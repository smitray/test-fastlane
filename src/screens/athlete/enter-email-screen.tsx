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

type EnterEmailScreenProps = {
  navigation: StackNavigationProp<RootParamList, 'Athlete/EnterEmail'>
}
const EnterEmailScreen = ({ navigation }: EnterEmailScreenProps) => {
  const inputRefs = useRef({})
  const theme = useTheme()
  const { resetPassword } = useAuth()

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onSubmit = useCallback(
    async ({ email }) => {
      try {
        await resetPassword(email, 0)
        Alert.alert('A password reset link has been sent to your email.')
        navigation.goBack()
      } catch (error) {
        Alert.alert(`Email not found. Please check and try again`)
      }
    },
    []
  )
 
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      email: yup.string().email(translate('email_must_be_valid')).required(translate('email_is_required')),
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
        onLeftPress: _onBackPress,
      }}
    >
      <Box alignItems="center" paddingHorizontal="s-7" marginTop="vs-10">
        <Text tx="enter_your_email" variant="bold" color="scorpion" />
        <Box marginTop="vs-4" width="100%">
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

export default EnterEmailScreen
