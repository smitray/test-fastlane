/* eslint-disable react-native/split-platform-components */
import { Button } from '@components/button'
import { Box } from '@components/common'
import { Text } from '@components/text'
import { s, vs } from 'react-native-size-matters/extend'
import * as Progress from 'react-native-progress'
import { typography } from '@styles/typography'
import { TFan } from '@src/database/types'
import { TouchableOpacity } from 'react-native'
import { useCallback, useState } from 'react'
import { Theme } from '@styles/theme'

type VideoCallBottomControlProps = {
  theme: Theme
  progress: number
  bottom: number
  bonusTime: number
  remainingTime: number
  receiver: TFan
  onBlockFan: () => void
  onAddTime: () => void
  onEndCall: () => void
  showTimeCounter: boolean
}
export const VideoCallBottomControl = ({
  theme,
  receiver,
  progress,
  bottom,
  remainingTime,
  bonusTime,
  onBlockFan,
  onAddTime,
  onEndCall,
  showTimeCounter,
}: VideoCallBottomControlProps) => {
  const [isCallingEndCall, setIsCallingEndCall] = useState(false)
  const _onEndCallPress = useCallback(() => {
    setIsCallingEndCall(true)
    onEndCall()
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
          {showTimeCounter && (
            <Button
              height={s(54)}
              width={s(54)}
              borderRadius="xl"
              backgroundColor="green"
              variant="clear"
              labelTx="bonus_time"
              labelTxOptions={{ time: bonusTime }}
              labelVariant="semiBold"
              labelProps={{ color: 'mineShaft' }}
              onPress={onAddTime}
            />
          )}
        </Box>
        <Box flex={1} alignItems="center">
          {showTimeCounter ? (
            <TouchableOpacity disabled={isCallingEndCall} onPress={_onEndCallPress}>
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
              disabled={isCallingEndCall}
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
        <Box flex={1} alignItems="center">
          <Button
            variant="clear"
            height={s(54)}
            width={s(54)}
            borderRadius="xl"
            backgroundColor="white18"
            icon={{ name: 'block', color: 'white' }}
            onPress={onBlockFan}
          />
        </Box>
      </Box>
      <Box height={vs(16)} marginBottom="m">
        {showTimeCounter && <Text tx="call_ends_in" color="white" textAlign="center" />}
      </Box>
    </Box>
  )
}
