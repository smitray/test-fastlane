import React from 'react'
import * as Animatable from 'react-native-animatable'

interface AnimatableMoveZoomProps {
  fromY: number
  toY: number
  startScale?: number
  endScale?: number
  duration?: number
  children?: any
}
const AnimatableMoveAndZoom = (props: AnimatableMoveZoomProps) => {
  const { fromY, toY, startScale = 1, endScale = 0.5, duration = 1000, children, ...restProps } = props
  const animation = {
    from: {
      scale: startScale,
      translateY: fromY,
    },
    to: {
      scale: endScale,
      translateY: toY,
    },
  }
  return <Animatable.View animation={animation} duration={duration} useNativeDriver {...restProps} >
  {children}
  </Animatable.View>
}

export default AnimatableMoveAndZoom
