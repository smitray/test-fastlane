import { Box } from '@components/common'
import { Button } from '@components/button'
import { Text } from '@components/text'
import { ScaledSheet, s, vs, mvs } from 'react-native-size-matters/extend'
import { Input } from 'react-native-elements'
import { typography } from '@styles/typography'
import LinearGradient from 'react-native-linear-gradient'
import { useCallback, useRef } from 'react'
import { palette } from '@styles/palette'
import { IconSvg } from '@components/icon-svg'
import { VideoPlayer } from '@components/video-player'
import ActionSheet from '@alessiocancian/react-native-actionsheet'
import { translate } from '@i18n/translate'

type AboutYouProps = {
  isUploadRecordVideo: boolean
  message?: string
  videoIntroUrl?: string
  onVideoIntroUrlChange: (value) => void
  onMessageChange: (value) => void
  onRemoveRecordVideo: () => void
  launchVideoPicker: (index: number) => void
}
const AboutYou = ({
  message,
  onMessageChange,
  videoIntroUrl,
  onRemoveRecordVideo,
  launchVideoPicker,
  isUploadRecordVideo,
}: AboutYouProps) => {
  const actionSheetRef = useRef(null)

  const _onUploadRecordVideoPress = useCallback(() => {
    actionSheetRef.current?.show()
  }, [actionSheetRef])

  return (
    <Box mt="vs-12">
      <Text tx="tell_a_brief_about_you" color="grey" />
      <Input
        multiline
        value={message}
        containerStyle={styles.feedbackInput}
        underlineColorAndroid="transparent"
        onChangeText={onMessageChange}
        inputContainerStyle={styles.inputContainer}
        style={styles.textInput}
        maxLength={400}
      />
      <Text
        tx="record_a_short_video_about_you"
        variant="medium"
        color="grey"
        mt="vs-5"
        fontSize={typography.fontSize.small}
      />

      {videoIntroUrl ? (
        <Box mt="vs-3.5">
          <VideoPlayer source={{ uri: videoIntroUrl }} videoWidth={s(107)} videoHeight={vs(110)} paused />
          <Box position="absolute" left={s(90)} top={-10}>
            <Button
              variant="clear"
              icon={{ name: 'close', color: 'white', size: mvs(15) }}
              onPress={onRemoveRecordVideo}
              borderRadius="s-4.5"
              height={s(24)}
              width={s(24)}
              backgroundColor="green"
            />
          </Box>
        </Box>
      ) : (
        <Button
          marginTop="vs-3"
          width={s(155)}
          height={vs(40)}
          icon={<IconSvg name="camera" />}
          iconRight
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: palette.gradient.background2,
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="record_video"
          labelVariant="bold"
          onPress={_onUploadRecordVideoPress}
          labelProps={{ color: 'plantation', marginRight: 's-3' }}
          disabled={isUploadRecordVideo}
          loading={isUploadRecordVideo}
        />
      )}
      <ActionSheet
        ref={actionSheetRef}
        title={translate('select_a_video')}
        options={[translate('record_new_video'), translate('choose_from_library'), translate('cancel')]}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={launchVideoPicker}
      />
    </Box>
  )
}

export default AboutYou

const styles = ScaledSheet.create({
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    marginTop: '14@vs',
    borderRadius: '4@s',
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  textInput: {
    height: '102@vs',
    textAlignVertical: 'top',
  },
})
