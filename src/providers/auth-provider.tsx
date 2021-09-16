import { useState, useEffect, createContext, useCallback, useRef } from 'react'
import Realm from 'realm'
import OneSignal from 'react-native-onesignal'
import { getRealmApp } from '@src/database/get-app-realm'
import {
  athleteSubmitProCode as athleteSubmitProCodeFunc,
  athleteApplyProCode as athleteApplyProCodeFunc,
  userAddVoIPToken as userAddVoIPTokenFunc,
  userRemoveVoIPToken as userRemoveVoIPTokenFunc,
} from '@src/database/functions/users'
import Routes from '@navigation/routes'
import { IUser } from '@src/database/models/user'
import { AthleteApplyProCode } from '@src/database/types'
import { REALM_API_KEY } from '@env'
import { googleServices } from '@services/authentication'
import { facebookServices } from '../services/authentication/facebook'
import { appleServices } from '../services/authentication/apple'
import { UserType } from '../constants/index'
import { checkIsAPIUser } from '@utils/helpers'
import {
  setupSyncProfile as setupSyncProfileFunc,
} from '@src/database/syncs/user'

// Access the Realm App.
const app = getRealmApp()

// Create a new Context object that will be provided to descendants of
// the AuthProvider.
type TAuthContext = {
  user: any
  isUserCompleteProfile: boolean
  VoIPToken: string
  userProfile: IUser
  isBlocked: boolean
  logInWithEmailPassword: (email: string, password: string) => Promise<Realm.User>
  signUpWithEmailPassword: (email: string, password: string) => Promise<Realm.User>
  resetPassword: (email: string, isResetPassword?: number, newPassword?: string) => Promise<void>
  resetPasswordConfirm: (newPassword: string, token: string, tokenId: string) => Promise<void>
  signOut: (paramUser?: Realm.User | null) => void
  athleteApplyProCode: (profile: AthleteApplyProCode) => void
  athleteSubmitProCode: (proCode: string) => void
  logInWithFacebook: () => Promise<Realm.User>
  logInWithGoogle: () => Promise<Realm.User>
  logInWithApple: () => Promise<Realm.User>
  signUpWithFacebook: () => Promise<Realm.User>
  signUpWithGoogle: () => Promise<Realm.User>
  signUpWithApple: () => Promise<Realm.User>
  setVoIPToken: (token: string) => void
}

export const AuthContext = createContext<TAuthContext>({} as TAuthContext)

// The AuthProvider is responsible for user management and provides the
// AuthContext value to its descendants. Components under an AuthProvider can
// use the useAuth() hook to access the auth value.
export const AuthProvider = ({ children, navigationRef }) => {
  const apiUserRef = useRef(null)
  const [loggedUser, setLoggedUser] = useState(app.currentUser)
  const [VoIPToken, setVoIPToken] = useState(null)
  const isSynced = useRef(false)
  const userRealm = useRef(null)

  const [userProfile, setUserProfile] = useState(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isUserCompleteProfile, setUserCompleteProfile] = useState(true)

  useEffect(() => {
    const profileChanged = (users, changes) => {
      if (users && users.length > 0) {
        // because there's only one item
        const user = Object.assign({}, JSON.parse(JSON.stringify(users[0])))
        setUserProfile(user)
      }
    }
    const blockChanged = (blocks, changes) => {
      if (blocks && blocks.length > 0) {
        setIsBlocked(true)
      } else {
        setIsBlocked(false)
      }
    }

    const setupSyncProfile = async (user) => {
      try {
        if (isSynced.current) {
          // this hack to handle multi sync created when app refresh
          return
        }
        isSynced.current = true
        userRealm.current = await setupSyncProfileFunc({
          user,
          listener: { profileChanged, blockChanged },
        })
        // const userProfile = Object.assign({}, JSON.parse(JSON.stringify(userRealm.current.objects('User')[0])))
        // setUserProfile(userProfile)
      } catch (error) {
        console.log(error)
      }
    }
    if (loggedUser && !checkIsAPIUser(loggedUser)) {
      setupSyncProfile(loggedUser)
    }
    return () => {
      setIsBlocked(false)
      setUserProfile(null)
      if (userRealm.current) {
        userRealm.current?.close()
        userRealm.current = null
      }
      isSynced.current = false
    }
  }, [loggedUser])

  useEffect(() => {
    if (isBlocked && userProfile?.type === 'fan') {
      const currentRoute = navigationRef.current.getCurrentRoute()
      const currentRouteName = currentRoute.name
      if (currentRouteName !== Routes.Fan.Block) {
        navigationRef.current?.reset({ index: 0, routes: [{ name: Routes.Fan.Block }] })
      }
    }
  }, [isBlocked, navigationRef, userProfile?.type])

  useEffect(() => {
    if (loggedUser && !checkIsAPIUser(loggedUser)) {
      OneSignal.setExternalUserId(loggedUser.id)
    }
  }, [loggedUser])

  useEffect(() => {
    const userAddVoIPToken = async () => {
      if (loggedUser && !checkIsAPIUser(loggedUser) && VoIPToken) {
        try {
          await userAddVoIPTokenFunc({ user: loggedUser, token: VoIPToken })
        } catch (error) {
          console.log(error)
        }
      }
    }
    userAddVoIPToken()
  }, [loggedUser, VoIPToken])

  useEffect(() => {
    async function logInAsApiUser() {
      try {
        const credentials = Realm.Credentials.serverApiKey(REALM_API_KEY)
        const user = await app.logIn(credentials)
        apiUserRef.current = user
        setLoggedUser(user)
      } catch (err) {
        console.log('Failed to log in', err.message)
      }
    }

    if (!app.currentUser) {
      logInAsApiUser()
    }
  }, [])

  // athlete signup procode
  const athleteApplyProCode = useCallback(async (profile: AthleteApplyProCode) => {
    await athleteApplyProCodeFunc({ user: app.currentUser, profile })
  }, [])

  // athlete submit procode
  const athleteSubmitProCode = useCallback(async (proCode: string) => {
    await athleteSubmitProCodeFunc({ user: app.currentUser, proCode })
  }, [])

  // The signOut function calls the logOut function on the currently
  // logged in user
  const signOut = useCallback(async () => {
    const currentUser = app.currentUser
    if (!currentUser || checkIsAPIUser(currentUser)) return

    await userRemoveVoIPTokenFunc({ user: currentUser, token: VoIPToken }).catch(console.warn)
    switch (app?.currentUser?.providerType) {
      case 'oauth2-google': {
        await googleServices.logout()
        break
      }
      case 'oauth2-facebook': {
        await facebookServices.logout()
        break
      }
      case 'oauth2-apple': {
        await appleServices.logout()
        break
      }
    }
    await app.removeUser(currentUser)
    setLoggedUser(apiUserRef.current || app.currentUser)
    OneSignal.removeExternalUserId()
  }, [VoIPToken])

  // AUTHENTICATION
  const logInWithEmailPassword = useCallback(async (email: string, password: string) => {
    const credentials = Realm.Credentials.emailPassword(email, password)
    const newUser = await app.logIn(credentials)
    setLoggedUser(newUser)
    return newUser
  }, [])

  const resetPassword = async (email: string, isChangePassword: number, newPassword = 'meetlete') => {
    await app.emailPasswordAuth.callResetPasswordFunction(email, newPassword, [isChangePassword])
  }

  const resetPasswordConfirm = useCallback(async (email: string, token: string, tokenId: string) => {
    await app.emailPasswordAuth.resetPassword(email, token, tokenId)
  }, [])

  const handleLogInWithGoogle = useCallback(async () => {
    const googleAuth = await googleServices.signInWithGoogle()
    const credentials = Realm.Credentials.google(googleAuth.idToken)
    const loggedUser: Realm.User = await app.logIn(credentials)
    setLoggedUser(loggedUser)
    return loggedUser
  }, [])

  const handleLogInWithApple = useCallback(async () => {
    const appleAuth = await appleServices.signInWithApple()

    if (!appleAuth) throw new Error('User cancelled login')

    const credentials = Realm.Credentials.apple(appleAuth.identityToken)
    const loggedUser: Realm.User = await app.logIn(credentials)
    setLoggedUser(loggedUser)
    return loggedUser
  }, [])

  const handleLogInWithFacebook = useCallback(async () => {
    const accessToken = await facebookServices.signInWithFacebook()
    const credentials = Realm.Credentials.facebook(accessToken)
    const loggedUser = await app.logIn(credentials)
    setLoggedUser(loggedUser)
    return loggedUser
  }, [])

  const logInWithGoogle = useCallback(async () => {
    const loggedUser = await handleLogInWithGoogle()
    if ([UserType.ATHLETE, UserType.FAN].includes(loggedUser.customData?.type)) {
      return loggedUser
    }
    await signOut()
    throw new Error("You've not registered any account. Please register one.")
  }, [handleLogInWithGoogle, signOut])

  const logInWithFacebook = useCallback(async () => {
    const loggedUser = await handleLogInWithFacebook()
    if ([UserType.ATHLETE, UserType.FAN].includes(loggedUser.customData?.type)) {
      return loggedUser
    }
    await signOut()
    throw new Error("You've not registered any account. Please register one.")
  }, [handleLogInWithFacebook, signOut])

  const logInWithApple = useCallback(async () => {
    const loggedUser = await handleLogInWithApple()
    if ([UserType.ATHLETE, UserType.FAN].includes(loggedUser.customData?.type)) {
      return loggedUser
    }
    await signOut()
    throw new Error("You've not registered any account. Please register one.")
  }, [handleLogInWithApple, signOut])

  const signUpWithApple = useCallback(async () => {
    const loggedUser = await handleLogInWithApple()
    setUserCompleteProfile(false)
    return loggedUser
  }, [handleLogInWithApple])

  const signUpWithGoogle = useCallback(async () => {
    const loggedUser = await handleLogInWithGoogle()
    setUserCompleteProfile(false)
    return loggedUser
  }, [handleLogInWithGoogle])

  const signUpWithFacebook = useCallback(async () => {
    const loggedUser = await handleLogInWithFacebook()
    setUserCompleteProfile(false)
    return loggedUser
  }, [handleLogInWithFacebook])

  const signUpWithEmailPassword = useCallback(
    async (email: string, password: string) => {
      await app.emailPasswordAuth.registerUser(email, password)
      const loggedUser = await logInWithEmailPassword(email, password)
      setUserCompleteProfile(false)
      return loggedUser
    },
    [logInWithEmailPassword],
  )

  return (
    <AuthContext.Provider
      value={{
        user: loggedUser,
        isUserCompleteProfile,
        VoIPToken,
        isBlocked,
        signOut,
        athleteApplyProCode,
        athleteSubmitProCode,
        logInWithFacebook,
        logInWithGoogle,
        logInWithApple,
        logInWithEmailPassword,
        signUpWithApple,
        signUpWithGoogle,
        signUpWithFacebook,
        signUpWithEmailPassword,
        setVoIPToken,
        userProfile,
        resetPassword,
        resetPasswordConfirm,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
