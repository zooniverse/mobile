import React from 'react'
import {
  TouchableOpacity
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { append } from 'ramda'

import FontedText from './common/FontedText'

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
      <FontedText style={textStyle}>
        {props.text}
      </FontedText>
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
  tealButton: {
    backgroundColor: '$zooniverseTeal'
  }
});

Button.propTypes = {
  handlePress: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  buttonStyle: PropTypes.string,
  additionalStyles: PropTypes.array,
  additionalTextStyles: PropTypes.any,
  text: PropTypes.string
}
Button.defaultProps = { disabled: false }

export default Button
