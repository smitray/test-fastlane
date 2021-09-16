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
  typography,
  color,
  layout,
  LayoutProps,
  TypographyProps,
} from '@shopify/restyle'
import { Theme, theme } from '@styles/theme'
import { Button as ButtonElement, ButtonProps as RNEButtonProps } from 'react-native-elements'
import { translate } from '@i18n/translate'
import { TextProps } from '@components/text'
import { TouchableOpacity } from 'react-native'
import { flatten, mergeAll } from '@utils/lodash'
import { s } from 'react-native-size-matters/extend'

const buttonRestyleFunctions = [layout, spacing, border, backgroundColor, createVariant({ themeKey: 'buttonVariants' })]
const textRestyleFunctions = [spacing, typography, color, createVariant({ themeKey: 'textVariants' })]
export type ButtonProps = RNEButtonProps &
  SpacingProps<Theme> &
  BorderProps<Theme> &
  LayoutProps<Theme> &
  BackgroundColorProps<Theme> & {
    onPress?: () => void
  } & VariantProps<Theme, 'buttonVariants'> & {
    labelTx?: string
    label?: string
    labelTxOptions?: Record<string, unknown>
    labelVariant?: keyof typeof theme.textVariants
    labelProps?: TextProps & TypographyProps<Theme>
    children?: any
    rounded?: boolean
  }

export const Button = ({
  labelTx,
  label,
  labelTxOptions,
  labelVariant = 'regular',
  labelProps,
  titleStyle,
  onPress,
  buttonStyle,
  containerStyle,
  children,
  rounded,
  variant = 'solid',
  ...rest
}: ButtonProps) => {
  const { style: buttonRestyle } = useRestyle(buttonRestyleFunctions, { variant, ...rest }) as any
  const { style: titleRestyle } = useRestyle(textRestyleFunctions, {
    variant: labelVariant,
    ...labelProps,
  }) as any
  const i18nText = labelTx && translate(labelTx, labelTxOptions)
  const buttonTitle = i18nText || label

  if (children) {
    return (
      <TouchableOpacity {...rest} style={[buttonRestyle, containerStyle]} onPress={onPress}>
        {children}
      </TouchableOpacity>
    )
  }

  return (
    <ButtonElement
      {...rest}
      containerStyle={containerStyle}
      buttonStyle={[buttonRestyle, rounded && { borderRadius: s(18) }, buttonStyle]}
      title={buttonTitle}
      titleStyle={mergeAll(flatten([titleRestyle, titleStyle]))}
      onPress={onPress}
      TouchableComponent={TouchableOpacity}
    >
      {children}
    </ButtonElement>
  )
}
