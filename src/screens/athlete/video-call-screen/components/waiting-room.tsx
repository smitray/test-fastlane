import { Box } from '@components/common'
import { Text } from '@components/text'
import { typography } from '@styles/typography'
import { StyleSheet } from 'react-native'
import { vs, s } from 'react-native-size-matters/extend'
import { Button } from '@components/button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TUser } from '@src/database/types'
import { useState, useCallback, useEffect } from 'react'
import { useInterval } from '@hooks/useInterval'

type WaitingRoomProps = {
  fan: TUser
  fanJoined?: boolean
  waitingTime: number
  onEndCall: (endReason: string) => void
}
export const WaitingRoom = ({ fan, fanJoined, waitingTime, onEndCall }: WaitingRoomProps) => {
  const { bottom } = useSafeAreaInsets()
  const [waitingConnectTime, setWaitingConnectTime] = useState(waitingTime)
  const [isCallingEndCall, setIsCallingEndCall] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

  useEffect(() => {
    if (!fanJoined) {
      setWaitingConnectTime(waitingTime)
    }
  }, [fanJoined, waitingTime])

  useInterval(
    () => {
      if (!fanJoined) {
        const newValue = waitingConnectTime - 1
        if (newValue < 0) {
          setIsCallingEndCall(true)
          setIsTimerRunning(false)
          const endReason = 'system'
          onEndCall?.(endReason)
        }
        setWaitingConnectTime(Math.max(newValue, 0))
      }
    },
    isTimerRunning ? 1000 : null,
  )

  const _onEndCallPress = useCallback(() => {
    setIsCallingEndCall(true)
    const endReason = 'system'
    onEndCall?.(endReason)
  }, [onEndCall])

  return (
    <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="xxl" position="relative">
      <Text
        tx={fanJoined ? 'reconnecting_fan_now' : 'contacting_fan_now'}
        txOptions={{ fan: fan?.name }}
        textAlign="center"
        variant="bold"
        color="white"
        textTransform="uppercase"
        fontSize={typography.fontSize.huge}
      />
      <Text
        text={waitingConnectTime}
        variant="bold"
        textAlign="center"
        color="white"
        fontSize={typography.fontSize.giant}
        style={styles.waitingTime}
      />
      <Text
        tx="please_give_fan_few_moments"
        textAlign="center"
        color="white"
        variant="bold"
        fontSize={typography.fontSize.larger}
      />
      <Box position="absolute" bottom={bottom} width="100%">
        <Box alignItems="center" paddingBottom="m">
          <Button
            disabled={isCallingEndCall}
            variant="clear"
            height={s(72)}
            width={s(72)}
            borderRadius="h"
            backgroundColor="cinnabar"
            icon={{ name: 'call-end', color: 'white', size: s(32) }}
            containerStyle={styles.btnContainer}
            onPress={_onEndCallPress}
          />
        </Box>
      </Box>
    </Box>
  )
}

const styles = StyleSheet.create({
  btnContainer: {
    borderRadius: s(36),
    elevation: 10,
    overflow: 'visible',
    shadowColor: 'rgba(0,0,0,0.53)',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6.27,
  },
  waitingTime: {
    marginBottom: vs(56),
    marginTop: vs(46),
  },
})
