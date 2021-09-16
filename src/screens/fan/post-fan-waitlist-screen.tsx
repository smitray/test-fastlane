import { Box, Button, Text, Screen, IconSvg } from '@components/index'
import Routes from '@navigation/routes'
import { palette } from '@styles/palette'
import { typography } from '@styles/typography'
import { useCallback } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { s, vs } from 'react-native-size-matters/extend'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PostFanWaitListScreen = ({ navigation, route }) => {
  const { top } = useSafeAreaInsets()
  const order = route.params?.order || 1000

  const onLogin = useCallback(() => {
    navigation.replace(Routes.Fan.SignIn)
  }, [navigation])

  const onInviteFriends = useCallback(() => {
    navigation.replace(Routes.Fan.FanInviteFriends)
  }, [navigation])

  const onBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  return (
    <Screen backgroundColor="white">
      <Box position="absolute" top={top} left={s(24)} zIndex={100 as any}>
        <Button variant="clear" icon={{ name: 'west' }} height={vs(48)} width={s(48)} onPress={onBack} />
      </Box>
      <Box alignItems="center" flex={1} style={{ paddingTop: vs(120) }}>
        <IconSvg name="congrats" width={vs(160)} height={vs(160)} />
        <Text tx="well_done" variant="bold" fontSize={typography.fontSize.largest} mt="vs-14" />
        <Text
          tx="order_invite_in_fan_waitlist"
          txOptions={{ order }}
          textAlign="center"
          color="emperor"
          mt="vs-6"
          lineHeight={24}
        />
        <Text tx="invite_friends_to_earn_access" textAlign="center" color="emperor" mt="vs-8" lineHeight={24} />
      </Box>

      <Box flexDirection="row" justifyContent="space-between" alignItems="center" paddingHorizontal="vs-6">
        <Button
          variant="clear"
          width={s(100)}
          height={vs(48)}
          labelTx="logIn"
          labelVariant="bold"
          onPress={onLogin}
          labelProps={{ color: 'emperor' }}
          disabledStyle={{ backgroundColor: 'transparent' } as any}
        />
        <Button
          height={vs(48)}
          width={s(156)}
          borderRadius="s-12"
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.background,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelVariant="bold"
          labelProps={{ color: 'white', fontSize: typography.fontSize.medium }}
          marginVertical="vs-5"
          labelTx="invite_friends"
          onPress={onInviteFriends}
        />
      </Box>
    </Screen>
  )
}

export default PostFanWaitListScreen
