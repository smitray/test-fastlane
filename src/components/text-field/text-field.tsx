/* eslint-disable react-native/no-inline-styles */
import { Input, InputProps } from 'react-native-elements'
import { translate } from '@i18n/translate'
import { StyleSheet, ViewStyle } from 'react-native'
import {
  useRestyle,
  spacing,
  border,
  backgroundColor,
  SpacingProps,
  BorderProps,
  BackgroundColorProps,
  createVariant,
  VariantProps,
  typography as restyleTypography,
  color,
  layout,
  LayoutProps,
  TypographyProps,
  ColorProps,
} from '@shopify/restyle'
import { theme, Theme } from '@styles/theme'
import { TextProps } from '@components/text'
import { s } from 'react-native-size-matters/extend'
import { FC } from 'react'
import { flatten, mergeAll } from '@utils/lodash'

const inputRestyleFunctions = [layout, spacing, border, backgroundColor, createVariant({ themeKey: 'inputVariants' })]
const textRestyleFunctions = [spacing, restyleTypography, color, createVariant({ themeKey: 'textVariants' })]
export type TextFieldProps = InputProps &
  SpacingProps<Theme> &
  BorderProps<Theme> &
  LayoutProps<Theme> &
  ColorProps<Theme> &
  BackgroundColorProps<Theme> & {
    onPress?: () => void
  } & VariantProps<Theme, 'inputVariants'> & {
    labelTx?: string
    label?: string
    textTxOptions?: Pick<TextProps, 'txOptions'>
    variant?: keyof typeof theme.inputVariants
    textVariant?: keyof typeof theme.textVariants
    textProps?: TextProps & TypographyProps<Theme>
    children?: any
    placeholderTx?: string
    mask?: string
    noErrorMessage?: boolean
    inputRef?: any
  }

export const TextField: FC<TextFieldProps> = (props) => {
  const {
    placeholderTx,
    placeholder,
    textVariant = 'regular',
    inputStyle,
    variant = 'default',
    textProps,
    secureTextEntry,
    errorStyle,
    keyboardAppearance,
    borderRadius,
    borderColor,
    paddingHorizontal,
    noErrorMessage,
    marginTop,
    paddingVertical,
    inputRef,
    borderBottomColor,
    ...rest
  } = props
  const { style: inputRestyle } = useRestyle(inputRestyleFunctions, {
    variant,
    borderRadius,
    paddingHorizontal,
    borderColor,
    marginTop,
    paddingVertical,
    borderBottomColor,
    ...rest,
  }) as any
  const { style: textRestyle } = useRestyle(textRestyleFunctions, {
    variant: textVariant,
    ...textProps,
  }) as any
  const actualPlaceholder = placeholderTx ? translate(placeholderTx) : placeholder
  return (
    <Input
      ref={inputRef}
      keyboardAppearance={keyboardAppearance || 'dark'}
      inputContainerStyle={mergeAll(flatten([styles.inputContainer, inputRestyle]))}
      leftIconContainerStyle={styles.leftIconContainer}
      rightIconContainerStyle={styles.rightIconContainer}
      containerStyle={styles.containerStyle}
      inputStyle={mergeAll(flatten([styles.input, textRestyle, inputStyle]))}
      placeholder={actualPlaceholder}
      secureTextEntry={secureTextEntry}
      errorStyle={[styles.error, errorStyle, noErrorMessage && { height: 0 }]}
      {...rest}
    />
  )
}

type Style = {
  containerStyle: ViewStyle
  leftIconContainer: ViewStyle
  input: ViewStyle
  rightIconContainer: ViewStyle
  error: ViewStyle
  inputContainer: ViewStyle
}
const styles = StyleSheet.create<Style>({
  containerStyle: {
    paddingHorizontal: 0,
  },
  error: {
    marginLeft: 0,
  },
  input: {
    borderColor: 'transparent',
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  leftIconContainer: {},
  rightIconContainer: {
    marginRight: s(10),
    marginVertical: 0,
  },
})
