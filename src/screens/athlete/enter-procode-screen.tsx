import { Alert, Linking, Text as RNText, TouchableOpacity } from 'react-native'
import { Screen, IconSvg, Box, Text, Button, TextGradient } from '@components/index'
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field'
import { useState, useCallback } from 'react'
import { s, vs, ScaledSheet, mvs } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import { palette } from '@styles/palette'
import LinearGradient from 'react-native-linear-gradient'
import Modal from 'react-native-modal'
import { useAuth } from '@hooks/useAuth'
import { translate } from '@i18n/translate'
import Routes from '@navigation/routes'
import { TERMS_ATHLETE_URL, PRIVACY_POLICY_URL } from '@env'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const CELL_COUNT = 6
const EnterProcodeScreen = ({ navigation, route }) => {
  const [value, setValue] = useState(route.params?.code || '')
  const [isSubmitting, setSubmitting] = useState(false)
  const [isModalVisible, setModalVisible] = useState(false)
  const { top } = useSafeAreaInsets()

  const { athleteSubmitProCode } = useAuth()
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT })
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  })

  const _onBackPress = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: Routes.Welcome }],
      })
    }
  }, [navigation])

  const _onSubmitPress = useCallback(async () => {
    setSubmitting(true)
    try {
      if (value.length === CELL_COUNT) {
        await athleteSubmitProCode(value)
        setModalVisible(true)
      }
      setSubmitting(false)
    } catch (err) {
      setSubmitting(false)
      Alert.alert(translate('failed_to_submit_procode'), err.message)
    }
  }, [athleteSubmitProCode, value])

  const _onDeclinePress = useCallback(() => {
    setModalVisible(false)
    navigation.replace(Routes.Athlete.SignUp, {
      proCode: value,
      isTermAccepted: false,
    })
  }, [navigation, value])

  const _onAcceptPress = useCallback(() => {
    setModalVisible(false)
    navigation.replace(Routes.Athlete.SignUp, {
      proCode: value,
      isTermAccepted: true,
    })
  }, [navigation, value])

  const _onTermsAndConditionsPress = useCallback(async () => {
    const supported = await Linking.canOpenURL(TERMS_ATHLETE_URL)

    if (supported) {
      await Linking.openURL(TERMS_ATHLETE_URL)
    } else {
      Alert.alert(`Don't know how to open this URL: ${TERMS_ATHLETE_URL}`)
    }
  }, [])

  const _onPrivacyPolicyPress = useCallback(async () => {
    const supported = await Linking.canOpenURL(PRIVACY_POLICY_URL)

    if (supported) {
      await Linking.openURL(PRIVACY_POLICY_URL)
    } else {
      Alert.alert(`Don't know how to open this URL: ${PRIVACY_POLICY_URL}`)
    }
  }, [])

  return (
    <Screen preset="scroll">
      <Button
        variant="clear"
        icon={{ name: 'west' }}
        containerStyle={[
          styles.closeIcon,
          {
            top: top + vs(20),
          },
        ]}
        onPress={_onBackPress}
      />
      <Box alignItems="center" paddingHorizontal="s-9">
        <Box marginBottom="vs-10">
          <IconSvg name="logo" height={vs(62)} width={s(198)} />
        </Box>
        <IconSvg name="congrats" size={s(61)} />
        <Text tx="hooray" variant="bold" marginTop="vs-3" />
        <Text tx="your_account_has_been_registered" variant="bold" marginTop="vs-4" />

        <Box style={styles.codeWrapper}>
          <Text tx="enter_your_procode" variant="bold" color="scorpion" />
          <CodeField
            ref={ref}
            {...props}
            value={value}
            editable={!isSubmitting}
            autoFocus
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            returnKeyType="done"
            renderCell={({ index, symbol, isFocused }) => (
              <RNText
                key={index}
                style={[styles.cell, isFocused && styles.focusCell]}
                onLayout={getCellOnLayoutHandler(index)}
              >
                {symbol || (isFocused ? <Cursor /> : null)}
              </RNText>
            )}
            onSubmitEditing={_onSubmitPress}
          />
        </Box>

        <Button
          width={s(118)}
          height={vs(40)}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="submit"
          labelVariant="bold"
          labelProps={{ color: 'white' }}
          onPress={_onSubmitPress}
          loading={isSubmitting}
          disabled={isSubmitting}
        />
      </Box>
      <Modal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onBackButtonPress={() => setModalVisible(false)}
      >
        <Box style={styles.modal}>
          <RNText>
            <Text tx="by_clicking_accept" variant="medium" lineHeight={vs(21)} />{' '}
            <TouchableOpacity onPress={_onTermsAndConditionsPress}>
              <TextGradient
                variant="bold"
                tx="terms_and_conditions"
                gradient={{
                  colors: palette.gradient.text,
                }}
                style={styles.terms}
              />
            </TouchableOpacity>{' '}
            <Text tx="and" variant="medium" lineHeight={vs(21)} />{' '}
            <TouchableOpacity onPress={_onPrivacyPolicyPress}>
              <TextGradient
                variant="bold"
                tx="privacy_policy"
                gradient={{
                  colors: palette.gradient.text,
                }}
                style={{
                  lineHeight: mvs(20),
                }}
              />
            </TouchableOpacity>
          </RNText>
          <Box flexDirection="row" justifyContent="space-around" marginTop="vs-10">
            <Button
              variant="outline"
              width={s(118)}
              height={vs(36)}
              labelTx="decline"
              labelVariant="bold"
              labelProps={{ color: 'grey' }}
              onPress={_onDeclinePress}
            />
            <Button
              width={s(118)}
              height={vs(36)}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.button,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              labelTx="accept"
              labelVariant="bold"
              labelProps={{ color: 'white' }}
              onPress={_onAcceptPress}
            />
          </Box>
        </Box>
      </Modal>
    </Screen>
  )
}

export default EnterProcodeScreen

const styles = ScaledSheet.create({
  cell: {
    borderColor: '#DEDEDE',
    borderWidth: 2,
    fontSize: mvs(36),
    height: '60@vs',
    textAlignVertical: 'center',
    textAlign: 'center',
    width: '40@s',
    borderRadius: vs(6),
    includeFontPadding: false,
    lineHeight: '60@vs',
    fontFamily: typography.fontFamily.primary.bold,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  codeFieldRoot: {
    marginTop: '64@vs',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  focusCell: {
    borderColor: '#c5c5c5',
  },
  codeWrapper: {
    alignItems: 'center',
    marginTop: '80@vs',
    marginBottom: '115@vs',
  },
  modal: {
    backgroundColor: 'white',
    minHeight: '195@vs',
    paddingHorizontal: '24@s',
    paddingTop: '30@vs',
    paddingBottom: '24@vs',
    borderRadius: vs(6),
    shadowColor: 'rgba(0, 0, 0, 0.14)',
    shadowOffset: {
      width: 0,
      height: vs(7),
    },
    shadowRadius: vs(9),
  },
  terms: {
    lineHeight: '20@mvs',
    textAlign: 'center',
    width: '150@s',
  },
  closeIcon: {
    position: 'absolute',
    left: '20@s',
    zIndex: 100,
  },
})
