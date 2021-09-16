import { FC, ReactNode, useCallback, useRef, useState, createContext } from 'react'
import { TwilioVideo, TrackIdentifier } from 'react-native-twilio-video-webrtc'
interface Participant {
  sid: string
  identity: string
}
export enum TWILIO_CONNECTION_STATUS {
  CONNECTING = 'connecting',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export enum VIDEO_DIRECTION {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
}

export interface IVideoContext {
  status: TWILIO_CONNECTION_STATUS
  room: any
  videoTracks: Map<string, TrackIdentifier>
  participants: Participant[]
  enableVideo: boolean
  enableAudio: boolean
  remoteVideoDirection: VIDEO_DIRECTION
  toggleVideo: (...args: any) => any
  toggleAudio: (...args: any) => any
  connect: (...args: any) => any
  disconnect: (...args: any) => any
}

export const VideoContext = createContext<IVideoContext>(null as IVideoContext)

type ConnectParams = {
  roomName?: string
  enableAudio?: boolean
  enableVideo?: boolean
}

interface VideoProviderProps {
  options?: ConnectParams
  onError?: (error: any) => void
  children: ReactNode
}

export const VideoProvider: FC<VideoProviderProps> = ({ children, options }: VideoProviderProps) => {
  const [videoTracks, setVideoTracks] = useState(new Map())
  const [participants, setParticipants] = useState([])
  const [status, setStatus] = useState<TWILIO_CONNECTION_STATUS>(TWILIO_CONNECTION_STATUS.DISCONNECTED)
  const [remoteVideoDirection, setRemoteVideoDirection] = useState(VIDEO_DIRECTION.HORIZONTAL)
  const [enableVideo, setEnableVideo] = useState(options?.enableVideo !== undefined ? options.enableVideo : true)
  const [enableAudio, setEnableAudio] = useState(options?.enableAudio !== undefined ? options.enableAudio : true)
  const twilioRef = useRef(null)

  const getTwilioStat = useCallback(() => {
    setTimeout(() => twilioRef?.current?.getStats(), 200)
  }, [twilioRef])

  const _onRoomDidConnect = useCallback(
    (room) => {
      setParticipants([...room.participants])
      setStatus(TWILIO_CONNECTION_STATUS.CONNECTED)
      getTwilioStat()
    },
    [getTwilioStat],
  )

  const _onRoomDidDisconnect = useCallback(() => {
    setStatus(TWILIO_CONNECTION_STATUS.DISCONNECTED)
  }, [])

  const _onRoomDidFailToConnect = useCallback(() => {
    setStatus(TWILIO_CONNECTION_STATUS.DISCONNECTED)
  }, [])

  const _onParticipantAddedVideoTrack = useCallback(
    ({ participant, track }) => {
      setVideoTracks(
        new Map([...videoTracks, [track.trackSid, { participantSid: participant.sid, videoTrackSid: track.trackSid }]]),
      )
      getTwilioStat()
    },
    [getTwilioStat, videoTracks],
  )

  const _onStatReceived = useCallback((stats) => {
    const currentStats = stats[Object.keys(stats)[0]]
    if (currentStats?.remoteVideoTrackStats?.length === 0) {
      return
    }
    const { dimensions } = currentStats?.remoteVideoTrackStats[0]
    if (dimensions?.width > dimensions?.height) {
      setRemoteVideoDirection(VIDEO_DIRECTION.HORIZONTAL)
    } else {
      setRemoteVideoDirection(VIDEO_DIRECTION.VERTICAL)
    }
  }, [])

  const _onRoomParticipantDidConnect = useCallback((participant) => {
    setParticipants((participants) => [...participants, participant])
  }, [])

  const _onRoomParticipantDidDisConnect = useCallback((participant) => {
    setParticipants((participants) => participants.filter((p) => p.sid !== participant.sid))
  }, [])

  const toggleAudio = useCallback(() => {
    twilioRef?.current?.setLocalAudioEnabled(!enableAudio).then((isEnabled) => setEnableAudio(isEnabled))
  }, [enableAudio])

  const toggleVideo = useCallback(() => {
    twilioRef?.current?.setLocalVideoEnabled(!enableVideo).then((isEnabled) => setEnableVideo(isEnabled))
  }, [enableVideo])

  const _onParticipantRemovedVideoTrack = ({ track }) => {
    const currentVideoTracks = videoTracks
    currentVideoTracks.delete(track.trackSid)

    setVideoTracks(new Map([...currentVideoTracks]))
  }

  const disconnect = () => {
    twilioRef?.current?.setLocalAudioEnabled(false)
    twilioRef?.current.disconnect()
  }

  const connect = useCallback(
    ({
      roomName,
      accessToken,
      cameraType = 'front',
      encodingParameters = null,
      enableNetworkQualityReporting = false,
      dominantSpeakerEnabled = false,
    }) => {
      if (!accessToken) {
        throw new Error('Missing twilio access token')
      }
      try {
        twilioRef?.current?.connect({
          enableAudio,
          enableVideo,
          roomName,
          accessToken,
          cameraType,
          encodingParameters,
          enableNetworkQualityReporting,
          dominantSpeakerEnabled,
        })
      } catch (error) {
        console.log(error)
      }
    },
    [enableAudio, enableVideo],
  )

  const _onNetworkLevelChanged = ({ participant, isLocalUser, quality }) => {
    console.log('Participant', participant, 'isLocalUser', isLocalUser, 'quality', quality)
  }

  return (
    <VideoContext.Provider
      value={{
        videoTracks,
        participants,
        enableVideo,
        toggleVideo,
        enableAudio,
        toggleAudio,
        status,
        remoteVideoDirection,
        room: twilioRef?.current,
        connect,
        disconnect,
      }}
    >
      <TwilioVideo
        ref={twilioRef}
        onRoomDidConnect={_onRoomDidConnect}
        onRoomDidDisconnect={_onRoomDidDisconnect}
        onRoomDidFailToConnect={_onRoomDidFailToConnect}
        onParticipantAddedVideoTrack={_onParticipantAddedVideoTrack}
        onParticipantRemovedVideoTrack={_onParticipantRemovedVideoTrack}
        onStatsReceived={_onStatReceived}
        onRoomParticipantDidConnect={_onRoomParticipantDidConnect}
        onRoomParticipantDidDisconnect={_onRoomParticipantDidDisConnect}
        onNetworkQualityLevelsChanged={_onNetworkLevelChanged}
      />
      {children}
    </VideoContext.Provider>
  )
}
