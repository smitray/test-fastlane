import { FlatList } from 'react-native'
import { Screen } from '@components/screen'
import { useCallback } from 'react'
import { CallItem } from './components/call-item'
import { ScaledSheet } from 'react-native-size-matters/extend'
import { useCalls } from '@hooks/useCalls'
import { useFocusEffect } from '@react-navigation/native'

const CompletedScreen = () => {
  const { completedCalls, getCalls, fetching } = useCalls()

  const _onRefresh = useCallback(() => {
    const filter = { status: 'completed' }
    const orderBy = { endedAt: -1 }
    const type = 'completed'
    getCalls({ type, filter, orderBy })
  }, [getCalls])

  const _renderItem = useCallback(({ item }) => {
    return <CallItem call={item} />
  }, [])

  useFocusEffect(
    useCallback(() => {
      _onRefresh()
    }, [_onRefresh]),
  )

  return (
    <Screen header={{ headerTx: 'completed' }} style={styles.container}>
      <FlatList
        onRefresh={_onRefresh}
        data={completedCalls}
        refreshing={fetching.completedCalls}
        renderItem={_renderItem}
        keyExtractor={(item) => String(item._id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContentContainer}
      />
    </Screen>
  )
}

export default CompletedScreen

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '20@s',
    paddingTop: '24@vs',
  },
  listContentContainer: {
    paddingBottom: '90@vs',
  },
})
