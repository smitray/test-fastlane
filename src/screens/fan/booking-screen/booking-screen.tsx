/* eslint-disable react-native/no-inline-styles */
import { Button, Screen, Box, Avatar, Text } from '@components/index'
import { s, ScaledSheet, vs } from 'react-native-size-matters/extend'
import { useConfirmPayment } from '@stripe/stripe-react-native'
import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@hooks/useAuth'
import { createPaymentIntent, getPaymentMethods } from '@src/database/functions/payment'
import { useImmer } from 'use-immer'
import { typography } from '@styles/typography'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Alert, View } from 'react-native'
import Payment from './components/payment'
import AboutYou from './components/about-you'
import { PaymentMethod } from '@src/database/types'
import Routes from '@navigation/routes'
import { translate } from '@i18n/translate'
import { fanCreateNewCall, getS3PresignedURL } from '@src/database/functions'
import { useTheme } from '@hooks/theme'
import { omitNil } from '@utils/lodash'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { launchCamera, launchImageLibrary } from 'react-native-image-picker'
import { metrics } from '@styles/metrics'
import * as mimeTypes from 'react-native-mime-types'
import { uploadFile } from '@utils/s3'

const PaymentScreen = ({ navigation, route }) => {
  const [localState, setLocalState] = useImmer({
    isNew: true,
    isLoadingCards: true,
    videoIntroUrl: null,
    cardDetail: null,
    paymentMethodId: null,
    paymentMethods: [] as PaymentMethod[],
    currentStep: 1,
    message: '',
    isUploadRecordVideo: false,
  })
  const callRef = useRef(null)
  const paymentIntentRef = useRef(null)
  const { confirmPayment, loading } = useConfirmPayment()
  const { user } = useAuth()
  const { athlete } = route.params
  const theme = useTheme()

  useEffect(() => {
    setLocalState((draft) => {
      draft.isLoadingCards = true
    })
    getPaymentMethods({ user })
      .then(({ paymentMethods }) => {
        setLocalState((draft) => {
          draft.paymentMethods = paymentMethods || []
          draft.isNew = paymentMethods?.length === 0
          draft.isLoadingCards = false
        })
      })
      .catch((err) => {
        console.warn(err)
        setLocalState((draft) => {
          draft.isLoadingCards = false
        })
      })
  }, [setLocalState, user])

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onCardDetailChange = useCallback(
    (value) => {
      setLocalState((draft) => {
        draft.cardDetail = value
      })
    },
    [setLocalState],
  )

  const _onPaymentMethodSelect = useCallback(
    (value) => {
      setLocalState((draft) => {
        draft.paymentMethodId = value
      })
    },
    [setLocalState],
  )

  const _onRemoveRecordVideo = useCallback(() => {
    setLocalState((draft) => {
      draft.videoIntroUrl = null
    })
  }, [setLocalState])

  const _togglePaymentMethod = useCallback(() => {
    setLocalState((draft) => {
      draft.isNew = !draft.isNew
    })
  }, [setLocalState])

  const _onMessageChange = useCallback(
    (value) => {
      setLocalState((draft) => {
        draft.message = value
      })
    },
    [setLocalState],
  )
  const _onVideoIntroUrlChange = useCallback(
    (value) => {
      setLocalState((draft) => {
        draft.videoIntroUrl = value
      })
    },
    [setLocalState],
  )

  const _onNextPress = useCallback(async () => {
    const _fetchPaymentIntentClientSecret = async () => {
      // Create call before making payment
      let callId
      if (callRef.current) {
        callId = callRef.current
      } else {
        const callObject = omitNil({
          meetAthlete: athlete._id,
          fanVideoIntroduceURL: localState.videoIntroUrl,
          message: localState.message,
        })
        const response = await fanCreateNewCall({ user, call: callObject })
        callId = response.callId
        callRef.current = response.callId
      }
      const { paymentIntent } = await createPaymentIntent({ user, callId })
      return paymentIntent
    }

    if (localState.currentStep === 2) {
      try {
        // Validate
        if (localState.isNew) {
          if (!localState.cardDetail) {
            throw new Error(translate('card_detail_is_invalid'))
          }
        } else if (!localState.paymentMethodId) {
          throw new Error(translate('no_credit_card_is_selected'))
        }

        if (!paymentIntentRef.current) {
          paymentIntentRef.current = await _fetchPaymentIntentClientSecret()
        }

        const { paymentIntent, error } = await confirmPayment(paymentIntentRef.current, {
          type: 'Card',
          paymentMethodId: localState.isNew ? null : localState.paymentMethodId,
          setupFutureUsage: 'OnSession', // to save card
        })

        if (error) {
          // message has better meaning.
          // Ex: localizedMessage = Your card was declined while message = Your card has insufficient funds
          const message = error.message || error.localizedMessage || 'Payment confirmation error'
          console.warn(error)
          throw new Error(message)
        } else if (paymentIntent) {
          navigation.reset({
            index: 1,
            routes: [{ name: Routes.FanNavigator }, { name: Routes.Fan.BookingSuccess, params: { athlete } }],
          })
        }
      } catch (err) {
        Alert.alert(translate('payment_error'), err.message)
      }
    } else {
      setLocalState((draft) => {
        draft.currentStep = 2
      })
      _fetchPaymentIntentClientSecret().then((clientSecret) => {
        paymentIntentRef.current = clientSecret
      })
    }
  }, [
    user,
    athlete,
    navigation,
    setLocalState,
    confirmPayment,
    localState.videoIntroUrl,
    localState.message,
    localState.cardDetail,
    localState.currentStep,
    localState.isNew,
    localState.paymentMethodId,
  ])

  const _launchVideoPicker = useCallback(
    (index) => {
      const uploadFileToS3 = async (file) => {
        try {
          setLocalState((draft) => {
            draft.isUploadRecordVideo = true
          })
          const fileExt = file.uri.split('.').pop()
          const mime = mimeTypes.lookup(fileExt)
          const presignedUrl = await getS3PresignedURL({
            fileName: `fan_intro_video/avatar_${user.id}_${Date.now()}.${fileExt}`,
            fileType: mime,
            user,
          })
          await uploadFile(presignedUrl, file)
          const url = presignedUrl?.split('?')?.[0]
          _onVideoIntroUrlChange(url)
          setLocalState((draft) => {
            draft.isUploadRecordVideo = false
          })
        } catch (err) {
          Alert.alert('Cannot upload file', err.message)
          setLocalState((draft) => {
            draft.isUploadRecordVideo = false
          })
        }
      }

      let launchPicker
      switch (index) {
        case 0: {
          launchPicker = launchCamera
          break
        }
        case 1: {
          launchPicker = launchImageLibrary
          break
        }
      }
      if (index === 0 || index === 1) {
        launchPicker(
          {
            mediaType: 'video',
            maxHeight: metrics.screenHeight,
            saveToPhotos: true,
          },
          (response) => {
            if (response.didCancel) {
              // console.log("User cancelled image picker")
            } else if (response.errorCode) {
              if (response.errorCode === 'camera_unavailable') {
                Alert.alert(translate('camera_unavailable'))
              }
            } else {
              const file = response.assets?.[0]
              uploadFileToS3(file)
            }
          },
        )
      }
    },
    [_onVideoIntroUrlChange, setLocalState, user],
  )

  return (
    <Screen
      header={{
        headerTx: 'book_a_call',
        style: {
          paddingHorizontal: s(16),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _onBackPress,
      }}
      preset="scroll"
      keyboardAwareScrollViewProps={{
        contentContainerStyle: { flexGrow: 1 },
      }}
    >
      <Box alignItems="center" flex={1}>
        <Box flexDirection="row" justifyContent="center" marginBottom="vs-5">
          <Avatar
            source={athlete.avatar ? { uri: athlete.avatar } : require('@assets/images/user-avatar.png')}
            size={vs(80)}
          />
          <Box style={styles.fanAvatar}>
            <Avatar
              source={user.avatar ? { uri: user.avatar } : require('@assets/images/user-avatar.png')}
              size={vs(80)}
            />
          </Box>
        </Box>
        <Text text={`you and ${athlete.name}`} variant="bold" fontSize={typography.fontSize.large} />

        <Box width="100%" paddingHorizontal="s-15" mt="vs-7">
          <Box flexDirection="row" justifyContent="center" alignItems="center" pl="s-3" pr="s-2">
            <Button
              variant={localState.currentStep === 1 ? 'outline' : 'solid'}
              ViewComponent={localState.currentStep === 1 ? View : LinearGradient}
              linearGradientProps={
                localState.currentStep === 2 && {
                  colors: palette.gradient.button,
                  start: { x: 0, y: 1 },
                  end: { x: 1, y: 1 },
                }
              }
              style={styles.progressBtn}
              label="1"
              labelVariant="bold"
              labelProps={{ color: localState.currentStep === 1 ? 'grey' : 'white' }}
              disabled
              disabledTitleStyle={{ color: localState.currentStep === 1 ? theme.colors.grey : theme.colors.white }}
            />
            <Box height={1} backgroundColor="grey" flex={1} />
            <Button
              variant="outline"
              label="2"
              style={[styles.progressBtn, localState.currentStep !== 2 && { borderColor: 'grey' }]}
              labelProps={{ color: 'grey' }}
              disabled
              disabledTitleStyle={{ color: theme.colors.grey }}
            />
          </Box>
          <Box flexDirection="row" justifyContent="space-between" alignItems="center">
            <Text tx="about_you" color="primary" />
            <Text tx="payment" color={localState.currentStep === 2 ? 'primary' : 'grey'} />
          </Box>
        </Box>

        <Box width="100%" paddingHorizontal="vs-7.5" flex={1}>
          {localState.currentStep === 1 ? (
            <AboutYou
              message={localState.message}
              onMessageChange={_onMessageChange}
              onVideoIntroUrlChange={_onVideoIntroUrlChange}
              onRemoveRecordVideo={_onRemoveRecordVideo}
              launchVideoPicker={_launchVideoPicker}
              isUploadRecordVideo={localState.isUploadRecordVideo}
              videoIntroUrl={localState.videoIntroUrl}
            />
          ) : (
            <Payment
              isProcessing={loading}
              isLoadingCards={localState.isLoadingCards}
              athlete={athlete}
              isNew={localState.isNew}
              paymentMethods={localState.paymentMethods}
              selectedPaymentMethod={localState.paymentMethodId}
              onCardDetailChange={_onCardDetailChange}
              onPaymentMethodSelect={_onPaymentMethodSelect}
              togglePaymentMethod={_togglePaymentMethod}
            />
          )}
        </Box>
      </Box>
      <Box
        justifyContent="space-between"
        alignItems="center"
        flexDirection="row"
        paddingHorizontal="s-5"
        mb={isIphoneX() ? 'vs-3' : 'vs-7'}
      >
        <Button
          width={s(78)}
          height={vs(36)}
          variant="outline"
          labelTx="cancel"
          labelVariant="bold"
          labelProps={{ color: 'grey' }}
          onPress={_onBackPress}
          disabled={loading || localState.isUploadRecordVideo}
        />
        <Button
          width={s(78)}
          height={vs(36)}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx={localState.currentStep === 1 ? 'next' : 'book'}
          labelVariant="bold"
          onPress={_onNextPress}
          labelProps={{ color: 'white' }}
          disabled={loading || localState.isUploadRecordVideo}
          loading={loading}
        />
      </Box>
    </Screen>
  )
}

const styles = ScaledSheet.create({
  fanAvatar: {
    zIndex: 100,
    left: '-8@s',
    borderRadius: '40@vs',
    backgroundColor: 'white',
  },
  progressBtn: {
    padding: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: '15@s',
    width: '30@s',
    height: '30@s',
  },
  cardForm: {
    height: 50,
    marginVertical: 30,
    width: '100%',
  },
})

export default PaymentScreen
