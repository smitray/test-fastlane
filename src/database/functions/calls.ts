import {
  CreateNewCallParams,
  EndCallParams,
  GetCallByIdParam,
  GetTwilioTokenParams,
  GetIsCallEndedParam,
  TBackendCall,
  BlockFanParams,
  GetCallsParam,
  getCompositionURLFromCallParam,
  FeedbackCallParams,
  FanDeclineCall,
} from '@src/database/types'

export const getIsCallEnded = async ({ user, callId }: GetIsCallEndedParam): Promise<boolean> => {
  const { isEnded } = await user.functions.getIsCallEnded({ callId: callId.toString() })
  return isEnded
}

export const getCallById = async ({ user, callId }: GetCallByIdParam): Promise<TBackendCall> => {
  if (user) {
    const call = await user.functions.getCall({ callId })
    return call
  }
  throw new Error('No User')
}

export const getCalls = async ({ user, filter, orderBy }: GetCallsParam): Promise<TBackendCall[]> => {
  if (user) {
    const calls = await user.functions.getMyCalls(filter, orderBy)
    return calls
  }
  throw new Error('No User')
}

export const getTwilioToken = async ({ user, callId }: GetTwilioTokenParams): Promise<string> => {
  const { jwt } = await user.functions.getTwilioToken({ callId: callId.toString() })
  return jwt
}

export const feedbackCall = async ({
  callId,
  user,
  feedback,
  shouldFanHasRecord,
}: FeedbackCallParams): Promise<void> => {
  return await user.functions.athleteFeedbackCall({ callId: callId.toString(), feedback, shouldFanHasRecord })
}

export const blockUser = async ({ user, blockedUserId }: BlockFanParams): Promise<void> => {
  return await user.functions.athleteBlockFan({ blockedUserId })
}

export const createNewCall = async ({ user, call }: CreateNewCallParams): Promise<void> => {
  return await user.functions.fanCreateNewCall({
    call,
  })
}

export const endCall = async ({ user, callId, endReason }: EndCallParams): Promise<void> => {
  return await user.functions.userEndCall({
    callId: callId.toString(),
    endReason,
  })
}

export const getCompositionURLFromCall = async ({ user, callId }: getCompositionURLFromCallParam): Promise<string> => {
  const { url } = await user.functions.getCompositionURLFromCall({
    callId: callId.toString(),
  })
  return url
}

export const fanDeclineCall = async ({ user, callId }: FanDeclineCall): Promise<void> => {
  const { url } = await user.functions.fanDeclineCall({
    callId: callId,
  })
  return url
}
