import { TouchableOpacity } from 'react-native'
import { Text } from '@components/text'
import { ProgressiveImage } from '@components/progressive-image'
import { Box } from '@components/common/viewbox'
import { ScaledSheet } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import { formatDate } from '@utils/time'
import { TBackendCall } from '@src/database/types'

type CallItemProps = {
  call: TBackendCall
}
const CallItem = ({ call }: CallItemProps) => {
  return (
    <TouchableOpacity style={styles.content}>
      <Box
        flexDirection="row"
        flex={1}
        alignItems="center"
        borderBottomColor="alto"
        borderBottomWidth={1}
        paddingVertical="ls"
        paddingLeft="s"
      >
        <Box flexDirection="row" flex={1} alignItems="center">
          <ProgressiveImage
            source={{ uri: call.athlete?.avatar }}
            containerStyle={styles.avatarContainer as any}
            style={styles.avatar}
          />
          <Text variant="bold" text={call.athlete?.name} color="emperor" fontSize={typography.fontSize.small} />
        </Box>
        <Box justifyContent="center">
          <Text
            tx="date_booked"
            txOptions={{ date: formatDate(call.createdAt, 'DD/MM/YYYY') }}
            color="emperor"
            marginBottom="s"
            variant="medium"
            fontSize={typography.fontSize.tiny}
          />
          <Text
            tx="price"
            txOptions={{ price: call.price }}
            color="emperor"
            marginBottom="s"
            variant="medium"
            fontSize={typography.fontSize.tiny}
          />
          <Text
            tx="booking_id"
            txOptions={{ bookingId: call._id }}
            color="emperor"
            numberOfLines={1}
            marginBottom="s"
            variant="medium"
            fontSize={typography.fontSize.tiny}
          />
        </Box>
      </Box>
    </TouchableOpacity>
  )
}

export default CallItem

const styles = ScaledSheet.create({
  avatar: {
    borderRadius: '20@s',
    height: '40@vs',
    width: '40@vs',
  },
  avatarContainer: {
    height: '40@vs',
    marginHorizontal: '8@s',
    width: '40@vs',
  },
  content: {
    flex: 1,
  },
})
