import { Alert, Image, Insets, KeyboardAvoidingView, ScrollView } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useCallback, useRef, useState } from 'react'
import { RootParamList } from '@navigation/params'
import { NavigationProp } from '@react-navigation/native'
import * as yup from 'yup'
import { useFormik } from 'formik'
import Routes from '@navigation/routes'
import { s, vs, ScaledSheet } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'
import { Button, Box, Screen, Text, CustomInput } from '@components/index'
import { useTheme } from '@hooks/theme'
import { typography } from '@styles/typography'
import { usePublicSync } from '@hooks/usePublicSync'
import { translate } from '@i18n/translate'
import { useAuth } from '@hooks/useAuth'
import Modal from "react-native-modal"
import { BlurView } from "@react-native-community/blur"
import { ObjectId } from 'bson'
import { addNewSport, addNewSchoolTeam, addNewProfessionalTeam, athleteUpdateAthteleProfileEachStep } from '@src/database/functions/users'
import { metrics } from '@styles/index'

const CHECK_BOX_ICON = require('@assets/images/checkBoxIcon.png')
const DROP_DOWN_ICON = require('@assets/images/dropDownIcon.png')
const DROP_DOWN_ACTIVE_ICON = require('@assets/images/dropDownActiveIcon.png')

type PersonalInformationScreenProps = {
  navigation: NavigationProp<RootParamList, 'Athlete/PersonalInformation'>
}
const PersonalInformationScreen = ({ navigation }: PersonalInformationScreenProps) => {
  const theme = useTheme()
  const { sports, professionalTeams, schoolTeams } = usePublicSync()
  const { user, signOut } = useAuth()
  const [isSignOut, setSignOut] = useState(false)
  const inputRefs = useRef({})
  const scrollViewRef = useRef({})
  // Sports
  const [isModalVisible, setModalVisible] = useState(false)
  const [isChooseIndexSport, selectedIndexSport] = useState(-1)
  const [otherValueSport, setOtherValueSport] = useState(false)

  // School Team
  const [isModalSchoolTeamVisible, setModalSchoolTeamVisible] = useState(false)
  const [isChooseIndexSchoolTeam, selectedIndexSchoolTeam] = useState(-1)
  const [otherValueSchoolTeam, setOtherValueSchoolTeam] = useState(false)

  // Professional Team
  const [isModalProfessionalTeamVisible, setModalProfessionalTeamVisible] = useState(false)
  const [isChooseIndexProfessionalTeam, selectedIndexProfessionalTeam] = useState(-1)
  const [otherValueProfessionalTeam, setOtherValueProfessionalTeam] = useState(false)

  const [activeCheckBox, setActiveCheckBox] = useState(false)

  const _onBackPress = useCallback(async () => {
    try {
      setSignOut(true)
      await signOut()
    } catch (err) {
    } finally {
      setSignOut(false)
      navigation.goBack()
    }
  }, [navigation, signOut])

  // toggle modal sports
  const toggleModal = () => {
    if (disableMode) { return }
    setModalVisible(!isModalVisible)
  }

  const hideModal = () => {
    setModalVisible(false)
  }

  // toggle modal sports
  const toggleModalSchoolTeam = () => {
    if (disableMode) { return }
    setModalSchoolTeamVisible(!isModalSchoolTeamVisible)
  }

  const hideModalSchool = () => {
    setModalSchoolTeamVisible(false)
  }

  // toggle modal sports
  const toggleModalProfessionalTeam = () => {
    if (disableMode) { return }
    setModalProfessionalTeamVisible(!isModalProfessionalTeamVisible)
  }

  const hideModalProfessional = () => {
    setModalProfessionalTeamVisible(false)
  }

  // CHOSE SPORT FROM MODAL
  const chooseSport = (index: number, sportValue: any) => {
      if (sportValue.name === 'other') {
        selectedIndexSport(index)
        setOtherValueSport(true)
        formik.setFieldValue('sportId', sportValue._id)
        setTimeout(() => {
          inputRefs.current[5]?.focus()
          scrollViewRef.current[0]?.scrollToEnd({ animated: true })
        }, 500)
      } else {
        selectedIndexSport(index)
        setOtherValueSport(false)
        setModalVisible(false)
        formik.setFieldValue('sportName', sports[index].name)
        formik.setFieldValue('sportId', sports[index]._id)
        formikOtherSport.setFieldValue('otherSport', '')
        setTimeout(() => {
          inputRefs.current[2]?.focus()
        }, 500)
      }
  }
  // CHOSE SCHOOL TEAM FROM MODAL
  const chooseSchoolTeam = (index: number, schoolTeamValue: any) => {
    if (schoolTeamValue.name === 'other') {
      selectedIndexSchoolTeam(index)
      setOtherValueSchoolTeam(true)
      formik.setFieldValue('schoolId', schoolTeamValue._id)
      setTimeout(() => {
        inputRefs.current[6]?.focus()
        scrollViewRef.current[1]?.scrollToEnd({ animated: true })
      }, 500)
    } else {
      selectedIndexSchoolTeam(index)
      setOtherValueSchoolTeam(false)
      setModalSchoolTeamVisible(false)
      formik.setFieldValue('schoolTeamName', schoolTeams[index].name)
      formik.setFieldValue('schoolId', schoolTeams[index]._id)
      formikOtherSchoolTeam.setFieldValue('otherSchoolTeam', '')
      // setTimeout(() => {
      //   inputRefs.current[2]?.focus()
      // }, 500)
    }
  }
  // CHOSE PROFESSIONAL TEAM FROM MODAL
  const chooseProfessionalTeam = (index: number, professionalTeamValue: any) => {
    if (professionalTeamValue.name === 'other') {
      selectedIndexProfessionalTeam(index)
      setOtherValueProfessionalTeam(true)
      formik.setFieldValue('professionalId', professionalTeamValue._id)
      setTimeout(() => {
        inputRefs.current[7]?.focus()
        scrollViewRef.current[2]?.scrollToEnd({ animated: true })
      }, 500)
    } else {
      selectedIndexProfessionalTeam(index)
      setOtherValueProfessionalTeam(false)
      setModalProfessionalTeamVisible(false)
      formik.setFieldValue('professionalTeamName', professionalTeams[index].name)
      formik.setFieldValue('professionalId', professionalTeams[index]._id)
      formikOtherProfessionalTeam.setFieldValue('otherProfessionalTeam', '')
      // setTimeout(() => {
      //   inputRefs.current[2]?.focus()
      // }, 500)
    }
  }

  const toggleCheckBox = () => {
    if (disableMode) { return }
    setActiveCheckBox(!activeCheckBox)
    formik.setFieldValue('isActiveCollegeAthlete', !activeCheckBox)
  }
  // SUBMIT ADD NEW OTHER SPORT
  const submitOtherSport = async () => {
      try {
        const otherSport = formikOtherSport.values.otherSport
        const dataSport = await addNewSport({ user, name: otherSport })
        setModalVisible(false)
        formik.setFieldValue('sportName', otherSport)
        formik.setFieldValue('sportId', dataSport.id)
        setOtherValueSport(false)
        formikOtherSport.setFieldValue('otherSport', '')
        setTimeout(() => {
          inputRefs.current[2]?.focus()
        }, 500)
      } catch (error) {
        Alert.alert(translate('failed_to_add_new_sport'), error.message)
      }
    }

  // SUBMIT ADD NEW OTHER SCHOOL TEAM
  const submitOtherSchoolTeam = async () => {
    try {
      const otherSchoolTeam = formikOtherSchoolTeam.values.otherSchoolTeam
      // console.log('NAME SPORTTTTTTT=====', otherSport)
      const dataSchoolTeam = await addNewSchoolTeam({ user, name: otherSchoolTeam })
      setModalSchoolTeamVisible(false)
      formik.setFieldValue('schoolTeamName', otherSchoolTeam)
      formik.setFieldValue('schoolId', dataSchoolTeam.id)
      setOtherValueSchoolTeam(false)
      formikOtherSchoolTeam.setFieldValue('otherSchoolTeam', '')
    } catch (error) {
      Alert.alert(translate('failed_to_add_new_school_team'), error.message)
    }
  }

  // SUBMIT ADD NEW OTHER PROFESSIONAL TEAM
  const submitOtherProfessionalTeam = async () => {
    try {
      const otherProfessionalTeam = formikOtherProfessionalTeam.values.otherProfessionalTeam
      const dataProfessionalTeam = await addNewProfessionalTeam({ user, name: otherProfessionalTeam })
      setModalProfessionalTeamVisible(false)
      formik.setFieldValue('professionalTeamName', otherProfessionalTeam)
      formik.setFieldValue('professionalId', dataProfessionalTeam.id)
      setOtherValueProfessionalTeam(false)
      formikOtherProfessionalTeam.setFieldValue('otherProfessionalTeam', '')
    } catch (error) {
      Alert.alert(translate('failed_to_add_new_professional_team'), error.message)
    }
  }

  const onSubmit = useCallback(
    async (values) => {
      try {
        const { name, ...others } = values
        const data = {
          email: user.customData.email,
          name: values?.name,
          profile: others
        }
        await athleteUpdateAthteleProfileEachStep({ user, data })
        navigation.navigate(Routes.Athlete.SocialMedia)
      } catch (error) {
        Alert.alert('Failed to sign up', error.message)
      }
    },
    [athleteUpdateAthteleProfileEachStep, navigation],
  )
  const renderDropDownSportName = () => {
    return (
      <Image source={formik.values.sportName ? DROP_DOWN_ACTIVE_ICON : DROP_DOWN_ICON} />
    )
  }

  const renderDropDownSchoolTeamName = () => {
    return (
      <Image source={formik.values.schoolTeamName ? DROP_DOWN_ACTIVE_ICON : DROP_DOWN_ICON} />
    )
  }

  const renderDropDownProfessionalTeamName = () => {
    return (
      <Image source={formik.values.professionalTeamName ? DROP_DOWN_ACTIVE_ICON : DROP_DOWN_ICON} />
    )
  }

  const checkValidate = () => {
    return yup.object().shape({
      name: yup.string().required(translate('name_is_required')),
      bio: yup.string().max(148, translate('bio_length_error'))
    })
  }
  // CHECK VALIDATE OTHER SPORT
  const checkValidateOtherSport = () => {
    return yup.object().shape({
      otherSport: sports.length === isChooseIndexSport ? yup.string().trim().required(translate('sport_is_required')) : undefined
    })
  }

  // CHECK VALIDATE OTHER SCHOOL TEAM
  const checkValidateOtherSchoolTeam = () => {
    return yup.object().shape({
      otherSchoolTeam: schoolTeams.length === isChooseIndexSchoolTeam ? yup.string().trim().required(translate('school_team_is_required')) : undefined
    })
  }

  // CHECK VALIDATE OTHER PROFESSIONAL TEAM
  const checkValidateOtherProfessionalTeam = () => {
    return yup.object().shape({
      otherProfessionalTeam: professionalTeams.length === isChooseIndexProfessionalTeam ? yup.string().trim().required(translate('professional_team_is_required')) : undefined
    })
  }

  // FORMIK OTHER SPORT
  const formikOtherSport = useFormik({
    initialValues: {
      otherSport: '',
      sportId: ''
    },
    onSubmit: submitOtherSport,
    validationSchema: checkValidateOtherSport()
  })

  // FORMIK OTHER SCHOOL TEAM
  const formikOtherSchoolTeam = useFormik({
    initialValues: {
      otherSchoolTeam: '',
      schoolId: ''
    },
    onSubmit: submitOtherSchoolTeam,
    validationSchema: checkValidateOtherSchoolTeam(),
  })

  // FORMIK OTHER PROFESSIONAL TEAM
  const formikOtherProfessionalTeam = useFormik({
    initialValues: {
      otherProfessionalTeam: '',
      professionalId: ''
    },
    onSubmit: submitOtherProfessionalTeam,
    validationSchema: checkValidateOtherProfessionalTeam()
  })
  const formik = useFormik({
    initialValues: {
      name: '',
      sportId: null,
      sportName: '',
      bio: '',
      schoolTeamName: '',
      schoolId: null,
      professionalTeamName: '',
      professionalId: null,
      isActiveCollegeAthlete: false
    },
    onSubmit,
    validationSchema: checkValidate(),
  })

  // Hide Modal Sport
  const hideModalSport = () => {
      const findIndexSport = sports.findIndex((sport) => {
        return sport.name === formik.values.sportName
      })
      if (findIndexSport > -1) {
        selectedIndexSport(findIndexSport)
        setOtherValueSport(false)
        formikOtherSport.setFieldValue('otherSport', '')
      }
    hideModal()
  }

   // Hide Modal School Team
   const hideModalSchoolTeam = () => {
      const findIndexSchoolTeam = schoolTeams.findIndex((schoolTeam) => {
        return schoolTeam.name === formik.values.schoolTeamName
      })
      if (findIndexSchoolTeam > -1) {
        selectedIndexSchoolTeam(findIndexSchoolTeam)
        setOtherValueSchoolTeam(false)
        formikOtherSchoolTeam.setFieldValue('otherSchoolTeam', '')
      }
    hideModalSchool()
  }

 // Hide Modal Professional Team
 const hideModalProfessionalTeam = () => {
    const findIndexProfessionalTeam = professionalTeams.findIndex((professionalTeam) => {
      return professionalTeam.name === formik.values.professionalTeamName
    })
    if (findIndexProfessionalTeam > -1) {
      selectedIndexProfessionalTeam(findIndexProfessionalTeam)
      setOtherValueProfessionalTeam(false)
      formikOtherProfessionalTeam.setFieldValue('otherProfessionalTeam', '')
    }
    hideModalProfessional()
  }

  const BlurredBackdrop = useCallback(() => (
    <Box style={styles.blurContainer} onTouchEnd={hideModalSport}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"/>
    </Box>
  ), [isChooseIndexSport])

  const BlurredBackdropSchool = useCallback(() => (
    <Box style={styles.blurContainer} onTouchEnd={hideModalSchoolTeam}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"/>
    </Box>
  ), [isChooseIndexSchoolTeam])

  const BlurredBackdropProfessional = useCallback(() => (
    <Box style={styles.blurContainer} onTouchEnd={hideModalProfessionalTeam}>
      <BlurView
        style={styles.blurView}
        blurType="dark"
        blurAmount={10}
        reducedTransparencyFallbackColor="white"/>
    </Box>
  ), [isChooseIndexProfessionalTeam])

  const disableMode = formik.isSubmitting || isSignOut

  return (
    <Screen preset="scroll" backgroundColor="white">
      <Box alignItems="center" paddingHorizontal="s-6" justifyContent="center" backgroundColor='white'>
      <Box width="100%" flexDirection="row" justifyContent="space-between" alignItems="center">
          <Button
            variant="clear"
            icon={{ name: 'chevron-left' }}
            containerStyle={[
              styles.closeIcon,
            ]}
            onPress={_onBackPress}
            />
          <Text tx="sign_up" paddingRight="s-6" fontSize={typography.fontSize.large} variant="bold" color='gray_2'/>
          <Box/>
        </Box>
        <Box flexDirection="row" justifyContent='space-between' marginTop="s-7" width="100%" alignItems="center">
            <Text tx="personal_information" fontSize={typography.fontSize.largest} variant="bold" color='gray_2'/>
            <Button
               ViewComponent={LinearGradient}
               linearGradientProps={{
                 colors: ['#049C69', '#049C69', '#009EBE'],
                 start: { x: 0, y: 0 },
                 end: { x: 1, y: 1 },
               }}
               labelTx="button_personal_information"
               labelVariant="button"
            />
        </Box>
        <Box width="100%" marginTop="vs-10">
          <Box>
            <Box marginBottom="vs-3">
              <Text tx="your_name_new" color="emperor" variant="semiBold" />
            </Box>
            <CustomInput
              autoFocus
              onSubmitEditing={() => {
                toggleModal()
              }}
              inputRef={(ref) => {
                inputRefs.current[0] = ref
              }}
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              height={vs(48)}
              variant="rounded"
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="enter_your_fullname"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              editable={!disableMode}
              value={formik.values.name}
              onChangeText={formik.handleChange('name')}
              errorMessage={formik.touched.name && (formik.errors?.name as string)}
            />
          </Box>

          <Box marginTop="vs-4">
            <Text tx="sport_played" color="emperor" variant="semiBold" marginBottom="vs-3" />
            <TouchableOpacity onPress={toggleModal}>
              <CustomInput
                onSubmitEditing={() => {
                  setTimeout(() => {
                    inputRefs.current[2]?.focus()
                  }, 500)
                }}
                inputRef={(ref) => {
                  inputRefs.current[1] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_your_sport_played"
                autoCapitalize="none"
                textVariant="semiBold"
                rightIcon={renderDropDownSportName()}
                isDropDown
                returnKeyType="next"
                textProps={{
                  fontSize: typography.fontSize.large,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={false}
                value={formik.values.sportName}
                onChangeText={formik.handleChange('sportName')}
                errorMessage={formik.touched.sportName && (formik.errors?.sportName as string)}
              />
            </TouchableOpacity>
          </Box>
          <Modal isVisible={isModalVisible} backdropOpacity={0.99} customBackdrop={<BlurredBackdrop />}>
            <KeyboardAvoidingView style={styles.wrapperAvoidingView} behavior="position" keyboardVerticalOffset={50}>
            <Box style={styles.modal}>
            <Text tx="select_your_sport_played" color="gray_2" variant="bold" fontFamily={typography.fontFamily.primary.bold} fontSize={typography.fontSize.large}/>
            <ScrollView ref={(ref) => {
                    scrollViewRef.current[0] = ref
                }} style={styles.wrapperScrollView} showsVerticalScrollIndicator={false}>
              <Box>
                {[...sports, { _id: new ObjectId(), name: 'other' }].map((item, index) => {
                  return (
                    <TouchableOpacity key={item._id.toString()} onPress={() => chooseSport(index, item)}>
                    <Box paddingVertical={'s-3'} alignItems="center" flexDirection="row">
                      {isChooseIndexSport === index ? <Box style={styles.wrapperBoxButton}>
                        <LinearGradient style={styles.boxButton} colors={palette.gradient.button}/>
                      </Box> : <Box style={styles.boxInactiveButton} />}
                      <Text
                        text={item.name}
                        color="gray_2"
                        variant="semiBold"
                        fontFamily={typography.fontFamily.primary.regular}
                        fontSize={typography.fontSize.regular}
                        />
                    </Box>
                    </TouchableOpacity>
                  )
                })}
              </Box>
             {otherValueSport && <Box marginTop="vs-2.5">
               <CustomInput
                // onSubmitEditing={() => {
                //   submitOtherSport()
                // }}
                inputRef={(ref) => {
                  inputRefs.current[5] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_your_sport_played"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                textProps={{
                  fontSize: typography.fontSize.medium,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={true}
                value={formikOtherSport.values.otherSport}
                onChangeText={formikOtherSport.handleChange('otherSport')}
                errorMessage={formikOtherSport.touched.otherSport && (formikOtherSport.errors?.otherSport as string)}
              />
              <Box style={styles.addNew}>
              <Button
              width={s(200)}
              height={vs(48)}
              borderRadius='s-6'
              disabled={formikOtherSport.isSubmitting}
              loading={formikOtherSport.isSubmitting}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.buttonV2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }}
              labelTx="add_new"
              labelVariant="bold"
              labelProps={{
                  color: 'white',
                  fontSize: typography.fontSize.medium
                 }}
              onPress={formikOtherSport.handleSubmit}
            /></Box></Box>}
        </ScrollView>
        </Box>
      </KeyboardAvoidingView>
          </Modal>

          <Box marginTop="vs-5">
            <Box flexDirection="row" marginBottom="vs-3">
              <Text tx="bio" color="emperor" variant="semiBold" />
              <Text tx="max_bio" color="emperor" />
            </Box>
            <CustomInput
              inputRef={(ref) => {
                inputRefs.current[2] = ref
              }}
              onSubmitEditing={() => {
                inputRefs.current[3]?.focus()
              }}
              paddingHorizontal="s-3"
              borderBottomColor="transparent"
              height={vs(96)}
              variant="rounded"
              backgroundColor="transparent"
              color="pickledBluewood"
              placeholderTextColor={theme.colors.silver}
              placeholderTx="bio_placeholder"
              autoCapitalize="none"
              textVariant="semiBold"
              returnKeyType="next"
              textProps={{
                fontSize: typography.fontSize.large,
                color: 'silver',
                fontWeight: '300',
              }}
              blurOnSubmit
              multiline={true}
              customContainerStyle={styles.customBioView}
              editable={!disableMode}
              value={formik.values.bio}
              onChangeText={formik.handleChange('bio')}
              errorMessage={(formik.errors?.bio as string)}
            />
          </Box>
          <Box marginTop="vs-4">
            <Text tx="did_you_play" color="emperor" variant="semiBold" />
            <TouchableOpacity onPress={toggleCheckBox}>
              <Box flexDirection="row" alignItems="center" marginTop="vs-4">
                {!activeCheckBox ? <Box width={vs(20)} height={vs(20)}
                  style={styles.inactiveCheckBox}
                /> : <LinearGradient colors={palette.gradient.button} style={styles.activeCheckBox}>
                  <Image source={CHECK_BOX_ICON} style={styles.imageActiveCheckBox} />
                </LinearGradient>}
                <Text tx="im_an_active" color="emperor" />
              </Box>
            </TouchableOpacity>
          </Box>
            <Box marginTop="vs-5" >
            <TouchableOpacity onPress={toggleModalSchoolTeam}>    
              <CustomInput
                onSubmitEditing={() => {
                  inputRefs.current[4]?.focus()
                }}
                inputRef={(ref) => {
                  inputRefs.current[3] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="school_placeholder"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                rightIcon={renderDropDownSchoolTeamName()}
                isDropDown
                textProps={{
                  fontSize: typography.fontSize.large,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={false}
                value={formik.values.schoolTeamName}
                onChangeText={formik.handleChange('schoolTeamName')}
                errorMessage={formik.touched.schoolTeamName && (formik.errors?.schoolTeamName as string)}
              />
            </TouchableOpacity>
          </Box>

          <Modal isVisible={isModalSchoolTeamVisible} backdropOpacity={0.99} customBackdrop={<BlurredBackdropSchool />}>
            <KeyboardAvoidingView style={styles.wrapperAvoidingView} behavior="position" keyboardVerticalOffset={50}>
            <Box style={styles.modal}>
            <Text tx="select_your_school_team" color="gray_2" variant="bold" fontFamily={typography.fontFamily.primary.bold} fontSize={typography.fontSize.large}/>
            <ScrollView ref={(ref) => {
                    scrollViewRef.current[1] = ref
                }} style={styles.wrapperScrollView} showsVerticalScrollIndicator={false}>
              <Box>
                {[...schoolTeams, { _id: new ObjectId(), name: 'other' }].map((item, index) => {
                  return (
                    <TouchableOpacity key={item._id.toString()} onPress={() => chooseSchoolTeam(index, item)}>
                      <Box paddingVertical={'s-3'} alignItems="center" flexDirection="row">
                        {isChooseIndexSchoolTeam === index ? <Box style={styles.wrapperBoxButton}>
                          <LinearGradient style={styles.boxButton} colors={palette.gradient.button} />
                        </Box> : <Box style={styles.boxInactiveButton} />}
                        <Text
                          text={item.name}
                          color="gray_2"
                          variant="semiBold"
                          fontFamily={typography.fontFamily.primary.regular}
                          fontSize={typography.fontSize.regular}
                        />
                      </Box>
                    </TouchableOpacity>
                  )
                })}
              </Box>
             {otherValueSchoolTeam && <Box marginTop="vs-2.5">
               <CustomInput
                onSubmitEditing={() => {
                  submitOtherSchoolTeam()
                }}
                inputRef={(ref) => {
                  inputRefs.current[6] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_your_school_team"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                textProps={{
                  fontSize: typography.fontSize.medium,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={true}
                value={formikOtherSchoolTeam.values.otherSchoolTeam}
                onChangeText={formikOtherSchoolTeam.handleChange('otherSchoolTeam')}
                errorMessage={formikOtherSchoolTeam.touched.otherSchoolTeam && (formikOtherSchoolTeam.errors?.otherSchoolTeam as string)}
              />
              <Box style={styles.addNew}>
              <Button
              width={s(200)}
              height={vs(48)}
              borderRadius='s-6'
              disabled={formikOtherSchoolTeam.isSubmitting}
              loading={formikOtherSchoolTeam.isSubmitting}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.buttonV2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }}
              labelTx="add_new"
              labelVariant="bold"
              labelProps={{
                  color: 'white',
                  fontSize: typography.fontSize.medium
                 }}
              onPress={formikOtherSchoolTeam.handleSubmit}
            /></Box></Box>}
        </ScrollView>
        </Box>
      </KeyboardAvoidingView>
          </Modal>
            <Text tx="did_you_play_pro" color="emperor" variant="semiBold" marginVertical="vs-4"/>
            <Box marginTop="vs-2" >
            <TouchableOpacity onPress={toggleModalProfessionalTeam}>
              <CustomInput
                onSubmitEditing={() => {}}
                inputRef={(ref) => {
                  inputRefs.current[4] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="team_placeholder"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                rightIcon={renderDropDownProfessionalTeamName()}
                isDropDown
                textProps={{
                  fontSize: typography.fontSize.large,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={false}
                value={formik.values.professionalTeamName}
                onChangeText={formik.handleChange('professionalTeamName')}
                errorMessage={formik.touched.professionalTeamName && (formik.errors?.professionalTeamName as string)}
              />
            </TouchableOpacity>
          </Box>
          <Modal isVisible={isModalProfessionalTeamVisible} backdropOpacity={0.99} customBackdrop={<BlurredBackdropProfessional />}>
            <KeyboardAvoidingView style={styles.wrapperAvoidingView} behavior="position" keyboardVerticalOffset={50}>
            <Box style={styles.modal}>
            <Text tx="select_your_professional_team" color="gray_2" variant="bold" fontFamily={typography.fontFamily.primary.bold} fontSize={typography.fontSize.large}/>
            <ScrollView ref={(ref) => {
                    scrollViewRef.current[2] = ref
                }} style={styles.wrapperScrollView} showsVerticalScrollIndicator={false}>
              <Box>
                {[...professionalTeams, { _id: new ObjectId(), name: 'other' }].map((item, index) => {
                  return (
                    <TouchableOpacity key={item._id.toString()} onPress={() => chooseProfessionalTeam(index, item)}>
                      <Box paddingVertical={'s-3'} alignItems="center" flexDirection="row">
                        {isChooseIndexProfessionalTeam === index ? <Box style={styles.wrapperBoxButton}>
                          <LinearGradient style={styles.boxButton} colors={palette.gradient.button} />
                        </Box> : <Box style={styles.boxInactiveButton} />}
                        <Text
                          text={item.name}
                          color="gray_2"
                          variant="semiBold"
                          fontFamily={typography.fontFamily.primary.regular}
                          fontSize={typography.fontSize.regular}
                        />
                      </Box>
                    </TouchableOpacity>
                  )
                })}
              </Box>
             {otherValueProfessionalTeam && <Box marginTop="vs-2.5">
               <CustomInput
                onSubmitEditing={() => {
                  submitOtherProfessionalTeam()
                }}
                inputRef={(ref) => {
                  inputRefs.current[7] = ref
                }}
                paddingHorizontal="s-3"
                borderBottomColor="transparent"
                height={vs(48)}
                variant="rounded"
                backgroundColor="transparent"
                color="pickledBluewood"
                placeholderTextColor={theme.colors.silver}
                placeholderTx="enter_your_professional_team"
                autoCapitalize="none"
                textVariant="semiBold"
                returnKeyType="next"
                textProps={{
                  fontSize: typography.fontSize.medium,
                  color: 'silver',
                  fontWeight: '300',
                }}
                editable={true}
                value={formikOtherProfessionalTeam.values.otherProfessionalTeam}
                onChangeText={formikOtherProfessionalTeam.handleChange('otherProfessionalTeam')}
                errorMessage={formikOtherProfessionalTeam.touched.otherProfessionalTeam && (formikOtherProfessionalTeam.errors?.otherProfessionalTeam as string)}
              />
              <Box style={styles.addNew}>
              <Button
              height={vs(48)}
              width={s(200)}
              borderRadius='s-6'
              disabled={formikOtherProfessionalTeam.isSubmitting}
              loading={formikOtherProfessionalTeam.isSubmitting}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: palette.gradient.buttonV2,
                start: { x: 0, y: 0 },
                end: { x: 1, y: 0 },
              }}
              labelTx="add_new"
              labelVariant="bold"
              labelProps={{
                  color: 'white',
                  fontSize: typography.fontSize.medium
                 }}
              onPress={formikOtherProfessionalTeam.handleSubmit}
            /></Box></Box>}
        </ScrollView>
        </Box>
      </KeyboardAvoidingView>
          </Modal>
        </Box>
        <Button
          width={metrics.screenWidth * 0.88}
          height={vs(48)}
          borderRadius='s-6'
          disabled={formik.isSubmitting}
          loading={formik.isSubmitting}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.button,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="next"
          labelVariant="bold"
          marginTop="vs-6"
          marginBottom="vs-6"
          labelProps={{
              color: 'white',
              fontSize: typography.fontSize.larger
             }}
          onPress={formik.handleSubmit}
        />
      </Box>
    </Screen>
  )
}

export default PersonalInformationScreen

const styles = ScaledSheet.create({
  closeIcon: {
    right: '10@s',
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
  wrapperBoxButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#049C69',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10
  },
  boxButton: {
    width: 10,
    height: 10,
    borderRadius: 5
  },
  boxInactiveButton: {
    borderRadius: 15,
    height: 15,
    width: 15,
    borderWidth: 0.9,
    marginRight: 10
  },
  inactiveCheckBox: {
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 5
  },
  activeCheckBox: {
    width: vs(20),
    height: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderRadius: 5
  },
  imageActiveCheckBox: {
    width: vs(12),
    height: vs(10),
  },
  modal: {
    backgroundColor: 'white',
    minHeight: '195@vs',
    maxHeight: metrics.screenHeight / 2,
    paddingHorizontal: '24@s',
    paddingTop: '20@vs',
    borderRadius: vs(6),
    shadowColor: 'rgba(0, 0, 0, 0.14)',
    shadowOffset: {
      width: 0,
      height: vs(7),
    },
    shadowRadius: vs(9),
  },
  addNew: {
    alignItems: 'center',
    paddingVertical: '20@vs',
  },
  blurContainer: {
    backgroundColor: "transparent",
    flex: 1,
  },
  blurView: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 1,
  },
  wrapperAvoidingView: {
    justifyContent: 'center'
  },
  wrapperScrollView: {
    marginVertical: 10
  },
  customBioView: {
    alignItems: 'flex-start',
    paddingTop: 5
  }
})
