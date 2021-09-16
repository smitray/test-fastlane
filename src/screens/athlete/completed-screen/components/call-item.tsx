import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Text } from '@components/text'
import { ProgressiveImage } from '@components/progressive-image'
import { Box } from '@components/common/viewbox'
import { s, vs } from 'react-native-size-matters/extend'
import { Icon } from 'react-native-elements'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { useCallback, useState } from 'react'
import Collapsible from 'react-native-collapsible'
import { formatDate } from '@utils/time'
import { VideoPlayer } from '@components/video-player'
import { TBackendCall } from '@src/database/types'
import { getCompositionURLFromCall } from '@src/database/functions/calls'
import { useAuth } from '@hooks/useAuth'

type CallItemProps = {
  call: TBackendCall
}
export const CallItem = ({ call }: CallItemProps) => {
  const theme = useTheme()
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [compositionURL, setCompositionURL] = useState(null)
  const [isLoading, setLoading] = useState(null)
  const hasCompositionVideo = call.compositionVideoStatus === 'composition-available'

  const _onItemPress = useCallback(() => {
    setIsCollapsed(!isCollapsed)
    if (!compositionURL) {
      const getCompositionURL = async () => {
        setLoading(true)
        const url = await getCompositionURLFromCall({ user, callId: call._id })
        setCompositionURL(url)
        setLoading(false)
      }
      if (hasCompositionVideo) {
        getCompositionURL()
      }
    }
  }, [isCollapsed, compositionURL, hasCompositionVideo, call._id, user])

  const _renderVideo = useCallback(() => {
    if (isLoading === null) return <Text tx="recording_is_in_progress" textAlign="center" variant="small" />
    if (isLoading === true) {
      return (
        <Box justifyContent="center" alignItems="center" height={vs(210)} width={s(148)}>
          <ActivityIndicator size="small" />
        </Box>
      )
    }

    return hasCompositionVideo && compositionURL && <VideoPlayer source={{ uri: compositionURL }} />
  }, [hasCompositionVideo, compositionURL, isLoading])

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
      </Box>
      <Box>
        <Collapsible collapsed={isCollapsed}>
          <Box flexDirection="row" marginTop="l">
            {_renderVideo()}
            <Box marginLeft="s-4">
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
