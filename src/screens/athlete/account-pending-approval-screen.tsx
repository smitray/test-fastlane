import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '@components/screen'
import { Box, Text, IconSvg, Button } from '@components/index'
import { typography } from '@styles/typography'
import { ScaledSheet, s, vs } from 'react-native-size-matters/extend'
import Routes from '@navigation/routes'
import { useCallback } from 'react'
import { palette } from '../../styles/palette'
import { Alert } from 'react-native'

const AccountPendingApprovalScreen = ({ navigation }) => {
  const _onHomePress = useCallback(async () => {
    navigation.reset({ index: 0, routes: [{ name: Routes.Welcome }] })
  }, [navigation])

  const _onHerePress = useCallback(async () => {
    Alert.alert('Waiting for twitter link')
  }, [])

  return (
    <Screen unsafe>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={palette.gradient.background}
        style={styles.linearGradient}
      >
        <Box flex={1} alignItems="center" style={styles.container}>
          <Text
            tx="account_pending_approval"
            variant="bold"
            color="white"
            textAlign="center"
            fontSize={typography.fontSize.largest}
            marginBottom="vxl"
          />
          <IconSvg name="timer" height={vs(45)} width={s(36)} />
          <Text
            tx="one_step_to_go"
            color="white"
            variant="medium"
            fontSize={typography.fontSize.large}
            marginTop="vs-11"
          />
          <Text
            tx="our_team_will_contact_you"
            color="white"
            textAlign="center"
            fontSize={typography.fontSize.large}
            marginTop="vs-3"
          />
          <Box paddingHorizontal="xl" alignItems="center">
            <Text
              tx="once_your_account_verified"
              color="white"
              textAlign="center"
              fontSize={typography.fontSize.large}
              marginTop="vml"
            />
            <Text
              tx="get_your_account_verified_faster"
              color="white"
              textAlign="center"
              fontSize={typography.fontSize.large}
              marginTop="vxsl"
            />
            <Button
              marginTop="vs-2"
              variant="clear"
              labelTx="here"
              labelVariant="bold"
              labelProps={{
                color: 'white',
                fontSize: typography.fontSize.large,
              }}
              width={s(127)}
              onPress={_onHerePress}
            />
          </Box>
          <Button
            marginTop="vh"
            variant="solid"
            backgroundColor="white"
            labelTx="home"
            labelVariant="bold"
            width={s(127)}
            onPress={_onHomePress}
            labelProps={{
              color: 'green',
            }}
          />
        </Box>
      </LinearGradient>
    </Screen>
  )
}

export default AccountPendingApprovalScreen

const styles = ScaledSheet.create({
  linearGradient: {
    height: '100%',
    width: '100%',
  },
  container: {
    paddingTop: '120@vs',
    paddingHorizontal: '38@s',
  },
})
