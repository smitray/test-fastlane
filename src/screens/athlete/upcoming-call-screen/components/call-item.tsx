import { StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from '@components/text'
import { ProgressiveImage } from '@components/progressive-image'
import { Box } from '@components/common/viewbox'
import { s, vs } from 'react-native-size-matters/extend'
import { Icon } from 'react-native-elements'
import { Button } from '@components/button'
import LinearGradient from 'react-native-linear-gradient'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { useCallback, useState } from 'react'
import Collapsible from 'react-native-collapsible'
import { formatDate } from '@utils/time'
import { VideoPlayer } from '@components/video-player'
import { TBackendCall } from '@src/database/types'
import { palette } from '../../../../styles/palette'

type CallItemProps = {
  call: TBackendCall
  onCallPress: (call: TBackendCall) => void
}
const CallItem = ({ call, onCallPress }: CallItemProps) => {
  const theme = useTheme()
  const [isCollapsed, setIsCollapsed] = useState(true)

  const _onCallPress = useCallback(() => {
    onCallPress?.(call)
  }, [call, onCallPress])

  const _onItemPress = useCallback(() => {
    setIsCollapsed(!isCollapsed)
  }, [isCollapsed])

  return (
    <Box paddingLeft="s">
      <Box
        flexDirection="row"
        flex={1}
        alignItems="center"
        borderBottomColor="alto"
        borderBottomWidth={1}
        paddingVertical="ls"
      >
        <TouchableOpacity style={styles.content} onPress={_onItemPress}>
          <Box flexDirection="row" flex={1} alignItems="center">
            <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} color={theme.colors.primary} size={s(20)} />
            <ProgressiveImage
              source={{ uri: call.fan?.avatar }}
              containerStyle={styles.avatarContainer}
              style={styles.avatar}
            />
            <Text variant="bold" text={call.fan?.name} color="emperor" fontSize={typography.fontSize.small} />
          </Box>
        </TouchableOpacity>
        <Button
          rounded
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="call"
          labelVariant="button"
          iconContainerStyle={{ marginRight: s(7) }}
          icon={{ type: 'feather', name: 'video', color: 'white' }}
          onPress={_onCallPress}
        />
      </Box>
      <Box>
        <Collapsible collapsed={isCollapsed}>
          <Box flex={1} flexDirection="row" marginTop="m">
            {call.fanVideoIntroduceURL && <VideoPlayer source={{ uri: call.fanVideoIntroduceURL }} paused={true} />}
            <Box marginTop="vs-1" marginLeft="s-4">
              <Text
                variant="tiny"
                tx="date_booked"
                txOptions={{ date: formatDate(call.createdAt, 'DD/MM/YYYY') }}
                color="emperor"
                marginBottom="s"
              />
              <Text
                variant="tiny"
                tx="price"
                txOptions={{ price: '$' + call.price }}
                color="emperor"
                marginBottom="s"
              />
              <Text
                variant="tiny"
                tx="booking_id"
                txOptions={{ bookingId: call._id }}
                color="emperor"
                marginBottom="s"
              />
              <Text variant="tiny" tx="fan_message" color="emperor" marginBottom="s" />
              <Text variant="tiny" text={call.message} color="emperor" marginBottom="s" />
            </Box>
          </Box>
        </Collapsible>
      </Box>
    </Box>
  )
}

export default CallItem

const styles = StyleSheet.create({
  avatar: {
    borderRadius: s(20),
    height: s(40),
    width: s(40),
  },
  avatarContainer: {
    height: s(40),
    marginHorizontal: s(8),
    width: s(40),
  },
  content: {
    flex: 1,
  },
})
