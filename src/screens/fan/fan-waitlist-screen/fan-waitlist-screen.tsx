/* eslint-disable react-native/no-inline-styles */
import { Box, Button, Text, Screen } from '@components/index'
import { useCallback, useRef } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { palette } from '@styles/palette'
import { Image } from 'react-native'
import { typography } from '@styles/typography'
import PhoneInput from './components/phone-input'
import { useImmer } from 'use-immer'
import { translate } from '@i18n/translate'
import { useTheme } from '@hooks/theme'
import TextInputMask from 'react-native-text-input-mask'
import Routes from '@navigation/routes'
import { useAuth } from '@hooks/useAuth'
import { addPhoneToWaitList } from '@src/database/functions/users'
import { show } from '@utils/toast'

const FanWaitListScreen = ({ navigation }) => {
  const { user } = useAuth()
  const theme = useTheme()
  const phoneTextRef = useRef(null)
  const phoneInputRef = useRef(null)
  const [state, setState] = useImmer({
    isSubmitting: false,
    phone: '',
    phoneWithoutCallingCode: '',
    defaultCode: 'US',
    touched: true,
    error: null,
  })
  const onSubmit = useCallback(async () => {
    if (!state.phone && !phoneInputRef.current.isValidNumber(state.phone)) {
      setState((draft) => {
        draft.error = 'Phone number is invalid'
      })
    } else {
      const phone = state.phone.replace(/'-'/g, '')
      try {
        setState((draft) => {
          draft.isSubmitting = true
        })
        const { totalFanInWaitList } = await addPhoneToWaitList({ user, phone })
        setState((draft) => {
          draft.isSubmitting = false
          draft.phone = ''
          draft.phoneWithoutCallingCode = ''
          draft.defaultCode = ''
          draft.touched = true
          draft.error = null
        })
        show({ type: 'success', messageTx: 'message_sent_successfully' })
        navigation.navigate(Routes.Fan.PostFanWaitList, { order: totalFanInWaitList })
      } catch (err) {
        setState((draft) => {
          draft.isSubmitting = false
          draft.error = err.error
        })
        show({ type: 'error', message: err.message })
      }
    }
  }, [navigation, setState, state.phone, user])

  const onLogin = useCallback(() => {
    navigation.navigate(Routes.Fan.SignIn)
  }, [navigation])

  const onChangeText = useCallback(
    (text) => {
      setState((draft) => {
        draft.phoneWithoutCallingCode = text
        draft.touched = true
        draft.error = null
      })
    },
    [setState],
  )

  const onChangeFormattedText = useCallback(
    (text) => {
      setState((draft) => {
        draft.phone = text
      })
    },
    [setState],
  )

  return (
    <Screen backgroundColor="white" unsafe preset="scroll" style={{ flexGrow: 1, paddingTop: 0 }}>
      <Image source={require('@assets/images/fan-waitlist.png')} style={styles.imgBg} />
      <Box paddingHorizontal="vs-6" alignItems="center" flex={1} paddingBottom="vs-5">
        <Box height={vs(60)} width={vs(60)} position="absolute" top={-vs(90)} left={s(24)}>
          <Image source={require('@assets/images/small-logo.png')} style={styles.logo} />
        </Box>
        <Box width="100%">
          <Text tx="want_to_meet_favorite_athletes" variant="semiBold" fontSize={typography.fontSize.largest} />
          <Text tx="join_meetlete_waitlist" fontSize={typography.fontSize.largest} color="emperor" mt="vs-4" />
        </Box>
        <Box flex={1} justifyContent="center" marginTop="vs-14">
          <PhoneInput
            ref={phoneInputRef}
            disabled={state.isSubmitting}
            editable={!state.isSubmitting}
            flagButtonStyle={styles.phoneInputFlagButton}
            containerStyle={styles.phoneInputContainer}
            textContainerStyle={styles.phoneInputTextContainer}
            codeTextStyle={styles.phoneInputCodeText}
            textInputStyle={styles.phoneInputTextInput}
            disableArrowIcon
            defaultValue={state.phoneWithoutCallingCode}
            style={styles.bottomSheetMobileNumberInput}
            defaultCode={state.defaultCode}
            layout="second"
            onChangeText={onChangeText}
            onChangeFormattedText={onChangeFormattedText}
            placeholder={translate('enter_your_phone_number')}
            textInputProps={{
              value: state.phoneWithoutCallingCode,
              placeholderTextColor: theme.colors.silver,
              ref: phoneTextRef,
              blurOnSubmit: false,
              fontSize: typography.fontSize.medium,
            }}
            mask={'[000]-[000]-[0000]'}
            InputComponent={TextInputMask as any}
          />
          <Box mt="vs-1" height={vs(24)}>
            {!!state.error && state.touched && <Text text={state.error} color="red" />}
          </Box>
        </Box>
        <Button
          height={vs(48)}
          borderRadius="s-12"
          containerStyle={{ width: '100%' }}
          disabled={state.isSubmitting}
          loading={state.isSubmitting}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.background,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="submit"
          labelVariant="bold"
          labelProps={{ color: 'white', fontSize: typography.fontSize.medium }}
          onPress={onSubmit}
          marginVertical="vs-5"
        />
        <Text tx="already_have_an_account" variant="medium" />
        <Button
          variant="clear"
          width={s(118)}
          height={vs(40)}
          disabled={state.isSubmitting}
          labelTx="login"
          labelVariant="bold"
          labelProps={{ color: 'dodgerBlue' }}
          onPress={onLogin}
          disabledStyle={{ backgroundColor: 'transparent' }}
        />
      </Box>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  imgBg: {
    height: vs(423),
    resizeMode: 'stretch',
    width: '100%',
  },
  logo: {
    height: '100%',
    resizeMode: 'contain',
    width: '100%',
  },
  phoneInputFlagButton: {
    width: null,
    height: '30@vs',
    borderWidth: 1,
    paddingLeft: '4@s',
    borderColor: '#E0E0E0',
    borderRadius: '4@vs',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '39@s',
  },
  phoneInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
    paddingBottom: '10@vs',
  },
  phoneInputTextContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'white',
  },
  phoneInputCodeText: {
    fontFamily: typography.fontFamily.primary.semiBold,
    color: '#BDBDBD',
    fontSize: typography.fontSize.medium,
  },
  phoneInputTextInput: {
    fontFamily: typography.fontFamily.primary.regular,
    color: '#BDBDBD',
    fontSize: typography.fontSize.medium,
  },
  bottomSheetMobileNumberInput: {
    flex: 1,
    alignItems: 'center',
  },
})

export default FanWaitListScreen
