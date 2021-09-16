import { useCallback } from 'react'
import { Screen, Text, Box, Button, Avatar } from '@components/index'
import { Icon } from 'react-native-elements'
import { vs, s } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { useTheme } from '@hooks/theme'
import { isIphoneX } from 'react-native-iphone-x-helper'

const BookingSuccessScreen = ({ navigation, route }) => {
  const { athlete } = route?.params || {}
  const theme = useTheme()

  const _onDonePress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <Screen>
      <Box alignItems="center" mt="vs-20">
        <Avatar
          source={athlete.avatar ? { uri: athlete.avatar } : require('@assets/images/user-avatar.png')}
          size={vs(80)}
        />
        <Icon name="check" size={vs(56)} color={theme.colors.green} />
        <Text tx="call_booked_successfully" textAlign="center" variant="bold" mt="vs-5" />
        <Text
          mt="vs-3"
          tx="time_for_athlete_to_make_a_call"
          txOptions={{ athleteName: athlete.name, period: 14 }}
          textAlign="center"
          color="doveGray"
        />
        <Text tx="time_for_refund" txOptions={{ period: 14 }} textAlign="center" color="doveGray" />
        <Button
          marginTop="vs-10"
          width={s(78)}
          height={vs(36)}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="done"
          labelVariant="bold"
          onPress={_onDonePress}
          labelProps={{ color: 'white' }}
        />
      </Box>
    </Screen>
  )
}

export default BookingSuccessScreen
