import { Alert, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useCallback, useRef } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RootParamList } from '@navigation/params'
import { useAuth } from '@hooks/useAuth'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, Screen, Text, TextGradient, CustomInput } from '@components/index'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '../../i18n/translate'
import { useImmer } from 'use-immer'
import { some } from '@utils/lodash'
import { typography } from '@styles/typography'
import { metrics } from '@styles/metrics'

type SignInScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/SignIn'>
}
const BACKGROUND = require('@assets/images/talentLoginBackground.png')
const GOOGLE = require('@assets/images/google.png')
const FACEBOOK = require('@assets/images/facebook.png')
const APPLE = require('@assets/images/apple.png')

const SignInScreen = ({ navigation }: SignInScreenProps) => {
  const inputRefs = useRef({})
  const { logInWithEmailPassword, logInWithGoogle, logInWithFacebook, logInWithApple, signOut } = useAuth()
  const [localState, setLocalState] = useImmer({
    loading: {
      facebook: false,
      google: false,
      apple: false,
    },
  })

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onForgotPasswordPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.EnterEmail)
  }, [navigation])

  const _onSignUpPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.SignUp)
  }, [navigation])
  const _handleNavigateAfterSignIn = useCallback(
    async (user) => {
      if (user) {
        await user.refreshCustomData()
        const userProfile = user?.customData
        const userType = user?.customData?.type
        if (userType === 'fan') {
          const isVerified = userProfile?.isVerified
          if (!isVerified) {
            // show alert or error here
            Alert.alert(translate('fan_not_verified'))
            return await signOut()
          }
          if (userProfile.name) {
            navigation.reset({
              index: 0,
              routes: [{ name: Routes.FanNavigator }],
            })
            return
          } else {
            navigation.reset({
              index: 1,
              routes: [
                { name: Routes.FanNavigator },
                {
                  name: Routes.Fan.EditProfile,
                },
              ],
            })
            return
          }
        }

        if (userType === 'athlete') {
          navigation.reset({
            index: 0,
            routes: [{ name: Routes.AthleteNavigator }],
          })
        }
      }
    },
    [navigation, signOut],
  )

  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        const user = await logInWithEmailPassword(email, password)
        await _handleNavigateAfterSignIn(user)
      } catch (error) {
        Alert.alert(`Failed to sign in: ${error.message}`)
      }
    },
    [_handleNavigateAfterSignIn, logInWithEmailPassword],
  )

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      email: yup.string().email(translate('email_must_be_valid')).required(translate('email_is_required')),
      password: yup.string().required(translate('password_is_required')),
    }),
  })

  const _onSignInWithFacebookPress = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.facebook = true
      })
      const loggedInUser = await logInWithFacebook()
      await _handleNavigateAfterSignIn(loggedInUser)
      setLocalState((draft) => {
        draft.loading.facebook = false
      })
    } catch (err) {
      setLocalState((draft) => {
        draft.loading.facebook = false
      })
      Alert.alert(translate('failed_to_sign_in_with_facebook'), err.message)
    }
  }, [_handleNavigateAfterSignIn, logInWithFacebook, setLocalState])

  const _onSignInWithGooglePress = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.google = true
      })
      const loggedInUser = await logInWithGoogle()
      await _handleNavigateAfterSignIn(loggedInUser)
      setLocalState((draft) => {
        draft.loading.google = false
      })
    } catch (err) {
      setLocalState((draft) => {
        draft.loading.google = false
      })
      Alert.alert(translate('failed_to_sign_in_with_google'), err.message)
    }
  }, [_handleNavigateAfterSignIn, logInWithGoogle, setLocalState])

  const _onSignInWithApplePress = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.apple = true
      })
      const loggedInUser = await logInWithApple()
      await _handleNavigateAfterSignIn(loggedInUser)
      setLocalState((draft) => {
        draft.loading.apple = false
      })
    } catch (err) {
      setLocalState((draft) => {
        draft.loading.apple = false
      })
      Alert.alert(translate('failed_to_sign_in_with_apple'), err.message)
    }
  }, [_handleNavigateAfterSignIn, logInWithApple, setLocalState])

  const disableMode = formik.isSubmitting || some(Object.values(localState.loading), true)

  return (
    <Screen
      unsafe
      preset="fixed"
      headerV2={{
        leftButtonProps: {
          icon: { name: 'chevron-left', color: 'white', size: 26 },
          containerStyle: { height: 25 },
          hitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
        },
        onLeftPress: _onBackPress,
      }}
    >
      <LinearGradient
        colors={palette.gradient.background}
        style={styles.flex1}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 1 }}
      >
        <Box flex={1}>
          <FastImage source={BACKGROUND} style={styles.imgBg} />
          <KeyboardAwareScrollView
            style={styles.flex1}
            scrollEnabled={false}
            extraHeight={vs(20)}
            showsVerticalScrollIndicator={false}>
            <Box style={styles.hideView} />
            <Box
              flex={1}
              height={metrics.screenHeight * 0.7}
              paddingHorizontal="s-6"
              borderTopLeftRadius="s-9"
              borderTopRightRadius="s-9"
              backgroundColor="white"
            >
              <Box flex={1} justifyContent="space-between">
                <Box>
                  <Box paddingTop="vs-5">
                    <Text
                      variant="bold"
                      tx="welcome_back"
                      fontSize={typography.fontSize.largest}
                      fontFamily={typography.fontFamily.primary.bold}
                    />
                    <TextGradient
                      variant="bold"
                      tx="lets_meet_and_greet"
                      gradient={{
                        colors: palette.gradient.text,
                      }}
                      fontSize={typography.fontSize.largest}
                      fontFamily={typography.fontFamily.primary.bold}
                    />
                  </Box>
                </Box>
                <Box flexGrow={1} justifyContent="center">
                  <Box>
                    <CustomInput
                      onSubmitEditing={() => {
                        inputRefs.current[1]?.focus()
                      }}
                      inputRef={(ref) => {
                        inputRefs.current[0] = ref
                      }}
                      paddingHorizontal="s-3"
                      borderBottomColor="transparent"
                      height={vs(48)}
                      variant="rounded"
                      color="pickledBluewood"
                      placeholderTx="yourmail"
                      autoCapitalize="none"
                      returnKeyType="next"
                      textProps={{
                        fontSize: typography.fontSize.large,
                        fontWeight: '300',
                      }}
                      textVariant="semiBold"
                      keyboardType="email-address"
                      editable={!disableMode}
                      value={formik.values.email}
                      onChangeText={formik.handleChange('email')}
                      errorMessage={formik.touched.email && (formik.errors?.email as string)}
                    />
                    <Box paddingTop="vs-4" />
                    <CustomInput
                      onSubmitEditing={formik.handleSubmit}
                      inputRef={(ref) => {
                        inputRefs.current[1] = ref
                      }}
                      secureTextEntry
                      paddingHorizontal="s-3"
                      borderBottomColor="transparent"
                      height={vs(48)}
                      variant="rounded"
                      textVariant="semiBold"
                      color="pickledBluewood"
                      placeholderTx="password"
                      autoCapitalize="none"
                      returnKeyType="next"
                      textProps={{
                        fontSize: typography.fontSize.large,
                        fontWeight: '300',
                      }}
                      rightIconContainerStyle={styles.eyeIcon}
                      editable={!disableMode}
                      value={formik.values.password}
                      onChangeText={formik.handleChange('password')}
                      errorMessage={formik.touched.password && (formik.errors?.password as string)}
                    />
                  </Box>
                  <Text
                    onPress={disableMode ? null : _onForgotPasswordPress}
                    paddingTop="vs-2"
                    textAlign="right"
                    color="blue"
                    textDecorationLine="underline"
                    tx="forgot_your_password"
                    fontWeight="400"
                    fontSize={typography.fontSize.small}
                    fontFamily={typography.fontFamily.primary.bold}
                  />
                </Box>
                <Box justifyContent="flex-end" paddingBottom="vs-6">
                  <Button
                    width={'100%'}
                    borderRadius="s-6"
                    height={vs(48)}
                    disabled={formik.isSubmitting}
                    loading={formik.isSubmitting}
                    ViewComponent={LinearGradient}
                    linearGradientProps={{
                      colors: palette.gradient.button,
                      start: { x: 0, y: 0 },
                      end: { x: 1, y: 1 },
                    }}
                    labelTx="login"
                    labelVariant="bold"
                    labelProps={{
                      color: 'white',
                      fontSize: typography.fontSize.larger,
                    }}
                    onPress={formik.handleSubmit}
                  />
                  <Text
                    paddingTop="vs-5"
                    textAlign="center"
                    color="emperor"
                    tx="or_login_with"
                    fontWeight="400"
                    fontSize={typography.fontSize.regular}
                    fontFamily={typography.fontFamily.primary.semiBold}
                  />
                  <Box marginTop="vs-5" flexDirection="row">
                    <TouchableOpacity disabled={disableMode} style={styles.flex1} onPress={_onSignInWithGooglePress}>
                      <Box
                        style={{ height: vs(43) }}
                        justifyContent='center'
                        flex={1}
                        borderWidth={1}
                        borderColor="gray_4"
                        borderRadius="s-4"
                        alignItems="center"
                        marginRight="s-2"
                      >
                        <FastImage source={GOOGLE} style={styles.googleLogo} />
                      </Box>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={disableMode} style={styles.flex1} onPress={_onSignInWithFacebookPress}>
                      <Box
                        style={{ height: vs(43) }}
                        justifyContent='center'
                        flex={1}
                        borderWidth={1}
                        borderColor="gray_4"
                        borderRadius="s-4"
                        marginHorizontal="s-1"
                        alignItems="center"
                      >
                        <FastImage source={FACEBOOK} style={styles.facebookLogo} />
                      </Box>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={disableMode} style={[styles.flex1, { height: vs(43) }]} onPress={_onSignInWithApplePress}>
                      <Box
                        height={vs(43)}
                        justifyContent='center'
                        flex={1}
                        borderWidth={1}
                        borderColor="gray_4"
                        borderRadius="s-4"
                        marginLeft="s-2"
                        alignItems="center"
                      >
                        <FastImage source={APPLE} style={styles.appleLogo} />
                      </Box>
                    </TouchableOpacity>
                  </Box>
                  <Box paddingTop="vs-6" justifyContent="center" flexDirection="row">
                    <Text
                      color="emperor"
                      tx="new_to_meetlete"
                      fontSize={typography.fontSize.regular}
                      fontFamily={typography.fontFamily.primary.medium}
                    />
                    <TouchableOpacity disabled={disableMode} onPress={_onSignUpPress}>
                      <TextGradient
                        variant="bold"
                        tx="sign_up_here"
                        gradient={{
                          colors: palette.gradient.text,
                        }}
                        textDecorationLine="underline"
                        fontSize={typography.fontSize.regular}
                        fontFamily={typography.fontFamily.primary.bold}
                      />
                    </TouchableOpacity>
                  </Box>
                </Box>
              </Box>
            </Box>
          </KeyboardAwareScrollView>
        </Box>
      </LinearGradient>
    </Screen>
  )
}

export default SignInScreen

const styles = ScaledSheet.create({
  flex1: {
    flex: 1,
  },
  icon: {
    position: 'absolute',
    left: '34@s',
  },
  imgBg: {
    position: 'absolute',
    top: 0,
    resizeMode: 'stretch',
    height: metrics.screenHeight * 0.46,
    width: '100%',
  },
  eyeIcon: {
    padding: 0,
  },
  googleLogo: {
    width: '30@vs',
    height: '30@vs'
  },
  facebookLogo: {
    width: '48@vs',
    height: '48@vs'
  },
  appleLogo: {
    width: '48@vs',
    height: '48@vs'
  },
  hideView: {
    backgroundColor: 'transparent',
    height: metrics.screenHeight * 0.3,
  }
})
