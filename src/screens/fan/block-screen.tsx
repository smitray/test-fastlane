import LinearGradient from 'react-native-linear-gradient'
import { Screen } from '@components/screen'
import { Box, Text, IconSvg, Button } from '@components/index'
import { typography } from '@styles/typography'
import { useAuth } from '@hooks/useAuth'
import { ScaledSheet, s } from 'react-native-size-matters/extend'
import Routes from '@navigation/routes'
import { useCallback } from 'react'

const BlockScreen = ({ navigation }) => {
  const { signOut } = useAuth()

  const onSignOutPress = useCallback(async () => {
    await signOut()
    navigation.reset({ index: 0, routes: [{ name: Routes.Welcome }] })
  }, [navigation, signOut])

  return (
    <Screen unsafe>
      <LinearGradient
        start={{ x: 0.25, y: 0.5 }}
        end={{ x: 0.75, y: 0.5 }}
        colors={['#9C0456', '#BE0000']}
        style={styles.linearGradient}
      >
        <Box flex={1} alignItems="center" style={styles.container}>
          <Text tx="blocked" variant="bold" color="white" fontSize={typography.fontSize.giant} />
          <Text
            tx="your_account_has_been_temporarily_suspended"
            color="white"
            textAlign="center"
            marginTop="s"
            marginBottom="xxl"
          />
          <IconSvg name="flag" size={s(62)} />
          <Text
            tx="flagged_account"
            color="white"
            variant="medium"
            fontSize={typography.fontSize.large}
            marginTop="s"
          />
          <Text
            tx="investigating_announcement"
            color="white"
            textAlign="center"
            fontSize={typography.fontSize.large}
            marginTop="h"
          />
          <Text
            tx="this_was_a_mistake"
            color="white"
            textAlign="center"
            fontSize={typography.fontSize.large}
            marginTop="xxl"
          />
          <Button
            variant="outline"
            labelTx="sign_out"
            labelVariant="bold"
            marginTop="xl"
            labelProps={{ color: 'white' }}
            width={s(127)}
            marginRight="s"
            onPress={onSignOutPress}
          />
        </Box>
      </LinearGradient>
    </Screen>
  )
}

export default BlockScreen

const styles = ScaledSheet.create({
  linearGradient: {
    height: '100%',
    width: '100%',
  },
  container: {
    paddingTop: '100@vs',
    paddingHorizontal: '28@s',
  },
})
