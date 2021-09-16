import { Box, Text, Button } from '@components/index'
import { s, vs } from 'react-native-size-matters/extend'
import LinearGradient from 'react-native-linear-gradient'

type RecordingPermissionPromptProps = {
  onYes: () => void
  onNo: () => void
}

export const RecordingPermissionPrompt = ({ onYes, onNo }: RecordingPermissionPromptProps) => {
  return (
    <Box marginTop="ls">
      <Text tx="fan_can_have_a_recording" textAlign="center" />
      <Box flexDirection="row" justifyContent="center" marginTop="ls">
        <Button
          variant="outline"
          labelTx="no"
          labelVariant="bold"
          labelProps={{ color: 'grey' }}
          width={s(78)}
          height={vs(36)}
          marginRight="s"
          onPress={onNo}
        />
        <Button
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#049C69', '#049C69', '#009EBE'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          labelTx="yes"
          width={s(78)}
          labelVariant="bold"
          labelProps={{ color: 'white' }}
          marginLeft="s"
          height={vs(36)}
          onPress={onYes}
        />
      </Box>
    </Box>
  )
}
