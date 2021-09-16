/* eslint-disable react-native/split-platform-components */
import { createContext, useEffect, useState } from 'react'
import OneSignal from 'react-native-onesignal'
import { ONESIGNAL_APP_ID } from '@env'
import { getRealmApp } from '@src/database/get-app-realm'
import Routes from '@navigation/routes'
import { DeviceEventEmitter } from 'react-native'
import { useAuth } from '@hooks/useAuth'
import { fanDeclineCall } from '@src/database/functions'

const app = getRealmApp()

const setExternalUserId = () => {
  if (app?.currentUser) {
    OneSignal.setExternalUserId(app.currentUser.id)
  }
}

type TNotificationContext = {
  handledNavigation: boolean | undefined
  setHandleNavigation: (state: boolean) => void
}

export const NotificationContext = createContext<TNotificationContext>({} as TNotificationContext)

export const NotificationProvider = ({ children, navigationRef }) => {
  const [handledNavigation, setHandleNavigation] = useState(null)
  const { setVoIPToken } = useAuth()

  useEffect(() => {
    DeviceEventEmitter.addListener('setHandleNavigation', (handled) => {
      setHandleNavigation(handled)
    })
    DeviceEventEmitter.addListener('setVoIPToken', (token) => {
      setVoIPToken(token)
    })
    DeviceEventEmitter.addListener('fanDeclineCall', (callId) => {
      fanDeclineCall({
        user: app.currentUser,
        callId,
      })
    })
    DeviceEventEmitter.addListener('navigateToCallScreen', ({ callUUID, call }) => {
      console.log(' DeviceEventEmitter.addListener ~ callUUID', callUUID)
      // TODO: handle check  callUUId
      // Handle Call
      navigationRef.current?.reset({
        index: 1,
        routes: [
          { name: Routes.FanNavigator },
          {
            name: Routes.Fan.VideoCall,
            params: {
              call: {
                ...call,
              },
              callUUID,
            },
          },
        ],
      })
    })
  }, [navigationRef, setVoIPToken])

  useEffect(() => {
    const handleNotificationsAction = async (data) => {
      const { type, action, payload } = data
      switch (type) {
        case 'call': {
          if (action === 'athlete-call' && payload?.call) {
            setHandleNavigation(true)
            navigationRef.current?.navigate(Routes.Fan.VideoCall, {
              call: payload.call,
            })
          }
          break
        }
        default: {
          // nothing now
        }
      }
    }
    const onOpened = (openedEvent) => {
      try {
        const { notification } = openedEvent
        if (notification.additionalData) {
          handleNotificationsAction(notification.additionalData)
        }
      } catch (err) {
        //
      }
    }
    const getDeviceState = async () => {
      try {
        const deviceState = await OneSignal.getDeviceState()
        // console.log('deviceState', deviceState)
        return deviceState
      } catch (err) {
        //
      }
    }
    OneSignal.setAppId(ONESIGNAL_APP_ID)
    OneSignal.setLogLevel(6, 0)
    OneSignal.setRequiresUserPrivacyConsent(false)
    OneSignal.setNotificationWillShowInForegroundHandler((notificationReceivedEvent) => {
      // const notification = notificationReceivedEvent.getNotification()
      // console.log('notification: ', notification)
      // const data = notification.additionalData
      // console.log('additionalData: ', data)
      // if (appState.current === 'active') {
      //   notificationReceivedEvent.complete()
      // } else {
      //   notificationReceivedEvent.complete(notification)
      // }
    })
    OneSignal.setNotificationOpenedHandler(onOpened)
    OneSignal.setInAppMessageClickHandler((event) => {
      // this.OSLog('OneSignal IAM clicked:', event)
    })
    OneSignal.addEmailSubscriptionObserver((event) => {
      // this.OSLog('OneSignal: email subscription changed: ', event)
    })
    OneSignal.addSubscriptionObserver((event) => {
      // this.OSLog('OneSignal: subscription changed:', event)
      // this.setState({ isSubscribed: event.to.isSubscribed })
    })
    OneSignal.addPermissionObserver((event) => {
      // this.OSLog('OneSignal: permission changed:', event)
    })
    setExternalUserId()
    getDeviceState()

    return () => {
      OneSignal.clearHandlers()
    }
  }, [navigationRef])

  return (
    <NotificationContext.Provider value={{ handledNavigation, setHandleNavigation }}>
      {children}
    </NotificationContext.Provider>
  )
}
