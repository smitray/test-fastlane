import { Alert, TouchableOpacity } from 'react-native'
import { useCallback, useRef } from 'react'
import { RootParamList } from '@navigation/params'
import { NavigationProp } from '@react-navigation/native'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, TextField, Screen, IconSvg, Text, TextGradient } from '@components/index'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { Icon } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import RNPickerSelect from 'react-native-picker-select'
import { usePublicSync } from '@hooks/usePublicSync'
import { translate } from '@i18n/translate'
import TextInputMask from 'react-native-text-input-mask'
import { useAuth } from '@hooks/useAuth'

type ApplyProCodeScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/ApplyProCode'>
}
const ApplyProCodeScreen = ({ navigation }: ApplyProCodeScreenProps) => {
  const theme = useTheme()
  const { sports, leagues } = usePublicSync()
  const { athleteApplyProCode } = useAuth()
  const { top } = useSafeAreaInsets()
  const inputRefs = useRef({})

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onHaveProcodePress = useCallback(() => {
    navigation.navigate(Routes.Athlete.EnterProcode)
  }, [navigation])

  const onSubmit = useCallback(
    async (values) => {
      try {
        const findLeagueOther = leagues.find((league) => league.name === 'Other')
        const idLeagueOther = findLeagueOther._id
        const phone = values.phone?.replace(/\D/g, '')
        await athleteApplyProCode({
          ...values,
          leagueId: idLeagueOther,
          phone: `1${phone}`,
        })
        navigation.navigate(Routes.Athlete.AccountPendingApproval)
      } catch (error) {
        Alert.alert('Failed to sign up', error.message)
      }
    },
    [athleteApplyProCode, navigation],
  )
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      socialMedia: '',
      socialHandle: '',
      phone: '',
      leagueId: '',
      sportId: '',
    },
    onSubmit,
    validationSchema: yup.object().shape({
      name: yup.string().required(translate('name_is_required')),
      socialMedia: yup.string().required(translate('social_media_is_required')),
      socialHandle: yup.string().required(translate('social_handle_is_required')),
      // leagueId: yup.string().required(translate('league_is_required')),
      sportId: yup.string().required(translate('sport_is_required')),
      email: yup.string().email(translate('email_must_be_valid')).required(translate('email_is_required')),
      phone: yup
        .string()
        .required(translate('phone_is_required'))
        .test(
          'is-valid-phone-number',
          translate('phone_number_must_be_valid'),
          (value) => value?.replace(/\D/gi, '').length === 10,
        ),
    }),
  })

  const pickerStyle = {
    inputAndroid: styles.inputAndroid as any,
    inputIOS: styles.inputIOS as any,
    iconContainer: styles.iconContainer as any,
  }
  return (
    <Screen preset="scroll">
      <Button
        variant="clear"
        icon={{ name: 'west' }}
        containerStyle={[
          styles.closeIcon,
          {
            top,
          },
        ]}
        onPress={_onBackPress}
      />
      <Box alignItems="center" paddingHorizontal="s-7" justifyContent="center">
        <IconSvg name="logo" height={vs(40)} width={s(128)} />
        <Text marginTop="vs-6" tx="apply_for_procode" fontSize={typography.fontSize.large} variant="bold" />
        <Box width="100%" marginTop="vs-10">
          <Box>
            <Box flexDirection="row">
              <Text tx="your_name" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <TextField
              autoFocus
              onSubmitEditing={() => {
                inputRefs.current[1]?.togglePicker()
              }}
              borderBottomColor="inputBorder"
              height={vs(60)}
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="type_your_name"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              editable={!formik.isSubmitting}
              value={formik.values.name}
              onChangeText={formik.handleChange('name')}
              errorMessage={formik.touched.name && (formik.errors?.name as string)}
            />
          </Box>
          <Box marginTop="vs-10">
            <Box flexDirection="row">
              <Text tx="social_media" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <RNPickerSelect
              ref={(ref) => {
                inputRefs.current[1] = ref
              }}
              disabled={formik.isSubmitting}
              placeholder={{ label: translate('select_platform'), value: '' }}
              onValueChange={formik.handleChange('socialMedia')}
              items={[
                { label: translate('twitter'), value: 'twitter' },
                { label: translate('facebook'), value: 'facebook' },
                { label: translate('instagram'), value: 'instagram' },
              ]}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="expand-more" size={24} color="gray" />}
              style={pickerStyle}
              onDonePress={() => {
                inputRefs.current[2]?.focus()
              }}
            />
            <Text
              marginTop="vs-1"
              color="red"
              variant="small"
              text={formik.touched.socialMedia && ((formik.errors?.socialMedia as string) || '')}
            />
            {formik.values.socialMedia.length > 0 && (
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[2] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[4]?.togglePicker()
                }}
                textProps={{
                  fontSize: typography.fontSize.large,
                  color: 'silver',
                  fontWeight: '300',
                }}
                borderBottomColor="inputBorder"
                height={vs(60)}
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_social_handle"
                textVariant="semiBold"
                returnKeyType="next"
                autoCapitalize="none"
                editable={!formik.isSubmitting}
                value={formik.values.socialHandle}
                onChangeText={formik.handleChange('socialHandle')}
                errorMessage={formik.touched.socialHandle && (formik.errors?.socialHandle as string)}
              />
            )}
          </Box>

          {/* <Box marginTop="vs-10">
            <Box flexDirection="row">
              <Text tx="league" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <RNPickerSelect
              ref={(ref) => {
                inputRefs.current[3] = ref
              }}
              disabled={formik.isSubmitting}
              placeholder={{ label: translate('select_league'), value: '' }}
              onValueChange={formik.handleChange('leagueId')}
              items={leagues.map((league) => ({
                label: league.name,
                value: league._id.toString(),
              }))}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="expand-more" size={24} color="gray" />}
              style={pickerStyle}
              onDonePress={() => {
                inputRefs.current[4]?.togglePicker()
              }}
            />
            <Text
              marginTop="vs-1"
              color="red"
              variant="small"
              text={formik.touched.leagueId && ((formik.errors?.leagueId as string) || '')}
            />
          </Box> */}

          <Box marginTop="vs-10">
            <Box flexDirection="row">
              <Text tx="sport" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <RNPickerSelect
              ref={(ref) => {
                inputRefs.current[4] = ref
              }}
              disabled={formik.isSubmitting}
              placeholder={{ label: translate('select_sport'), value: '' }}
              onValueChange={formik.handleChange('sportId')}
              items={sports.map((sport) => ({
                label: sport.name,
                value: sport._id.toString(),
              }))}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="expand-more" size={24} color="gray" />}
              style={pickerStyle}
              onDonePress={() => {
                inputRefs.current[5]?.focus()
              }}
            />
            <Text
              marginTop="vs-1"
              color="red"
              variant="small"
              text={formik.touched.sportId && ((formik.errors?.sportId as string) || '')}
            />
          </Box>

          <Box marginTop="vs-10">
            <Box flexDirection="row">
              <Text tx="email_address" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <TextField
              inputRef={(ref) => {
                inputRefs.current[5] = ref
              }}
              blurOnSubmit={false}
              onSubmitEditing={() => {
                inputRefs.current[6]?.focus()
              }}
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              borderBottomColor="inputBorder"
              height={vs(60)}
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="enter_your_email_address"
              autoCapitalize="none"
              textVariant="semiBold"
              keyboardType="email-address"
              returnKeyType="next"
              editable={!formik.isSubmitting}
              value={formik.values.email}
              onChangeText={formik.handleChange('email')}
              errorMessage={formik.touched.email && (formik.errors?.email as string)}
            />
          </Box>
          <Box marginTop="vs-10">
            <Box flexDirection="row">
              <Text tx="mobile_number" color="label" textTransform="uppercase" variant="semiBold" />
              <Icon name="star" size={s(6)} color={theme.colors.label} />
            </Box>
            <TextField
              inputRef={(ref) => {
                inputRefs.current[6] = ref
              }}
              blurOnSubmit={false}
              onSubmitEditing={formik.handleSubmit}
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              borderBottomColor="inputBorder"
              height={vs(60)}
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="enter_your_phone_number"
              autoCapitalize="none"
              textVariant="semiBold"
              key="phone"
              keyboardType="phone-pad"
              textContentType="telephoneNumber"
              autoCompleteType="tel"
              returnKeyType="done"
              editable={!formik.isSubmitting}
              value={formik.values.phone}
              onChangeText={formik.handleChange('phone')}
              errorMessage={formik.touched.phone && (formik.errors?.phone as string)}
              mask={'[000]-[000]-[0000]'}
              InputComponent={TextInputMask as any}
            />
          </Box>
        </Box>
        <Button
          width={s(118)}
          height={vs(40)}
          disabled={formik.isSubmitting}
          loading={formik.isSubmitting}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="submit"
          labelVariant="bold"
          marginTop="vs-6"
          marginBottom="vs-6"
          labelProps={{ color: 'white' }}
          onPress={formik.handleSubmit}
        />

        <TouchableOpacity onPress={_onHaveProcodePress}>
          <TextGradient
            variant="bold"
            tx="already_have_a_procode"
            gradient={{
              colors: palette.gradient.text,
            }}
          />
        </TouchableOpacity>
      </Box>
    </Screen>
  )
}

export default ApplyProCodeScreen

const styles = ScaledSheet.create({
  closeIcon: {
    position: 'absolute',
    left: '20@s',
    zIndex: 100,
  },
  iconContainer: {
    top: '18@vs',
  },
  inputAndroid: {
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
    color: 'black',
    fontSize: typography.fontSize.large,
    paddingRight: 30,
    height: '60@vs',
    fontWeight: '300',
  },
  inputIOS: {
    borderBottomWidth: 1,
    borderBottomColor: '#A9A9A9',
    color: 'black',
    fontSize: typography.fontSize.large,
    fontFamily: typography.fontFamily.primary.regular,
    height: '60@vs',
    fontWeight: '300',
  },
})
