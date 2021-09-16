import { Alert, TouchableOpacity } from 'react-native'
import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import { useAuth } from '@hooks/useAuth'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, TextField, Screen, IconSvg, Text, TextGradient } from '@components/index'
import { useTheme } from '@hooks/theme'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '../../i18n/translate'
import { useImmer } from 'use-immer'
import { some } from '@utils/lodash'

type SignInScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/SignIn'>
}
const SignInScreen = ({ navigation }: SignInScreenProps) => {
  const inputRefs = useRef({})
  const { logInWithEmailPassword, logInWithGoogle, logInWithFacebook, logInWithApple, signOut } = useAuth()
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

  const _onHaveProcodePress = useCallback(() => {
    navigation.navigate(Routes.Athlete.EnterProcode)
  }, [navigation])

  const _onForgotPasswordPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.EnterEmail)
  }, [navigation]);

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
            onSubmitEditing={formik.handleSubmit}
            editable={!disableMode}
            value={formik.values.password}
            onChangeText={formik.handleChange('password')}
            errorMessage={formik.touched.password && (formik.errors?.password as string)}
          />
        </Box>
        <TouchableOpacity onPress={_onForgotPasswordPress} disabled={disableMode}>
          <TextGradient
            variant="bold"
            tx="forgot_password"
            gradient={{
              colors: palette.gradient.text,
            }}
          />
        </TouchableOpacity>
        <Button
          width={s(118)}
          height={vs(40)}
          disabled={formik.isSubmitting}
          loading={formik.isSubmitting}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="submit"
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
            labelTx="sign_in_with_google"
            labelVariant="medium"
            marginBottom="vs-3"
            borderRadius="s-2"
            loading={localState.loading.google}
            loadingProps={{ color: theme.colors.primary }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.white,
            }}
            onPress={_onSignInWithGooglePress}
          />
          <Button
            height={vs(60)}
            backgroundColor="white"
            icon={<IconSvg name="facebook" size={s(24)} style={styles.icon as any} />}
            labelTx="sign_in_with_facebook"
            labelVariant="medium"
            marginBottom="vs-3"
            borderRadius="s-2"
            loading={localState.loading.facebook}
            loadingProps={{ color: theme.colors.primary }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.white,
            }}
            onPress={_onSignInWithFacebookPress}
          />
          <Button
            height={vs(60)}
            backgroundColor="black"
            icon={<IconSvg name="apple" size={s(24)} style={styles.icon as any} />}
            labelTx="sign_in_with_apple"
            labelProps={{ color: 'white' }}
            labelVariant="medium"
            borderRadius="s-2"
            loading={localState.loading.apple}
            loadingProps={{ color: theme.colors.white }}
            disabled={disableMode}
            disabledStyle={{
              backgroundColor: theme.colors.black,
            }}
            onPress={_onSignInWithApplePress}
          />
        </Box>
        <TouchableOpacity onPress={_onHaveProcodePress} disabled={disableMode}>
          <TextGradient
            variant="bold"
            tx="already_have_a_procode"
            gradient={{
              colors: palette.gradient.text,
            }}
          />
        </TouchableOpacity>
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
