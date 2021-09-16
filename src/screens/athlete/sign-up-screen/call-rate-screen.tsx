import { Alert, View, TouchableOpacity, Insets, Image } from 'react-native'
import { useCallback, useRef, useState } from 'react'
import { RootParamList } from '@navigation/params'
import { NavigationProp } from '@react-navigation/native'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, Screen, Text, CustomInput } from '@components/index'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { translate } from '@i18n/translate'
import { useAuth } from '@hooks/useAuth'
import ICON_INFO_CIRCLE from '@assets/images/infoCircleIcon.png'
import ICON_AMOUNT from '@assets/images/amountIcon.png'
import { metrics } from '@styles/metrics'
import { athleteUpdateAthteleProfileEachStep } from '@src/database/functions/users'

type CallRateScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/CallRate'>
}

const hitSlop: Insets = { top: 20, bottom: 20, right: 20, left: 20 }

const CallRateScreen = ({ navigation }: CallRateScreenProps) => {
  const theme = useTheme()
  const { user } = useAuth()
  const { top, bottom } = useSafeAreaInsets()
  const inputRefs = useRef({})

  const renderAmountIcon = useCallback(() => {
    return <Image source={ICON_AMOUNT} />
  }, [])

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const skipScreen = useCallback(() => {
    navigation.navigate(Routes.Athlete.TakePicture)
  }, [navigation])

  const isComingSoon = () => {
    Alert.alert('IS COMING SOON')
  }

  const onSubmit = useCallback(
    async (values) => {
      try {
        const data = {
          email: user.customData.email,
          profile: {
            ...values,
            callPrice: parseFloat(values.callPrice),
          },
        }
        await athleteUpdateAthteleProfileEachStep({ user, data })
        navigation.navigate(Routes.Athlete.TakePicture)
      } catch (error) {
        Alert.alert('Failed to sign up', error.message)
      }
    },
    [athleteUpdateAthteleProfileEachStep, navigation],
  )

  const handleCallPriceChange = (text: string) => {
    formik.setFieldValue('callPrice', parseFloat(text))
  }

  const formik = useFormik({
    initialValues: {
      callPrice: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      callPrice: yup
        .number()
        .required(translate('total_amount_is_required'))
        .min(1, translate('price_value_error'))
        .max(9999, translate('price_value_error')),
    }),
  })

  return (
    <Screen preset="scroll" backgroundColor={palette.white}>
      <Box height={metrics.screenHeight - top} paddingHorizontal="s-5" backgroundColor="white">
        <Box flexDirection="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="clear"
            icon={{ name: 'chevron-left' }}
            containerStyle={[styles.closeIcon]}
            onPress={_onBackPress}
          />
          <Text tx="sign_up" paddingRight="s-5" fontSize={typography.fontSize.large} variant="bold" color="gray_2" />
          <Box />
        </Box>
        <Box flexDirection="row" justifyContent="space-between" marginTop="s-7" width="100%">
          <Box flex={2 / 3}>
            <Text tx="manage_call_rate" fontSize={typography.fontSize.largerS} variant="bold" color="gray_2" />
          </Box>
          <Box flex={1 / 4}>
            <Button
              width={s(60)}
              containerStyle={styles.buttonPage}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#049C69', '#049C69', '#009EBE'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              labelTx="button_call_rate"
              labelVariant="button"
            />
          </Box>
        </Box>
        <Box flexDirection="row" justifyContent="space-between" alignItems="center" marginTop="vs-14">
          <Text tx="your_call_rate" color="emperor" variant="bold" fontSize={typography.fontSize.regular} />
          <Box onTouchEnd={isComingSoon}>
            <Image source={ICON_INFO_CIRCLE} />
          </Box>
        </Box>
        <Box marginTop="vs-3">
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text tx="total_amount" color="emperor" fontSize={typography.fontSize.small} />
            <CustomInput
              autoFocus
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              inputRef={(ref) => {
                inputRefs.current[0] = ref
              }}
              maxLength={4}
              height={vs(48)}
              width={metrics.screenWidth * 0.4}
              variant="rounded"
              backgroundColor="transparent"
              placeholderTextColor={theme.colors.grey}
              placeholderTx="placeholder_fee"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              keyboardType="numeric"
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'black',
                fontWeight: '300',
                textAlign: 'right',
              }}
              leftIcon={renderAmountIcon()}
              editable={true}
              value={formik.values.callPrice}
              onChangeText={(text) => handleCallPriceChange(text)}
              errorMessage={formik.errors?.callPrice as string}
              renderErrorMessage={false}
            />
          </Box>
          {formik.errors?.callPrice && (
            <Text marginTop="vs-1" color="red_2" variant="small" text={(formik.errors?.callPrice as string) || ''} />
          )}
          <View style={styles.lineThrough} />
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text tx="service_fee" color="emperor" fontSize={typography.fontSize.small} />
            <CustomInput
              autoFocus
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              inputRef={(ref) => {
                inputRefs.current[0] = ref
              }}
              height={vs(48)}
              width={metrics.screenWidth * 0.4}
              variant="rounded"
              backgroundColor="transparent"
              placeholderTextColor={theme.colors.grey}
              placeholderTx="placeholder_fee"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              customContainerStyle={styles.customContainer}
              gradient={{
                colors: palette.gradient.transparent,
              }}
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
                textAlign: 'right',
              }}
              editable={false}
              leftIcon={renderAmountIcon()}
              value={formik.errors.callPrice ? parseInt('0.00') : (parseInt(formik.values.callPrice || '0.00') * 0.25).toFixed(2).toString()}
            />
          </Box>
          <View style={styles.lineThrough} />
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text tx="you_receive" color="emperor" fontSize={typography.fontSize.small} />
            <CustomInput
              autoFocus
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              inputRef={(ref) => {
                inputRefs.current[0] = ref
              }}
              height={vs(48)}
              width={metrics.screenWidth * 0.4}
              variant="rounded"
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.grey}
              customContainerStyle={styles.customContainerGrey}
              placeholderTx="placeholder_fee"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              gradient={{
                colors: palette.gradient.transparent,
              }}
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
                textAlign: 'right',
              }}
              editable={false}
              leftIcon={renderAmountIcon()}
              value={(formik.errors.callPrice ? parseInt('0.00') : parseInt(formik.values.callPrice || '0.00') * 0.75).toFixed(2).toString()}
            />
          </Box>
        </Box>
        <Box position="absolute" left={0} bottom={0} right={0} marginVertical="vs-7.5">
          <Box flexDirection="row" width="100%" justifyContent="space-around" paddingStart="s-3">
            <TouchableOpacity onPress={skipScreen} hitSlop={hitSlop} style={styles.wrapperTouch}>
              <Text tx="skip" fontSize={typography.fontSize.larger} variant="bold" color="gray_2" />
            </TouchableOpacity>
            <Button
              width={metrics.screenWidth * 0.65}
              height={vs(48)}
              borderRadius="s-6"
              disabled={formik.isSubmitting}
              loading={formik.isSubmitting}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.buttonV2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              labelTx="next"
              labelVariant="bold"
              labelProps={{
                color: 'white',
                fontSize: typography.fontSize.larger,
              }}
              onPress={formik.handleSubmit}
            />
          </Box>
        </Box>
      </Box>
    </Screen>
  )
}

export default CallRateScreen

const styles = ScaledSheet.create({
  closeIcon: {
    right: '10@s',
  },
  buttonPage: {
    marginLeft: 40,
    borderRadius: 7,
    alignItems: 'center',
  },
  lineThrough: {
    width: '100%',
    height: 1,
    borderWidth: 0.5,
    borderColor: palette.grey,
    marginVertical: vs(12),
  },
  customContainer: {
    backgroundColor: '#fff',
  },
  customContainerGrey: {
    backgroundColor: '#F2F2F2',
  },
  wrapperTouch: {
    justifyContent: 'center',
  },
})
