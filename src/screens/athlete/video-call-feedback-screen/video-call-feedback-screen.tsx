import { Screen } from '@components/screen'
import { Box, Text, Avatar } from '@components/index'
import { vs, ScaledSheet } from 'react-native-size-matters/extend'
import { typography } from '@styles/typography'
import { FeedbackInput } from './components/feedback-input'
import { RecordingPermissionPrompt } from './components/recording-permission-prompt'
import { ThankYouExperience } from './components/thank-you-experience'
import { useCallback } from 'react'
import { feedbackCall } from '@src/database/functions/calls'
import { useAuth } from '@hooks/useAuth'
import { useImmer } from 'use-immer'
import { RouteProp, useRoute } from '@react-navigation/native'
import { RootParamList } from '@navigation/params'
import { show } from '@utils/toast'

const VideoCallFeedbackScreen = () => {
  const { user } = useAuth()
  const route = useRoute<RouteProp<RootParamList, 'Athlete/VideoCallFeedback'>>()
  const { call } = route.params || {}
  const [feedbackState, setFeedbackState] = useImmer({
    shouldFanHasRecord: undefined,
    feedback: undefined,
  })

  const _onNoMeetPolicy = useCallback(() => {
    setFeedbackState((draft) => {
      draft.shouldFanHasRecord = false
    })

    feedbackCall({
      user,
      callId: call?._id,
      shouldFanHasRecord: false,
    }).catch((error) => {
      show({
        titleTx: 'failed_to_send_feedbacks',
        message: error.message,
        type: 'error',
      })
    })
  }, [call?._id, setFeedbackState, user])

  const _onYesMeetPolicy = useCallback(() => {
    setFeedbackState((draft) => {
      draft.shouldFanHasRecord = true
    })
    feedbackCall({
      user,
      callId: call?._id,
      shouldFanHasRecord: true,
    }).catch((error) => {
      show({
        titleTx: 'failed_to_send_feedbacks',
        message: error.message,
        type: 'error',
      })
    })
  }, [call?._id, setFeedbackState, user])

  const _onCancelProvideReason = useCallback(() => {
    setFeedbackState((draft) => {
      draft.shouldFanHasRecord = undefined
    })
  }, [setFeedbackState])

  const _onInvestigateReason = useCallback(
    (feedback) => {
      setFeedbackState((draft) => {
        draft.feedback = feedback
      })
      feedbackCall({
        user,
        callId: call?._id,
        feedback,
      }).catch((error) => {
        show({
          titleTx: 'failed_to_send_feedbacks',
          message: error.message,
          type: 'error',
        })
      })
    },
    [call?._id, setFeedbackState, user],
  )

  return (
    <Screen
      header={{ headerTx: feedbackState.feedback !== undefined ? 'thank_you' : 'feedback' }}
      style={styles.container}
      preset="scroll"
    >
      {feedbackState.feedback !== undefined || feedbackState.shouldFanHasRecord ? (
        <ThankYouExperience call={call} />
      ) : (
        <>
          <Box flexDirection="row" justifyContent="center" marginTop="xl">
            <Avatar source={user?.customData?.avatar && { uri: user?.customData?.avatar }} size={vs(80)} />
            <Box style={styles.fanAvatar}>
              <Avatar source={user?.customData?.avatar && { uri: call?.fan?.avatar }} size={vs(80)} />
            </Box>
          </Box>
          <Text
            marginTop="ls"
            marginBottom="ls"
            tx="question_meet_fan_conduct_policy"
            variant="bold"
            textAlign="center"
            fontSize={typography.fontSize.large}
          />
          {feedbackState.shouldFanHasRecord !== undefined ? (
            <FeedbackInput onCancel={_onCancelProvideReason} onInvestigate={_onInvestigateReason} />
          ) : (
            <RecordingPermissionPrompt onNo={_onNoMeetPolicy} onYes={_onYesMeetPolicy} />
          )}
        </>
      )}
    </Screen>
  )
}

export default VideoCallFeedbackScreen

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '20@s',
  },
  fanAvatar: {
    zIndex: 100,
    left: '-8@s',
    borderRadius: '40@vs',
    backgroundColor: 'white',
  },
  feedbackInput: {
    height: '214@vs',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    marginTop: '26@vs',
  },
  inputContainerStyle: {
    borderBottomWidth: 0,
  },
  inputWrapper: {
    marginTop: '60@vs',
    marginBottom: '41@vs',
  },
})
