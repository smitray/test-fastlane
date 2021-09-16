import { Box } from '@components/common'
import { Text } from '@components/text'
import { typography } from '@styles/typography'
import { StyleSheet } from 'react-native'
import { s } from 'react-native-size-matters/extend'
import { Button } from '@components/button'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TAthlete } from '@src/database/types'
import { useCallback } from 'react'

type WaitingRoomProps = {
  athlete: TAthlete
  onEndCall: (string) => void
}
export const WaitingRoom = ({ athlete, onEndCall }: WaitingRoomProps) => {
  const { bottom } = useSafeAreaInsets()

  const _onEndCallPress = useCallback(() => {
    onEndCall?.('manually')
  }, [onEndCall])

  return (
    <Box flex={1} alignItems="center" justifyContent="center" paddingHorizontal="xxl" position="relative">
      <Text
        tx={'contacting_athlete_now'}
        txOptions={{ athlete: athlete?.name }}
        textAlign="center"
        variant="bold"
        color="white"
        textTransform="uppercase"
        fontSize={typography.fontSize.huge}
      />
      <Text
        marginTop="xl"
        tx="please_give_athlete_few_moments"
        textAlign="center"
        color="white"
        variant="bold"
        fontSize={typography.fontSize.larger}
      />
      <Box position="absolute" bottom={bottom} width="100%">
        <Box alignItems="center" paddingBottom="m">
          <Button
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
  // waitingTime: {
  //   marginBottom: vs(56),
  //   marginTop: vs(46),
  // },
})
