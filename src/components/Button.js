import React from 'react'
import {
  Text,
  TouchableOpacity
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const Button = (props) => {
  const buttonStyle = ( props.disabled ? [styles.button, styles.disabledButton] : styles.button )

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={props.handlePress}
      disabled={props.disabled}
      activeOpacity={0.5}>
      <Text style={styles.buttonText}>
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
    letterSpacing: 1.5
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
});

Button.propTypes = {
  handlePress: React.PropTypes.func.isRequired,
  disabled: React.PropTypes.bool,
  text: React.PropTypes.string
}
Button.defaultProps = { disabled: false }

export default Button
