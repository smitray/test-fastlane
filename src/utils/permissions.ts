// eslint-disable-next-line react-native/split-platform-components
import { translate } from '@i18n/translate'
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions'
import { getApplicationName } from 'react-native-device-info'

const AppName = getApplicationName()

export const _requestPermissionOnIOS = (usage) => {
  check(usage)
    .then((result) => {
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('This feature is not available (on this device / in this context)')
          break
        case RESULTS.DENIED:
          console.log('The permission has not been requested / is denied but requestable')
          request(usage).then((result) => {
            switch (result) {
              case RESULTS.BLOCKED:
                console.log('The permission is denied and not requestable anymore')
                break
              case RESULTS.GRANTED:
                console.log('The permission is granted')
                break
            }
          })
          break
        case RESULTS.LIMITED:
          console.log('The permission is limited: some actions are possible')
          break
        case RESULTS.GRANTED:
          console.log('The permission is granted')
          break
        case RESULTS.BLOCKED:
          console.log('The permission is denied and not requestable anymore')
          break
      }
    })
    .catch((error) => {
      console.log(error)
    })
}

export const _requestAudioPermission = () => {
  return request(PERMISSIONS.ANDROID.RECORD_AUDIO, {
    title: translate('camera_permission_title'),
    message: translate('audio_permission_request', { appName: AppName }),
    buttonNegative: translate('deny'),
    buttonPositive: translate('ok'),
  })
}

export const _requestCameraPermission = () => {
  return request(PERMISSIONS.ANDROID.CAMERA, {
    title: translate('camera_permission_title'),
    message: translate('camera_permission_message', { appName: AppName }),
    buttonNegative: translate('deny'),
    buttonPositive: translate('ok'),
  })
}
