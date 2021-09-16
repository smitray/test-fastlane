/* eslint-disable react-native/no-inline-styles */
import { Box } from '@components/common'
import { Text } from '@components/text'
import { useTheme } from '@hooks/theme'
import { CardField } from '@stripe/stripe-react-native'
import { typography } from '@styles/typography'
import { ActivityIndicator, TouchableOpacity } from 'react-native'
import { palette } from '@styles/palette'
import { TextGradient } from '@components/index'
import { translate } from '@i18n/translate'
import { vs, ScaledSheet } from 'react-native-size-matters/extend'
import RNPickerSelect from 'react-native-picker-select'
import { Icon } from 'react-native-elements'

type PaymentProps = {
  isLoadingCards: boolean
  isNew: boolean
  isProcessing: boolean
  athlete: any
  paymentMethods: any[]
  selectedPaymentMethod: any
  togglePaymentMethod: () => void
  onPaymentMethodSelect: (card) => void
  onCardDetailChange: (cardDetail) => void
}
const Payment = ({
  athlete,
  isProcessing,
  isLoadingCards,
  isNew,
  paymentMethods,
  togglePaymentMethod,
  onCardDetailChange,
  onPaymentMethodSelect,
}: PaymentProps) => {
  const theme = useTheme()

  return (
    <Box flex={1} flexDirection="column">
      <Text
        mt="vs-5.5"
        text={`$${athlete.callPrice}`}
        color="black"
        variant="bold"
        fontSize={typography.fontSize.massive}
        textAlign="center"
      />
      <Text
        tx="call_duration"
        txOptions={{ count: 4 }}
        color="grey"
        fontSize={typography.fontSize.tiny}
        textAlign="center"
        mb="vs-10"
      />
      <Text tx="credit_card" color="black" variant="medium" mb={isNew ? 'none' : 'vs-7'} />
      {isLoadingCards ? (
        <Box mt="vs-10" justifyContent="center" alignItems="center">
          <ActivityIndicator color={theme.colors.primary} />
        </Box>
      ) : isNew ? (
        <CardField
          postalCodeEnabled
          cardStyle={{
            backgroundColor: '#FFFFFF',
            textColor: '#000000',
          }}
          style={styles.cardForm}
          onCardChange={onCardDetailChange}
        />
      ) : (
        <Box backgroundColor="mercury" height={vs(100)}>
          {paymentMethods.length > 0 ? (
            <RNPickerSelect
              disabled={isProcessing}
              placeholder={{ label: translate('select_from_my_cards'), value: '' }}
              onValueChange={onPaymentMethodSelect}
              items={paymentMethods.map((p) => ({ label: `****${p.card.last4}`, value: p.id }))}
              useNativeAndroidPickerStyle={false}
              Icon={() => <Icon name="expand-more" size={24} color="gray" />}
              style={{
                inputAndroid: styles.inputAndroid as any,
                inputIOS: styles.inputIOS as any,
                iconContainer: styles.iconContainer as any,
              }}
            />
          ) : (
            <Text tx="you_have_no_credit_card" textAlign="center" />
          )}
        </Box>
      )}
      <Box mb="vs-10" justifyContent="flex-end" alignItems="center" flex={1}>
        <Text tx="or" textAlign="center" mb="vs-1" />
        <TouchableOpacity onPress={togglePaymentMethod}>
          <TextGradient
            variant="bold"
            tx={isNew ? 'select_from_my_cards' : 'add_new_card'}
            gradient={{
              colors: palette.gradient.text,
            }}
          />
        </TouchableOpacity>
      </Box>
    </Box>
  )
}

export default Payment

const styles = ScaledSheet.create({
  cardForm: {
    height: 60,
    marginVertical: 30,
    width: '100%',
  },
  iconContainer: {
    top: '18@vs',
    right: '20@vs',
  },
  inputAndroid: {
    borderColor: palette.doveGray,
    borderWidth: 1,
    borderRadius: '4@vs',
    color: 'black',
    fontSize: typography.fontSize.large,
    fontWeight: '300',
    height: '60@vs',
    backgroundColor: 'white',
    paddingHorizontal: '10@s',
    paddingRight: 30,
  },
  inputIOS: {
    backgroundColor: 'white',
    borderColor: palette.doveGray,
    borderWidth: 1,
    borderRadius: '4@vs',
    color: 'black',
    fontFamily: typography.fontFamily.primary.regular,
    fontSize: typography.fontSize.large,
    fontWeight: '300',
    height: '60@vs',
    paddingHorizontal: '10@s',
  },
})
