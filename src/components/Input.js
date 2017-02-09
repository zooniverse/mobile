import React from 'react'
import {
  StyleSheet,
  TextInput,
  View
} from 'react-native'
import StyledText from './StyledText'
import EStyleSheet from 'react-native-extended-stylesheet'

const Input = (props) => {
  const inputStyle = ( props.inputStyle ? [styles.inputContainer, styles[props.inputStyle]] : styles.inputContainer )
  const containerStyle = ( props.subLabelText ? styles.tallContainer : styles.container )

  const addLabelDisplay =
    <StyledText
      textStyle={'subLabelText'}
      text={`  ${props.addLabel}`} />

  const labelDisplay =
    <View style={styles.rowContainer}>
      <StyledText text={props.labelText} />
      { props.addLabel ? addLabelDisplay : null }
    </View>

  const subLabelTextDisplay =
    <StyledText
      textStyle={'subLabelText'}
      text={props.subLabelText} />

  return (
    <View style={containerStyle}>
      { props.labelText ? labelDisplay : null }

      <View style={inputStyle}>
        <TextInput
          style={styles.input}
          autoCapitalize='none'
          autoCorrect={false}
          onChangeText={props.handleOnChangeText}
          secureTextEntry={props.passwordField}
          keyboardType={ props.keyboardType ? props.keyboardType : 'default' }
          returnKeyType={'done'}
          underlineColorAndroid ={'white'}
        />
      </View>
      { props.subLabelText ? subLabelTextDisplay : null }
    </View>
  )
}

const styles = EStyleSheet.create({
  container: {
    height: 58,
    marginBottom: 10,
  },
  tallContainer: {
    height: 73,
    marginBottom: 15,
  },
  input: {
    borderColor: '$lightGrey',
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
    flex: 1,
    height: 40,
    padding: 8,
  },
  inputContainer: {
    borderColor: '$lightGrey',
    borderWidth: StyleSheet.hairlineWidth,
    flex: 1,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  small: {
    width: '40%'
  },
});

Input.propTypes = {
  handleOnChangeText: React.PropTypes.func,
  labelText: React.PropTypes.string,
  passwordField: React.PropTypes.bool,
  keyboardType: React.PropTypes.string,
  inputStyle: React.PropTypes.string,
  subLabelText: React.PropTypes.string,
  addLabel: React.PropTypes.string
}

Input.defaultProps = { labelText: '', passwordField: false, required: false };

export default Input
