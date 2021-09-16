import { FlatList } from 'react-native'
import { Screen } from '@components/screen'
import { Text } from '@components/text'
import { useCallback } from 'react'
import CallItem from './components/call-item'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import { useCalls } from '@hooks/useCalls'
import Routes from '@navigation/routes'
import { useFocusEffect } from '@react-navigation/native'

const UpcomingCallScreen = ({ navigation }) => {
  const { upcomingCalls, getCalls, fetching } = useCalls()

  const _onRefresh = useCallback(() => {
    const filter = {
      status: {
        $in: ['created', 'attempted', 'error'],
      },
    }
    const orderBy = { createdAt: -1 }
    const type = 'upcoming'
    getCalls({ type, filter, orderBy })
  }, [getCalls])

  useFocusEffect(
    useCallback(() => {
      _onRefresh()
    }, [_onRefresh]),
  )

  const _onCallPress = useCallback(
    (call) => {
      navigation.navigate(Routes.Athlete.VideoCall, { call })
    },
    [navigation],
  )

  const _renderItem = useCallback(
    ({ item }) => {
      return <CallItem call={item} onCallPress={_onCallPress} />
    },
    [_onCallPress],
  )

  return (
    <Screen header={{ headerTx: 'my_calls' }} style={styles.container as any}>
      <Text
        variant="semiBold"
        tx="available_now"
        color="grey"
        textTransform="uppercase"
        fontSize={typography.fontSize.small}
      />
      <FlatList
        onRefresh={_onRefresh}
        data={upcomingCalls}
        refreshing={fetching.upcomingCalls}
        renderItem={_renderItem}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </Screen>
  )
}

export default UpcomingCallScreen

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: s(20),
    paddingTop: vs(24),
  },
  listContentContainer: {
    paddingBottom: vs(90),
  },
})
