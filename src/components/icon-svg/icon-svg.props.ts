import { IconName } from '@components/icon-svg/icons'
import { IconProps } from 'react-native-elements'

export type IconSVGProps = IconProps & {
  name: IconName
  stroke?: string
  fill?: string
  width?: number
  height?: number
  opacity?: number
}
