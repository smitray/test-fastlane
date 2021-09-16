import { translate } from '@i18n/translate'
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'

async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices()
    const auth = await GoogleSignin.signIn()
    return auth
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('User cancelled login')
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Your login is in progress')
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('We need Google Play Services for Google login')
    }
    // throw error
    throw new Error(translate('errors.cannotValidateLoginAccount'))
  }
}

async function logout() {
  await GoogleSignin.revokeAccess()
  return await GoogleSignin.signOut()
}

export const googleServices = {
  signInWithGoogle,
  logout,
}
