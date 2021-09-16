/* eslint-disable react-native/split-platform-components */
import { Button } from '@components/button'
import { Box } from '@components/common'
import { Text } from '@components/text'
import { s } from 'react-native-size-matters/extend'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TAthlete } from '@src/database/types'
import { TouchableOpacity } from 'react-native'
import * as Progress from 'react-native-progress'
import { typography } from '@styles/typography'
import { Theme } from '@styles/theme'
import { useState, useCallback } from 'react'

type VideoCallBottomControlProps = {
  onEndCall: () => void
  receiver: TAthlete
  showTimeCounter: boolean
  progress: number
  remainingTime: number
  theme: Theme
}

export const VideoCallBottomControl = ({
  showTimeCounter,
  onEndCall,
  receiver,
  progress,
  remainingTime,
  theme,
}: VideoCallBottomControlProps) => {
  const [isEnding, setEndingCall] = useState(false)
  const { bottom } = useSafeAreaInsets()

  const _onEndCallPress = useCallback(() => {
    onEndCall()
    setEndingCall(true)
  }, [onEndCall])

  return (
    <Box position="absolute" bottom={bottom} width="100%" zIndex={100 as any}>
      <Text text={receiver?.name} color="white" variant="bold" textAlign="center" />
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        marginTop="xl"
        marginBottom="s"
        paddingHorizontal="xl"
      >
        <Box flex={1} alignItems="center">
          {showTimeCounter ? (
            <TouchableOpacity onPress={_onEndCallPress} disabled={isEnding}>
              <Progress.Circle
                size={s(72)}
                progress={progress}
                showsText
                formatText={() => remainingTime}
                textStyle={{
                  ...theme.textVariants.bold,
                  color: theme.colors.mineShaft,
                  fontSize: typography.fontSize.largest,
                }}
                fill={theme.colors.mandysPink}
                color="white"
                borderWidth={0}
                style={{ backgroundColor: theme.colors.mandysPink, borderRadius: s(36) }}
                unfilledColor={theme.colors.cinnabar}
              />
            </TouchableOpacity>
          ) : (
            <Button
              disabled={isEnding}
              variant="clear"
              height={s(72)}
              width={s(72)}
              borderRadius="h"
              backgroundColor="cinnabar"
              icon={{ name: 'call-end', color: 'white', size: s(32) }}
              onPress={_onEndCallPress}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}
