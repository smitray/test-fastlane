/* eslint-disable react-native/split-platform-components */
import { Box } from '@components/common'
import { Alert, Platform, StyleSheet } from 'react-native'
import { useCallback, useState, useEffect, useRef } from 'react'
import { Screen } from '@components/screen'
import { s, vs } from 'react-native-size-matters/extend'
import { PERMISSIONS } from 'react-native-permissions'
import { TwilioVideo, TwilioVideoLocalView, TwilioVideoParticipantView } from 'react-native-twilio-video-webrtc'
import LinearGradient from 'react-native-linear-gradient'
import { useVideoContext } from '@hooks/useVideoContext'
import Draggable from 'react-native-draggable'
import { metrics } from '@styles/metrics'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useKeepAwake } from 'expo-keep-awake'
import { WaitingRoom } from './components/waiting-room'
import { VideoCallBottomControl } from './components/video-call-bottom-control'
import { VideoProvider, TWILIO_CONNECTION_STATUS, VIDEO_DIRECTION } from '@providers/twilio-video-provider'
import { useCalls } from '@hooks/useCalls'
import { RootParamList } from '@navigation/params'
import { endCall, getIsCallEnded, checkUserBlocked } from '@src/database/functions'
import { useAuth } from '@hooks/useAuth'
import Routes from '@navigation/routes'
import { translate } from '@i18n/translate'
import { _requestAudioPermission, _requestCameraPermission, _requestPermissionOnIOS } from '@utils/permissions'
import { useTheme } from '@hooks/theme'
import { useInterval } from '@hooks/useInterval'
import { useAndroidBackHandler } from '@hooks/useAndroidBackHandler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import RNCallKeep from 'react-native-callkeep'

const COUNTER_TIME_START = 120
const COUNTER_TIME_END = 60

const FanVideoCall = ({ call, navigation, callUUID }) => {
  const theme = useTheme()
  const { top } = useSafeAreaInsets()
  const remoteParticipantRef = useRef(null)
  const [isCheckingCallEnded, setIsCheckingCallEnded] = useState(false)
  const [showTimeCounter, setShowTimeCounter] = useState(false)
  const [remainingCallTime, setRemainingCallTime] = useState(call?.duration)
  const [progress, setProgress] = useState(0)
  const [isCallStarted, setStartCall] = useState(false)
  const [isGetToken, setGetToken] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const { enableVideo, status, remoteVideoDirection, videoTracks, connect, disconnect } = useVideoContext()
  const { getCallToken } = useCalls()
  const { user, isBlocked } = useAuth()

  useKeepAwake()

  useEffect(() => {
    if (!isCallStarted && status === TWILIO_CONNECTION_STATUS.CONNECTED) {
      setStartCall(true)
    }
  }, [isCallStarted, status])

  useEffect(() => {
    const connectToRoom = async () => {
      if (Platform.OS === 'android') {
        await _requestAudioPermission()
        await _requestCameraPermission()
      } else {
        await Promise.all([
          _requestPermissionOnIOS(PERMISSIONS.IOS.CAMERA),
          _requestPermissionOnIOS(PERMISSIONS.IOS.MICROPHONE),
        ])
      }
      const accessToken = await getCallToken(call._id)
      if (accessToken) {
        connect({ accessToken })
        setGetToken(true)
      }
    }

    if (!isGetToken) {
      connectToRoom().catch(console.log)
    }
  }, [call, connect, getCallToken, isGetToken])

  const _onEndCallPress = useCallback(
    (endReason?: string) => {
      RNCallKeep.endCall(callUUID)
      if (endReason === 'system') {
        disconnect()
        navigation.reset({
          index: 0,
          routes: [
            {
              name: Routes.FanNavigator,
              params: {
                screen: Routes.Fan.Dashboard,
              },
            },
          ],
        })
      } else {
        endCall({ user, callId: call._id, endReason: 'manually' })
          .then(() => {
            disconnect()
          })
          .catch((err) => {
            Alert.alert('An error occurred while ending call ', err.message)
          })
          .finally(() => {
            navigation.replace(Routes.FanNavigator, { call })
          })
      }
    },
    [callUUID, disconnect, navigation, user, call],
  )

  useAndroidBackHandler(() => {
    _onEndCallPress()
  })

  useInterval(
    () => {
      if (isCallStarted) {
        const newValue = remainingCallTime - 1
        if (newValue < 0) {
          setIsTimerRunning(false)
        } else {
          // NOTE: CUSTOMER BUSINESS: COUNTER when remaining video duration is 2 minutes
          if (newValue < COUNTER_TIME_START) {
            if (newValue >= COUNTER_TIME_END) {
              setProgress(1 - (newValue - COUNTER_TIME_END) / COUNTER_TIME_END)
            }
            if (!showTimeCounter) {
              setShowTimeCounter(true)
            }
          } else {
            setShowTimeCounter(false)
          }
        }
        setRemainingCallTime(newValue)
      }
    },
    isTimerRunning ? 1000 : null,
  )
  useEffect(() => {
    if (isBlocked) {
      disconnect()
      RNCallKeep.endCall(callUUID)
      Alert.alert(translate('you_have_been_blocked_by_athlete'))
    }
  }, [isBlocked])

  const onAthleteDisconnected = useCallback(async () => {
    setIsCheckingCallEnded(true)
    const isEnded = await getIsCallEnded({ user, callId: call._id })
    if (isEnded) {
      disconnect()
      RNCallKeep.endCall(callUUID)
      if (!isBlocked) {
        navigation.reset({ index: 0, routes: [{ name: Routes.FanNavigator }] })
      }
    }
    setIsCheckingCallEnded(false)
  }, [isBlocked, user, call._id, disconnect, callUUID, navigation])

  const _renderVideoParticipantView = useCallback(() => {
    if (Array.from(videoTracks).length === 0) return null

    return (
      <Box position="absolute" top={0} bottom={0} left={0} right={0} zIndex={5 as any}>
        {Array.from(videoTracks, ([trackSid, trackIdentifier]) => {
          return (
            <TwilioVideoParticipantView
              style={
                remoteVideoDirection === VIDEO_DIRECTION.VERTICAL
                  ? styles.remoteVideoVertical
                  : styles.remoteVideoHorizontal
              }
              ref={remoteParticipantRef}
              key={trackSid}
              trackIdentifier={trackIdentifier}
            />
          )
        })}
      </Box>
    )
  }, [remoteVideoDirection, videoTracks])

  const _renderVideoLocalView = useCallback(() => {
    return (
      <Box position="absolute" zIndex={100 as any}>
        <Draggable
          x={metrics.screenWidth - s(142)}
          y={top + vs(20)}
          z={100}
          minX={s(20)}
          minY={top + vs(20)}
          maxY={metrics.screenHeight - vs(180)}
          maxX={metrics.screenWidth - s(20)}
        >
          <TwilioVideoLocalView enabled={enableVideo} style={styles.localVideo} />
        </Draggable>
      </Box>
    )
  }, [enableVideo, top])

  const _renderContent = useCallback(() => {
    const isBothJointed = Array.from(videoTracks).length > 0
    if (isBothJointed) {
      return (
        <VideoCallBottomControl
          theme={theme}
          remainingTime={remainingCallTime >= COUNTER_TIME_END ? remainingCallTime - COUNTER_TIME_END : 0}
          progress={progress}
          showTimeCounter={showTimeCounter}
          receiver={call?.athlete}
          onEndCall={() => _onEndCallPress('manually')}
        />
      )
    }

    return (
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={['#049C69', '#009EBE']}
        style={styles.linearGradient}
      >
        <Box flex={1}>
          {!isCheckingCallEnded && <WaitingRoom athlete={call?.athlete} onEndCall={_onEndCallPress} />}
        </Box>
      </LinearGradient>
    )
  }, [
    _onEndCallPress,
    call?.athlete,
    isCheckingCallEnded,
    progress,
    remainingCallTime,
    showTimeCounter,
    theme,
    videoTracks,
  ])

  return (
    <Screen unsafe statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}>
      {_renderVideoLocalView()}
      {_renderVideoParticipantView()}
      {_renderContent()}
      <TwilioVideo onRoomParticipantDidDisconnect={onAthleteDisconnected} />
    </Screen>
  )
}

const FanVideoCallScreen = ({ navigation }) => {
  const route = useRoute<RouteProp<RootParamList, 'Fan/VideoCall'>>()
  const { call = {}, callUUID } = route.params || {}

  return (
    <VideoProvider>
      <FanVideoCall call={call} navigation={navigation} callUUID={callUUID} />
    </VideoProvider>
  )
}

export default FanVideoCallScreen

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  localVideo: {
    height: s(142),
    width: s(122),
    zIndex: 100,
  },
  remoteVideoHorizontal: {
    height: '100%',
    width: '100%',
    zIndex: 10,
  },
  remoteVideoVertical: {
    height: '100%',
    width: '100%',
    zIndex: 10,
  },
})
