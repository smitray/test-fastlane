import { Box, Text, Button } from '@components/index'
import { ScaledSheet, s, vs } from 'react-native-size-matters/extend'
import { Input, Icon } from 'react-native-elements'
import LinearGradient from 'react-native-linear-gradient'
import { useState, useCallback } from 'react'

type FeedbackInputProps = {
  onCancel: () => void
  onInvestigate: (feedback: string) => void
}
export const FeedbackInput = ({ onCancel, onInvestigate }: FeedbackInputProps) => {
  const [feedback, setFeedback] = useState('')

  const _onInputChange = useCallback((text) => {
    setFeedback(text)
  }, [])

  const _onInvestigatePress = useCallback(() => {
    onInvestigate?.(feedback.trim())
  }, [feedback, onInvestigate])

  return (
    <Box>
      <Box style={styles.inputWrapper}>
        <Text tx="please_tell_us_what_happened" textAlign="center" />
        <Input
          multiline
          value={feedback}
          containerStyle={styles.feedbackInput}
          underlineColorAndroid="transparent"
          onChangeText={_onInputChange}
          inputContainerStyle={styles.inputContainer}
          returnKeyType="done"
          style={styles.textInput}
        />
        <Box flexDirection="row" alignItems="center">
          <Icon name="star" size={s(7)} color="gray" />
          <Text tx="your_feedback_must_be_longer_than_40_characters" variant="small" color="grey" marginTop="s" />
        </Box>
      </Box>
      <Box flexDirection="row" justifyContent="center">
        <Button
          variant="outline"
          labelTx="cancel"
          labelVariant="bold"
          labelProps={{ color: 'grey' }}
          width={s(127)}
          height={vs(36)}
          onPress={onCancel}
        />
        <Button
          disabled={feedback.trim().length <= 40}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#049C69', '#049C69', '#009EBE'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="investigate"
          width={s(127)}
          height={vs(36)}
          labelVariant="bold"
          labelProps={{ color: 'white' }}
          marginLeft="s"
          onPress={_onInvestigatePress}
        />
      </Box>
    </Box>
  )
}

const styles = ScaledSheet.create({
  feedbackInput: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    marginTop: '26@vs',
  },
  inputContainer: {
    borderBottomWidth: 0,
  },
  textInput: {
    height: '214@vs',
    textAlignVertical: 'top',
  },
  inputWrapper: {
    marginTop: '40@vs',
    marginBottom: '41@vs',
  },
})
