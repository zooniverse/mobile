import React from 'react'
import {
  Text,
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { append } from 'ramda'

const Button = (props) => {
  let buttonStyle = ( props.buttonStyle ? [styles.button, styles[props.buttonStyle]] : styles.button )
  buttonStyle = (props.additionalStyles ? append(props.additionalStyles, [buttonStyle]) : buttonStyle)

  const textStyle = (props.additionalTextStyles ? append(props.additionalTextStyles, [styles.buttonText]) : styles.buttonText)

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
    letterSpacing: 1.3,
    flex: 1,
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
  handlePress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  buttonStyle: PropTypes.string,
  additionalStyles: PropTypes.array,
  additionalTextStyles: PropTypes.array,
  text: PropTypes.string
}
Button.defaultProps = { disabled: false }

export default Button
