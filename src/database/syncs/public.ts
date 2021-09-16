import Sport from '../models/sport'
import League from '../models/league'
import SchoolTeam from '../models/schoolTeam'
import ProfessionalTeam from '../models/professionalTeam'
import PublicAthleteProfile from '../models/publicAthleteProfile'

import { errorSync, restoreRealm } from './helpers'

let publicRealmSync = null
const partitionValue = 'public'
const schemaNames = ['Sport', 'League', 'SchoolTeam', 'ProfessionalTeam', 'PublicAthleteProfile']
const OpenRealmBehaviorConfiguration = {
  type: 'openImmediately',
}
export const setupSyncPublicData = async ({ user }: { user: Realm.User }): Promise<Realm> => {
  const config = {
    schema: [Sport.schema, League.schema, SchoolTeam.schema, ProfessionalTeam.schema, PublicAthleteProfile.schema],
    sync: {
      user,
      partitionValue,
      newRealmFileBehavior: OpenRealmBehaviorConfiguration,
      existingRealmFileBehavior: OpenRealmBehaviorConfiguration,
    },
    error: (_session, error) => {
      errorSync(publicRealmSync, _session, error)
    },
  }
  publicRealmSync = await Realm.open(config)
  await restoreRealm(publicRealmSync, schemaNames)
  return publicRealmSync
}
