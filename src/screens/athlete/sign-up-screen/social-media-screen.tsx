import { Alert, Image, TouchableOpacity } from 'react-native'
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
import { useImmer } from 'use-immer'
import { typography } from '@styles/typography'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { usePublicSync } from '@hooks/usePublicSync'
import { translate } from '@i18n/translate'
import TextInputMask from 'react-native-text-input-mask'
import { useAuth } from '@hooks/useAuth'
import PhoneInput from '@screens/fan/fan-waitlist-screen/components/phone-input'
import Modal from 'react-native-modal'
import { SocialMedia } from '@src/database/types'
import { BlurView } from '@react-native-community/blur'
import { athleteUpdateAthteleProfileEachStep } from '@src/database/functions/users'
import { metrics } from '@styles/metrics'

const DROP_DOWN_ICON = require('@assets/images/dropDownIcon.png')
const DROP_DOWN_ACTIVE_ICON = require('@assets/images/dropDownActiveIcon.png')
type ApplyProCodeScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/ApplyProCode'>
}
const SocialMediaScreen = ({ navigation }: ApplyProCodeScreenProps) => {
  const theme = useTheme()
  const { user } = useAuth()
  const { top, bottom } = useSafeAreaInsets()
  const inputRefs = useRef({})
  const phoneInputRef = useRef(null)
  const phoneTextRef = useRef(null)
  const [isSocialMedia, selectedSocialMedia] = useState(-1)

  const [state, setState] = useImmer({
    isSubmitting: false,
    phone: '',
    phoneWithoutCallingCode: '',
    defaultCode: 'US',
    touched: true,
    error: null,
  })

  const [isModalVisible, setModalVisible] = useState(false)
  const socialMediaData = [
    { id: '0', type: SocialMedia.Facebook, name: 'Facebook' },
    { id: '2', type: SocialMedia.Instagram, name: 'Instagram' },
    { id: '3', type: SocialMedia.Twitter, name: 'Twitter' },
    { id: '4', type: SocialMedia.SnapChat, name: 'Snap Chat' },
  ]
  const toggleModal = () => {
    if (disableMode) return
    setModalVisible(!isModalVisible)
  }

  const hideModal = () => {
    setModalVisible(false)
  }

  const chooseSocialMedia = (index: number) => {
    selectedSocialMedia(index)
    setModalVisible(false)
    setTimeout(() => {
      formik.setFieldValue('socialMedia', socialMediaData[index].name)
      inputRefs.current[1]?.focus()
    }, 500)
  }

  const renderDropDown = () => {
    return <Image source={formik.values.socialMedia ? DROP_DOWN_ACTIVE_ICON : DROP_DOWN_ICON} />
  }

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const onSubmit = useCallback(
    async (values) => {
      try {
        console.log('VALUES FORMIK', values)
        const phone = values.phone?.replace(/\D/g, '')
        const data = {
          email: user.customData.email,
          profile: {
            ...values,
            phone: `1${phone}`,
          },
        }
        await athleteUpdateAthteleProfileEachStep({ user, data })
        navigation.navigate(Routes.Athlete.CallRate)
      } catch (error) {
        Alert.alert('Failed to sign up', error.message)
      }
    },
    [athleteUpdateAthteleProfileEachStep, navigation],
  )

  const onChangeText = useCallback(
    (text) => {
      formik.setFieldValue('phone', text)
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
  const formik = useFormik({
    initialValues: {
      socialMedia: '',
      socialHandle: '',
      phone: state.phone,
    },
    onSubmit,
    validationSchema: yup.object().shape({
      socialMedia: yup.string().required(translate('social_media_is_required')),
      socialHandle: yup.string().required(translate('social_handle_is_required')),
      phone: yup
        .string()
        .required(translate('phone_is_required'))
        .test(
          'is-valid-phone-number',
          translate('phone_number_must_be_valid'),
          (value) => value?.replace(/\D/gi, '').length === 10,
        ),
    }),
  })

  const BlurredBackdrop = useCallback(
    () => (
      <Box style={styles.blurContainer} onTouchEnd={hideModal}>
        <BlurView style={styles.blurView} blurType="dark" blurAmount={10} reducedTransparencyFallbackColor="white" />
      </Box>
    ),
    [],
  )

  const disableMode = formik.isSubmitting

  return (
    <Screen preset="scroll" backgroundColor={palette.white}>
      <Box height={metrics.screenHeight - top} paddingHorizontal="s-5" alignItems="center">
        <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="clear"
            icon={{ name: 'chevron-left' }}
            containerStyle={[styles.closeIcon]}
            onPress={_onBackPress}
          />
          <Text tx="sign_up" paddingRight="s-5" fontSize={typography.fontSize.large} variant="bold" color="gray_2" />
          <Box />
        </Box>
        <Box flexDirection="row" justifyContent="space-between" marginTop="s-7" width="100%" alignItems="center">
          <Text tx="complete_your_profile" fontSize={typography.fontSize.largest} variant="bold" color="gray_2" />
          <Button
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ['#049C69', '#049C69', '#009EBE'],
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            }}
            labelTx="button_complete_your_profile"
            labelVariant="button"
          />
        </Box>
        <Box width="100%" marginTop="vs-10">
          <Box onTouchEnd={toggleModal} marginBottom="vs-2.5">
            <Box marginBottom="vs-2.5">
              <Text tx="social_media_new" color="emperor" variant="semiBold" />
            </Box>
            <CustomInput
              autoFocus
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              inputRef={(ref) => {
                inputRefs.current[0] = ref
              }}
              height={vs(48)}
              variant="rounded"
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="select_platform"
              autoCapitalize="none"
              textVariant="semiBold"
              rightIcon={renderDropDown()}
              isDropDown
              returnKeyType="next"
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              editable={false}
              value={formik.values.socialMedia}
              onChangeText={formik.handleChange('socialMedia')}
              errorMessage={formik.touched.socialMedia && (formik.errors?.socialMedia as string)}
            />
          </Box>
          <Modal isVisible={isModalVisible} backdropOpacity={0.99} customBackdrop={<BlurredBackdrop />}>
            <Box style={styles.modal}>
              <Text
                tx="select_social_media_platform"
                color="gray_2"
                variant="bold"
                fontFamily={typography.fontFamily.primary.bold}
                fontSize={typography.fontSize.large}
              />
              <Box marginVertical="s-3">
                {socialMediaData.map((item, index) => {
                  return (
                    <TouchableOpacity key={item.id.toString()} onPress={() => chooseSocialMedia(index)}>
                      <Box flexDirection="row" paddingVertical={'s-3'} alignItems="center">
                        {isSocialMedia === index ? (
                          <Box style={styles.wrapperBoxButton}>
                            <LinearGradient style={styles.boxButton} colors={palette.gradient.button} />
                          </Box>
                        ) : (
                          <Box style={styles.boxInactiveButton} />
                        )}
                        <Text
                          text={item.name === 'Twitter' ? `${item.name} (Recommended)` : item.name}
                          color="gray_2"
                          variant="semiBold"
                          fontFamily={typography.fontFamily.primary.regular}
                          fontSize={typography.fontSize.regular}
                        />
                      </Box>
                    </TouchableOpacity>
                  )
                })}
              </Box>
            </Box>
          </Modal>
          {formik.values.socialMedia.length > 0 && (
            <Box marginBottom="vs-2.5">
              <CustomInput
                autoFocus
                onSubmitEditing={() => {
                  phoneTextRef.current.focus()
                }}
                inputRef={(ref) => {
                  inputRefs.current[1] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_social_handle"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                textProps={{
                  fontSize: typography.fontSize.large,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={true}
                value={formik.values.socialHandle}
                onChangeText={formik.handleChange('socialHandle')}
                errorMessage={formik.touched.socialHandle && (formik.errors?.socialHandle as string)}
              />
            </Box>
          )}
          <Box marginBottom="vs-2.5" marginTop="vs-2.5">
            <Box flexDirection="row">
              <Text tx="mobile_number_new" color="emperor" variant="semiBold" />
              <Text tx="we_never_share" color="emperor" />
            </Box>
          </Box>
          <PhoneInput
            inputRef={(ref) => {
              phoneInputRef.current = ref
            }}
            clearPlaceholderWhenFocus={true}
            dynamicBackground={true}
            disableNativeModal={true}
            disabled={disableMode}
            editable={!disableMode}
            flagButtonStyle={styles.phoneInputFlagButton}
            containerStyle={styles.phoneInputContainer}
            textContainerStyle={styles.phoneInputTextContainer}
            codeTextStyle={styles.phoneInputCodeText}
            textInputStyle={styles.phoneInputTextInput}
            disableArrowIcon={false}
            defaultValue={formik.values.phone}
            style={styles.bottomSheetMobileNumberInput}
            defaultCode={state.defaultCode}
            layout="second"
            onChangeText={onChangeText}
            onChangeFormattedText={onChangeFormattedText}
            placeholder={translate('enter_your_phone_number')}
            textInputProps={{
              value: formik.values.phone,
              placeholderTextColor: theme.colors.silver,
              ref: phoneTextRef,
              blurOnSubmit: false,
              fontSize: typography.fontSize.large,
            }}
            mask={'[000]-[000]-[0000]'}
            InputComponent={TextInputMask as any}
            gradient={{
              colors: palette.gradient.textV2,
            }}
            errorMessage={formik.touched.phone && (formik.errors?.phone as string)}
          />
          <Text
            marginTop="vs-1"
            color="red_2"
            variant="small"
            text={formik.touched.phone && ((formik.errors?.phone as string) || '')}
          />
        </Box>
        <Box position="absolute" left={0} bottom={0} right={0} alignItems="center" marginVertical="vs-7.5">
          <Button
            width={metrics.screenWidth * 0.88}
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
    </Screen>
  )
}

export default SocialMediaScreen

const styles = ScaledSheet.create({
  closeIcon: {
    right: '12@s',
  },
  iconContainer: {
    top: '18@vs',
  },
  inputAndroid: {
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
    color: 'black',
    fontSize: typography.fontSize.large,
    paddingRight: 30,
    height: '60@vs',
    fontWeight: '300',
  },
  inputIOS: {
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
    color: 'black',
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontFamily.primary.regular,
    height: '60@vs',
    fontWeight: '300',
  },
  phoneInputFlagButton: {
    width: null,
    height: 30,
    paddingLeft: '4@s',
    borderRadius: '4@vs',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  phoneInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: vs(48),
    paddingHorizontal: '8@vs',
    paddingVertical: '6@vs',
    borderRadius: '8@vs',
  },
  phoneInputTextContainer: {
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
  },
  phoneInputCodeText: {
    fontFamily: typography.fontFamily.primary.semiBold,
    color: palette.emperor,
    fontSize: typography.fontSize.large,
  },
  phoneInputTextInput: {
    fontFamily: typography.fontFamily.primary.regular,
    fontSize: typography.fontSize.large,
    fontWeight: "300",
  },
  bottomSheetMobileNumberInput: {
    flex: 1,
    alignItems: 'center',
  },
  wrapperBoxButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#049C69',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boxButton: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  boxInactiveButton: {
    borderRadius: 15,
    height: 15,
    width: 15,
    borderWidth: 0.9,
    marginRight: 10,
  },
  modal: {
    backgroundColor: 'white',
    minHeight: '195@vs',
    marginHorizontal: '18@s',
    paddingHorizontal: '24@s',
    paddingTop: '20@vs',
    borderRadius: vs(6),
    shadowColor: 'rgba(0, 0, 0, 0.14)',
    shadowOffset: {
      width: 0,
      height: vs(7),
    },
    shadowRadius: vs(9),
  },
  addNew: {
    alignItems: 'center',
    paddingVertical: '20@vs',
  },
  blurContainer: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  blurView: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
})
