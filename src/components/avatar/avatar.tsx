import FastImage, {FastImageProps} from 'react-native-fast-image';

type AvatarProps = FastImageProps & {
  size: number,
  children?: any
}
export const Avatar = ({ source, size, style, children, ...rest }: AvatarProps) => {
  const commonStyle = { height: size, width: size, borderRadius: size / 2 }
  return <FastImage source={source || require('@assets/images/user-avatar.png')} style={[commonStyle, style]}
  {...rest}>
    {children}
  </FastImage>
}
