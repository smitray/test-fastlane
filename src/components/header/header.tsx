import { StyleSheet, ViewStyle } from 'react-native'
import { Header as ReactNativeElementsHeader } from 'react-native-elements'
import { metrics } from '@styles/index'
import { Button } from '@components/button'
import { Box } from '@components/common'
import { Text } from '@components/text'
import { HeaderProps } from './header.props'
import { typography } from '../../styles/typography'

/**
 * Header that appears on many screens. Will hold navigation buttons and screen title.
 */
export const Header = (props: HeaderProps) => {
  const { onLeftPress, onRightPress, headerTx, headerTextProps, style, leftButtonProps, rightButtonProps, ...rest } =
    props

  const containerStyle = StyleSheet.flatten([styles.container, style])
  return (
    <Box>
      <ReactNativeElementsHeader
        leftComponent={
          leftButtonProps && (
            <Button
              alignItems="center"
              margin="none"
              padding="none"
              variant="clear"
              onPress={onLeftPress}
              {...leftButtonProps}
            />
          )
        }
        centerComponent={
          headerTx && (
            <Box justifyContent="center">
              <Text
                numberOfLines={1}
                tx={headerTx}
                variant="bold"
                fontSize={typography.fontSize.large}
                color="black"
                {...headerTextProps}
              />
            </Box>
          )
        }
        rightComponent={
          rightButtonProps && (
            <Button
              alignItems="center"
              margin="none"
              padding="none"
              variant="clear"
              onPress={onRightPress}
              {...rightButtonProps}
            />
          )
        }
        leftContainerStyle={styles.leftContainer}
        rightContainerStyle={styles.rightContainer}
        containerStyle={containerStyle}
        {...rest}
      />
    </Box>
  )
}

type HeaderStyle = {
  container: ViewStyle
  rightContainer: ViewStyle
  leftContainer: ViewStyle
}
const styles = StyleSheet.create<HeaderStyle>({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    height: metrics.headerHeight,
  },
  leftContainer: {
    justifyContent: 'center',
  },
  rightContainer: {
    justifyContent: 'center',
  },
})
