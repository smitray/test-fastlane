import {
  AthleteSubmitProCodeResult,
  CheckUserBlockedParams,
  CheckUserBlockedResultSuccess,
  AthleteApplyProCodeParams,
  AthleteSubmitProCodeParams,
  UserInitAfterSignupParams,
  S3PresignedURLParams,
  AthleteSearchParams,
  AthleteSearchResult,
  GetAthleteProfileParams,
  AthletePreviewProfile,
  UserUpdateVoIPParams,
  UserCreateCallParams,
  AthleteGetDashboardInfoParams,
  AthleteGetDashboardInfoResult,
  UserInitAfterSignupResult,
  AddPhoneToWaitListParams,
  AthleteNewSignUpFlowParams,
  AthleteNewSignUpFlowResult,
} from '@src/database/types'

export const addPhoneToWaitList = async ({
  user,
  phone,
}: AddPhoneToWaitListParams): Promise<{ totalFanInWaitList: number }> => {
  return await user.functions.addPhoneToWaitList({ phone })
}

export const checkUserBlocked = async ({ user }: CheckUserBlockedParams): Promise<CheckUserBlockedResultSuccess> => {
  const { isBlocked } = await user.functions.checkMeBlocked()
  return isBlocked
}

// athlete authentication flow:
export const athleteApplyProCode = async ({ user, profile }: AthleteApplyProCodeParams): Promise<boolean> => {
  return await user.functions.athleteApplyProCode({ profile })
}

export const athleteSubmitProCode = async ({
  user,
  proCode,
}: AthleteSubmitProCodeParams): Promise<AthleteSubmitProCodeResult> => {
  return user.functions.athleteSubmitProCode({ proCode })
}

export const initUserAfterSignup = async ({
  user,
  type,
  isTermAccepted,
  proCode,
  email,
}: UserInitAfterSignupParams): Promise<UserInitAfterSignupResult> => {
  const userData = await user.functions.userInitAfterSignup({ type, isTermAccepted, proCode, email })
  await user.refreshCustomData()
  return userData
}

export const addNewSport = async ({
  user,
  name
}: any): Promise<any> => {
  const userData = await user.functions.addNewSport({ name })
  await user.refreshCustomData()
  return userData
}

export const athleteNewSignUpFlow = async ({
  user,
  email,
}: AthleteNewSignUpFlowParams): Promise<AthleteNewSignUpFlowResult> => {
  const userData = await user.functions.newUserInitAfterSignup({ type: 'athlete', isTermAccepted: true, proCode: '123455', email })
  await user.refreshCustomData()
  return userData
}
export const addNewSchoolTeam = async ({
  user,
  name
}: any): Promise<any> => {
  const userData = await user.functions.addNewSchoolTeam({ name })
  await user.refreshCustomData()
  return userData
}

export const addNewProfessionalTeam = async ({
  user,
  name
}: any): Promise<any> => {
  const userData = await user.functions.addNewProfessionalTeam({ name })
  await user.refreshCustomData()
  return userData
}

export const athleteUpdateAthteleProfileEachStep = async ({
  user,
  data
}: any): Promise<any> => {
  const userData = await user.functions.athleteUpdateAthteleProfileEachStep({ ...data })
  await user.refreshCustomData()
  return userData
}
export const getS3PresignedURL = async ({ fileName, fileType, user }: S3PresignedURLParams): Promise<string> => {
  return await user.functions.getS3PresignedURL({ fileName, fileType })
}

export const searchAthlete = async ({
  user,
  name,
  league,
  page,
  limit,
}: AthleteSearchParams): Promise<AthleteSearchResult> => {
  return await user.functions.searchAthlete({
    name,
    league,
    page,
    limit,
  })
}

export const getAthleteProfile = async ({ user, id }: GetAthleteProfileParams): Promise<AthletePreviewProfile> => {
  return await user.functions.getAthleteProfile({ id })
}

export const athleteGetDashboardInfo = async ({
  user,
}: AthleteGetDashboardInfoParams): Promise<AthleteGetDashboardInfoResult> => {
  return await user.functions.athleteGetDashboardInfo()
}

export const userAddVoIPToken = async ({ user, token }: UserUpdateVoIPParams): Promise<boolean> => {
  const { success } = await user.functions.userAddVoIPToken({ token, isDevMode: __DEV__ })
  return success
}

export const userRemoveVoIPToken = async ({ user, token }: UserUpdateVoIPParams): Promise<boolean> => {
  const { success } = await user.functions.userRemoveVoIPToken({ token })
  return success
}

export const fanCreateNewCall = async ({
  user,
  call,
}: UserCreateCallParams): Promise<{ success: boolean; callId: string }> => {
  return await user.functions.fanCreateNewCall({ call })
}
