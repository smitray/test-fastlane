/* eslint-disable react-native/no-inline-styles */
import { Box, Button, Screen, TextGradient, Text } from '@components/index'
import { useCallback } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { Image } from 'react-native'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { palette } from '@styles/palette'
import { typography } from '@styles/typography'
import Routes from '@navigation/routes'
import { CustomIcon, IconTypes } from '@components/custom-icon'
import { metrics } from '@styles/metrics'

const QuickAccessScreen = ({ navigation }) => {
  const onLogin = useCallback(() => {
    navigation.navigate(Routes.Athlete.SignIn)
  }, [navigation])

  const onSignUp = useCallback(() => {
    navigation.navigate(Routes.Athlete.SignUp)
  }, [navigation])

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])
  return (
    <Screen
      backgroundColor={palette.white}
      unsafe
      headerV2={{
        leftButtonProps: {
          icon: { name: 'chevron-left', color: 'white', size: 26 },
        },
        onLeftPress: _onBackPress,
      }}
    >
      <Image source={require('@assets/images/quick-access-screen.png')} style={styles.imgBg} />
      <Box flex={1} paddingBottom="vs-6">
        <Box paddingHorizontal="vs-6" flexGrow={1} marginTop="vs-7">
          <TextGradient
            variant="bold"
            tx="join_us_now"
            gradient={{
              colors: palette.gradient.textV2,
            }}
            fontSize={typography.fontSize.massive}
            fontFamily={typography.fontFamily.primary.bold}
          />
          <Box flexDirection="row" marginTop="vs-6" alignItems='center'>
            <CustomIcon
              name="grin-stars"
              solid
              size={16}
              type="font-awesome-5"
              gradient={{
                colors: palette.gradient.textV2,
              }}
            />
            <Text
              paddingLeft="s-3.5"
              tx="talent_qa_description_1"
              color="emperor"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>

          <Box flexDirection="row" marginTop="vs-3" alignItems='center'>
            <CustomIcon
              name="hand-holding-heart"
              size={16}
              type="font-awesome-5"
              gradient={{
                colors: palette.gradient.textV2,
              }}
            />
            <Text
              paddingLeft="s-3.5"
              tx="talent_qa_description_2"
              color="emperor"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>
          <Box flexDirection="row" marginTop="vs-3" alignItems='center'>
            <CustomIcon
              name="hand-holding-usd"
              size={16}
              type="font-awesome-5"
              gradient={{
                colors: palette.gradient.textV2,
              }}
            />
            <Text
              paddingLeft="s-3.5"
              tx="talent_qa_description_3"
              color="emperor"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>
          <Box flexDirection="row" marginTop="vs-3" alignItems='center'>
            <CustomIcon
              name="user-shield"
              size={16}
              type="font-awesome-5"
              gradient={{
                colors: palette.gradient.textV2,
              }}
            />
            <Text
              paddingLeft="s-3.5"
              tx="talent_qa_description_4"
              color="emperor"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>
          <Box flex={1} flexDirection="row" marginTop="vs-3">
            <CustomIcon
              name="stopwatch"
              size={16}
              type="font-awesome-5"
              gradient={{
                colors: palette.gradient.textV2,
              }}
            />
            <Text
              paddingLeft="s-3.5"
              tx="talent_qa_description_5"
              color="emperor"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>
        </Box>
        <Box position="absolute" left={0} bottom={0} right={0}>
          <Box paddingHorizontal="s-3.5" flexDirection="row">
            <Button
              height={vs(48)}
              borderRadius="s-12"
              onPress={onLogin}
              containerStyle={styles.btn}
              variant="outline"
              marginVertical="vs-7.5"
            >
              <TextGradient
                variant="bold"
                tx="login"
                gradient={{
                  colors: palette.gradient.textV2,
                }}
                fontSize={typography.fontSize.medium}
                fontFamily={typography.fontFamily.primary.bold}
              />
            </Button>
            <Button
              height={vs(48)}
              borderRadius="s-12"
              containerStyle={styles.btn}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.buttonV2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }}
              labelTx="sign_up"
              labelVariant="bold"
              marginVertical="vs-7.5"
              labelProps={{
                color: 'white',
                fontSize: typography.fontSize.medium,
                fontFamily: typography.fontFamily.primary.bold,
              }}
              onPress={onSignUp}
            />
          </Box>
      </Box>
      </Box>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  imgBg: {
    height: metrics.screenHeight * 0.53,
    resizeMode: 'stretch',
    width: '100%',
  },
  logo: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  btn: {
    flexGrow: 1,
    marginHorizontal: '10@s'
  },
})

export default QuickAccessScreen
