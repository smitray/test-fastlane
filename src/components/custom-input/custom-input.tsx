/* eslint-disable react-native/no-inline-styles */
import { Input, InputProps } from 'react-native-elements'
import { translate } from '@i18n/translate'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
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
import { TextProps, Text } from '@components/text'
import { vs } from 'react-native-size-matters/extend'
import { FC, useCallback, useMemo, useRef, useState } from 'react'
import { flatten, mergeAll } from '@utils/lodash'
import Icon from 'react-native-vector-icons/FontAwesome5'
import LinearGradient, { LinearGradientProps } from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Box } from '@components/index'

const inputRestyleFunctions = [layout, spacing, border, backgroundColor, createVariant({ themeKey: 'inputVariants' })]
const textRestyleFunctions = [spacing, restyleTypography, color, createVariant({ themeKey: 'textVariants' })]
type TextFieldProps = InputProps &
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
    touched?: boolean
    isDropDown?: boolean
    customContainerStyle?: any
    gradient?: any
    customErrorStyle?: any
  }

export const CustomInput: FC<TextFieldProps> = (props) => {
  const {
    placeholderTx,
    placeholder,
    textVariant = 'regular',
    inputStyle,
    variant = 'default',
    textProps,
    secureTextEntry,
    errorStyle,
    customErrorStyle,
    keyboardAppearance,
    borderRadius,
    borderColor,
    paddingHorizontal,
    noErrorMessage,
    marginTop,
    paddingVertical,
    inputRef,
    borderBottomColor,
    height,
    width,
    isDropDown,
    value,
    customContainerStyle,
    gradient,
    errorMessage,
    renderErrorMessage = true,
    ...rest
  } = props
  const { style: inputRestyle } = useRestyle(inputRestyleFunctions, {
    variant,
    borderRadius,
    paddingHorizontal,
    borderColor,
    marginTop,
    height,
    paddingVertical,
    borderBottomColor,
    ...rest,
  }) as any
  const { style: textRestyle } = useRestyle(textRestyleFunctions, {
    variant: textVariant,
    ...textProps,
  }) as any
  const actualPlaceholder = placeholderTx ? translate(placeholderTx) : placeholder

  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const renderPasswordTrailing: any = () => {
    return (
      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
        <Box style={styles.rightIconContainer}>
        {showPassword ? (
          <Icon color={theme.colors.grey} size={vs(20)} solid name="eye" />
        ) : (
          <Icon color={theme.colors.grey} size={vs(20)} solid name="eye-slash" />
        )}
        </Box>
      </TouchableOpacity>
    )
  }
  const handleFocus = useCallback(() => {
    setIsFocused(true)
    props?.onFocus && props?.onFocus()
  }, [props.onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    props?.onBlur && props?.onBlur()
  }, [props?.onBlur])

  const inputContainerStyle = useMemo(
    () =>
      mergeAll(
        flatten([
          inputRestyle,
          styles.inputContainer,
          { backgroundColor: (isFocused || props.value) && !isDropDown ? palette.white : palette.gray_3 },
        ]),
      ),
    [inputRestyle, isFocused, props.value, palette, isDropDown],
  )

  const inputBorderStyle = useMemo(
    () => mergeAll(flatten([inputRestyle, { paddingHorizontal: 0, height: +height + 2, ...!!width && { width: +width + 2 } }])),
    [height],
  )

  const getBorderColor = useMemo(() => {
    if (errorMessage) {
      return palette.gradient.red
    }
    if (isFocused) {
      return palette.gradient.gray
    }
    if (value) {
      return gradient?.colors || palette.gradient.text
    }
    return palette.gradient.transparent
  }, [value, errorMessage, isFocused, gradient])

  return (
    <View>
      <LinearGradient colors={getBorderColor} style={inputBorderStyle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <Input
          ref={inputRef}
          keyboardAppearance={keyboardAppearance || 'dark'}
          inputContainerStyle={mergeAll(flatten([inputContainerStyle, customContainerStyle]))}
          leftIconContainerStyle={styles.leftIconContainer}
          rightIconContainerStyle={styles.rightIconContainer}
          containerStyle={styles.containerStyle}
          rightIcon={secureTextEntry ? renderPasswordTrailing : props.rightIcon}
          inputStyle={mergeAll(flatten([styles.input, textRestyle, inputStyle]))}
          placeholder={isFocused ? null : actualPlaceholder}
          placeholderTextColor={props.placeholderTextColor ? props.placeholderTextColor : theme.colors.silverLight}
          secureTextEntry={secureTextEntry && !showPassword}
          onFocus={handleFocus}
          onBlur={handleBlur}
          selectionColor="#4F4F4F"
          errorStyle={[styles.error, errorStyle, noErrorMessage && { height: 0 }]}
          value={props.value}
          {...rest}
        />
      </LinearGradient>
      {errorMessage && renderErrorMessage &&
        <Box style={[styles.customError, customErrorStyle]}>
          <Text marginTop="vs-1" color="red_2" variant="small" text={props.errorMessage} />
        </Box>}
    </View>
  )
}

type Style = {
  containerStyle: ViewStyle
  leftIconContainer: ViewStyle
  input: ViewStyle
  rightIconContainer: ViewStyle
  error: ViewStyle
  inputContainer: ViewStyle
  customError: ViewStyle
}
const styles = StyleSheet.create<Style>({
  containerStyle: {
    paddingHorizontal: 0,
  },
  customError: {
    marginBottom: 0,
  },
  error: {
    marginLeft: 0,
  },
  input: {
    borderColor: 'transparent',
  },
  inputContainer: {
    margin: 1,
  },
  leftIconContainer: {},
  rightIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: vs(25),
  },
})
