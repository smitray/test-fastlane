import { Image, TouchableOpacity, View } from 'react-native'
import { ScaledSheet, vs } from 'react-native-size-matters/extend'
import { Screen, Text, Box, Button, TextGradient } from '@components/index'
import { typography } from '@styles/typography'
import { useCallback } from 'react'
import { NavigationProp } from '@react-navigation/native'
import { RootParamList } from '@navigation/params/index'
import Routes from '@navigation/routes'
import { palette } from '../../styles/palette'

type QuickAccessScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/QuickAccess'>
}
const QuickAccessScreen = ({ navigation }: QuickAccessScreenProps) => {
  const _onLoginPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.SignIn)
  }, [navigation])

  const _onEnterProCodePress = useCallback(() => {
    navigation.navigate(Routes.Athlete.EnterProcode)
  }, [navigation])

  const _onSignUpPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.ApplyProCode)
  }, [navigation])

  return (
    <Screen style={styles.container as any}>
      <Image source={require('@assets/images/bootsplash_logo.png')} style={styles.logo} />
      <Text
        textAlign="left"
        tx="talent"
        textTransform="uppercase"
        fontSize={typography.fontSize.huge}
        color="black"
        variant="bold"
        marginTop="vs-4"
      />
      <Button
        height={vs(48)}
        borderWidth={1}
        marginTop="vh"
        paddingHorizontal="xsl"
        variant="outline"
        labelTx="register_as_a_talent"
        labelVariant="bold"
        labelProps={{
          textTransform: 'uppercase',
          color: 'black',
        }}
        onPress={_onSignUpPress}
      />
      <Box style={{ marginTop: vs(85) }}>
        <Box alignItems="center">
          <Text
            textAlign="right"
            tx="have_account"
            textTransform="uppercase"
            color="grey"
            variant="medium"
            marginBottom="vs-4"
            fontSize={typography.fontSize.small}
          />

          <TouchableOpacity onPress={_onLoginPress}>
            <TextGradient
              variant="bold"
              tx="login"
              gradient={{
                colors: palette.gradient.text,
              }}
              fontSize={typography.fontSize.medium}
              textTransform="uppercase"
            />
          </TouchableOpacity>
        </Box>
        <Box alignItems="center" style={{ marginTop: vs(44) }}>
          <Text
            textAlign="right"
            tx="have_account"
            textTransform="uppercase"
            color="grey"
            variant="medium"
            marginBottom="vs-4"
            fontSize={typography.fontSize.small}
          />

          <TouchableOpacity onPress={_onEnterProCodePress}>
            <TextGradient
              variant="bold"
              tx="enter_procode"
              gradient={{
                colors: palette.gradient.text,
              }}
              fontSize={typography.fontSize.medium}
              textTransform="uppercase"
            />
          </TouchableOpacity>
        </Box>
      </Box>

      <View style={styles.imgContainer}>
        <Image source={require('@assets/images/access-screen.png')} style={styles.image} />
      </View>
    </Screen>
  )
}

export default QuickAccessScreen

const styles = ScaledSheet.create({
  imgContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  image: {
    height: '319@vs',
    width: '100%',
    resizeMode: 'contain',
  },
  container: {
    alignItems: 'center',
    flex: 1,
    paddingBottom: 0,
  },
  logo: {
    height: '40@vs',
    resizeMode: 'contain',
    width: '128@s',
  },
})
