import { useCallback } from 'react'
import { Box } from '@components/common/viewbox'
import { Screen } from '@components/screen'
import { Text } from '@components/text'
import { Image, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { typography } from '@styles/index'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootParamList } from '@navigation/params'

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Welcome'>
}

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const _onFanPress = useCallback(() => {
    navigation.navigate(Routes.Fan.FanWaitList)
  }, [navigation])

  const _onAthletePress = useCallback(() => {
    navigation.navigate(Routes.Athlete.QuickAccess)
  }, [navigation])

  return (
    <Screen style={styles.container as any}>
      <Image source={require('@assets/images/bootsplash_logo.png')} style={styles.logo} />
      <Box position="absolute" top={vs(192)} left={s(20)}>
        <TouchableOpacity onPress={_onFanPress}>
          <Text
            textAlign="left"
            tx="fan"
            textTransform="uppercase"
            fontSize={typography.fontSize.massive}
            color="black"
            variant="bold"
          />
          <Box flexDirection="row" alignItems="center">
            <Text
              textAlign="left"
              tx="tap_here"
              textTransform="uppercase"
              color="black"
              variant="bold"
              marginRight="s"
            />
            <Icon name="arrow-forward" />
          </Box>
        </TouchableOpacity>
      </Box>

      <Box position="absolute" bottom={vs(173)} right={s(42)} alignItems="flex-start">
        <TouchableOpacity onPress={_onAthletePress}>
          <Text
            tx="talent"
            textTransform="uppercase"
            fontSize={typography.fontSize.huge}
            color="black"
            variant="bold"
          />
          <Box flexDirection="row" alignItems="center" justifyContent="flex-start">
            <Text tx="tap_here" textTransform="uppercase" color="black" variant="bold" marginRight="s" />
            <Icon name="arrow-forward" />
          </Box>
        </TouchableOpacity>
      </Box>
      <TouchableOpacity style={styles.imageWrapper1} onPress={_onFanPress}>
        <Image source={require('@assets/images/welcome-screen-1.png')} style={styles.image} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.imageWrapper2} onPress={_onAthletePress}>
        <Image source={require('@assets/images/welcome-screen-2.png')} style={styles.image} />
      </TouchableOpacity>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  bootsplash: {
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    flex: 1,
    justifyContent: 'center',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 0,
    position: 'relative',
  },
  image: {
    alignSelf: 'flex-end',
    height: '100%',
    resizeMode: 'stretch',
    width: '100%',
  },
  imageWrapper1: {
    height: vs(400),
    position: 'absolute',
    right: 0,
    top: '10%',
    width: s(210),
    zIndex: -10,
  },
  imageWrapper2: {
    bottom: 0,
    height: vs(390),
    left: 0,
    position: 'absolute',
    width: s(260),
    zIndex: -10,
  },
  logo: {
    height: vs(50),
    resizeMode: 'contain',
    width: s(100),
  },
})

export default WelcomeScreen
