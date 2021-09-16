import { StyleSheet, FlatList } from 'react-native'
import { useCallback } from 'react'
import { Button } from '@components/button'
import LinearGradient from 'react-native-linear-gradient'
import { s, vs } from 'react-native-size-matters/extend'

type MenuProps = {
  menus: any
  selectedMenuItem: any
  onMenuItemSelect: (item) => void
}
export const Menu = ({ selectedMenuItem, menus, onMenuItemSelect }: MenuProps) => {
  const _renderItem = useCallback(
    ({ item }) => {
      const isActive =
        selectedMenuItem === null || item._id === null
          ? selectedMenuItem === item._id
          : selectedMenuItem.toString() === item._id.toString()
      const buttonProps = isActive
        ? {
            ViewComponent: LinearGradient,
            linearGradientProps: {
              colors: ['#049C69', '#049C69', '#009EBE'],
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            },
            paddingHorizontal: 'ls' as any,
          }
        : { borderRadius: 'ml' as any, paddingHorizontal: 'ls' as any, borderColor: 'silver' as any }
      return (
        <Button
          {...buttonProps}
          rounded
          height={vs(40)}
          label={item.name}
          labelVariant="button"
          marginRight="sl"
          variant={isActive ? 'solid' : 'outline'}
          labelProps={{ color: isActive ? 'white' : 'emperor' }}
          onPress={() => onMenuItemSelect(item._id)}
        />
      )
    },
    [onMenuItemSelect, selectedMenuItem],
  )

  return (
    <FlatList
      data={[{ _id: null, name: 'ALL' }, ...menus]}
      keyExtractor={(item) => String(item._id)}
      renderItem={_renderItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingLeft: s(12),
  },
})
