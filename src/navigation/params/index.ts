import Routes from '@navigation/routes'
import { AthleteSimpleInfo, TBackendCall } from '@src/database/types'

export type RootParamList = {
  [Routes.Welcome]: undefined
  [Routes.Splash]: undefined
  [Routes.AthleteNavigator]: undefined
  [Routes.FanNavigator]: undefined
  [Routes.Athlete.VideoCall]: { call: TBackendCall }
  [Routes.Athlete.VideoCallFeedback]: { call: TBackendCall }
  [Routes.Fan.VideoCall]: { call: TBackendCall; callUUID: string }
  [Routes.Fan.Block]: undefined
  [Routes.Fan.SignIn]: undefined
  [Routes.Fan.SignUp]: undefined
  [Routes.Fan.EditProfile]: undefined
  [Routes.Fan.ThankYouSignUp]: undefined
  [Routes.Fan.FanWaitList]: undefined
  [Routes.Fan.FanInviteFriends]: undefined
  [Routes.Fan.PostFanWaitList]: { order: number }
  [Routes.Athlete.QuickAccess]: undefined
  [Routes.Athlete.SignUp]: {
    proCode: string
    isTermAccepted: boolean
  }
  [Routes.Fan.Booking]: { athlete: AthleteSimpleInfo }
  [Routes.Fan.BookingSuccess]: { athlete: AthleteSimpleInfo }
  [Routes.Fan.SearchTalent]: undefined
  [Routes.Fan.TalentDetail]: { athlete: AthleteSimpleInfo }
  [Routes.Athlete.ApplyProCode]: undefined
  [Routes.Athlete.EnterProcode]: undefined
  [Routes.Athlete.SignIn]: undefined
  [Routes.Athlete.EditProfile]: undefined
  [Routes.Athlete.AccountPendingApproval]: undefined
  [Routes.Athlete.ResetPassword]: undefined
  [Routes.Athlete.ChangePassword]: undefined
  [Routes.Athlete.EnterEmail] : undefined
  [Routes.Athlete.Onboarding] : undefined
  [Routes.Athlete.PersonalInformation] : undefined
  [Routes.Athlete.SocialMedia] : undefined
  [Routes.Athlete.CallRate] : undefined
  [Routes.Athlete.TakePicture] : undefined
  [Routes.Athlete.SignUpCompleted]: undefined
}

export type AthleteNavigatorParamList = {
  [Routes.Athlete.Dashboard]: undefined
  [Routes.Athlete.UpcomingCall]: undefined
  [Routes.Athlete.Completed]: undefined
  [Routes.Athlete.Invite]: undefined
}

export type FanNavigatorParamList = {
  [Routes.Fan.Talent]: undefined
  [Routes.Fan.Dashboard]: undefined
  [Routes.Fan.Completed]: undefined
}
