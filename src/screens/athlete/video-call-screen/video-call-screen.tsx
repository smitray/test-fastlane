/* eslint-disable react-native/split-platform-components */
import { Box } from '@components/common'
import { Alert, Platform, StyleSheet } from 'react-native'
import { useCallback, useState, useEffect, useRef } from 'react'
import { translate } from '@i18n/translate'
import { Screen } from '@components/screen'
import { s, vs } from 'react-native-size-matters/extend'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@hooks/theme'
import { PERMISSIONS } from 'react-native-permissions'
import { TwilioVideoLocalView, TwilioVideoParticipantView, TwilioVideo } from 'react-native-twilio-video-webrtc'
import LinearGradient from 'react-native-linear-gradient'
import { useVideoContext } from '@hooks/useVideoContext'
import Draggable from 'react-native-draggable'
import { metrics } from '@styles/metrics'
import { VideoProvider, VIDEO_DIRECTION } from '@providers/twilio-video-provider'
import { RouteProp, useRoute } from '@react-navigation/native'
import { WaitingRoom } from './components/waiting-room'
import { useKeepAwake } from 'expo-keep-awake'
import { VideoCallBottomControl } from './components/video-call-bottom-control'
import { useCalls } from '@hooks/useCalls'
import { RootParamList } from '@navigation/params'
import { endCall, blockUser, getIsCallEnded } from '@src/database/functions/calls'
import { useAuth } from '@hooks/useAuth'
import Routes from '@navigation/routes'
import { _requestAudioPermission, _requestCameraPermission, _requestPermissionOnIOS } from '@utils/permissions'
import { useInterval } from '@hooks/useInterval'
import { useAndroidBackHandler } from '@hooks/useAndroidBackHandler'

const BONUS_TIME = 30 // second unit
const WAITING_CONNECT_TIME = 60 // second unit
const COUNTER_END = 60
const AthleteVideoCall = ({ call, navigation }) => {
  const theme = useTheme()
  const { bottom, top } = useSafeAreaInsets()
  const [progress, setProgress] = useState(0)
  const [showTimeCounter, setShowTimeCounter] = useState(false)
  const [isCheckingCallEnded, setIsCheckingCallEnded] = useState(false)
  const [remainingCallTime, setRemainingCallTime] = useState(call?.duration)
  const remoteParticipantRef = useRef(null)
  const [fanJoined, setFanJoined] = useState(null)
  const { getCallToken } = useCalls()
  const { user } = useAuth()
  const [isGetToken, setGetToken] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  const { enableVideo, remoteVideoDirection, videoTracks, connect, disconnect } = useVideoContext()
  useKeepAwake()

  useEffect(() => {
    if (Array.from(videoTracks).length > 0) {
      setFanJoined(true)
    } else {
      setFanJoined(false)
    }
  }, [fanJoined, videoTracks])

  const onFanDisconnected = useCallback(() => {
    const checkCallEnded = async () => {
      setIsCheckingCallEnded(true)
      const isEnded = await getIsCallEnded({ user, callId: call._id })
      if (isEnded) {
        // TODO should show alert or somethings
        disconnect()
        navigation.replace(Routes.Athlete.VideoCallFeedback, { call })
      }
      setIsCheckingCallEnded(false)
    }
    checkCallEnded()
  }, [user, call, disconnect, navigation])

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
      console.log(Date.now())
      const accessToken = await getCallToken(call?._id)
      console.log(Date.now())
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
      if (endReason === 'system' && !fanJoined) {
        // time out and fan does not joined
        // => disconnect
        disconnect()
        navigation.reset({
          index: 0,
          routes: [
            {
              name: Routes.AthleteNavigator,
              params: {
                screen: Routes.Athlete.UpcomingCall,
              },
            },
          ],
        })
      } else {
        // - athlete press end call
        // - time out (endReason === 'system an fanJoined)
        endCall({ user, callId: call._id, endReason: endReason || 'manually' })
          .then(() => {
            disconnect()
          })
          .catch((err) => {
            Alert.alert('An error occurred while ending call ', err.message)
          })
          .finally(() => {
            navigation.replace(Routes.Athlete.VideoCallFeedback, { call })
          })
      }
    },
    [call, disconnect, user, navigation, fanJoined],
  )

  const _onBlockFanPress = useCallback(() => {
    const blockFanFunc = async () => {
      try {
        await blockUser({ user, blockedUserId: call?.fan?._id })
        disconnect()
        navigation.reset({
          index: 0,
          routes: [
            {
              name: Routes.AthleteNavigator,
              params: {
                screen: Routes.Athlete.UpcomingCall,
              },
            },
          ],
        })
      } catch (err) {
        Alert.alert('An error occurred while block fan', err.message)
      }
    }

    Alert.alert(
      translate('block'),
      translate('do_you_want_to_block_this_fan'),
      [
        {
          text: translate('block'),
          onPress: blockFanFunc,
        },
        {
          text: translate('cancel'),
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      },
    )
  }, [call?.fan?._id, disconnect, navigation, user])

  useAndroidBackHandler(() => {
    _onEndCallPress()
  })

  useInterval(
    () => {
      if (fanJoined) {
        const newValue = remainingCallTime - 1
        if (newValue < 0) {
          setIsTimerRunning(false)
          _onEndCallPress()
        } else {
          if (newValue < COUNTER_END) {
            setProgress(1 - newValue / COUNTER_END)
            setShowTimeCounter(true)
          } else {
            setShowTimeCounter(false)
          }
        }
        setRemainingCallTime(newValue)
      }
    },
    isTimerRunning ? 1000 : null,
  )

  const _onAddTimePress = useCallback(() => {
    const newRemainingCallTime = remainingCallTime + BONUS_TIME
    setRemainingCallTime(remainingCallTime + BONUS_TIME)
    if (newRemainingCallTime > COUNTER_END) {
      setShowTimeCounter(false)
    }
  }, [remainingCallTime])

  const _renderVideoParticipantView = useCallback(() => {
    if (Array.from(videoTracks).length === 0) return null

    return (
      <Box position="absolute" top={0} bottom={0} left={0} right={0} zIndex={10 as any}>
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

  return (
    <Screen unsafe statusBarProps={{ translucent: true, backgroundColor: 'transparent' }}>
      {_renderVideoLocalView()}
      {_renderVideoParticipantView()}
      {fanJoined && (
        <VideoCallBottomControl
          receiver={call?.fan}
          theme={theme}
          bonusTime={BONUS_TIME}
          remainingTime={remainingCallTime}
          progress={progress}
          bottom={bottom}
          onBlockFan={_onBlockFanPress}
          onAddTime={_onAddTimePress}
          onEndCall={() => _onEndCallPress('manually')}
          showTimeCounter={showTimeCounter}
        />
      )}
      {!fanJoined && (
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={['#049C69', '#009EBE']}
          style={styles.linearGradient}
        >
          <Box flex={1}>
            {Array.from(videoTracks).length === 0 && !isCheckingCallEnded && (
              <WaitingRoom
                fan={call?.fan}
                fanJoined={fanJoined}
                waitingTime={WAITING_CONNECT_TIME}
                onEndCall={_onEndCallPress}
              />
            )}
          </Box>
        </LinearGradient>
      )}
      <TwilioVideo onRoomParticipantDidDisconnect={onFanDisconnected} />
    </Screen>
  )
}

const AthleteVideoCallScreen = ({ navigation }) => {
  const route = useRoute<RouteProp<RootParamList, 'Athlete/VideoCall'>>()
  const { call } = route.params || {}

  return (
    <VideoProvider>
      <AthleteVideoCall call={call} navigation={navigation} />
    </VideoProvider>
  )
}

export default AthleteVideoCallScreen

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
