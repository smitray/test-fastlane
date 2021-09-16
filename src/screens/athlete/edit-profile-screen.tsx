import { translate } from '@i18n/translate'
import { NavigationProp, useRoute, RouteProp } from '@react-navigation/native'
import { useFormik } from 'formik'
import React, { useCallback, useRef, useState, useMemo } from 'react'
import { Alert, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native'
import * as yup from 'yup'
import { Button, Box, TextField, Screen, Avatar, Text, TextGradient } from '@components/index'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { s, vs } from 'react-native-size-matters/extend'
import { useTheme } from '@hooks/theme'
import { RootParamList } from '@navigation/params'
import { typography } from '@styles/typography'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { useAuth } from '@hooks/useAuth'
import { userUpdateProfile } from '@src/database/syncs/user'
import { getS3PresignedURL } from '@src/database/functions/users'
import { uploadFile } from '@utils/s3'
import { show } from '@utils/toast'
import Routes from '@navigation/routes'
import { isNumeric, toNumber } from '@utils/lodash'
import { getRealmApp } from '@src/database/get-app-realm'

const app = getRealmApp()

type EditProfileScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/EditProfile'>
  route: RouteProp<RootParamList, 'Athlete/EditProfile'>
}
const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const theme = useTheme()
  const { user, userProfile } = useAuth()
  const route = useRoute<RouteProp<RootParamList, 'Athlete/EditProfile'>>()
  const actionSheetRef = useRef(null)
  const inputRefs = useRef({})
  const [userAvatar, setUserAvatar] = useState(null)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)
  const [isRefreshingUserData, setIsRefreshingUserData] = useState(false)

  const checkUserLocal = app?.currentUser?.providerType === "local-userpass"
  const _onChangeAvatarPress = useCallback(() => {
    actionSheetRef.current?.show()
  }, [actionSheetRef])

  const onSubmit = useCallback(
    async (values) => {
      try {
        setIsRefreshingUserData(true)
        await userUpdateProfile({
          user,
          profile: {
            // ...values,
            name: values.name,
            bio: values.bio,
            avatar: values.avatar,
            callPrice: isNumeric(values.callPrice) ? toNumber(values.callPrice) : null,
            // charityDonationPercentage: isNumeric(values.charityDonationPercentage)
            //   ? toNumber(values.charityDonationPercentage)
            //   : null,
          },
        })
        show({
          titleTx: 'your_profile_is_updated',
          type: 'success',
        })
        setIsRefreshingUserData(false)
        navigation.reset({
          index: 0,
          routes: [
            {
              name: Routes.AthleteNavigator,
              params: {
                screen: Routes.Athlete.UpcomingCall,
              },
            },
          ],
        })
      } catch (error) {
        setIsRefreshingUserData(false)
        show({
          titleTx: 'failed_to_update_profile',
          message: error.message,
          type: 'error',
        })
      }
    },
    [user, navigation],
  )

  const { name = null, avatar = null } = userProfile || {}
  const {
    bio = null,
    callPrice = null,
    charityName = null,
    charityDonationPercentage = null,
    payoutRoutingNumber = null,
    payoutAccountNumber = null,
  } = userProfile?.profile || {}

  const formik = useFormik({
    initialValues: {
      name,
      bio,
      avatar,
      callPrice: callPrice ? callPrice.toString() : null,
      charityName,
      charityDonationPercentage: charityDonationPercentage ? charityDonationPercentage.toString() : null,
      payoutRoutingNumber,
      payoutAccountNumber,
      payoutVerifyAccountNumber: payoutAccountNumber,
    },
    enableReinitialize: true,
    onSubmit,
    validationSchema: yup.object().shape({
      name: yup.string().required(),
      bio: yup.string().optional().nullable(),
      avatar: yup.string().optional().nullable(),
      charityName: yup.string().optional().nullable(),
      callPrice: yup.number().min(1).max(9999).required(),
      charityDonationPercentage: yup.number().min(1).max(100).optional().nullable(),
      payoutRoutingNumber: yup.string().optional().nullable(),
      payoutAccountNumber: yup.string().optional().nullable(),
      payoutVerifyAccountNumber: yup
        .string()
        .oneOf([yup.ref('payoutAccountNumber')], translate('verify_account_number_must_match'))
        .optional()
        .nullable(),
    }),
  })

  const _launchImagePicker = useCallback(
    (index) => {
      async function uploadImageToS3(file) {
        try {
          const fileExt = file.fileName.split('.').pop()
          const presignedUrl = await getS3PresignedURL({
            // TODO: This key path follow Vivek's request
            fileName: `athlete_avatar/avatar_${user.id}_${Date.now()}.${fileExt}`,
            fileType: file.type,
            user,
          })
          await uploadFile(presignedUrl, file)
          const remoteImageUrl = presignedUrl?.split('?')?.[0]
          setUserAvatar({ uri: remoteImageUrl })
          formik.setFieldValue('avatar', remoteImageUrl)
          setUploadingAvatar(false)
        } catch (err) {
          setUploadingAvatar(false)
          setUserAvatar(formik.values.avatar ? { uri: formik.values.avatar } : null)
          Alert.alert('Cannot upload image to S3', err.message)
        }
      }

      let launchPicker
      switch (index) {
        case 0: {
          launchPicker = launchCamera
          break
        }
        case 1: {
          launchPicker = launchImageLibrary
          break
        }
      }
      if (index === 0 || index === 1) {
        launchPicker(
          {
            mediaType: 'photo',
            maxHeight: 300,
            maxWidth: 300,
            saveToPhotos: true,
          },
          (response) => {
            if (response.didCancel) {
              // console.log("User cancelled image picker")
            } else if (response.errorCode) {
              // Do something
            } else {
              setUploadingAvatar(true)
              const file = response.assets?.[0]
              setUserAvatar(file)
              uploadImageToS3(file)
            }
          },
        )
      }
    },
    [formik, user],
  )

  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const memoUserAvatar = useMemo(() => {
    if (userAvatar) return userAvatar

    if (formik.values.avatar) return { uri: formik.values.avatar }

    return require('@assets/images/user-avatar.png')
  }, [formik.values.avatar, userAvatar])

  const _onChangePasswordPress = useCallback(() => {
    navigation.navigate(Routes.Athlete.ChangePassword)
  }, [navigation])

  return (
    <Screen
      header={{
        headerTx: 'complete_your_profile',
        style: {
          paddingHorizontal: s(16),
        },
        leftButtonProps: {
          icon: { name: 'west' },
        },
        onLeftPress: _onBackPress,
      }}
      preset="scroll"
      keyboardAwareScrollViewProps={{
        refreshControl: <RefreshControl tintColor={theme.colors.text} refreshing={isRefreshingUserData} />,
      }}
    >
      {userProfile ? (
        <Box paddingHorizontal="s-4" marginBottom="vs-2">
          <Box alignItems="center">
            <Avatar source={memoUserAvatar} size={s(114)} />
            <Button
              width={s(90)}
              height={vs(32)}
              marginTop="vs-4"
              disabled={formik.isSubmitting || isUploadingAvatar}
              loading={isUploadingAvatar}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.background2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              labelTx="change"
              labelVariant="bold"
              labelProps={{ color: 'plantation' }}
              onPress={_onChangeAvatarPress}
            />
          </Box>
          {checkUserLocal && <Box marginTop="vs-10" alignItems="center">
            <TouchableOpacity onPress={_onChangePasswordPress} disabled={formik.isSubmitting || isUploadingAvatar}>
              <TextGradient
                variant="bold"
                tx="change_password"
                gradient={{
                  colors: palette.gradient.text,
                }}
              />
            </TouchableOpacity>
          </Box>}
          <Box marginTop="vs-10">
            <Box>
              <Text
                tx="name"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[1]?.focus()
                }}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="next"
                editable={!formik.isSubmitting}
                value={formik.values.name}
                onChangeText={formik.handleChange('name')}
                errorMessage={formik.touched.name && (formik.errors?.name as string)}
              />
            </Box>
            <Box>
              <Text tx="bio" color="grey" variant="medium" marginBottom="vs-1.5" fontSize={typography.fontSize.small} />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[1] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[2]?.focus()
                }}
                multiline
                paddingVertical="vs-1"
                height={vs(99)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="next"
                editable={!formik.isSubmitting}
                value={formik.values.bio}
                onChangeText={formik.handleChange('bio')}
                errorMessage={formik.touched.bio && (formik.errors?.bio as string)}
              />
            </Box>
            <Box>
              <Text
                tx="call_cost"
                txOptions={{ duration: 5 }}
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[2] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[3]?.focus()
                }}
                maxLength={4}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="next"
                keyboardType="numeric"
                editable={!formik.isSubmitting}
                value={formik.values.callPrice}
                onChangeText={formik.handleChange('callPrice')}
                errorMessage={formik.touched.callPrice && (formik.errors?.callPrice as string)}
              />
              <Text
                tx="you_get_revenue"
                txOptions={{ percent: 75 }}
                color="inputBorder"
                variant="medium"
                fontSize={typography.fontSize.small}
              />
              <Text
                tx="you_will_earn"
                txOptions={{ earnings: '$' + (formik.values.callPrice || 0) * 0.75 }}
                color="inputBorder"
                variant="medium"
                fontSize={typography.fontSize.small}
              />
            </Box>
            <Box marginTop="vs-7">
              <Text
                tx="charity_optional"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[3] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[4]?.focus()
                }}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                placeholderTx="enter_charity"
                textVariant="semiBold"
                returnKeyType="next"
                editable={false && !formik.isSubmitting}
                value={formik.values.charityName}
                onChangeText={formik.handleChange('charityName')}
                noErrorMessage
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[4] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[5]?.focus()
                }}
                marginTop="vs-1"
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                placeholderTx="donation_revenue"
                textVariant="semiBold"
                returnKeyType="next"
                keyboardType="numeric"
                editable={false && !formik.isSubmitting}
                value={formik.values.charityDonationPercentage}
                onChangeText={formik.handleChange('charityDonationPercentage')}
                noErrorMessage
              />
              <Text
                tx="we_will_donate"
                txOptions={{ percent: 1 }}
                color="inputBorder"
                variant="medium"
                fontSize={typography.fontSize.small}
              />
            </Box>
          </Box>
          <Box marginTop="vs-9">
            <Text
              tx="payout_details"
              textTransform="uppercase"
              color="grey"
              variant="medium"
              marginBottom="vs-1.5"
              fontSize={typography.fontSize.small}
            />
            <Box marginTop="vs-4">
              <Text
                tx="routing_number"
                textTransform="uppercase"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[5] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[6]?.focus()
                }}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="next"
                keyboardType="numeric"
                editable={false && !formik.isSubmitting}
                value={formik.values.payoutRoutingNumber}
                onChangeText={formik.handleChange('payoutRoutingNumber')}
                errorMessage={formik.touched.payoutRoutingNumber && (formik.errors?.payoutRoutingNumber as string)}
              />
            </Box>
            <Box>
              <Text
                tx="account_number"
                textTransform="uppercase"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[6] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[7]?.focus()
                }}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="next"
                keyboardType="numeric"
                editable={false && !formik.isSubmitting}
                value={formik.values.payoutAccountNumber}
                onChangeText={formik.handleChange('payoutAccountNumber')}
                errorMessage={formik.touched.payoutAccountNumber && (formik.errors?.payoutAccountNumber as string)}
              />
            </Box>
            <Box>
              <Text
                tx="verify_account_number"
                textTransform="uppercase"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[7] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={formik.handleSubmit}
                height={vs(40)}
                borderWidth={1}
                borderRadius="s-1"
                paddingHorizontal="s-3"
                borderColor="inputBorder"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.grey}
                textVariant="semiBold"
                returnKeyType="done"
                keyboardType="numeric"
                editable={false && !formik.isSubmitting}
                value={formik.values.payoutVerifyAccountNumber}
                onChangeText={formik.handleChange('payoutVerifyAccountNumber')}
                errorMessage={
                  formik.touched.payoutVerifyAccountNumber && (formik.errors?.payoutVerifyAccountNumber as string)
                }
              />
            </Box>
          </Box>
          <Box marginTop="vs-4" alignItems="center">
            <Button
              width={s(118)}
              height={vs(40)}
              disabled={formik.isSubmitting || isUploadingAvatar}
              loading={formik.isSubmitting}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.button,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              labelTx="submit"
              labelVariant="bold"
              labelProps={{ color: 'white' }}
              onPress={formik.handleSubmit}
            />
          </Box>
        </Box>
      ) : (
        <ActivityIndicator color={theme.colors.primary} />
      )}
      <ActionSheet
        ref={actionSheetRef}
        title={translate('select_a_photo')}
        options={[translate('take_photo'), translate('choose_from_library'), translate('cancel')]}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={_launchImagePicker}
      />
    </Screen>
  )
}

export default EditProfileScreen
