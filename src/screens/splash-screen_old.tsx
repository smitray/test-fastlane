import { ActivityIndicator, StyleSheet } from 'react-native'
import { useEffect } from 'react'
import Routes from '@navigation/routes'
import { useAuth } from '@hooks/useAuth'
import { useNotification } from '@hooks/useNotification'
import { Screen } from '@components/screen'
import { getActiveRouteName } from '@navigation/utilities'
import { RootParamList } from '@navigation/params'
import { StackNavigationProp } from '@react-navigation/stack'
import { useNavigationState } from '@react-navigation/native'

type SplashScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Splash'>
}
const SplashScreen = ({ navigation }: SplashScreenProps) => {
  const { user } = useAuth()
  const { handledNavigation } = useNotification()
  const navigationState = useNavigationState((state) => state)

  useEffect(() => {
    const currentRouteName = getActiveRouteName(navigationState)

    async function bootstrap() {
      if (user) {
        const userType = user?.customData?.type
        if (userType === 'fan') {
          return navigation.replace(Routes.FanNavigator)
        }

        if (userType === 'athlete') return navigation.replace(Routes.AthleteNavigator)
        return navigation.replace(Routes.Welcome)
      }
      navigation.replace(Routes.Welcome)
    }

    const timeout = setTimeout(() => {
      if (handledNavigation !== true && currentRouteName !== Routes.Fan.VideoCall) {
        bootstrap()
      }
    }, 1500)

    return () => {
      clearTimeout(timeout)
    }
  }, [navigation, user, handledNavigation, navigationState])

  return (
    <Screen style={styles.container}>
      <ActivityIndicator color="green" size="small" />
    </Screen>
  )
}

export default SplashScreen

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})
