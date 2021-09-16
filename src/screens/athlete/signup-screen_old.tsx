import { Alert, TouchableOpacity } from 'react-native'
import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import { RouteProp } from '@react-navigation/native'
import { useAuth } from '@hooks/useAuth'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { initUserAfterSignup } from '@src/database/functions/users'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, TextField, Screen, IconSvg, Text, TextGradient } from '@components/index'
import { useTheme } from '@hooks/theme'
import { translate } from '@i18n/translate'
import { StackNavigationProp } from '@react-navigation/stack'
import { useImmer } from 'use-immer'
import { some } from '@utils/lodash'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

type SignUpScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/SignUp'>
  route: RouteProp<RootParamList, 'Athlete/SignUp'>
}
const SignUpScreen = ({ navigation, route }: SignUpScreenProps) => {
  const { signUpWithEmailPassword, signUpWithGoogle, signUpWithFacebook, signUpWithApple, signOut } = useAuth()
  const inputRefs = useRef({})
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

  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        const user = await signUpWithEmailPassword(email, password)
        if (user) {
          const { proCode, isTermAccepted } = route.params
          await initUserAfterSignup({
            user,
            proCode,
            isTermAccepted,
            type: 'athlete',
          })
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
      } catch (error) {
        Alert.alert(translate('failed_to_sign_up_with_email'), error.message)
        return await signOut()
      }
    },
    [navigation, route.params, signOut, signUpWithEmailPassword],
  )

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      email: yup.string().email().required(),
      password: yup.string().required(),
    }),
  })

  const _onSignUpWithGoogle = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.google = true
      })
      const { proCode, isTermAccepted } = route.params
      const user = await signUpWithGoogle()
      // google signin can not get email: https://developer.mongodb.com/community/forums/t/email-with-google-auth-missing/104121/
      // so email only used to update user when they login with google
      const currentGoogleUser = await GoogleSignin.getCurrentUser()
      await initUserAfterSignup({
        user,
        proCode,
        isTermAccepted,
        type: 'athlete',
        email: currentGoogleUser.user.email,
      })
      await _handleNavigateAfterSignIn(user)
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
  }, [_handleNavigateAfterSignIn, route.params, setLocalState, signOut, signUpWithGoogle])

  const _onSignUpWithFacebook = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.facebook = true
      })
      const user = await signUpWithFacebook()
      const { proCode, isTermAccepted } = route.params
      await initUserAfterSignup({
        user,
        proCode,
        isTermAccepted,
        type: 'athlete',
      })
      await _handleNavigateAfterSignIn(user)
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
  }, [_handleNavigateAfterSignIn, route.params, setLocalState, signOut, signUpWithFacebook])

  const _onSignUpWithApple = useCallback(async () => {
    try {
      setLocalState((draft) => {
        draft.loading.apple = true
      })
      const user = await signUpWithApple()
      const { proCode, isTermAccepted } = route.params
      await initUserAfterSignup({
        user,
        proCode,
        isTermAccepted,
        type: 'athlete',
      })
      await _handleNavigateAfterSignIn(user)
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
  }, [_handleNavigateAfterSignIn, route.params, setLocalState, signOut, signUpWithApple])

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
            borderColor="transparent"
            paddingHorizontal="s-10"
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
        <TouchableOpacity onPress={_onHaveProcodePress}>
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

export default SignUpScreen

const styles = ScaledSheet.create({
  icon: {
    position: 'absolute',
    left: '34@s',
  },
})
