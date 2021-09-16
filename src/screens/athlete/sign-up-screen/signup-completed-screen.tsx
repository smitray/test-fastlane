import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '@components/screen'
import { Box, Text, IconSvg, Button, TextGradient } from '@components/index'
import { typography } from '@styles/typography'
import { ScaledSheet, s, vs } from 'react-native-size-matters/extend'
import Routes from '@navigation/routes'
import { useCallback } from 'react'
import { palette } from '@src/styles/palette'
import { Alert, Linking } from 'react-native'
import { RootParamList } from '@navigation/params'
import { NavigationProp } from '@react-navigation/native'
import { TWITTER_MEETLETE_URL } from '@env'

type SignupCompletedScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athelete/SignUpCompleted'>
}

const SignupCompletedScreen = ({ navigation }: SignupCompletedScreenProps) => {
  const _onHomePress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onProfilePress = useCallback(() => {
    navigation.reset({
      index: 1,
      routes: [{ name: Routes.AthleteNavigator  }, { name: Routes.Athlete.EditProfile }]
    })
  }, [navigation])
  const _onTwitterPress = useCallback(async () => {
    const supported = await Linking.canOpenURL(TWITTER_MEETLETE_URL)

    if (supported) {
      await Linking.openURL(TWITTER_MEETLETE_URL)
    } else {
      Alert.alert(`Don't know how to open this URL: ${TWITTER_MEETLETE_URL}`)
    }
  }, [])

  return (
    <Screen unsafe>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={palette.gradient.background}
        style={styles.linearGradient}
      >
        <Box flex={1} paddingHorizontal="vs-5.5" alignItems="center" style={styles.container}>
          <IconSvg name="document" height={vs(87)} width={vs(78)} />
          <Text
            paddingTop="vs-15"
            tx="your_account_is_now_being_reviewed"
            lineHeight={vs(32)}
            variant="bold"
            color="white"
            textAlign="center"
            fontSize={typography.fontSize.largest}
          />
          <Box marginTop="vs-15">
            <Box flexDirection="row" justifyContent="center">
              <Text
                tx="your_account_is"
                color="white"
                variant="bold"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.bold}
              />
              <Text
                tx="not_active"
                textDecorationLine="underline"
                color="white"
                variant="bold"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.bold}
              />
              <Text
                tx="yet"
                color="white"
                variant="bold"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.bold}
              />
            </Box>
            <Text
              tx="your_account_is_under_review"
              lineHeight={vs(22)}
              color="white"
              paddingTop="vs-2"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
              textAlign="center"
            />
          </Box>
          <Box marginTop="vs-6">
            <Box flexDirection="row" flexWrap="wrap">
              <Text
                textAlign="center"
                tx="the_best_way_to_get_approved"
                color="white"
                lineHeight={vs(22)}
                variant="bold"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.bold}
              >
                <Box flexDirection="row">
                  <Text
                    onPress={_onTwitterPress}
                    tx="twitter_here"
                    textDecorationLine="underline"
                    color="white"
                    variant="bold"
                    fontSize={typography.fontSize.regular}
                    fontFamily={typography.fontFamily.primary.bold}
                  />
                  <Text
                    tx="dot"
                    color="white"
                    variant="bold"
                    fontSize={typography.fontSize.regular}
                    fontFamily={typography.fontFamily.primary.bold}
                  />
                </Box>
              </Text>
            </Box>
            <Text
              tx="while_your_are_waiting"
              lineHeight={typography.fontSize.largerS}
              color="white"
              paddingTop="vs-2"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
              textAlign="center"
            />
          </Box>
          <Box flexDirection="row" flexGrow={1} paddingBottom="vs-6" alignItems="flex-end">
            <Box flex={1}>
              <Button
                height={vs(43)}
                borderRadius="s-6"
                variant="clear"
                labelTx={'back_to_home'}
                labelVariant="bold"
                labelProps={{
                  color: 'white',
                  fontSize: typography.fontSize.medium,
                  fontWeight: '600',
                }}
                onPress={_onHomePress}
              />
            </Box>
            <Box flex={1} marginLeft="s-4">
              <Button height={vs(43)} borderRadius="s-6" backgroundColor="white" onPress={_onProfilePress}>
                <TextGradient
                  tx="go_to_my_profile"
                  gradient={{
                    colors: palette.gradient.text,
                  }}
                  fontSize={typography.fontSize.medium}
                  fontWeight={'700'}
                  fontFamily={typography.fontFamily.primary.medium}
                />
              </Button>
            </Box>
          </Box>
        </Box>
      </LinearGradient>
    </Screen>
  )
}

export default SignupCompletedScreen

const styles = ScaledSheet.create({
  linearGradient: {
    height: '100%',
    width: '100%',
  },
  container: {
    paddingTop: '100@vs',
  },
})
