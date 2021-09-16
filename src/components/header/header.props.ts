import { ViewStyle } from 'react-native'

import { HeaderProps as ReactNativeElementsHeaderProps } from 'react-native-elements'
import { TextProps } from '../text'
import { ButtonProps } from '@components/button'
import { IconName } from '@components/icon-svg'

export interface HeaderProps extends ReactNativeElementsHeaderProps {
  /**
   * Main header, e.g. POWERED BY BOWSER
   */
  headerTx?: string
  headerTextProps?: TextProps

  /**
   * Icon that should appear on the left
   */
  leftButtonProps?: ButtonProps

  /**
   * What happens when you press the left icon
   */
  onLeftPress?(): void

  /**
   * What happens when you press the right icon
   */
  onRightPress?(): void

  /**
   * i18 Right title.
   */
  rightTx?: string
  rightTextProps?: TextProps
  rightButtonProps?: ButtonProps

  /**
   * Container style overrides.
   */
  style?: ViewStyle
}
