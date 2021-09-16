import { s, vs } from 'react-native-size-matters/extend'
import { Box, Screen, Text } from '@components/index'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { typography } from '@styles/typography'
import MaskedView from '@react-native-masked-view/masked-view'
import { Icon } from 'react-native-elements'

const ThankYouSignUpScreen = () => {
  return (
    <Screen>
      <Box alignItems="center" marginTop="vs-10">
        <Text tx="thank_you" variant="bold" fontSize={typography.fontSize.large} />
        <MaskedView
          style={{ height: vs(47), width: s(56), marginTop: vs(100), marginBottom: vs(62) }}
          maskElement={<Icon name="check" size={vs(56)} color="white" />}
        >
          <LinearGradient
            colors={palette.gradient.button}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            // eslint-disable-next-line react-native/no-inline-styles
            style={{ flex: 1 }}
          />
        </MaskedView>
        <Text tx="thank_you_please_check_your_email" variant="bold" fontSize={typography.fontSize.large} />
      </Box>
    </Screen>
  )
}

export default ThankYouSignUpScreen
