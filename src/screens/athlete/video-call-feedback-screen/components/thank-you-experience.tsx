import { Box, Text, Button } from '@components/index'
import { ScaledSheet, vs } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { Icon } from 'react-native-elements'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { useCallback } from 'react'
import Routes from '@navigation/routes'
import { useNavigation } from '@react-navigation/native'
import { TBackendCall } from '@src/database/types'

type ThankYouExperienceProps = {
  call: TBackendCall
}
export const ThankYouExperience = ({ call }: ThankYouExperienceProps) => {
  const navigation = useNavigation()
  const theme = useTheme()

  const _onBackToDashboardPress = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: Routes.AthleteNavigator,
          params: {
            screen: Routes.Athlete.UpcomingCall,
          },
        },
      ],
    })
  }, [navigation])

  return (
    <Box marginTop="ls" paddingHorizontal="sl" style={styles.container}>
      <Icon name="check" size={vs(56)} color={theme.colors.green} />
      <Text
        textAlign="center"
        variant="bold"
        fontSize={typography.fontSize.large}
        tx="thank_you_for_providing_this_exp"
        txOptions={{ name: call?.fan?.name }}
        marginBottom="ls"
        style={styles.thankYouText}
      />
      <Text textAlign="center" tx="amount_transfer_to_account" txOptions={{ amount: `$${call.price}` }} />
      <Text textAlign="center" tx="sending_a_donation" txOptions={{ charity: 'ABC' }} />
      <Box alignItems="center" style={styles.backWrapper}>
        <Button
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#049C69', '#049C69', '#009EBE'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="back_to_upcoming"
          paddingHorizontal="xl"
          labelVariant="bold"
          labelProps={{ color: 'white' }}
          marginLeft="s"
          height={vs(36)}
          onPress={_onBackToDashboardPress}
        />
      </Box>
    </Box>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingTop: '100@s',
  },
  thankYouText: {
    marginTop: '62@vs',
  },
  backWrapper: {
    marginTop: '100@vs',
  },
})
