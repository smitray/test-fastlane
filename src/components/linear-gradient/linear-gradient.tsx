import { Component } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import LinearGradientOriginal from 'react-native-linear-gradient'

interface LinearGradientProps {
  style?: StyleProp<ViewStyle>;
  color1: string | number;
  color2: string | number;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

export class LinearGradient extends Component<LinearGradientProps, null> {
  render() {
    const {
      style,
      color1,
      color2,
      start = { x: 0, y: 0 },
      end = { x: 1, y: 1 }
    } = this.props

    return (
      <LinearGradientOriginal
        colors={[color1, color2]}
        start={start}
        end={end}
        style={style}
      />
    )
  }
}
