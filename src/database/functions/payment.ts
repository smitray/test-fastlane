import {
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  GetPaymentMethodParams,
  GetPaymentMethodResult,
} from '@src/database/types'

export const createPaymentIntent = async ({
  user,
  callId,
}: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> => {
  return user.functions.stripeCreatePaymentIntent({ callId })
}

export const getPaymentMethods = async ({ user }: GetPaymentMethodParams): Promise<GetPaymentMethodResult> => {
  return user.functions.stripeGetUserSavedPaymentMethods()
}
