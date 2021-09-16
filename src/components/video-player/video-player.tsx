import { StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { s, vs } from 'react-native-size-matters/extend'
import React, { memo, useCallback, useRef } from 'react'
import { useImmer } from 'use-immer'
import { Box } from '@components/common/viewbox'
import { Video } from 'expo-av'
import { Icon } from 'react-native-elements'
import useAppState from '@hooks/useAppState'

type VideoPlayerProps = {
  videoWidth?: number
  videoHeight?: number
  orientation?: string
  source: {
    uri: string
  }
  thumbnail?: any
  endThumbnail?: any
  loop?: boolean
  muted?: boolean
  paused?: boolean
  autoplay?: boolean
  hideControlsOnStart?: boolean
  onLoad?: (event) => void
  onEnd?: (event) => void
  onProgress?: (event) => void
  onSeekComplete?: () => void
  onStart?: () => void
}

export const VideoPlayer = memo(
  ({ videoWidth = s(120), videoHeight = vs(180), muted, loop, thumbnail, source }: VideoPlayerProps) => {
    const [playerState, setPlayerState] = useImmer({
      isPlaying: false,
      isBuffering: false,
      isLoaded: false,
      isEnded: false,
      didJustFinish: false,
    })
    const playerRef = useRef(null)

    useAppState({
      onBackground: () => {
        if (playerState.isPlaying) {
          playerRef.current.pauseAsync()
        }
      },
    })

    const _onStartPress = useCallback(() => {
      playerRef.current.presentFullscreenPlayer()
      if (playerState.isPlaying) {
        playerRef.current.pauseAsync()
      } else {
        playerRef.current.playAsync()
      }
    }, [playerState, playerRef])

    const _onPlaybackStatusUpdate = useCallback(
      (playbackStatus) => {
        if (!playbackStatus.isLoaded) {
          // Update your UI for the unloaded state
          if (playbackStatus.error) {
            console.log(`Encountered a fatal error during playback: ${playbackStatus.error}`)
            // Send Expo team the error on Slack or the forums so we can help you debug!
          }
        }

        const isEnded = playbackStatus.durationMillis === playbackStatus.positionMillis
        setPlayerState((draft) => {
          draft.isLoaded = playbackStatus.isLoaded
          draft.isPlaying = playbackStatus.isPlaying
          draft.isBuffering = playbackStatus.isBuffering
          draft.isEnded = isEnded
          draft.didJustFinish = playbackStatus.didJustFinish
        })
        if (isEnded) {
          playerRef.current.setPositionAsync(0)
        }
      },
      [setPlayerState],
    )

    return (
      <TouchableWithoutFeedback onPress={_onStartPress}>
        <Box width={videoWidth} height={videoHeight} borderRadius="s">
          <Video
            ref={playerRef}
            isLooping={loop}
            isMuted={muted}
            style={styles.video}
            onPlaybackStatusUpdate={_onPlaybackStatusUpdate}
            source={source}
            posterSource={thumbnail}
            usePoster={!!thumbnail}
            resizeMode={Video.RESIZE_MODE_CONTAIN}
          />
          <Box position="absolute" top={0} right={0} left={0} bottom={0} justifyContent="center" alignItems="center">
            <Icon color="white" name={playerState.isPlaying ? 'pause' : 'play-circle-outline'} size={s(36)} />
          </Box>
        </Box>
      </TouchableWithoutFeedback>
    )
  },
)

const styles = StyleSheet.create({
  video: {
    backgroundColor: 'black',
    borderRadius: s(8),
    height: '100%',
    width: '100%',
  },
})
