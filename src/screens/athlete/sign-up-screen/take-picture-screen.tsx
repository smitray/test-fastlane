import { Alert, TouchableOpacity } from 'react-native'
import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { RootParamList } from '@navigation/params'
import { NavigationProp } from '@react-navigation/native'
import * as yup from 'yup'
import { useFormik } from 'formik'
import FastImage from 'react-native-fast-image'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, Screen, Text, TextGradient, Avatar } from '@components/index'
import { typography } from '@styles/typography'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { translate } from '@i18n/translate'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { useAuth } from '@hooks/useAuth'
import { getS3PresignedURL, athleteUpdateAthteleProfileEachStep } from '@src/database/functions/users'
import { uploadFile } from '@utils/s3'
import { launchImageLibrary, launchCamera } from 'react-native-image-picker'
import { metrics } from '@styles/metrics'

type TakePictureScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/TakePicture'>
}
const AVATAR = require('@assets/images/blank_avatar.png')
const CHECK_BOX_ICON = require('@assets/images/checkBoxIcon.png')

const MIN_AVATAR_HEIGHT = 250
const MIN_AVATAR_WIDTH = 250
const MAX_AVATAR_SIZE = 5 * 1024 * 1024

const TakePictureScreen = ({ navigation }: TakePictureScreenProps) => {
  const { top } = useSafeAreaInsets()
  const actionSheetRef = useRef(null)
  const { user, userProfile } = useAuth()
  const [userAvatar, setUserAvatar] = useState(null)
  const [isUploadingAvatar, setUploadingAvatar] = useState(false)
  const [previousPicture, setPreviousPicture] = useState(null)
  const _onBackPress = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const _onChangeAvatarPress = useCallback(() => {
    actionSheetRef.current?.show()
  }, [actionSheetRef])

  const onSubmit = useCallback(
    async (values) => {
      try {
        const data = {
          email: user.customData.email,
          avatar: values.avatar
        }
        await athleteUpdateAthteleProfileEachStep({ user, data })
        navigation.reset({
          index: 1,
          routes: [{ name: Routes.AthleteNavigator }, { name: Routes.Athlete.SignUpCompleted }]
        })
      } catch (error) {
        Alert.alert('Failed to sign up', error.message)
      }
    },
    [athleteUpdateAthteleProfileEachStep, navigation],
  )

  const formik = useFormik({
    initialValues: {
      avatar: null,
      activeCheckBox: false
    },
    onSubmit,
    validationSchema: yup.object().shape({
      avatar: yup.string().required(),
      activeCheckBox: yup.bool().oneOf([true], 'please_check_the_box_above')
    }),
  })

  const toggleCheckBox = useCallback(() => {
    if (isUploadingAvatar || formik.isSubmitting) {
      return
    }
    formik.setFieldValue('activeCheckBox', !formik.values.activeCheckBox)
  }, [isUploadingAvatar, formik.isSubmitting, formik.values.activeCheckBox])

  const renderAvatar = useCallback(() => {
    if (userAvatar) {
 return (
      <Avatar source ={userAvatar} size={100}/>
    )
}

    if (formik.values.avatar) {
 return (
      <Avatar source ={{ uri: formik.values.avatar }} size={100}/>
    )
}

    return <Avatar source={AVATAR} size={84}/>
  }, [formik.values.avatar, userAvatar])

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
          formik.setFieldValue('avatar', remoteImageUrl)
          setUploadingAvatar(false)
          setPreviousPicture(file)
        } catch (err) {
          setUserAvatar(previousPicture)
          setUploadingAvatar(false)
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
            saveToPhotos: true,
            maxHeight: 1000,
            maxWidth: 1000,
          },
          (response) => {
            if (response.didCancel) {
              // console.log("User cancelled image picker")
            } else if (response.errorCode) {
              // Do something
            } else {
              const { fileSize, height, width } = response.assets[0]

              if (fileSize > MAX_AVATAR_SIZE) {
                Alert.alert('Max picture file size is 5 MB')
                // setUserAvatar(null)
                return
              }
              if (height < MIN_AVATAR_HEIGHT || width < MIN_AVATAR_WIDTH) {
                Alert.alert('Min picture size is 250 x 250')
                // setUserAvatar(null)
                return
              }
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

  return (
    <Screen backgroundColor="white">
      <Box flex={1} paddingHorizontal="s-6">
        <Box width={'100%'} flexDirection="row">
          <Box flex={1} right={s(12)} alignItems={'flex-start'}>
            <Button variant="clear" icon={{ name: 'chevron-left' }} onPress={_onBackPress} />
          </Box>

          <Box flex={1} alignItems="center" justifyContent="center">
            <Text tx="sign_up" fontSize={typography.fontSize.large} variant="bold" color="gray_2" />
          </Box>
          <Box flex={1} />
        </Box>

        <Box flexDirection="row" justifyContent="space-between" marginTop="vs-6" width="100%" alignItems="center">
          <Text tx="one_step_to_go" fontSize={typography.fontSize.largest} variant="bold" color="gray_2" />
          <Button
            ViewComponent={LinearGradient}
            linearGradientProps={{
              colors: ['#049C69', '#049C69', '#009EBE'],
              start: { x: 0, y: 0 },
              end: { x: 1, y: 1 },
            }}
            labelTx="button_take_picture"
            labelVariant="button"
          />
        </Box>
        <Box flex={1} paddingTop='vs-10'>
          <Box alignItems="center">
            <TouchableOpacity disabled={isUploadingAvatar || formik.isSubmitting} style={styles.avatarContainer} onPress={_onChangeAvatarPress}>
              {renderAvatar()}
            </TouchableOpacity>
            <Text
              paddingTop="vs-6"
              color="emperor"
              tx="photo_req"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
          </Box>
          <Box paddingTop="vs-12">
            <TextGradient
              variant="bold"
              tx="show_to_fans"
              gradient={{
                colors: palette.gradient.textV2,
              }}
              fontSize={typography.fontSize.largest}
              fontFamily={typography.fontFamily.primary.bold}
            />
            <Text
              variant="bold"
              paddingTop="vs-2.5"
              tx="must_be_actual_photo"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.bold}
            />
            <Box alignItems="center" flexDirection="row" paddingTop="vs-3.5">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="logos"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Box alignItems="center" flexDirection="row" paddingTop="vs-1">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="school_jersey"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Box alignItems="center" flexDirection="row" paddingTop="vs-1">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="team_jersey"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Box alignItems="center" flexDirection="row" paddingTop="vs-1">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="clip_art"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Box alignItems="center" flexDirection="row" paddingTop="vs-1">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="group_photos"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Box alignItems="center" flexDirection="row" paddingTop="vs-1">
              <Text
                paddingLeft="vs-1.5"
                color="emperor"
                tx="dots"
                fontSize={typography.fontSize.dot}
                fontFamily={typography.fontFamily.primary.light}
              />
              <Text
                tx="and_digitally_altered_images"
                color="emperor"
                paddingLeft="vs-2"
                fontSize={typography.fontSize.regular}
                fontFamily={typography.fontFamily.primary.regular}
              />
            </Box>
            <Text
              tx="are_not_allowed"
              color="emperor"
              paddingTop="vs-2.5"
              fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.regular}
            />
            <TouchableOpacity onPress={toggleCheckBox}>
              <Box
                flexDirection="row"
                alignItems="center"
                marginTop="vs-4"
                marginBottom="vs-3"
              >
                {!formik.values.activeCheckBox ? (
                  <Box borderColor='gray_4' width={vs(20)} height={vs(20)} style={styles.inactiveCheckBox} />
                ) : (
                  <LinearGradient
                    colors={palette.gradient.buttonV2}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.activeCheckBox}
                  >
                    <FastImage source={CHECK_BOX_ICON} style={styles.imageActiveCheckBox} />
                  </LinearGradient>
                )}
                <Text fontWeight='400' tx="i_understand" color="emperor" fontSize={typography.fontSize.small}
                  fontFamily={typography.fontFamily.primary.medium} />
              </Box>
            </TouchableOpacity>
            {formik.touched.activeCheckBox && formik.errors.activeCheckBox &&
              <Text fontWeight='400' tx={formik.errors?.activeCheckBox as string} color="red_2" fontSize={typography.fontSize.regular}
              fontFamily={typography.fontFamily.primary.medium} />
            }
          </Box>
        </Box>
      </Box>
      <Box position="absolute" left={0} bottom={0} right={0} alignItems="center" marginVertical="vs-7.5">
        <Button
          width={metrics.screenWidth * 0.88}
          height={vs(48)}
          borderRadius='s-6'
          disabled={formik.isSubmitting || isUploadingAvatar}
          loading={formik.isSubmitting || isUploadingAvatar}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.buttonV2,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx={!formik.values.avatar ? "take_a_picture" : "submit"}
          labelVariant="bold"
          labelProps={{
            color: 'white',
            fontSize: typography.fontSize.larger,
          }}
          onPress={!formik.values.avatar ? _onChangeAvatarPress : formik.handleSubmit}
        />
      </Box>
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

export default TakePictureScreen

const styles = ScaledSheet.create({
  inactiveCheckBox: {
    borderWidth: 1,
    marginRight: s(6),
    borderRadius: vs(5),
  },
  activeCheckBox: {
    width: vs(20),
    height: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(6),
    borderRadius: vs(5),
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: palette.gray_5,
    overflow: 'hidden',
  },
  imageActiveCheckBox: {
    width: vs(12),
    height: vs(10),
  },
})
