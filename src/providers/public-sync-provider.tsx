import { createContext, memo, useEffect, useRef, useState, useCallback } from 'react'
import { setupSyncPublicData as setupSyncPublicDataFunc } from '@src/database/syncs/public'
import { checkIsAPIUser } from '@utils/helpers'
import { useAuth } from '@hooks/useAuth'
import { ISport } from '@src/database/models/sport'
import { ILeague } from '@src/database/models/league'
import { IPublicAthleteProfile } from '@src/database/models/publicAthleteProfile'
import { ISchoolTeam } from '@src/database/models/schoolTeam'
import { IProfessionalTeam } from '@src/database/models/professionalTeam'

type TPublicSyncContext = {
  isSynced: boolean,
  publicSyncRealm: Realm,
  sports: Realm.Results<ISport>,
  leagues: Realm.Results<ILeague>,
  schoolTeams: Realm.Results<ISchoolTeam>,
  professionalTeams: Realm.Results<IProfessionalTeam>,
  publicAthleteProfiles: Realm.Results<IPublicAthleteProfile>
}

export const PublicSyncContext = createContext<TPublicSyncContext>({} as TPublicSyncContext)

// TODO: refresh when user reset (type, identify changed)
export const PublicSyncProvider = memo(({ children }) => {
  const { user } = useAuth()
  const [sports, setSports] = useState([])
  const [publicAthleteProfiles, setPublicAthleteProfiles] = useState([])
  const [leagues, setLeagues] = useState([])
  const [schoolTeams, setSchoolTeams] = useState([])
  const [professionalTeams, setProfessionalTeams] = useState([])

  const isSynced = useRef(false)
  const publicSyncRealm = useRef(null)

  useEffect(() => {
    const handleAthletesChanged = (publicAthleteProfiles) => {
      const filteredProfiles = publicAthleteProfiles.filtered('name != null && avatar != null && bio != null && callPrice != null').sorted('priority')
      setPublicAthleteProfiles(filteredProfiles)
    }
    const publicAthleteProfilesChanged = (publicAthleteProfiles, changes) => {
      handleAthletesChanged(publicAthleteProfiles)
    }
    const sportsChanged = (sports, changes) => {
      setSports(sports)
    }
    const leaguesChanged = (leagues, changes) => {
      setLeagues(leagues)
    }
    const schoolTeamsChanged = (schoolTeams, changes) => {
      setSchoolTeams(schoolTeams)
    }
    const professionalTeamsChanged = (professionalTeams, changes) => {
      setProfessionalTeams(professionalTeams)
    }
    const setupSyncPublicData = async (user) => {
      try {
        if (isSynced.current) {
          // this hack to handle multi sync created when app refresh
          return
        }
        isSynced.current = true
        publicSyncRealm.current = await setupSyncPublicDataFunc({
          user,
        })
        const sports = publicSyncRealm.current?.objects('Sport')
        setSports(sports)
        publicSyncRealm.current?.objects('Sport').addListener(sportsChanged)

        const leagues = publicSyncRealm.current?.objects('League')
        setLeagues(leagues)
        publicSyncRealm.current?.objects('League').addListener(leaguesChanged)

        const schoolTeams = publicSyncRealm.current?.objects('SchoolTeam')
        setSchoolTeams(schoolTeams)
        publicSyncRealm.current?.objects('SchoolTeam').addListener(schoolTeamsChanged)

        const professionalTeams = publicSyncRealm.current?.objects('ProfessionalTeam')
        setProfessionalTeams(professionalTeams)
        publicSyncRealm.current?.objects('ProfessionalTeam').addListener(professionalTeamsChanged)

        publicSyncRealm.current?.objects('PublicAthleteProfile').addListener(publicAthleteProfilesChanged)
        const publicAthleteProfiles = publicSyncRealm.current?.objects('PublicAthleteProfile')
        handleAthletesChanged(publicAthleteProfiles)
      } catch (error) {
        console.log(error)
      }
    }
    if (user) {
      setupSyncPublicData(user)
    }
    return () => {
      if (publicSyncRealm.current) {
        // set empty array to prevent error
        // https://stackoverflow.com/questions/52811631/realm-js-access-to-invalidated-results-objects
        setPublicAthleteProfiles([])
        setSports([])
        setLeagues([])
        setSchoolTeams([])
        setProfessionalTeams([])
        publicSyncRealm.current?.close()
        publicSyncRealm.current = null
      }
      isSynced.current = false
    }
  }, [user])

  return (
    <PublicSyncContext.Provider
      value={{
        isSynced: isSynced.current,
        publicSyncRealm: publicSyncRealm.current,
        sports,
        leagues,
        schoolTeams,
        professionalTeams,
        publicAthleteProfiles,
      }}
    >
      {children}
    </PublicSyncContext.Provider>
  )
})
