/* eslint-disable eqeqeq */
import { FlatList, RefreshControl } from 'react-native'
import { Menu } from './components/menu'
import { useCallback, useEffect, useState } from 'react'
import AthleteItem from './components/athlete-item'
import { ScaledSheet } from 'react-native-size-matters/extend'
import { Box, Text, Screen } from '@components/index'
import Routes from '@navigation/routes'
import { useAuth } from '@hooks/useAuth'
import { debounce } from '@utils/lodash'
import { usePublicSync } from '@hooks/usePublicSync'
import { useTheme } from '@hooks/theme'

const TalentScreen = ({ navigation }) => {
  const { signOut } = useAuth()
  const { publicAthleteProfiles, leagues, sports } = usePublicSync()
  const [athletes, setAthletes] = useState(publicAthleteProfiles)
  const [isLoading, setIsLoading] = useState(false)
  const [leagueId, setLeagueId] = useState(null) // null = all
  const [sportId, setSportId] = useState(null) // null = all
  const [isSignOut, setIsSignOut] = useState(null) // null = all
  const theme = useTheme()
  console.log('ALTHLETES=====', athletes)
  const search = useCallback(
    debounce((publicAthleteProfiles, sportId) => {
      const result = sportId ? publicAthleteProfiles.filtered('sportId == $0', sportId) : publicAthleteProfiles
      const sortedResult = result.sorted([['priority', true]])
      // must convert to plain object:
      // https://github.com/realm/realm-js/issues/1031
      setAthletes(JSON.parse(JSON.stringify(sortedResult)))
      setIsLoading(false)
    }, 500),
    [],
  )

  useEffect(() => {
    setIsLoading(true)
    search(publicAthleteProfiles, sportId)
  }, [publicAthleteProfiles, sportId, search])

  const _onMenuItemSelect = useCallback((sportId) => {
    setSportId(sportId)
  }, [])

  const _onAthleteSelect = useCallback(
    (athlete) => {
      navigation.navigate(Routes.Fan.TalentDetail, { athlete })
    },
    [navigation],
  )

  const _onSearchPress = useCallback(async () => {
    navigation.navigate(Routes.Fan.SearchTalent)
  }, [navigation])

  const _onLogoutPress = useCallback(async () => {
    try {
      setIsSignOut(true)

      await signOut()
    } catch (err) {
      setIsSignOut(false)
    } finally {
      setIsSignOut(false)
      navigation.reset({ index: 0, routes: [{ name: Routes.Welcome }] })
    }
  }, [navigation, setIsSignOut, signOut])

  const _renderAthleteItem = useCallback(
    ({ item }) => (
      <AthleteItem
        athlete={item}
        onSelect={_onAthleteSelect}
      />
    ),
    [_onAthleteSelect]
  )

  return (
    <Screen
      header={{
        headerTx: 'talents',
        headerTextProps: { color: 'pickledBluewood' },
        leftButtonProps: {
          icon: { name: 'logout', color: '#828282' },
          loading: isSignOut,
          disabled: isSignOut,
          disabledStyle: { backgroundColor: 'transparent' },
        },
        rightButtonProps: {
          icon: { name: 'search', type: 'feather', color: '#828282' },
          disabled: isSignOut,
          disabledStyle: { backgroundColor: 'transparent' },
        },
        onRightPress: _onSearchPress,
        onLeftPress: _onLogoutPress,
      }}
    >
      <Box paddingBottom="m">
        <Menu menus={sports} selectedMenuItem={sportId} onMenuItemSelect={_onMenuItemSelect} />
      </Box>
      <FlatList
        data={athletes}
        numColumns={2}
        refreshControl={<RefreshControl tintColor={theme.colors.text} refreshing={isLoading} />}
        keyExtractor={(item) => String(item._id)}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={_renderAthleteItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <Box justifyContent="center" alignItems="center" flex={1}>
            <Text tx="no_talent_found" />
          </Box>
        }
      />
    </Screen>
  )
}

export default TalentScreen

const styles = ScaledSheet.create({
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: '42@vs',
    paddingHorizontal: '30@s',
  },
  contentContainer: {
    flexGrow: 1,
    paddingTop: '20@vs',
    paddingBottom: '40@vs',
  },
})
