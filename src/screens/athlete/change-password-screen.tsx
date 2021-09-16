import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { s, vs } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Text, Box, TextField, Screen } from '@components/index'
import { useTheme } from '@hooks/theme'
import { StackNavigationProp } from '@react-navigation/stack'
import { translate } from '../../i18n/translate'
import { useAuth } from '@hooks/useAuth'
import { Alert } from 'react-native'

type ChangePasswordScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/ChangePassword'>
}
const ChangePasswordScreen = ({ navigation }: ChangePasswordScreenProps) => {
  const inputRefs = useRef({})
  const theme = useTheme()
  const { resetPassword, user } = useAuth()
  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onSubmit = useCallback(async ({ newPassword }) => {
    try {
      await resetPassword(user.customData.email, 1, newPassword)
      Alert.alert('Your password has been changed successfully.')
      navigation.goBack()
    } catch (error) {
      Alert.alert(`Unable to update the password: ${error.message}`)
    }
  }, [])

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
        headerTx: 'change_password',
        style: {
          paddingHorizontal: s(20),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _onBackPress,
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

export default ChangePasswordScreen
