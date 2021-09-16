import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { s, vs } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, TextField, Screen } from '@components/index'
import { useTheme } from '@hooks/theme'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '../../i18n/translate'
import { Alert } from 'react-native'
import { useAuth } from '@hooks/useAuth'
import { RouteProp, useRoute } from '@react-navigation/native'
import Routes from '@navigation/routes'

type ResetPasswordScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/ResetPassword'>
  route: RouteProp<RootParamList, 'Athlete/ResetPassword'>
}
const ResetPasswordScreen = ({ navigation }: ResetPasswordScreenProps) => {
  const inputRefs = useRef({})
  const theme = useTheme()
  const route = useRoute<RouteProp<RootParamList, 'Athlete/ResetPassword'>>()
  const { resetPasswordConfirm, user } = useAuth()
  const { token, tokenId } = route?.params

  const onSubmit = useCallback(
    async ({ newPassword }) => {
      try {
        await resetPasswordConfirm(newPassword, token, tokenId)
        await user.refreshCustomData()
        _resetToLogin()
        Alert.alert('Your password has been reset successfully.')
      } catch (error) {
        Alert.alert(`Unable to reset the password: ${error.message}`)
      }
    },
    []
  )
  const _resetToLogin = useCallback(() => {
    navigation.reset({
      index: 1,
      routes: [{ name: Routes.Welcome }, { name: Routes.Athlete.SignIn }]
    })
  }, [navigation])

  const formik = useFormik({
    initialValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      newPassword: yup.string().required(translate('new_password_is_required')),
      confirmNewPassword: yup.string().required(translate('confirm_new_password_is_required')).oneOf([yup.ref('newPassword'), null], translate('confirm_password_does_not_match'))
    }),
  })

  const disableMode = formik.isSubmitting
  return (
    <Screen
      header={{
        headerTx: 'reset_password',
        style: {
          paddingHorizontal: s(20),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _resetToLogin,
      }}
    >
      <Box alignItems="center" paddingHorizontal="s-7">
        <Box marginTop="vs-10" width="100%">
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
            placeholderTx="new_password"
            secureTextEntry
            textVariant="semiBold"
            returnKeyType="done"
            onSubmitEditing={formik.handleSubmit}
            editable={!disableMode}
            value={formik.values.newPassword}
            onChangeText={formik.handleChange('newPassword')}
            errorMessage={formik.touched.newPassword && (formik.errors?.newPassword as string)}
          />
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
            placeholderTx="confirm_new_password"
            secureTextEntry
            textVariant="semiBold"
            returnKeyType="done"
            onSubmitEditing={formik.handleSubmit}
            editable={!disableMode}
            value={formik.values.confirmNewPassword}
            onChangeText={formik.handleChange('confirmNewPassword')}
            errorMessage={formik.touched.confirmNewPassword && (formik.errors?.confirmNewPassword as string)}
          />
        </Box>

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
      </Box>
    </Screen>
  )
}

export default ResetPasswordScreen
