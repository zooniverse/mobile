import React from 'react'
import {
  TextInput,
  View
} from 'react-native'
import StyledText from './StyledText'
import EStyleSheet from 'react-native-extended-stylesheet'

const Input = (props) => {
  return (
    <View>
      { props.labelText !== '' ? <StyledText text={props.labelText} /> : null }
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={props.handleOnChangeText}
          secureTextEntry={props.passwordField}
        />
      </View>
    </View>
  )
}

const styles = EStyleSheet.create({
  input: {
    backgroundColor: 'transparent',
    height: 40,
    padding: 8,
  },
  inputContainer: {
    borderColor: 'grey',
    borderWidth: 1,
    marginBottom: 10
  },
});

Input.propTypes = {
  handleOnChangeText: React.PropTypes.func,
  labelText: React.PropTypes.string,
  passwordField: React.PropTypes.bool
}

Input.defaultProps = { labelText: '', passwordField: false };

export default Input
