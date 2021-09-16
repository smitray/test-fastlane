/* eslint-disable react-native/split-platform-components */
import { Platform, DeviceEventEmitter, PermissionsAndroid } from 'react-native'

import VoipPushNotification from 'react-native-voip-push-notification'
import { requestNotifications, request, PERMISSIONS } from 'react-native-permissions'
import RNCallKeep from 'react-native-callkeep'

const isIOS = Platform.OS === 'ios'
let setupCallKeepPromise = null
let notificationState = {
  ready: false,
  callId: '',
  callUUID: null,
  inCall: false,
  call: null,
}
// native call
const call = async (number, video = false) => {
  notificationState = {
    ...notificationState,
    inCall: true,
    callId: number,
  }

  RNCallKeep.startCall(notificationState.callId, number, number, 'number', video)
}

const onNativeCall = ({ handle, hasVideo }) => {
  console.log('🚀 ~ file: notification-provider.tsx ~ line 134 ~ onNativeCall ~ onNativeCall')
  // _onOutGoingCall on android is also called when making a call from the app
  // so we have to check in order to not making 2 calls
  if (notificationState.inCall) {
    return
  }
  // Called when performing call from native Contact app
  call(handle, hasVideo)
}

// answer
const answer = async (callUUID: string) => {
  console.log('answer ~ callUUID', callUUID)
  DeviceEventEmitter.emit('setHandleNavigation', true)
  // RNCallKeep.setCurrentCallActive(callUUID)
  notificationState = {
    ...notificationState,
    inCall: true,
    callUUID,
  }

  DeviceEventEmitter.emit('navigateToCallScreen', {
    callUUID: notificationState.callUUID,
    call: notificationState.call,
  })
}

const onAnswerCallAction = ({ callUUID }) => {
  console.log('onAnswerCallAction ~ callUUID', callUUID)
  // called when the user answer the incoming call
  answer(callUUID)

  // On Android display the app when answering a video call
  // TODO: check cameraEnabled
  const cameraEnabled = true
  if (!isIOS && cameraEnabled) {
    RNCallKeep.backToForeground()
  }
  // VoipPushNotification.onVoipNotificationCompleted(callUUID)
}

// endcall
const onEndCallAction = ({ callUUID }) => {
  console.log('onEndCallAction ~ callUUID', callUUID)
  if (callUUID === notificationState.callUUID && !notificationState.inCall) {
    DeviceEventEmitter.emit('fanDeclineCall', notificationState.callId.toString())
  }

  notificationState = {
    ...notificationState,
    inCall: true,
  }
  RNCallKeep.endCall(callUUID)
  // VoipPushNotification.onVoipNotificationCompleted(callUUID)
}

const onIncomingCallDisplayed = ({ callUUID, handle, fromPushKit }) => {
  // Incoming call displayed (used for pushkit on iOS)
  console.log('onIncomingCallDisplayed', notificationState)
}

// mutate
const onToggleMute = (muted) => {
  // Incoming call displayed (used for pushkit on iOS)
  console.log('onToggleMute', muted)
}

// perform action
const onDTMF = (action) => {
  console.log('onDTMF', action)
}

// did load with events
const didLoadWithEvents = (events) => {
  console.log(events)
  events.forEach((event) => {
    const {
      name,
      data: { payload },
    } = event
    const { call } = payload
    const isUserAlreadyAnswered = name === 'RNCallKeepPerformAnswerCallAction'
    if (isUserAlreadyAnswered) {
      notificationState = {
        ...notificationState,
        call,
      }
      onAnswerCallAction(event)
    }
    const isUserAlreadyDeclined = name === 'RNCallKeepPerformEndCallAction'

    if (isUserAlreadyDeclined) {
      notificationState = {
        ...notificationState,
        call,
      }
      onEndCallAction(event)
    }
  })
}

const setupCallKeepFunc = async () => {
  await RNCallKeep.setup({
    ios: {
      appName: 'Meetlete',
      maximumCallGroups: '1',
      maximumCallsPerCallGroup: '1',
      includesCallsInRecents: true,
    },
    android: {
      alertTitle: 'Permissions required',
      alertDescription: 'This application needs to access your phone accounts',
      cancelButton: 'Cancel',
      okButton: 'ok',
      additionalPermissions: [PermissionsAndroid.PERMISSIONS.READ_CONTACTS],
    },
  })
  RNCallKeep.setAvailable(true)
  notificationState = {
    ...notificationState,
    ready: true,
  }
  RNCallKeep.addEventListener('didReceiveStartCallAction', onNativeCall)
  RNCallKeep.addEventListener('answerCall', onAnswerCallAction)
  RNCallKeep.addEventListener('endCall', onEndCallAction)
  RNCallKeep.addEventListener('didDisplayIncomingCall', onIncomingCallDisplayed)
  RNCallKeep.addEventListener('didPerformSetMutedCallAction', onToggleMute)
  RNCallKeep.addEventListener('didPerformDTMFAction', onDTMF)
  RNCallKeep.addEventListener('didLoadWithEvents', didLoadWithEvents)
}

const setupCallKeep = async () => {
  const shouldSetupCallKeep = !notificationState.ready && !setupCallKeepPromise
  if (shouldSetupCallKeep) {
    setupCallKeepPromise = new Promise((resolve) => {
      console.log('setup call keep done in promise')
      setupCallKeepFunc().then(resolve)
      setupCallKeepPromise = null
    })
  }
  return setupCallKeepPromise
}

const onVoipPushNotificationRegistered = async (token) => {
  // console.log('token', token)
  DeviceEventEmitter.emit('setVoIPToken', token)
  // when token registered
}

const onVoipPushNotificationsReceived = async (notification) => {
  console.log('onVoipPushNotificationsReceived')

  // console.log('notification', JSON.stringify(notification, null, 4))
  // --- when receive remote voip push, register your VoIP client, show local notification ... etc
  const call = notification?.custom?.a?.payload?.call
  const callUUID = notification?.custom?.i
  // const callUUID = notification?.custom?.a.payload
  if (call && callUUID) {
    await setupCallKeep()
    console.log('setup call keep done in on notification')
    console.log('on notification => call display incoming call')
    notificationState = {
      ...notificationState,
      call,
    }
    // RNCallKeep.displayIncomingCall(callUUID, call._id, call.athlete?.name)
  }

  // --- optionally, if you `addCompletionHandler` from the native side, once you have done the js jobs to initiate a call, call `completion()`
  // VoipPushNotification.onVoipNotificationCompleted(callUUID)
}

const onVoipLoadWWithEvents = async (events) => {
  console.log('events', events)
  // --- this will fire when there are events occurred before js bridge initialized
  // --- use this event to execute your event handler manually by event type

  if (!events || !Array.isArray(events) || events.length < 1) {
    return
  }
  for (const voipPushEvent of events) {
    const { name, data } = voipPushEvent
    console.log('name', name)
    if (name === 'RNVoipPushRemoteNotificationsRegisteredEvent') {
      onVoipPushNotificationRegistered(data)
    } else if (name === 'RNVoipPushRemoteNotificationReceivedEvent') {
      DeviceEventEmitter.emit('setHandleNavigation', true)
      onVoipPushNotificationsReceived(data)
    }
  }
}

async function setupOneVOIPNotification() {
  console.log('setupOneVOIPNotification')
  await setupCallKeep()

  await requestNotifications(['alert', 'sound'])
  const isIOS = Platform.OS === 'ios'
  if (isIOS) {
    await request(PERMISSIONS.IOS.MICROPHONE)
    await request(PERMISSIONS.IOS.CAMERA)
    VoipPushNotification.addEventListener('register', onVoipPushNotificationRegistered)
  } else {
    await request(PERMISSIONS.ANDROID.READ_PHONE_STATE)
    await request(PERMISSIONS.ANDROID.CALL_PHONE)
    await request(PERMISSIONS.ANDROID.RECORD_AUDIO)
    await request(PERMISSIONS.ANDROID.CAMERA)
  }

  // ===== Step 2: subscribe `notification` event =====
  // --- this.onVoipPushNotificationReceived
  VoipPushNotification.addEventListener('notification', onVoipPushNotificationsReceived)

  // ===== Step 3: subscribe `didLoadWithEvents` event =====
  VoipPushNotification.addEventListener('didLoadWithEvents', onVoipLoadWWithEvents)

  // ===== Step 4: register =====
  // --- it will be no-op if you have subscribed before (like in native side)
  // --- but will fire `register` event if we have latest cached voip token ( it may be empty if no token at all )
  VoipPushNotification.registerVoipToken() // --- register token
}

export default setupOneVOIPNotification
