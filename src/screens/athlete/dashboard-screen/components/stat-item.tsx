import { Box } from '@components/common/viewbox'
import { ActivityIndicator } from 'react-native'
import { Text } from '@components/text'
import { s, vs } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'

type StatItemProps = {
  figure: number | string
  labelTx: string
  loading: boolean
  figureFontSize?: number
  figureColor: string
  marginLeft?: string
  marginRight?: string
}
export const StatItem = ({
  figure,
  figureColor,
  labelTx,
  loading = false,
  figureFontSize = typography.fontSize.largest,
  marginLeft = 'none',
  marginRight = 'none',
}: StatItemProps) => {
  return (
    <Box
      height={vs(142)}
      marginLeft={marginLeft as any}
      marginRight={marginRight as any}
      flex={1}
      justifyContent="center"
      alignItems="center"
      backgroundColor="white"
      borderRadius="xs"
    >
      {
        loading ? <ActivityIndicator />
        : (
          <>
            <Text color={figureColor as any} text={figure} variant="bold" fontSize={figureFontSize} />
            <Text tx={labelTx} color="grey" marginTop="ml" variant="medium" textTransform="capitalize" />
          </>
        )
      }
    </Box>
  )
}
