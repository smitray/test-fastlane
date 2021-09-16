import { Box, Avatar, Text, VideoPlayer } from '@components/index'
import { formatDate } from '@utils/time'
import { typography } from '@styles/typography'
import { ActivityIndicator } from 'react-native'
import { useEffect, useState, useCallback } from 'react'
import { vs } from 'react-native-size-matters/extend'
import { getCompositionURLFromCall } from '@src/database/functions/calls'
import { useAuth } from '@hooks/useAuth'

export const CallItem = ({ item }) => {
  const { user } = useAuth()

  const [compositionURL, setCompositionURL] = useState(null)
  const [isLoading, setLoading] = useState(null)
  const hasCompositionVideo = item.shouldFanHasRecord && item.compositionVideoStatus === 'composition-available'

  useEffect(() => {
    if (hasCompositionVideo) {
      const getCompositionURL = async () => {
        setLoading(true)
        const url = await getCompositionURLFromCall({ user, callId: item._id })
        setCompositionURL(url)
        setLoading(false)
      }
      getCompositionURL()
    }
  }, [hasCompositionVideo, item._id, user])

  const _renderVideo = useCallback(() => {
    if (item.shouldFanHasRecord) {
      if (isLoading === null) return <Text tx="recording_is_in_progress" textAlign="center" variant="small" />
      if (isLoading === true) {
        return (
          <Box justifyContent="center" alignItems="center" flex={1} width="100%">
            <ActivityIndicator size="small" />
          </Box>
        )
      }

      return hasCompositionVideo && compositionURL && <VideoPlayer source={{ uri: compositionURL }} />
    } else {
      return <Text tx="recording_is_not_shared" textAlign="center" variant="small" />
    }
  }, [item.shouldFanHasRecord, isLoading, hasCompositionVideo, compositionURL])

  return (
    <Box width="50%" flex={1} justifyContent="flex-start">
      <Box flex={1} flexDirection="row" alignItems="center" marginBottom="s">
        <Avatar
          size={vs(40)}
          source={item.athlete?.avatar ? { uri: item.athlete.avatar } : require('@assets/images/user-avatar.png')}
        />
        <Box marginLeft="s">
          <Text text={item.athlete?.name} variant="bold" fontSize={typography.fontSize.small} />
          <Text text={formatDate(item.completedAt || item.endedAt, 'DD/MM/YYYY')} variant="small" />
        </Box>
      </Box>
      <Box
        flex={1}
        height={vs(210)}
        width="100%"
        justifyContent="center"
        flexShrink={1}
        flexWrap="wrap"
        paddingHorizontal="s"
      >
        {_renderVideo()}
      </Box>
    </Box>
  )
}
