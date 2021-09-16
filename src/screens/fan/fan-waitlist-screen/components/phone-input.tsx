import React, { PureComponent } from 'react'
import { View, Text, TouchableOpacity, Image } from 'react-native'
import CountryPicker, {
  getCallingCode,
  DARK_THEME,
  DEFAULT_THEME,
  CountryModalProvider,
  Flag,
} from 'react-native-country-picker-modal'
import { PhoneNumberUtil } from 'google-libphonenumber'
import { ScaledSheet } from 'react-native-size-matters/extend'
import TextInputMask from 'react-native-text-input-mask'
import LinearGradient from 'react-native-linear-gradient'
import { palette } from '@styles/palette'

const dropDown =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg=='
const DROP_DOWN_ICON = require('@assets/images/chevron-left-phone-flag.png')
const phoneUtil = PhoneNumberUtil.getInstance()

export default class PhoneInput extends PureComponent<any, any> {
  constructor(props) {
    super(props)
    this.state = {
      code: props.defaultCode ? undefined : '91',
      number: props.value ? props.value : props.defaultValue ? props.defaultValue : '',
      modalVisible: false,
      countryCode: props.defaultCode ? props.defaultCode : 'IN',
      disabled: props.disabled || false,
      isFocused: false,
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.disabled !== prevState.disabled) {
      if ((nextProps.value || nextProps.value === '') && nextProps.value !== prevState.number) {
        return { disabled: nextProps.disabled, number: nextProps.value }
      }
      return { disabled: nextProps.disabled }
    }
    return null
  }

  async componentDidMount() {
    const { defaultCode } = this.props
    if (defaultCode) {
      const code = await getCallingCode(defaultCode)
      this.setState({ code })
    }
  }

  getCountryCode = () => {
    return this.state.countryCode
  }

  reset = async () => {
    const { defaultCode } = this.props
    let code
    if (defaultCode) {
      code = await getCallingCode(defaultCode)
    }
    this.setState({
      code,
      number: this.props.value ? this.props.value : this.props.defaultValue ? this.props.defaultValue : '',
      modalVisible: false,
      countryCode: this.props.defaultCode ? this.props.defaultCode : 'IN',
      disabled: this.props.disabled || false,
    })
  }

  getCallingCode = () => {
    return this.state.code
  }

  isValidNumber = (number) => {
    try {
      const { countryCode } = this.state
      const parsedNumber = phoneUtil.parse(number, countryCode)
      return phoneUtil.isValidNumber(parsedNumber)
    } catch (err) {
      return false
    }
  }

  onSelect = (country) => {
    const { onChangeCountry } = this.props
    this.setState(
      {
        countryCode: country.cca2,
        code: country.callingCode[0],
      },
      () => {
        const { onChangeFormattedText } = this.props
        if (onChangeFormattedText) {
          if (country.callingCode[0]) {
            onChangeFormattedText(`+${country.callingCode[0]}${this.state.number}`)
          } else {
            onChangeFormattedText(this.state.number)
          }
        }
      },
    )
    if (onChangeCountry) {
      onChangeCountry(country)
    }
  }

  onChangeText = (text) => {
    let number
    if (text.startsWith('0')) {
      number = text.substr(1)
    } else {
      number = text
    }
    this.setState({ number })
    const { onChangeText, onChangeFormattedText } = this.props
    if (onChangeText) {
      onChangeText(number)
    }
    if (onChangeFormattedText) {
      const { code } = this.state
      if (code) {
        onChangeFormattedText(number.length > 0 ? `+${code}${number}` : number)
      } else {
        onChangeFormattedText(number)
      }
    }
  }

  getNumberAfterPossiblyEliminatingZero() {
    let { number, code } = this.state
    if (number.length > 0 && number.startsWith('0')) {
      number = number.substr(1)
      return { number, formattedNumber: code ? `+${code}${number}` : number }
    } else {
      return { number, formattedNumber: code ? `+${code}${number}` : number }
    }
  }

  renderDropdownImage = () => {
    return <Image source={DROP_DOWN_ICON} style={styles.dropDownImage} />
  }

  renderFlagButton = (props) => {
    const { layout = 'first', flagSize } = this.props
    const { countryCode } = this.state
    if (layout === 'first') {
      return <Flag countryCode={countryCode} flagSize={flagSize || DEFAULT_THEME.flagSize} />
    }
    return <View />
  }

  handleFocus = () => {
    this.setState({ isFocused: true })
  }

  handleBlur = () => {
    this.setState({ isFocused: false })
  }

  getBorderColor = () => {
    if (this.props.errorMessage) {
      return palette.gradient.red
    }
    if (!this.props.gradient) {
      return palette.gradient.transparent
    }
    if (this.state.isFocused) {
      return palette.gradient.gray
    }
    if (this.props.value || this.props.defaultValue) {
      return this.props.gradient?.colors
    }
    return palette.gradient.transparent
  }
    
  render() {
    const {
      withShadow,
      withDarkTheme,
      codeTextStyle,
      textInputProps,
      textInputStyle,
      autoFocus,
      placeholder,
      disableArrowIcon,
      flagButtonStyle,
      containerStyle,
      textContainerStyle,
      renderDropdownImage,
      countryPickerProps = {},
      filterProps = {},
      countryPickerButtonStyle,
      layout = 'first',
      onCountryPickerClose,
    } = this.props
    const { modalVisible, code, countryCode, number, disabled } = this.state
    return (
      <CountryModalProvider>
        <LinearGradient style={styles.gradient} colors={this.getBorderColor()} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={[styles.container, withShadow ? styles.shadow : {}, containerStyle || {}, !!this.props.dynamicBackground && { backgroundColor: (this.state.isFocused || this.state.number) ? palette.white : palette.gray_3 },]}>
          <TouchableOpacity
            disabled={disabled}
            onPress={() => this.setState({ modalVisible: true })}
          >
          <View
            style={[
              styles.flagButtonView,
              layout === 'second' ? styles.flagButtonExtraWidth : {},
              flagButtonStyle || {},
              countryPickerButtonStyle || {},
            ]}>
            <CountryPicker
              onSelect={this.onSelect}
              withEmoji
              withFilter
              withFlag
              filterProps={filterProps}
              countryCode={countryCode}
              withCallingCode
              disableNativeModal={disabled || this.props.disableNativeModal}
              visible={modalVisible}
              theme={withDarkTheme ? DARK_THEME : DEFAULT_THEME}
              renderFlagButton={this.renderFlagButton}
              onClose={() => {
                this.setState({ modalVisible: false })
                onCountryPickerClose?.()
              }}
              {...countryPickerProps}
            />
            {code && layout === 'second' && <Text style={[styles.codeText, codeTextStyle || {}]}>{`+${code}`}</Text>}
            {!disableArrowIcon && <React.Fragment>{renderDropdownImage || this.renderDropdownImage()}</React.Fragment>}
            </View>
          </TouchableOpacity>
          <View style={[styles.textContainer, textContainerStyle || {}]}>
            {code && layout === 'first' && <Text style={[styles.codeText, codeTextStyle || {}]}>{`+${code}`}</Text>}
            <TextInputMask
              refInput={this.props.inputRef}
              style={[styles.numberText, textInputStyle || {}]}
              placeholder={(this.props.clearPlaceholderWhenFocus && this.state.isFocused)? '' : (placeholder || 'Phone Number')}
              onChangeText={this.onChangeText}
              value={number}
              editable={!disabled}
              selectionColor="black"
              keyboardAppearance={withDarkTheme ? 'dark' : 'default'}
              keyboardType="number-pad"
              autoFocus={autoFocus}
              mask={'[000]-[000]-[0000]'}
              onFocus={this.handleFocus}
              onBlur={this.handleBlur}
              {...textInputProps}
            />
          </View>
        </View>
        </LinearGradient>
      </CountryModalProvider>
    )
  }
}

export const isValidNumber = (number, countryCode) => {
  try {
    const parsedNumber = phoneUtil.parse(number, countryCode)
    return phoneUtil.isValidNumber(parsedNumber)
  } catch (err) {
    return false
  }
}

const styles = ScaledSheet.create({
  container: {
    width: '80@s',
    backgroundColor: 'white',
    flexDirection: 'row',
  },
  flagButtonView: {
    width: '20@s',
    height: '100%',
    minWidth: 32,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagButtonExtraWidth: {
    width: '23@s',
  },
  shadow: {
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowOffset: {
      width: 1,
      height: 5,
    },
    shadowOpacity: 0.34,
    shadowRadius: 6.27,
    elevation: 10,
  },
  dropDownImage: {
    height: 16,
    width: 14,
    marginEnd: '8@s',
  },
  textContainer: {
    flex: 1,
    backgroundColor: '#F8F9F9',
    paddingHorizontal: '4@s',
    paddingVertical: '2@vs',
    textAlign: 'left',
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeText: {
    fontSize: 16,
    marginHorizontal: '8@s',
    fontWeight: '600',
    color: '#000000',
  },
  numberText: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  gradient: {
    padding: 1,
    borderRadius: '8@vs',
    width: '100%',
  },
})
