import React from 'react'
import {
  Text,
  TouchableOpacity
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { append } from 'ramda'

const Button = (props) => {
  var buttonStyle = ( props.buttonStyle ? [styles.button, styles[props.buttonStyle]] : styles.button )
  buttonStyle = (props.additionalStyles ? append(props.additionalStyles, [buttonStyle]) : buttonStyle)

  var textStyle = (props.additionalTextStyles ? append(props.additionalTextStyles, [styles.buttonText]) : styles.buttonText)

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={props.handlePress}
      disabled={props.disabled}
      activeOpacity={0.5}>
      <Text style={textStyle}>
        {props.text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = EStyleSheet.create({
  buttonText: {
    fontSize: 14,
    color: 'white',
    alignSelf: 'center',
    letterSpacing: 1.3
  },
  button: {
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    backgroundColor: '$buttonColor',
    alignSelf: 'stretch',
    justifyContent: 'center',
    marginTop: 10
  },
  disabledButton: {
    backgroundColor: '$disabledButtonColor'
  },
  registerButton: {
    backgroundColor: '$registerButtonColor'
  },
  disabledRegisterButton: {
    backgroundColor: '$registerDisabledButtonColor'
  },
  navyButton: {
    backgroundColor: '$navy',
  },
});

Button.propTypes = {
  handlePress: React.PropTypes.func.isRequired,
  disabled: React.PropTypes.bool,
  buttonStyle: React.PropTypes.string,
  additionalStyles: React.PropTypes.array,
  additionalTextStyles: React.PropTypes.array,
  text: React.PropTypes.string
}
Button.defaultProps = { disabled: false }

export default Button
