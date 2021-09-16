import { translate } from '@i18n/translate'
import { AccessToken, LoginManager } from 'react-native-fbsdk-next'

async function signInWithFacebook() {
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email'])
  if (result.isCancelled) {
    throw new Error(translate('user_cancelled_login'))
  }
  const currentAccessToken = await AccessToken.getCurrentAccessToken()
  const accessToken = currentAccessToken.accessToken.toString()
  return accessToken
}

async function logout() {
  return LoginManager.logOut()
}

export const facebookServices = {
  signInWithFacebook,
  logout,
}
