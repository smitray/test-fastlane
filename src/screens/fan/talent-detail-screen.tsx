import { useCallback } from 'react'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { Box, Button, Screen, Avatar, Text } from '@components/index'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { palette } from '@styles/palette'
import { AirbnbRating } from 'react-native-elements'
import { typography } from '@styles/typography'
import Routes from '@navigation/routes'

const TalentDetailScreen = ({ navigation, route }) => {
  const { top } = useSafeAreaInsets()
  const { athlete } = route.params

  const _onBookCallPress = useCallback(() => {
    navigation.navigate(Routes.Fan.Booking, { athlete })
  }, [athlete, navigation])

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <Screen unsafe>
      <Box position="absolute" top={top + vs(10)} left={s(16)} zIndex={100 as any}>
        <Button
          variant="clear"
          icon={{
            name: 'arrow-back',
            size: s(30),
          }}
          onPress={_onBackPress}
        />
      </Box>
      <Box>
        <LinearGradient
          colors={palette.gradient.background3}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.linearGradient}
        />
        <Box height={vs(60)} alignItems="center">
          <Box position="absolute" top={-vs(60)} zIndex={100 as any}>
            <Avatar source={athlete.avatar && { uri: athlete.avatar }} size={vs(120)} />
          </Box>
        </Box>
      </Box>
      <Box paddingHorizontal="s-4" alignItems="center" marginTop="vs-5">
        <Text text={athlete.name} variant="bold" fontSize={typography.fontSize.large} />
        <AirbnbRating count={5} defaultRating={5} size={s(15)} showRating={false} />
        <Text marginTop="vs-4" text={athlete.bio} color="doveGray" textAlign="center" />
        <Button
          height={null}
          paddingVertical="vs-3"
          paddingHorizontal="s-8"
          borderRadius="s-7"
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="book_call"
          labelTxOptions={{
            price: `$${athlete.callPrice}`,
          }}
          labelVariant="bold"
          marginTop="vs-7"
          marginBottom="vs-5"
          labelProps={{ color: 'white', fontSize: typography.fontSize.medium }}
          onPress={_onBookCallPress}
        />
        {!!athlete.charityName && (
          <Text
            tx="call_charity_description"
            txOptions={{ charityName: athlete.charityName }}
            color="doveGray"
            textAlign="center"
          />
        )}
      </Box>
    </Screen>
  )
}

export default TalentDetailScreen

const styles = ScaledSheet.create({
  linearGradient: {
    height: '166@vs',
    width: '100%',
  },
})
