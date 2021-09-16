import { useCallback, useEffect, useState } from 'react'
import { Box, Screen, Text, TextGradient } from '@src/components'
import { View, TouchableOpacity, Image } from 'react-native'
import FastImage from 'react-native-fast-image'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { metrics, typography } from '@styles/index'
import { StackNavigationProp } from '@react-navigation/stack'
import { RootParamList } from '@navigation/params'
import { palette } from '@styles/palette'
import { AnimatableSlideIn, AnimatableMoveAndZoom, AnimatableFadeIn } from '@src/animation'
import { useAuth } from '@hooks/useAuth'
import { useNotification } from '@hooks/useNotification'
import { useNavigationState } from '@react-navigation/native'
import { getActiveRouteName } from '@navigation/utilities'
import BootSplash from 'react-native-bootsplash'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { CustomIcon } from '@components/custom-icon'

type WelcomeScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Welcome'>
}

const APP_ICON = require('@assets/images/bootsplash_logo.png')
const FAN = require('@assets/images/welcome-screen-fan.png')
const ATHLETE = require('@assets/images/welcome-screen-talent.png')
const BACKGROUND = require('@assets/images/gradientBackground.png')
const BACKGROUND2 = require('@assets/images/gradientBackground_2.png')

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  const { user, isUserCompleteProfile } = useAuth()
  const [isAppReady, setIsAppReady] = useState<boolean>(false)
  const { handledNavigation } = useNotification()
  const navigationState = useNavigationState((state) => state)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    BootSplash.hide({ fade: true })
    const currentRouteName = getActiveRouteName(navigationState)
    async function bootstrap() {
      if (user && isUserCompleteProfile) {
        const userType = user?.customData?.type
        if (userType === 'fan') {
          return navigation.replace(Routes.FanNavigator)
        }

        if (userType === 'athlete') return navigation.replace(Routes.AthleteNavigator)
        setIsAppReady(true)
      }
      setIsAppReady(true)
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

  const _onFanPress = useCallback(() => {
    navigation.navigate(Routes.Fan.FanWaitList)
  }, [navigation])

  const _onAthletePress = useCallback(() => {
    navigation.navigate(Routes.Athlete.Onboarding)
  }, [navigation])

  if (!isAppReady) {
    return (
      <View style={styles.container as any}>
        <Image source={APP_ICON} />
      </View>
    )
  }

  return (
    <Screen style={styles.container as any}>
      <Box style={styles.contentBox}>
        <AnimatableFadeIn>
          <Box style={styles.title}>
            <Text
              textAlign="center"
              paddingTop="s-12"
              paddingHorizontal="vs-16"
              tx="choose_the_one"
              fontWeight="600"
              fontSize={typography.fontSize.largerS}
              color="emperor"
            />
          </Box>
        </AnimatableFadeIn>
        <Box style={styles.welcomeBox}>
          <AnimatableSlideIn fromX={-metrics.screenWidth * 0.8} toX={0}>
            <TouchableOpacity style={styles.fanContainer} onPress={_onFanPress}>
              <Box>
                <FastImage source={FAN} style={styles.imageFan} />
                <Box flexDirection="row" alignItems="center" paddingRight="s-5" paddingTop="s-4">
                  <Box borderRadius="s-4">
                    <FastImage source={BACKGROUND} style={styles.imageBackground as any} />
                  </Box>
                  <Box
                    borderTopRightRadius="s-4"
                    borderBottomRightRadius="s-4"
                    borderRightWidth={1}
                    borderTopWidth={1}
                    borderBottomWidth={1}
                    borderColor="gray"
                    height="100%"
                    width="100%"
                    paddingLeft="vs-4"
                    paddingBottom="vs-6"
                    paddingRight="vs-6"
                    flex={1}
                  >
                    <Text
                      textAlign="left"
                      tx="im_a_fans"
                      paddingTop="vs-5.5"
                      fontSize={typography.fontSize.large}
                      color="gray_2"
                      variant="bold"
                    />
                    <Text
                      textAlign="left"
                      paddingTop="vs-2.5"
                      tx="fans_desc"
                      fontSize={typography.fontSize.regular}
                      color="emperor"
                    />
                    <Box flex={1} justifyContent='flex-end'>
                      <Box flexDirection="row" alignItems='center'>
                        <TextGradient
                          variant="bold"
                          tx="continue_as_fans"
                          gradient={{
                            colors: palette.gradient.textV2,
                          }}
                          fontSize={typography.fontSize.regular}
                          fontFamily={typography.fontFamily.primary.bold}
                          marginEnd="s-1"
                        />
                        <CustomIcon
                          name="chevron-right"
                          size={14}
                          type='font-awesome-5'
                          gradient={{
                            colors: palette.gradient.textV2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </TouchableOpacity>
          </AnimatableSlideIn>
          <AnimatableSlideIn fromX={metrics.screenWidth * 0.8} toX={0}>
            <TouchableOpacity style={styles.talentContainer} onPress={_onAthletePress}>
              <Box>
                <Box flexDirection="row" alignItems="center" paddingLeft="s-4" paddingTop="s-4">
                  <Box
                    borderTopLeftRadius="s-4"
                    borderBottomLeftRadius="s-4"
                    borderLeftWidth={1}
                    borderTopWidth={1}
                    borderBottomWidth={1}
                    borderColor="gray"
                    height="100%"
                    paddingLeft="vs-6"
                    paddingBottom="vs-5.5"
                    paddingRight="vs-4"
                    flex={1}
                  >
                    <Text
                      textAlign="left"
                      tx="im_a_talent"
                      paddingTop="vs-5.5"
                      fontSize={typography.fontSize.large}
                      color="gray_2"
                      variant="bold"
                    />
                    <Text
                      textAlign="left"
                      paddingTop="vs-2.5"
                      tx="talent_desc"
                      fontSize={typography.fontSize.regular}
                      color="emperor"
                    />
                    <Box flex={1} justifyContent='flex-end'>
                      <Box flexDirection="row" alignItems='center'>
                        <TextGradient
                          variant="bold"
                          tx="continue_as_talents"
                          gradient={{
                            colors: palette.gradient.textV2,
                          }}
                          fontSize={typography.fontSize.regular}
                          fontFamily={typography.fontFamily.primary.bold}
                          marginEnd="s-1"
                        />
                        <CustomIcon
                          name="chevron-right"
                          size={14}
                          type='font-awesome-5'
                          gradient={{
                            colors: palette.gradient.textV2,
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box style={styles.imageBackground as any}>
                    <FastImage source={BACKGROUND2} style={styles.imageBackground as any} />
                  </Box>
                </Box>
                <FastImage source={ATHLETE} style={styles.imageTalent} />
              </Box>
            </TouchableOpacity>
          </AnimatableSlideIn>
        </Box>
      </Box>
      <AnimatableMoveAndZoom fromY={0} toY={-metrics.screenHeight / 1.15 + insets.top}>
        <Image source={APP_ICON} />
      </AnimatableMoveAndZoom>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  contentBox: {
    flex: 1,
    position: 'absolute',
    height: metrics.screenHeight,
    width: metrics.screenWidth,
  },
  title: {
    height: metrics.screenHeight / 4,
    justifyContent: 'flex-end',
  },
  welcomeBox: {
    flex: 1,
    justifyContent: 'center',
    marginTop: -60,
  },
  fanContainer: {
    paddingLeft: '17@vs',
  },
  talentContainer: {
    marginTop: '33@s',
    paddingRight: '17@vs',
  },
  imageFan: {
    zIndex: 1,
    left: vs(-13),
    bottom: 0,
    width: vs(122),
    height: vs(191),
    position: 'absolute',
  },
  imageTalent: {
    zIndex: 1,
    right: vs(-8),
    bottom: 0,
    width: vs(117),
    height: vs(192),
    position: 'absolute',
  },
  imageBackground: {
    width: vs(109),
    height: vs(173),
  },
  imageBackgroundAthlete: {
    transform: [{ rotate: '180deg' }],
    flex: 1,
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
