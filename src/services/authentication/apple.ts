import { Platform } from 'react-native'
import { appleAuth } from '@invertase/react-native-apple-authentication'
import { translate } from '@i18n/translate'

async function signInWithApple() {
  if (Platform.OS !== 'ios' || !appleAuth.isSupported) {
    throw new Error('Apple Sign In is not supported in your device')
  }

  let response
  try {
    response = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    })
  } catch (error) {
    if (error.code === appleAuth.Error.CANCELED) {
      // throw new Error("User cancelled login.")
      return
    }
    // throw error
    throw new Error(translate('cannotValidateLoginAccount'))
  }

  // get current authentication state for user
  const credentialState = await appleAuth.getCredentialStateForUser(response.user)

  // use credentialState response to ensure the user is authenticated
  if (credentialState !== appleAuth.State.AUTHORIZED) {
    throw new Error('Invalid state. Please try again.')
  }

  // user is authenticated
  // response.user
  // response.email
  // response.fullName.givenName
  // response.fullName.familyName
  // response.identityToken
  // response.authorizationCode
  return response
}

async function logout() {
  // do nothing
}

export const appleServices = {
  signInWithApple,
  logout,
}
