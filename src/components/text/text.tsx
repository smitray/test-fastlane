import { translate } from '@i18n/translate'
import { createText } from '@shopify/restyle'
import { Theme } from '@styles/theme'
import { ComponentProps } from 'react'

const RText = createText<Theme>()

export type TextProps = ComponentProps<typeof RText> & {
  /**
   * Text which is looked up via i18n.
   */
  tx?: string

  /**
   * Optional options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  txOptions?: any

  /**
   * The text to display if not using `tx` or nested components.
   */
  text?: string | number
}

export const Text = (props: TextProps) => {
  const { tx, txOptions, text, children, variant = 'regular', ...rest } = props
  const i18nText = tx && translate(tx, txOptions)
  const content = i18nText || String(text || '') || children

  return (
    <RText variant={variant} {...rest}>
      {content}
      {props.children}
    </RText>
  )
}
