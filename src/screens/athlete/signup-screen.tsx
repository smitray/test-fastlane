import { Alert, TouchableOpacity, View } from 'react-native'
import { useCallback, useRef } from 'react'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { RootParamList } from '@navigation/params'
import FastImage from 'react-native-fast-image'
import { useAuth } from '@hooks/useAuth'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, mvs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, Screen, Text, TextGradient, CustomInput } from '@components/index'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '../../i18n/translate'
import { typography } from '@styles/typography'
import { metrics } from '@styles/metrics'
import { athleteNewSignUpFlow, initUserAfterSignup } from '@src/database/functions/users'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

type SignUpScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/SignUp'>
}
const BACKGROUND = require('@assets/images/talentSignUpBackground.png')
const GOOGLE = require('@assets/images/google.png')
const FACEBOOK = require('@assets/images/facebook.png')
const APPLE = require('@assets/images/apple.png')

const SignInScreen = ({ navigation }: SignUpScreenProps) => {
  const { signUpWithEmailPassword, signOut, signUpWithGoogle, signUpWithFacebook, signUpWithApple } = useAuth()
  const inputRefs = useRef({})

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onLoginPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.SignIn)
  }, [navigation])

  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        const user = await signUpWithEmailPassword(email, password)
        if (user) {
          await athleteNewSignUpFlow({ user, email })
          navigation.navigate(Routes.Athlete.PersonalInformation)
        }
      } catch (error) {
        Alert.alert(translate('failed_to_sign_up_with_email'), error.message)
        return await signOut()
      }
    },
    [navigation, signOut, signUpWithEmailPassword],
  )

  // SIGN UP WITH GOOGLE
    const _onSignUpWithGoogle = useCallback(async () => {
      try {
        const user = await signUpWithGoogle()
        // google signin can not get email: https://developer.mongodb.com/community/forums/t/email-with-google-auth-missing/104121/
        // so email only used to update user when they login with google
        const currentGoogleUser = await GoogleSignin.getCurrentUser()
        console.log('EMAIL GOOGLE=====', currentGoogleUser.user.email)
        await athleteNewSignUpFlow({
          user,
          email: currentGoogleUser.user.email,
        })
        navigation.navigate(Routes.Athlete.PersonalInformation)
      } catch (error) {
        Alert.alert(translate('failed_to_sign_up_with_google'), error.message)
        return await signOut()
      }
    }, [navigation, signOut, signUpWithGoogle])

  // SIGN UP WITH FACEBOOK
  const _onSignUpWithFacebook = useCallback(async () => {
    try {
      const user = await signUpWithFacebook()
      await athleteNewSignUpFlow({
        user
      })
      navigation.navigate(Routes.Athlete.PersonalInformation)
    } catch (error) {
      Alert.alert(translate('failed_to_sign_up_with_facebook'), error.message)
      return await signOut()
    }
  }, [navigation, signOut, signUpWithFacebook])

  // SIGN UP WITH APPLE
  const _onSignUpWithApple = useCallback(async () => {
    try {
      const user = await signUpWithApple()
      await athleteNewSignUpFlow({
        user
      })
      navigation.navigate(Routes.Athlete.PersonalInformation)
    } catch (error) {
      Alert.alert(translate('failed_to_sign_up_with_apple'), error.message)
      return await signOut()
    }
  }, [navigation, signOut, signUpWithApple])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit,
    validationSchema: yup.object().shape({
      email: yup.string().email(translate('email_must_be_valid')).required(translate('email_is_required')),
      password: yup.string().required(translate('password_is_required')),
      confirmPassword: yup.string().required(translate('confirm_password_is_required')).oneOf([yup.ref('password'), null], translate('confirm_password_does_not_match'))
    }),
  })

  const disableMode = formik.isSubmitting
  return (
    <Screen
      unsafe
      preset="fixed"
      headerV2={{
        leftButtonProps: {
          icon: { name: 'chevron-left', color: 'white', size: 26 },
        },
        onLeftPress: _onBackPress,
      }}
    >
      <LinearGradient
        colors={palette.gradient.background}
        style={styles.flex1}
        start={{ x: 1, y: 0 }}
        end={{ x: 1, y: 0 }}
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
              height={metrics.screenHeight * 0.7}
              borderTopLeftRadius="s-9"
              borderTopRightRadius="s-9"
              backgroundColor="white"
              paddingHorizontal="s-6"
            >
              <Box flex={1}>
                <Box paddingTop="vs-5" paddingBottom="vs-5">
                  <Text
                    variant="bold"
                    tx="become_an_industry_leader_in"
                    fontSize={typography.fontSize.largerS}
                    fontFamily={typography.fontFamily.primary.bold}
                    lineHeight={mvs(27)}
                  />
                  <TextGradient
                    variant="bold"
                    tx="providing_fans_with"
                    gradient={{
                      colors: palette.gradient.text,
                    }}
                    fontSize={typography.fontSize.largerS}
                    fontFamily={typography.fontFamily.primary.bold}
                    lineHeight={mvs(27)}
                  />
                </Box>
                <Box flexDirection="row">
                  <TouchableOpacity disabled={disableMode} style={styles.flex1} onPress={_onSignUpWithGoogle}>
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
                  <TouchableOpacity disabled={disableMode} style={styles.flex1} onPress={_onSignUpWithFacebook}>
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
                  <TouchableOpacity disabled={disableMode} style={[styles.flex1, { height: vs(43) }]} onPress={_onSignUpWithApple}>
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
                <Text
                  paddingTop="vs-4.5"
                  textAlign="center"
                  color="emperor"
                  tx="or_sign_up"
                  fontWeight="400"
                  fontSize={typography.fontSize.regular}
                  fontFamily={typography.fontFamily.primary.semiBold}
                />
                <Box paddingTop="vs-5">
                  <CustomInput
                    onSubmitEditing={() => {
                      inputRefs.current[1]?.focus()
                    }}
                    inputRef={(ref) => {
                      inputRefs.current[0] = ref
                    }}
                    paddingHorizontal="vs-3"
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
                    value={formik.values.email}
                    onChangeText={formik.handleChange('email')}
                    errorMessage={formik.touched.email && (formik.errors?.email as string)}
                    customErrorStyle={styles.customErrorStyle}
                  />
                  <Box paddingTop="vs-4" >
                    <CustomInput
                      onSubmitEditing={() => {
                        inputRefs.current[2]?.focus()
                      }}
                      inputRef={(ref) => {
                        inputRefs.current[1] = ref
                      }}
                      secureTextEntry
                      paddingHorizontal="s-3"
                      borderBottomColor="transparent"
                      height={vs(48)}
                      editable={!disableMode}
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

                      value={formik.values.password}
                      onChangeText={formik.handleChange('password')}
                      errorMessage={formik.touched.password && (formik.errors?.password as string)}
                      customErrorStyle={styles.customErrorStyle}
                    />
                  </Box>
                  <Box paddingTop="vs-4" >
                    <CustomInput
                      onSubmitEditing={formik.handleSubmit}
                      inputRef={(ref) => {
                        inputRefs.current[2] = ref
                      }}
                      secureTextEntry
                      paddingHorizontal="s-3"
                      borderBottomColor="transparent"
                      height={vs(48)}
                      variant="rounded"
                      editable={!disableMode}
                      textVariant="semiBold"
                      color="pickledBluewood"
                      placeholderTx="confirm_password"
                      autoCapitalize="none"
                      returnKeyType="next"
                      textProps={{
                        fontSize: typography.fontSize.large,
                        fontWeight: '300',
                      }}
                      rightIconContainerStyle={styles.eyeIcon}
                      value={formik.values.confirmPassword}
                      onChangeText={formik.handleChange('confirmPassword')}
                      errorMessage={formik.touched.confirmPassword && (formik.errors?.confirmPassword as string)}
                      customErrorStyle={styles.customErrorStyle}
                    />
                  </Box>
                </Box>
                <Box flexGrow={1} paddingBottom="vs-5" justifyContent="flex-end">
                  <Button
                    width={'100%'}
                    borderRadius="s-6"
                    height={vs(48)}
                    disabled={formik.isSubmitting}
                    loading={formik.isSubmitting}
                    ViewComponent={LinearGradient}
                    linearGradientProps={{
                      colors: palette.gradient.buttonV2,
                      start: { x: 0, y: 0 },
                      end: { x: 1, y: 0 },
                    }}
                    labelTx="next"
                    labelVariant="bold"
                    labelProps={{
                      color: 'white',
                      fontSize: typography.fontSize.larger,
                    }}
                    onPress={formik.handleSubmit}
                  />
                  <Box paddingTop="vs-4" justifyContent="center" flexDirection="row">
                    <Text
                      color="emperor"
                      tx="already_have_an_account"
                      fontSize={typography.fontSize.regular}
                      fontFamily={typography.fontFamily.primary.medium}
                    />
                    <TouchableOpacity disabled={disableMode} onPress={_onLoginPress}>
                      <TextGradient
                        variant="bold"
                        tx="login_here"
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
    height: metrics.screenHeight * 0.44,
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
  customErrorStyle: {
    marginBottom: -vs(10)
  },
  hideView: {
    backgroundColor: 'transparent',
    height: metrics.screenHeight * 0.3,
  },
})
