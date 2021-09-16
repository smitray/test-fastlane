import User from '../models/user'
import Block from '../models/block'

enum UserRole {
  ATHLETE = 'athlete',
  FAN = 'fan',
  ADMIN = 'admin',
}

enum UserStatus {
  ACTIVE = 'active',
  DEACTIVATE = 'deactivate',
  SUSPENDED = 'suspended',
}

export type TUser = {
  id: string
  name: string
  team: string
  avatar: string
  status: UserStatus
  role: UserRole
}

export type TAthlete = TUser & {
  price: string
}

export type TFan = TUser

export type TRecording = {
  link: string
}

export enum TUserType {
  FAN = 'fan',
  ATHLETE = 'athlete',
}

export enum TBackendCallStatus {
  CREATED = 'created',
  PENDING = 'pending',
  ATTEMPTED = 'attempted',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CANCELED = 'canceld',
  ERROR = 'error',
}

type Log = {
  createdAt: number // unixtime
  log: string
}

enum RecordingType {
  MKA = 'mka',
  MKV = 'mkv',
}

enum RecordingStatus {
  FAILED = 'failed',
  STARTED = 'started',
  COMPLETED = 'completed',
}

type Recording = {
  id: string
  container: RecordingType
  status: RecordingStatus
}

type AvailableTime = {
  start: number
  end: number
}

export type TBackendCall = {
  _id: string
  status: TBackendCallStatus
  createdBy: string
  meetAthlete: string
  availableTime: AvailableTime
  message: string
  videoURL: URL
  price: number
  transactionId: string
  confirmationNumber: string
  createdAt: number // unixtime
  fanVideoIntroduceURL?: string
  // call logs:
  twilioCallId: string
  isFanInCall: boolean
  isAthleteInCall: boolean
  isCallEnded: boolean
  callEndedBy: TUserType
  endReason: string
  attemptedCount: number
  errorCount: number
  logs: Log[]
  // recordings
  recordings: Recording[]
  compositionVideoResult: string
  compositionVideoStatus: string
  fan?: TUser
  athlete?: TUser
}

export type GetCallByIdParam = {
  user: Realm.User
  type: TUserType
  callId: string
}

export type GetIsCallEndedParam = {
  user: Realm.User
  callId: string
}

export type NewCallParams = {
  meetAthlete: string
  availableTime: AvailableTime
  message: string
  videoURL: string
  price: number
}

export type CreateNewCallParams = {
  user: Realm.User
  call: NewCallParams
}

export type EndCallParams = {
  user: Realm.User
  callId: string
  endReason: string
}

export type GetTwilioTokenParams = {
  user: Realm.User
  callId: string
}

export type getCompositionURLFromCallParam = {
  user: Realm.User
  callId: string
}

export type BlockFanParams = {
  user: Realm.User
  blockedUserId: string
}

export type FeedbackCallParams = {
  user: Realm.User
  feedback?: string
  shouldFanHasRecord?: boolean
  callId: string
}

export type GetCallsParam = {
  user: Realm.User
  filter: Record<string, any>
  orderBy: Record<string, number>
}

export type CheckUserBlockedParams = {
  user: Realm.User
}

export type CheckUserBlockedResultSuccess = {
  isBlocked?: boolean
}

export enum SocialMedia {
  Facebook = 'Facebook',
  Instagram = 'Instagram',
  Twitter = 'Twitter',
  SnapChat = 'Snap Chat'
}

export type AthleteApplyProCode = {
  name: string
  socialMedia: SocialMedia
  socialHandle: string
  email: string
  phone: string
  leagueId: string
  sportId: string
}

export type AthleteApplyProCodeParams = {
  user: Realm.User
  profile: AthleteApplyProCode
}

export type AthleteSubmitProCodeParams = {
  user: Realm.User
  proCode: string
}

export type AthleteSubmitProCodeResult = {
  success: boolean
  profile: AthleteApplyProCode
}

export type UserAcceptTermParams = {
  user: Realm.User
}

export type AthleteProfile = {
  name: string
  bio: string
  avatar: string
  callDuration: number
  callPrice: number
  charityName: string
  charityDonationPercentage: number // 90% -> 90
  payoutRoutingNumber: string
  payoutAccountNumber: string
}

export type UserProfile = {
  name: string
  avatar: string
  email: string
  zipCode: string
  socialHandle: string // twwitter handle, they could be allow other social type so I add this name!
}

export type UserUpdateProfileParams = {
  user: Realm.User
  profile: AthleteProfile | UserProfile
}

export type UserInitAfterSignupParams = {
  user: Realm.User
  type: string
  proCode?: string
  email?: string
  isTermAccepted: boolean
}

export type UserInitAfterSignupResult = {
  user?: {
    isVerified: boolean,
    type: 'athlete' | 'fan',
    name: string
  },
  success?: boolean,
  error?: string
}

export type AthleteNewSignUpFlowParams = {
  user: Realm.User
  email?: string
}

export type AthleteNewSignUpFlowResult = {
  user?: {
    isVerified: boolean,
    type: 'athlete' | 'fan',
    name: string
  },
  success?: boolean,
  error?: string
}

export type S3PresignedURLParams = {
  user: Realm.User
  fileName: string
  fileType: string
}

export type AthleteSimpleInfo = {
  _id: string
  avatar: string
  name: string
  league?: string
  callPrice: string
  bio?: string
  sport?: string
  charityName?: string
}

export type AthleteSearchParams = {
  user: Realm.User
  name?: string
  league?: string
  page?: number
  limit?: number
}

export type AthleteSearchResult = {
  data: AthleteSimpleInfo[]
  limit: number
  total: number
  totalPages: number
  currentPage: number
  nextPage?: number
  prevPage?: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export type AthletePreviewProfile = {
  league: string
  name: string
  bio: string
  avatar: string
  callDuration: number
  callPrice: number
  description: string
  charityName: string
  charityDonationPercentage: number // 90% -> 90
}

export type GetAthleteProfileParams = {
  user: Realm.User
  id: string
}

export type AthleteGetDashboardInfoParams = {
  user: Realm.User
}

export type AthleteDashboardInfoItem = {
  _id: string
  total: number
  totalRevenue: number
}

export type AthleteGetDashboardInfoResult = {
  data: AthleteDashboardInfoItem[]
}

export type UserUpdateVoIPParams = {
  user: Realm.User
  token: string
}

export type UserCreateCallParams = {
  user: Realm.User
  call: {
    meetAthlete: string // athleteId
    availableTime?: {
      start: number
      end: number
    }
    fanVideoIntroduceURL: string
    message?: string
  }
}

export type CreatePaymentIntentParams = {
  user: Realm.User
  callId: string
}

export type FanDeclineCall = {
  user: Realm.User
  callId: string
}

export type CreatePaymentIntentResult = {
  paymentIntent: string
  customerId: string
}

export type GetPaymentMethodParams = {
  user: Realm.User
}

export type PaymentMethod = {
  id: string
  billing_details: Record<string, any>
  card: {
    brand: string
    exp_month: number
    exp_year: number
    funding: string
    last4: string
  }
  type: 'card'
  // this type has more props, I just add useful prop here
}

export type GetPaymentMethodResult = {
  paymentMethods: PaymentMethod[]
}

export type SetupProfileParams = {
  user: Realm.User,
  listener: {
    profileChanged: Realm.CollectionChangeCallback<User>,
    blockChanged: Realm.CollectionChangeCallback<Block>
  }
}

export type AddPhoneToWaitListParams = {
  user: Realm.User,
  phone: string,
}
