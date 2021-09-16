/* eslint-disable @typescript-eslint/no-empty-function */
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'
import { setI18nConfig } from '@i18n/index'
// This puts screens in a native ViewController or Activity. If you want fully native
// stack navigation, use `createNativeStackNavigator` in place of `createStackNavigator`:
// https://github.com/kmagiera/react-native-screens#using-native-stack-navigator
import { enableScreens } from 'react-native-screens'
import { AppWrapper } from './app-wrapper'
import { theme } from '@styles/theme'
import { ThemeProvider } from '@shopify/restyle'
import RNLocalize from 'react-native-localize'
import { useEffect, useReducer, useRef } from 'react'
import OneSignal from 'react-native-onesignal'
import { Platform } from 'react-native'
import { AuthProvider } from '@providers/auth-provider'
import { PublicSyncProvider } from '@providers/public-sync-provider'
import { CallProvider } from '@providers/call-provider'
import { setRootNavigation, useBackButtonHandler, canExit } from '@navigation/index'
import Toast from 'react-native-toast-message'
import { toastConfig } from '@components/toast'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { GOOGLE_SIGNIN_IOS_CLIENT_ID, GOOGLE_SIGNIN_WEB_CLIENT_ID } from '@env'
import setupOneVOIPNotification from '@utils/setupCallKeep'
import { NavigationContainerRef } from '@react-navigation/native'

setupOneVOIPNotification()
enableScreens()
setI18nConfig()

function App() {
  const [_, forceUpdate] = useReducer((x) => x + 1, 0)
  const navigationRef = useRef<NavigationContainerRef>()
  setRootNavigation(navigationRef)
  useBackButtonHandler(navigationRef, canExit)

  useEffect(() => {
    const _handleLocalizationChange = () => {
      setI18nConfig()
      forceUpdate()
    }
    RNLocalize.addEventListener('change', _handleLocalizationChange)
    if (Platform.OS === 'ios') {
      OneSignal.promptForPushNotificationsWithUserResponse(() => {})
    }
  }, [])

  useEffect(() => {
    // [Implementation][@react-native-community/google-signin] Start
    // config google signin once.
    GoogleSignin.configure({
      scopes: [
        'email',
        'profile' /* 'https://www.googleapis.com/auth/user.gender.read', 'https://www.googleapis.com/auth/calendar' */,
      ], // what API you want to access on behalf of the user, default is email and profile
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      iosClientId: GOOGLE_SIGNIN_IOS_CLIENT_ID,
      webClientId: GOOGLE_SIGNIN_WEB_CLIENT_ID,
    })
    // [Implementation][@react-native-community/google-signin] End
  }, [])

  return (
    <AuthProvider navigationRef={navigationRef}>
      <PublicSyncProvider>
        <CallProvider>
          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            <ThemeProvider theme={theme}>
              <AppWrapper navigationRef={navigationRef} />
              <Toast config={toastConfig} ref={(ref) => Toast.setRef(ref)} />
            </ThemeProvider>
          </SafeAreaProvider>
        </CallProvider>
      </PublicSyncProvider>
    </AuthProvider>
  )
}

export default App
