import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Routes from '../routes'
import { translate } from '@i18n/translate'
import { typography } from '@styles/typography'
import { s, vs } from 'react-native-size-matters/extend'
import { StyleSheet } from 'react-native'
import { Icon } from 'react-native-elements'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { AthleteNavigatorParamList } from '@navigation/params'

const Tab = createBottomTabNavigator<AthleteNavigatorParamList>()

export default function AthleteNavigator() {
  return (
    <Tab.Navigator
      initialRouteName={Routes.Athlete.Dashboard}
      tabBarOptions={{
        labelStyle: {
          fontSize: typography.fontSize.small,
        },
        style: styles.tabBar,
      }}
    >
      <Tab.Screen
        name={Routes.Athlete.Dashboard}
        options={{
          tabBarLabel: translate('dashboard'),
          tabBarIcon: ({ color, size }) => (
            <Icon type="material-community" name="view-dashboard-outline" color={color} size={size} />
          ),
        }}
        component={require('@screens/athlete/dashboard-screen').default}
      />
      <Tab.Screen
        name={Routes.Athlete.UpcomingCall}
        options={{
          tabBarLabel: translate('upcoming'),
          tabBarIcon: ({ color, size }) => (
            <Icon type="material-community" name="message-video" color={color} size={size} />
          ),
        }}
        component={require('@screens/athlete/upcoming-call-screen').default}
      />
      <Tab.Screen
        name={Routes.Athlete.Completed}
        options={{
          tabBarLabel: translate('completed'),
          tabBarIcon: ({ color, size }) => (
            <Icon type="material-community" name="clipboard-play-outline" color={color} size={size} />
          ),
        }}
        component={require('@screens/athlete/completed-screen').default}
      />
      <Tab.Screen
        name={Routes.Athlete.Invite}
        options={{
          tabBarLabel: translate('invite'),
          tabBarIcon: ({ color, size }) => (
            <Icon type="material-community" name="heart-plus-outline" color={color} size={size} />
          ),
        }}
        component={require('@screens/athlete/invite-screen').default}
      />
    </Tab.Navigator>
  )
}

const exitRoutes = ['welcome']
export const canExit = (routeName: string) => exitRoutes.includes(routeName)

const styles = StyleSheet.create({
  tabBar: {
    borderTopLeftRadius: s(10),
    borderTopRightRadius: s(10),
    borderTopWidth: 0,
    elevation: 10,
    height: vs(80),
    overflow: 'visible',
    position: 'absolute',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.8,
    shadowRadius: 6.27,
    zIndex: 100,
    ...ifIphoneX(
      {
        paddingBottom: vs(20),
      },
      {
        paddingBottom: vs(10),
      },
    ),
  },
})
