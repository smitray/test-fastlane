import { FlatList } from 'react-native'
import { useCallback, useState, useEffect } from 'react'
import AthleteItem from './talent-screen/components/athlete-item'
import { s, ScaledSheet } from 'react-native-size-matters/extend'
import { Box, Text, Screen } from '@components/index'
import Routes from '@navigation/routes'
import { SearchBar } from 'react-native-elements'
import { translate } from '@i18n/translate'
import { debounce } from '@utils/lodash'
import { usePublicSync } from '@hooks/usePublicSync'

const SearchTalentScreen = ({ navigation }) => {
  const { publicAthleteProfiles } = usePublicSync()
  const [athletes, setAthletes] = useState(publicAthleteProfiles)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const search = useCallback(debounce((publicAthleteProfiles, searchTerm) => {
    const result = searchTerm ? publicAthleteProfiles.filtered('name CONTAINS[c] $0', searchTerm) : publicAthleteProfiles
    const sortedResult = result.sorted([['priority', true]])
    // must convert to plain object:
    // https://github.com/realm/realm-js/issues/1031
    setAthletes(JSON.parse(JSON.stringify(sortedResult)))
    setIsLoading(false)
  }, 500), [])

  useEffect(() => {
    setIsLoading(true)
    search(publicAthleteProfiles, searchTerm)
  }, [publicAthleteProfiles, searchTerm])

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onAthleteSelect = useCallback(
    (athlete) => {
      navigation.navigate(Routes.Fan.TalentDetail, { athlete })
    },
    [navigation],
  )

  const _renderAthleteItem = useCallback(
    ({ item }) => {
      return <AthleteItem athlete={item} onSelect={() => _onAthleteSelect(item)} />
    },
    [_onAthleteSelect],
  )

  const _updateSearchTerm = useCallback(
    (value: string) => {
      setSearchTerm(value)
    },
    [],
  )

  return (
    <Screen
      style={styles.root}
      header={{
        headerTx: 'search_talent',
        headerTextProps: { color: 'pickledBluewood' },
        style: {
          paddingHorizontal: s(16),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _onBackPress,
      }}
    >
      <SearchBar
        lightTheme
        platform="default"
        containerStyle={styles.searchBar}
        inputContainerStyle={styles.searchBarInput}
        placeholder={translate('enter_talent_name')}
        onChangeText={_updateSearchTerm as any}
        value={searchTerm}
        showLoading={isLoading}
      />
      <FlatList
        data={athletes}
        numColumns={2}
        keyExtractor={(item) => String(item._id)}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={_renderAthleteItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={(
            <Box justifyContent="center" alignItems="center" flex={1}>
              <Text tx="no_talent_found" />
            </Box>
          )
        }
      />
    </Screen>
  )
}

export default SearchTalentScreen

const styles = ScaledSheet.create({
  root: {
    paddingBottom: 0,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: '42@vs',
    paddingHorizontal: '30@s',
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: '20@vs',
    paddingBottom: '20@vs',
  },
  searchBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: '16@s',
  },
  searchBarInput: {
    backgroundColor: 'white',
  },
})
