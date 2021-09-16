import { Alert } from 'react-native'
import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import { useAuth } from '@hooks/useAuth'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { initUserAfterSignup } from '@src/database/functions/users'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, TextField, Screen, IconSvg, Text } from '@components/index'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '@i18n/translate'
import { useImmer } from 'use-immer'
import { some } from '@utils/lodash'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

type SignupScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Fan/SignUp'>
}
const SignInScreen = ({ navigation }: SignupScreenProps) => {
  const inputRefs = useRef({})
  const { signUpWithEmailPassword, signUpWithGoogle, signUpWithFacebook, signUpWithApple, signOut } = useAuth()
  const theme = useTheme()
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

  const _onLoginPress = useCallback(() => {
    navigation.navigate(Routes.Fan.SignIn)
  }, [navigation])

  const _onSignUpWithEmailPassword = useCallback(
    async ({ email, password }, { resetForm }) => {
      let isSignedUp = false
      let user
      try {
        user = await signUpWithEmailPassword(email, password)
        isSignedUp = true
        await initUserAfterSignup({
          user,
          isTermAccepted: false,
          type: 'fan',
        })
        resetForm()
        navigation.navigate(Routes.Fan.ThankYouSignUp)
      } catch (error) {
        if (error.code === 49) {
          Alert.alert(translate('failed_to_sign_up_with_email'), translate('email_has_already_registered'))
        } else {
          Alert.alert(translate('failed_to_sign_up_with_email'), error.message)
        }
      } finally {
        if (isSignedUp) {
          // only signout when user already signed in
          await signOut(user)
        }
      }
    },
    [navigation, signOut, signUpWithEmailPassword],
  )

  const _handleNavigateAfterSignIn = useCallback(
    async (user, userProfile) => {
      if (user) {
        await user.refreshCustomData()
        const userType = userProfile?.type
        if (userType === 'fan') {
          const isVerified = userProfile?.isVerified
          if (!isVerified) {
            // show alert or error here
            Alert.alert(translate('fan_not_verified'))
            return await signOut()
          }
          if (user?.customData?.name) {
            navigation.reset({
              index: 0,
              routes: [{ name: Routes.FanNavigator }],
            })
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
          }
        }

        if (userType === 'athlete') {
          if (userProfile.name) {
            navigation.reset({
              index: 0,
              routes: [{ name: Routes.AthleteNavigator }],
            })
          } else {
            navigation.reset({
              index: 1,
              routes: [
                { name: Routes.AthleteNavigator },
                {
                  name: Routes.Athlete.EditProfile,
                },
              ],
            })
          }
        }
      }
    },
    [navigation, signOut],
  )

  const _onSignUpWithGoogle = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.google = true
      })
      const user = await signUpWithGoogle()
      // google signin can not get email: https://developer.mongodb.com/community/forums/t/email-with-google-auth-missing/104121/
      // so we must update email when user signup with google
      const currentGoogleUser = await GoogleSignin.getCurrentUser()
      const { user: userData } = await initUserAfterSignup({
        user,
        isTermAccepted: false,
        type: 'fan',
        email: currentGoogleUser.user.email,
      })
      await _handleNavigateAfterSignIn(user, userData)
      setLocalState((draft) => {
        draft.loading.google = false
      })
    } catch (error) {
      setLocalState((draft) => {
        draft.loading.google = false
      })
      await signOut()
      Alert.alert(translate('failed_to_sign_up_with_google'), error.message)
    }
  }, [_handleNavigateAfterSignIn, setLocalState, signOut, signUpWithGoogle])

  const _onSignUpWithFacebook = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.facebook = true
      })
      const user = await signUpWithFacebook()
      const { user: userData } = await initUserAfterSignup({
        user,
        isTermAccepted: false,
        type: 'fan',
      })
      await _handleNavigateAfterSignIn(user, userData)
      setLocalState((draft) => {
        draft.loading.facebook = false
      })
    } catch (error) {
      setLocalState((draft) => {
        draft.loading.facebook = false
      })
      await signOut()
      Alert.alert(translate('failed_to_sign_up_with_facebook'), error.message)
    }
  }, [_handleNavigateAfterSignIn, setLocalState, signOut, signUpWithFacebook])

  const _onSignUpWithApple = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.apple = true
      })
      const user = await signUpWithApple()
      const { user: userData } = await initUserAfterSignup({
        user,
        isTermAccepted: false,
        type: 'fan',
      })
      await _handleNavigateAfterSignIn(user, userData)
      setLocalState((draft) => {
        draft.loading.apple = false
      })
    } catch (error) {
      setLocalState((draft) => {
        draft.loading.apple = false
      })
      await signOut()
      Alert.alert(translate('failed_to_sign_up_with_apple'), error.message)
    }
  }, [_handleNavigateAfterSignIn, setLocalState, signOut, signUpWithApple])

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: _onSignUpWithEmailPassword,
    validationSchema: yup.object().shape({
      email: yup.string().email(translate('email_must_be_valid')).required(translate('email_is_required')),
      password: yup.string().required(translate('password_is_required')),
    }),
  })

  const disableMode = formik.isSubmitting || some(Object.values(localState.loading), true)
  return (
    <Screen
      header={{
        style: {
          paddingHorizontal: s(20),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _onBackPress,
      }}
    >
      <Box alignItems="center" paddingHorizontal="s-7" justifyContent="center">
        <Box marginBottom="vs-6">
          <IconSvg name="logo" height={vs(62)} width={s(198)} />
        </Box>
        <Box width="100%">
          <TextField
            blurOnSubmit={false}
            onSubmitEditing={() => {
              inputRefs.current[1]?.focus()
            }}
            paddingHorizontal="s-10"
            borderColor="transparent"
            height={vs(60)}
            variant="rounded"
            color="pickledBluewood"
            placeholderTextColor={theme.colors.pickledBluewood}
            placeholderTx="email"
            autoCapitalize="none"
            textVariant="semiBold"
            keyboardType="email-address"
            returnKeyType="next"
            editable={!disableMode}
            value={formik.values.email}
            onChangeText={formik.handleChange('email')}
            errorMessage={formik.touched.email && (formik.errors?.email as string)}
          />
        </Box>
        <Box width="100%">
          <TextField
            inputRef={(ref) => {
              inputRefs.current[1] = ref
            }}
            blurOnSubmit={false}
            paddingHorizontal="s-10"
            borderColor="transparent"
            height={vs(60)}
            variant="rounded"
            color="pickledBluewood"
            placeholderTextColor={theme.colors.pickledBluewood}
            placeholderTx="password"
            secureTextEntry
            textVariant="semiBold"
            returnKeyType="done"
            editable={!disableMode}
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            errorMessage={formik.touched.password && (formik.errors?.password as string)}
          />
        </Box>
        <Button
          width={s(118)}
          height={vs(40)}
          disabled={disableMode}
          loading={formik.isSubmitting}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="sign_up"
          labelVariant="bold"
          marginTop="vs-7"
          marginBottom="vs-5"
          labelProps={{ color: 'white' }}
          onPress={formik.handleSubmit}
        />

        <Box flexDirection="row" alignItems="center" justifyContent="center" marginBottom="vs-8">
          <Box height={1} backgroundColor="line" width="25%" />
          <Text tx="or" marginHorizontal="s-5" />
          <Box height={1} backgroundColor="line" width="25%" />
        </Box>
        <Box width="100%" marginBottom="vs-12">
          <Button
            backgroundColor="white"
            height={vs(60)}
            icon={<IconSvg name="google" size={s(24)} style={styles.icon as any} />}
            labelTx="sign_up_with_google"
            labelVariant="medium"
            marginBottom="vs-3"
            borderRadius="s-2"
            loading={localState.loading.google}
            loadingProps={{ color: theme.colors.primary }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.white,
            }}
            onPress={_onSignUpWithGoogle}
          />
          <Button
            height={vs(60)}
            backgroundColor="white"
            icon={<IconSvg name="facebook" size={s(24)} style={styles.icon as any} />}
            labelTx="sign_up_with_facebook"
            labelVariant="medium"
            marginBottom="vs-3"
            borderRadius="s-2"
            loading={localState.loading.facebook}
            loadingProps={{ color: theme.colors.primary }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.white,
            }}
            onPress={_onSignUpWithFacebook}
          />
          <Button
            height={vs(60)}
            backgroundColor="black"
            icon={<IconSvg name="apple" size={s(24)} style={styles.icon as any} />}
            labelTx="sign_up_with_apple"
            labelProps={{ color: 'white' }}
            labelVariant="medium"
            borderRadius="s-2"
            loading={localState.loading.apple}
            loadingProps={{ color: theme.colors.white }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.black,
            }}
            onPress={_onSignUpWithApple}
          />
        </Box>
        <Text tx="already_have_an_account" />
        <Button
          variant="clear"
          labelTx="login"
          labelProps={{
            color: 'dodgerBlue',
            fontSize: typography.fontSize.regular,
          }}
          labelVariant="bold"
          onPress={_onLoginPress}
        />
      </Box>
    </Screen>
  )
}

export default SignInScreen

const styles = ScaledSheet.create({
  icon: {
    position: 'absolute',
    left: '34@s',
  },
})
