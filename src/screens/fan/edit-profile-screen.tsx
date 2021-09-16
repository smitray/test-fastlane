import { translate } from '@i18n/translate'
import { NavigationProp } from '@react-navigation/native'
import { useFormik } from 'formik'
import { useCallback, useRef, useState, useMemo } from 'react'
import { Alert, RefreshControl, ActivityIndicator } from 'react-native'
import * as yup from 'yup'
import { Button, Box, TextField, Screen, Avatar, Text } from '@components/index'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { s, vs } from 'react-native-size-matters/extend'
import { useTheme } from '@hooks/theme'
import { RootParamList } from '@navigation/params'
import { typography } from '@styles/typography'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { useAuth } from '@hooks/useAuth'
import { getS3PresignedURL } from '@src/database/functions/users'
import { userUpdateProfile } from '@src/database/syncs/user'
import { uploadFile } from '@utils/s3'
import { show } from '@utils/toast'
import Routes from '@navigation/routes'

type EditProfileScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/EditProfile'>
}
const EditProfileScreen = ({ navigation }: EditProfileScreenProps) => {
  const theme = useTheme()
  const { user, userProfile } = useAuth()
  const actionSheetRef = useRef(null)
  const inputRefs = useRef({})
  const [userAvatar, setUserAvatar] = useState(null)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)
  const [isRefreshingUserData, setIsRefreshingUserData] = useState(false)

  const _onChangeAvatarPress = useCallback(() => {
    actionSheetRef.current?.show()
  }, [actionSheetRef])

  const onSubmit = useCallback(
    async (values) => {
      try {
        setIsRefreshingUserData(true)
        await userUpdateProfile({
          user,
          profile: values,
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
              name: Routes.FanNavigator,
              params: {
                screen: Routes.Fan.Talent,
              },
            },
          ],
        })
      } catch (error) {
        show({
          titleTx: 'failed_to_update_profile',
          message: error.message,
          type: 'error',
        })
        setIsRefreshingUserData(false)
      }
    },
    [navigation, user],
  )

  const { name = '', email = null, avatar = null } = userProfile || {}
  const { zipCode = null, socialHandle = null } = userProfile?.profile || {}

  const formik = useFormik({
    initialValues: {
      name,
      email,
      avatar,
      zipCode,
      socialHandle,
    },
    enableReinitialize: true,
    onSubmit,
    validationSchema: yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      avatar: yup.string().optional().nullable(),
      zipCode: yup.string().optional().nullable(),
      socialHandle: yup.string().optional().nullable(),
    }),
  })

  const _launchImagePicker = useCallback(
    (index) => {
      async function uploadImageToS3(file) {
        try {
          const fileExt = file.fileName.split('.').pop()
          const presignedUrl = await getS3PresignedURL({
            // TODO: This key path follow Vivek's request
            fileName: `fan_avatar/avatar_${user.id}_${Date.now()}.${fileExt}`,
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

    return null
  }, [formik.values.avatar, userAvatar])

  return (
    <Screen
      header={{
        headerTx: 'complete_your_profile',
        style: {
          paddingHorizontal: s(16),
        },
        leftButtonProps: userProfile?.name && {
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
              height={vs(36)}
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
                autoFocus
                inputRef={(ref) => {
                  inputRefs.current[0] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[2]?.focus()
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
              <Text
                tx="email"
                color="grey"
                variant="medium"
                marginBottom="vs-1.5"
                fontSize={typography.fontSize.small}
              />
              <TextField
                inputRef={(ref) => {
                  inputRefs.current[1] = ref
                }}
                blurOnSubmit={false}
                onSubmitEditing={() => {
                  inputRefs.current[2]?.focus()
                }}
                paddingVertical="vs-1"
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
                editable={false}
                value={formik.values.email}
                onChangeText={formik.handleChange('email')}
                errorMessage={formik.touched.email && (formik.errors?.email as string)}
              />
            </Box>
            <Box>
              <Text
                tx="zip_code"
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
                paddingVertical="vs-1"
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
                keyboardType="numeric"
                value={formik.values.zipCode}
                onChangeText={formik.handleChange('zipCode')}
                errorMessage={formik.touched.zipCode && (formik.errors?.zipCode as string)}
              />
            </Box>
            <Box>
              <Text
                tx="twitter_handle"
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
                onSubmitEditing={formik.handleSubmit}
                paddingVertical="vs-1"
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
                value={formik.values.socialHandle}
                onChangeText={formik.handleChange('socialHandle')}
                errorMessage={formik.touched.socialHandle && (formik.errors?.socialHandle as string)}
              />
            </Box>
          </Box>
          <Box marginTop="vs-8" alignItems="center">
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
