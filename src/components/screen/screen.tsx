import { KeyboardAvoidingView, StatusBar, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Header } from '../header'
import { isNonScrolling, offsets, presets } from './screen.presets'
import { ScreenProps } from './screen.props'
import { HeaderV2 } from '@components/header/headerV2'

function ScreenWithoutScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets()
  const preset = presets.fixed
  const style = props.style || {}
  const backgroundStyle = props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}
  const insetStyle = props.unsafe ? {} : { paddingBottom: insets.bottom, paddingTop: props.header ? 0 : insets.top }
  const ScreenHeader = props.header ? Header : View
  const ScreenHeaderV2 = props.headerV2 ? HeaderV2 : View

  const statusBarPropsDefault = {
    barStyle: props.barStyle || 'dark-content',
    backgroundColor: '#E5E5E5',
    ...props.statusBarProps,
  }

  return (
    <KeyboardAvoidingView
      style={[preset.outer, backgroundStyle, props.containerStyle]}
      keyboardVerticalOffset={offsets[props.keyboardOffset || 'none']}
    >
      <StatusBar {...statusBarPropsDefault} />
      <ScreenHeader statusBarProps={statusBarPropsDefault} {...props.header} />
      <View style={[preset.inner, insetStyle, style]}>{props.children}</View>
      <ScreenHeaderV2 statusBarProps={statusBarPropsDefault} {...props.headerV2} />
    </KeyboardAvoidingView>
  )
}

function ScreenWithScrolling(props: ScreenProps) {
  const insets = useSafeAreaInsets()
  const preset = presets.scroll
  const { safeAreaViewProps = { edges: ['left', 'right'] } } = props
  const backgroundStyle = props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}
  const wrapperProps = props.wrapperProps
  const ScreenHeader = props.header ? Header : View

  const statusBarPropsDefault = {
    barStyle: props.barStyle || 'dark-content',
    backgroundColor: '#E5E5E5',
    ...props.statusBarProps,
  }

  return (
    <View style={[preset.outer, backgroundStyle]}>
      <StatusBar {...statusBarPropsDefault} />
      <ScreenHeader statusBarProps={statusBarPropsDefault} {...props.header} />
      <KeyboardAwareScrollView {...props.keyboardAwareScrollViewProps} showsVerticalScrollIndicator={false}>
        <SafeAreaView
          {...wrapperProps}
          {...safeAreaViewProps}
          style={[
            preset.outer,
            props.unsafe ? {} : { paddingBottom: insets.bottom, paddingTop: insets.top },
            props.style,
          ]}
        >
          {props.children}
        </SafeAreaView>
      </KeyboardAwareScrollView>
    </View>
  )
}

/**
 * The starting component on every screen in the app.
 *
 * @param props The screen props
 */
export const Screen = (props: ScreenProps) => {
  if (isNonScrolling(props.preset)) {
    return <ScreenWithoutScrolling {...props} />
  } else {
    return <ScreenWithScrolling {...props} />
  }
}
