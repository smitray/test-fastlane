import isString from 'lodash-es/isString'
import { Linking, Platform } from 'react-native'

const Launch = (url: string) => {
  return new Promise((resolve, reject) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url)
          return resolve(1)
        }
        return reject(new Error('Invalid link'))
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export const openSms = (phone, message = null, autoEncode = true) => {
  return new Promise((resolve, reject) => {
    if (!isString(phone)) {
      reject(new Error('The provided phone number must be a string'))
    }

    let url = 'sms:' + phone

    if (message) {
      if (autoEncode) {
        if (Platform.OS === 'android') {
          message = encodeURIComponent(message)
        }

        message = encodeURIComponent(message)
      }

      url += Platform.OS === 'ios' ? `&body=${message}` : `?body=${message}`
    }

    Launch(url)
      .then(resolve)
      .catch((error) => reject(error))
  })
}
