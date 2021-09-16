import { StyleSheet } from 'react-native'
import { Screen, Button, Text, Box, ProgressiveImage } from '@components/index'
import { s, vs } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import LinearGradient from 'react-native-linear-gradient'
import { AirbnbRating } from 'react-native-elements'
import { StatItem } from './components/stat-item'
import { useAuth } from '@hooks/useAuth'
import Routes from '@navigation/routes'
import { useCallback, useEffect, useState } from 'react'
import { athleteGetDashboardInfo } from '@src/database/functions/users'
import { palette } from '@styles/palette'
import millify from 'millify'

function formatNumber(number: number, unit?: string, options?: Record<string, any>) {
  if (!unit) {
    if (number < 10000) {
      return millify(
        number || 0,
        options || {
          precision: 2,
          decimalSeparator: ',',
        },
      )
    }
    return number
  }

  if (number < 10000) return `${unit || ''}${number}`

  return (
    unit +
    millify(
      number || 0,
      options || {
        precision: 2,
        decimalSeparator: ',',
      },
    )
  )
}
const DashboardScreen = ({ navigation }) => {
  const { signOut, user, userProfile } = useAuth()
  const [dashboardInfo, setDashboardInfo] = useState(null)
  const [isSignOut, setSignOut] = useState(false)
  const [isLoadingDashboardInfo, setIsLoadingDashboardInfo] = useState(false)

  const _onLogoutPress = useCallback(async () => {
    try {
      setSignOut(true)
      await signOut()
    } catch (err) {
    } finally {
      setSignOut(false)
      navigation.reset({
        index: 0,
        routes: [
          {
            name: Routes.Welcome,
          },
        ],
      })
    }
  }, [navigation, signOut])

  useEffect(() => {
    const getAthleteDashboardInfo = async () => {
      try {
        setIsLoadingDashboardInfo(true)
        const { data } = await athleteGetDashboardInfo({ user })
        const refactoredData = data.reduce(
          (preResult, { _id, total, totalRevenue }) => ({
            ...preResult,
            [_id]: { total, totalRevenue },
          }),
          {},
        )
        setDashboardInfo(refactoredData)
        setIsLoadingDashboardInfo(false)
      } catch (err) {
        setIsLoadingDashboardInfo(false)
      }
    }
    getAthleteDashboardInfo()
  }, [user])

  const _onSettingsPress = useCallback(async () => {
    navigation.navigate(Routes.Athlete.EditProfile, { from: Routes.Athlete.Dashboard, isFromDashboard: true })
  }, [navigation])

  return (
    <Screen unsafe preset="scroll">
      <Box style={styles.header}>
        <LinearGradient
          colors={palette.gradient.background3}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.linearGradient}
        >
          <Box position="absolute" bottom={vs(14)} left={s(18)}>
            <Button
              variant="clear"
              icon={{ name: 'logout' }}
              onPress={_onLogoutPress}
              loading={isSignOut}
              disabled={isSignOut}
              disabledStyle={{ backgroundColor: 'transparent' } as any}
            />
          </Box>
          <Box position="absolute" bottom={vs(14)} right={s(18)}>
            <Button
              variant="clear"
              icon={{ name: 'settings' }}
              onPress={_onSettingsPress}
              disabled={isSignOut}
              disabledStyle={{ backgroundColor: 'transparent' } as any}
            />
          </Box>
        </LinearGradient>
        <Box position="absolute" bottom={0} justifyContent="center" alignItems="center">
          <ProgressiveImage
            source={userProfile?.avatar ? { uri: userProfile?.avatar } : require('@assets/images/user-avatar.png')}
            containerStyle={styles.avatar}
            style={styles.avatar}
          />
        </Box>
      </Box>
      <Box paddingHorizontal="m">
        <Box alignItems="center">
          <Text variant="bold" text={userProfile?.name} fontSize={typography.fontSize.large} />
          <AirbnbRating count={5} defaultRating={5} size={s(15)} showRating={false} isDisabled={true} />
          <Text text={userProfile?.profile?.bio} textAlign="center" color="doveGray" marginTop="m" variant="small" />
        </Box>
        <Box marginTop="xl">
          <Text
            variant="medium"
            tx="calls"
            fontSize={typography.fontSize.tiny}
            textTransform="uppercase"
            color="grey"
          />
          <Box flexDirection="row" marginTop="sl">
            <StatItem
              loading={isLoadingDashboardInfo}
              marginRight="s"
              figureColor="tulipTree"
              figure={formatNumber(dashboardInfo?.pending?.total || 0)}
              labelTx={'pending_call_plural'}
            />
            <StatItem
              loading={isLoadingDashboardInfo}
              marginLeft="s"
              figureColor="shamrock"
              figure={formatNumber(dashboardInfo?.completed?.total || 0)}
              labelTx={'completed_call_plural'}
            />
          </Box>
        </Box>
        <Box marginTop="xl">
          <Text
            variant="medium"
            tx="finance"
            fontSize={typography.fontSize.tiny}
            textTransform="uppercase"
            color="grey"
          />
          <Box flexDirection="row" marginTop="sl">
            <StatItem
              loading={isLoadingDashboardInfo}
              marginRight="s"
              figureColor="shamrock"
              figure={formatNumber(dashboardInfo?.completed?.totalRevenue, '$')}
              labelTx="total_revenue"
            />
            <StatItem
              loading={isLoadingDashboardInfo}
              marginLeft="s"
              figureColor="flamingo"
              figure={formatNumber(dashboardInfo?.pending?.totalRevenue, '$')}
              labelTx="pending_funds"
            />
          </Box>
        </Box>
      </Box>
    </Screen>
  )
}

export default DashboardScreen

const styles = StyleSheet.create({
  avatar: {
    borderRadius: vs(50),
    height: vs(100),
    resizeMode: 'cover',
    width: vs(100),
  },
  header: {
    alignItems: 'center',
    marginBottom: vs(23),
    paddingBottom: vs(50),
    position: 'relative',
  },
  linearGradient: {
    height: vs(126),
    width: '100%',
  },
})
