import { omitNil } from '@utils/lodash'
import { IconSVGProps } from './icon-svg.props'
import { icons } from './icons'

export function IconSvg(props: IconSVGProps) {
  const { name, size, height, width, ...rest } = props

  const IconSVG = icons[name]
  const objectProps = omitNil({
    size,
    height: height || size,
    width: width || size,
    ...rest,
  })
  return <IconSVG {...objectProps} />
}
