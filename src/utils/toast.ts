import Toast, { AnyObject, ToastPosition } from 'react-native-toast-message'
import { translate } from '@i18n/translate'
import { metrics } from '@styles/metrics'

type ToastOptions = {
  type: string
  position?: ToastPosition
  title?: string
  titleTx?: string
  titleTxOptions?: Record<string, any>
  message?: string
  messageTx?: string
  messageTxOptions?: Record<string, any>
  visibilityTime?: number
  autoHide?: boolean
  topOffset?: number
  bottomOffset?: number
  props?: AnyObject
  onShow?: () => void
  onHide?: () => void
  onPress?: () => void
}

export function show(options: ToastOptions) {
  const { title, titleTx, titleTxOptions, message, messageTx, messageTxOptions } = options || {}
  const text1 = title || (titleTx ? translate(titleTx, titleTxOptions) : '')
  const text2 = message || (messageTx ? translate(messageTx, messageTxOptions) : '')
  Toast.show({
    type: options.type,
    text1: text1,
    text2: text2,
    visibilityTime: 2000,
    autoHide: true,
    topOffset: metrics.headerHeight,
    ...options,
  })
}
