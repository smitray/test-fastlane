import React from 'react'
import * as Animatable from 'react-native-animatable'

interface AnimatableFadeInProps {
    startOpacity?: number,
    endOpacity?: number,
    duration?: number,
    children: any,
}
const AnimatableFadeIn = (props: AnimatableFadeInProps) => {
    const { startOpacity = 0, endOpacity = 1, duration = 1000, children, ...restProps } = props
    const animation = {
        from: { opacity: startOpacity },
        to: { opacity: endOpacity }
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

export default AnimatableFadeIn
