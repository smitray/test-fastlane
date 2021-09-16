import { StatusBarProps, ViewProps, ViewStyle } from 'react-native'
import { NativeSafeAreaViewProps } from 'react-native-safe-area-context'
import { KeyboardOffsets, ScreenPresets } from './screen.presets'
import { KeyboardAwareScrollViewProps } from 'react-native-keyboard-aware-scroll-view'
import { HeaderProps } from '../header'

export interface ScreenProps {
  /**
   * Children components.
   */
  children?: React.ReactNode

  /**
   * An optional style override useful for padding & margin.
   */
  style?: ViewStyle | ViewStyle[]

  /**
   * One of the different types of presets.
   */
  preset?: ScreenPresets

  /**
   * An optional background color
   */
  backgroundColor?: string

  /**
   * An optional status bar setting. Defaults to light-content.
   */
  barStyle?: 'light-content' | 'dark-content'
  statusBarProps?: StatusBarProps

  /**
   * Should we not wrap in SafeAreaView? Defaults to false.
   */
  unsafe?: boolean

  /**
   * By how much should we offset the keyboard? Defaults to none.
   */
  keyboardOffset?: KeyboardOffsets

  /**
   * An optional style override useful for padding & margin.
   */
  containerStyle?: ViewStyle

  wrapperProps?: ViewProps

  safeAreaViewProps?: NativeSafeAreaViewProps

  headerWithScroll?: boolean

  keyboardAwareScrollViewProps?: KeyboardAwareScrollViewProps

  theme?: any
  header?: HeaderProps
  headerV2?: HeaderProps
}
