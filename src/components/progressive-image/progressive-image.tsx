import { useState } from 'react'
import { View, StyleSheet, Animated, ViewStyle } from 'react-native'
import FastImage, { FastImageProps, Source } from 'react-native-fast-image'

const AnimatedFastImage = Animated.createAnimatedComponent(FastImage)
export interface ProgressiveImageProps extends FastImageProps {
  thumbnailSource?: Source
  containerStyle?: ViewStyle | ViewStyle[]
}

export const ProgressiveImage = (props: ProgressiveImageProps) => {
  const { containerStyle, style, thumbnailSource, source, children, ...rest } = props
  const [thumbnailAnimated] = useState(new Animated.Value(0))
  const [imageAnimated] = useState(new Animated.Value(0))

  const handleThumbnailLoad = () => {
    Animated.timing(thumbnailAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  const onImageLoad = () => {
    Animated.timing(imageAnimated, {
      toValue: 1,
      useNativeDriver: true,
    }).start()
  }

  return (
    <View style={(styles.container, containerStyle)}>
      <Animated.Image
        {...rest}
        source={thumbnailSource as any}
        style={[style as any, styles.imageOverlay, { opacity: thumbnailAnimated }]}
        onLoad={handleThumbnailLoad}
        blurRadius={1}
      />
      <AnimatedFastImage
        {...rest}
        source={source}
        style={[styles.imageOverlay, { opacity: imageAnimated }, style]}
        onLoad={onImageLoad}
      />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    height: '100%',
    justifyContent: 'flex-end',
  },
  imageOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
})
