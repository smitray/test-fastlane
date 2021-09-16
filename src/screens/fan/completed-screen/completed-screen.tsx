import { FlatList } from 'react-native'
import { Screen } from '@components/index'
import { useCalls } from '@hooks/useCalls'
import { useCallback } from 'react'
import { ScaledSheet } from 'react-native-size-matters/extend'
import { CallItem } from './components/call-item'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useFocusEffect } from '@react-navigation/native'

const CompletedScreen = () => {
  const tabBarHeight = useBottomTabBarHeight()
  const { completedCalls, getCalls, fetching } = useCalls()

  const _onRefresh = useCallback(() => {
    const filter = { status: 'completed' }
    const type = 'completed'
    const orderBy = { endedAt: -1 }

    getCalls({ type, filter, orderBy })
  }, [getCalls])

  const _renderItem = useCallback(({ item }) => {
    return <CallItem item={item} />
  }, [])

  useFocusEffect(
    useCallback(() => {
      _onRefresh()
    }, [_onRefresh]),
  )

  return (
    <Screen header={{ headerTx: 'completed' }}>
      <FlatList
        onRefresh={_onRefresh}
        numColumns={2}
        data={completedCalls}
        refreshing={fetching.completedCalls}
        renderItem={_renderItem}
        keyExtractor={(item) => String(item._id)}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: tabBarHeight }}
      />
    </Screen>
  )
}

export default CompletedScreen

const styles = ScaledSheet.create({
  video: {
    height: '100%',
    marginRight: '20@s',
    width: '100%',
  },
  columnWrapper: {
    paddingHorizontal: '20@s',
    marginBottom: '30@vs',
  },
})
