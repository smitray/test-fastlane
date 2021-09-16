import MaskedView from '@react-native-masked-view/masked-view'
import { StyleSheet } from 'react-native'
import LinearGradient, { LinearGradientProps } from 'react-native-linear-gradient'
import { Text, TextProps } from '../text'
import { Icon } from 'react-native-elements'
type TextGradientProps = TextProps & { gradient: LinearGradientProps }
export const TextGradient = ({ gradient, ...rest }: TextGradientProps) => {
  return (
    <MaskedView maskElement={<Text {...rest} />}>
      <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} {...gradient} style={StyleSheet.absoluteFill} />
      <Text {...rest} style={styles.mask} />
    </MaskedView>
  )
}

const styles = StyleSheet.create({
  mask: {
    opacity: 0,
  },
})
