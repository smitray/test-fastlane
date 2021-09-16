import { RootParamList } from '@navigation/params'
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { ComponentProps, forwardRef } from 'react'
import Routes from '../routes'

const Stack = createStackNavigator<RootParamList>()

const RootStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={Routes.Welcome}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={Routes.AthleteNavigator} component={require('./athlete-navigator').default} />
      <Stack.Screen name={Routes.FanNavigator} component={require('./fan-navigator').default} />
      <Stack.Screen name={Routes.Welcome} component={require('@screens/welcome-screen').default} />
      <Stack.Screen
        name={Routes.Athlete.VideoCall}
        options={{ gestureEnabled: false }}
        component={require('@screens/athlete/video-call-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.VideoCallFeedback}
        component={require('@screens/athlete/video-call-feedback-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.QuickAccess}
        component={require('@screens/athlete/quick-access-screen').default}
      />
      <Stack.Screen name={Routes.Athlete.SignUp} component={require('@screens/athlete/signup-screen').default} />
      <Stack.Screen
        name={Routes.Athlete.ApplyProCode}
        component={require('@screens/athlete/apply-procode-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.PersonalInformation}
        options={{ gestureEnabled: false }}
        component={require('@screens/athlete/sign-up-screen/personal-information-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.SocialMedia}
        component={require('@screens/athlete/sign-up-screen/social-media-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.CallRate}
        component={require('@screens/athlete/sign-up-screen/call-rate-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.TakePicture}
        component={require('@screens/athlete/sign-up-screen/take-picture-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.SignUpCompleted}
        component={require('@screens/athlete/sign-up-screen/signup-completed-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.ResetPassword}
        component={require('@screens/athlete/reset-password-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.ChangePassword}
        component={require('@screens/athlete/change-password-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.EnterEmail}
        component={require('@screens/athlete/enter-email-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.EnterProcode}
        options={{ gestureEnabled: false }}
        component={require('@screens/athlete/enter-procode-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.EditProfile}
        options={{ gestureEnabled: false }}
        component={require('@screens/athlete/edit-profile-screen').default}
      />
      <Stack.Screen
        name={Routes.Athlete.Onboarding}
        options={{ gestureEnabled: false }}
        component={require('@screens/athlete/onboarding-screen').default}
      />
      <Stack.Screen name={Routes.Athlete.SignIn} component={require('@screens/athlete/signin-screen').default} />
      <Stack.Screen
        name={Routes.Athlete.AccountPendingApproval}
        component={require('@screens/athlete/account-pending-approval-screen').default}
      />
      <Stack.Screen
        name={Routes.Fan.VideoCall}
        options={{ gestureEnabled: false }}
        component={require('@screens/fan/video-call-screen').default}
      />
      <Stack.Screen name={Routes.Fan.SignIn} component={require('@screens/fan/signin-screen').default} />
      <Stack.Screen name={Routes.Fan.SignUp} component={require('@screens/fan/signup-screen').default} />
      <Stack.Screen
        name={Routes.Fan.EditProfile}
        options={{ gestureEnabled: false }}
        component={require('@screens/fan/edit-profile-screen').default}
      />
      <Stack.Screen name={Routes.Fan.Block} component={require('@screens/fan/block-screen').default} />
      <Stack.Screen
        name={Routes.Fan.ThankYouSignUp}
        component={require('@screens/fan/thank-you-signup-screen').default}
      />
      <Stack.Screen name={Routes.Fan.Booking} component={require('@screens/fan/booking-screen').default} />
      <Stack.Screen
        name={Routes.Fan.BookingSuccess}
        component={require('@screens/fan/booking-success-screen').default}
      />
      <Stack.Screen name={Routes.Fan.TalentDetail} component={require('@screens/fan/talent-detail-screen').default} />
      <Stack.Screen name={Routes.Fan.SearchTalent} component={require('@screens/fan/search-talent-screen').default} />
      <Stack.Screen name={Routes.Fan.FanWaitList} component={require('@screens/fan/fan-waitlist-screen').default} />
      <Stack.Screen
        name={Routes.Fan.PostFanWaitList}
        component={require('@screens/fan/post-fan-waitlist-screen').default}
      />
      <Stack.Screen
        name={Routes.Fan.FanInviteFriends}
        component={require('@screens/fan/invite-friends-screen').default}
      />
    </Stack.Navigator>
  )
}

export const RootNavigator = forwardRef<NavigationContainerRef, Partial<ComponentProps<typeof NavigationContainer>>>(
  (props, ref) => {
    return (
      <NavigationContainer {...props} ref={ref}>
        <RootStack />
      </NavigationContainer>
    )
  },
)
RootNavigator.displayName = 'RootNavigator'

const exitRoutes = [Routes.Welcome]
export const canExit = (routeName: string) => exitRoutes.includes(routeName as any)
