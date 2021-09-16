import { FlatList } from 'react-native'
import { Screen } from '@components/screen'
import { memo, useCallback, useEffect } from 'react'
import CallItem from './components/call-item'
import { s, ScaledSheet } from 'react-native-size-matters/extend'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useCalls } from '@hooks/useCalls'

const DashboardScreen = memo(() => {
  const bottomBarHeight = useBottomTabBarHeight()
  const { upcomingCalls, getCalls, fetching } = useCalls()

  const _onRefresh = useCallback(() => {
    const filter = { status: 'created' }
    const type = 'upcoming'
    const orderBy = { createdAt: -1 }
    getCalls({ type, filter, orderBy })
  }, [getCalls])

  const _renderItem = useCallback(({ item }) => {
    return <CallItem call={item} />
  }, [])

  useEffect(() => {
    _onRefresh()
  }, [_onRefresh])

  return (
    <Screen header={{ headerTx: 'my_calls' }} style={styles.container}>
      <FlatList
        onRefresh={_onRefresh}
        data={upcomingCalls}
        refreshing={fetching.upcomingCalls}
        renderItem={_renderItem}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[{ paddingBottom: bottomBarHeight }]}
      />
    </Screen>
  )
})

export default DashboardScreen

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: s(20),
  },
})
