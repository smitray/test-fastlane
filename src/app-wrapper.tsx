import { RootNavigator } from '@navigation/index'
import { theme } from '@styles/theme'
import { NotificationProvider } from './providers/notification-provider'
import { StripeProvider } from '@stripe/stripe-react-native'
import { STRIPE_PUBLISH_KEY } from '@env'
import dynamicLinks from '@react-native-firebase/dynamic-links'
import Routes from '@navigation/routes'
import { useAuth } from '@hooks/useAuth'
import { useMemo } from 'react'
import { Linking } from 'react-native'

export const AppWrapper = ({ navigationRef }) => {
  const { user } = useAuth()
  const userType = user?.customData?.type

  const later = (delay) => {
    return new Promise(function(resolve) {
        setTimeout(resolve, delay)
    })
  }

  const linking = useMemo(
    () => ({
      prefixes: ['meetleteapp://', 'meetlete://', 'https://dlinks.meetlete.com', 'https://meetleteapp.page.link'],
      // Custom function to get the URL which was used to open the app
      async getInitialURL() {
        // First, you may want to do the default deep link handling
        // Check if app was opened from a deep link
        // const url = await Linking.getInitialURL()

        // if (url != null) {
        //   return url
        // }

        // Handle links clicked in background state
        await later(500)
        const link = await dynamicLinks().getInitialLink()
        if (link && !['fan', 'athlete'].includes(userType)) {
          return link?.url
        }
        return null
      },

      // Custom function to subscribe to incoming links
      subscribe(listener) {
        const onReceiveURL = (link) => {
          if (link && !['fan', 'athlete'].includes(userType)) {
            listener(link.url)
          }
        }

        // Listen to incoming links from deep linking
        // Linking.addEventListener('url', onReceiveURL)

        // Handle links clicked in foreground state
        const unsubscribe = dynamicLinks().onLink(onReceiveURL)
        return () => {
          // Clean up the event listeners
          // Linking.removeEventListener('url', onReceiveURL)
          unsubscribe()
        }
      },

      config: {
        // Deep link configuration
        screens: {
          [Routes.Athlete.EnterProcode]: {
            initialRouteName: Routes.Welcome,
            path: 'procode',
          },
          [Routes.Splash]: '*',
          [Routes.Athlete.ResetPassword]: 'reset-password'
        },
      },
    }),
    [userType],
  )

  return (
    <NotificationProvider navigationRef={navigationRef}>
      <StripeProvider publishableKey={STRIPE_PUBLISH_KEY} merchantIdentifier="merchant.identifier">
        <RootNavigator theme={theme.navigation} ref={navigationRef} linking={linking} />
      </StripeProvider>
    </NotificationProvider>
  )
}
