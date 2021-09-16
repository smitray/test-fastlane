import { StyleSheet } from 'react-native'
import { Box } from '@components/common/viewbox'
import { Text } from '@components/text'

interface ToastProps {
  type: 'success' | 'error' | 'warning'
  state: any
}

const colors = {
  success: 'green',
  error: 'cinnabar',
  warning: 'tulipTree',
}
export const Toast = ({ type, state }: ToastProps) => {
  return (
    <Box
      width="90%"
      style={styles.container}
      paddingHorizontal="s-2"
      paddingVertical="s-4"
      borderRadius="s-5"
      borderWidth={1}
      borderColor={colors[type]}
      backgroundColor={colors[type]}
      shadowColor={state?.inProgress || state.isVisible ? colors[type] : 'black'}
      justifyContent="center"
      alignItems="center"
    >
      {!!state.text1 && <Text variant="bold" color="white" text={state.text1} />}
      {!!state.text2 && <Text color="white" text={state.text2} />}
    </Box>
  )
}

export const toastConfig = {
  success: (state) => <Toast state={state} type="success" />,
  error: (state) => <Toast state={state} type="error" />,
  warning: (state) => <Toast state={state} type="warning" />,
}

const styles = StyleSheet.create({
  container: {
    elevation: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.48,
    shadowRadius: 10.32,
  },
})
