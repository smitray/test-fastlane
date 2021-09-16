import React from 'react'
import * as Animatable from 'react-native-animatable'
interface AnimatableSlideInProps {
    fromX: number,
    toX: number,
    duration?: number,
    children?: any
}
const AnimatableSlideIn = (props: AnimatableSlideInProps) => {
    const { fromX, toX, duration = 1000, children, ...restProps } = props
    const animation = {
        from: { translateX: fromX },
        to: { translateX: toX }
    }
    return (
        <Animatable.View
            animation={animation}
            duration={duration}
            useNativeDriver
            {...restProps}
        >
            {children}
        </Animatable.View>
    )
}

export default AnimatableSlideIn
