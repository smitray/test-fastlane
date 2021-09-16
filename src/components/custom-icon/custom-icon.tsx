import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import {Icon, IconProps} from 'react-native-elements';
import LinearGradient, { LinearGradientProps } from 'react-native-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'

export enum IconTypes {
  AntDesign = 'antd',
  FontAwesome5 = 'fa5',
}
export interface fontAwesome5StyleProps {
  solid?: boolean
}

export interface ICustomIcon extends IconProps{
  gradient?: LinearGradientProps
}

type CustomIconProps = IconProps & ICustomIcon
const SIZE = 8

export const CustomIcon = ({
  gradient,
  size = SIZE,
  ...restProps
}: CustomIconProps) => {
  
  return (
    <View style={styles.viewContainer(size)}>
      {gradient ? (
        <MaskedView
          style={styles.maskedView(size)}
          maskElement={<View style={styles.iconWrapper}>{<Icon size={size} {...restProps}/>}</View>}
        >
          <LinearGradient start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} {...gradient} style={StyleSheet.absoluteFill} />
        </MaskedView>
      ) : (
        <Icon size={size} { ...restProps}/>
      )}
    </View>
  )
}
type Styles = {
  iconWrapper: ViewStyle
  maskedView: (size: number) => ViewStyle
  viewContainer: (size: number) => ViewStyle
}
const styles: Styles = {
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    justifyContent: 'center',
  },
  maskedView: (size: number) => ({
    flex: 1,
    flexDirection: 'row',
    height: size,
    width: size,
  }),
  viewContainer: (size: number) => ({
    width: size,
    height: size,
  }),
}
