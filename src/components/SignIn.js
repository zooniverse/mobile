import React from 'react'
import {
  Alert,
  Linking,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { signIn } from '../actions/index'
import { connect } from 'react-redux';
import Button from './Button'
import Input from './Input'
import NavBar from './NavBar'
import OverlaySpinner from './OverlaySpinner'
import StyledText from './StyledText'

const mapStateToProps = (state) => ({
  isFetching: state.isFetching,
  errorMessage: state.errorMessage,
  isConnected: state.isConnected,
})

const mapDispatchToProps = (dispatch) => ({
  signIn(login, password) {
    dispatch(signIn(login, password))
  },
})

class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {login: '', password: ''}
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleResetPassword = this.handleResetPassword.bind(this)
    this.handleSignIn = this.handleSignIn.bind(this)
  }

  handleRegistration() {
    const zurl='https://www.zooniverse.org/accounts/register'
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to open your default browser.',
        )
      }
    });
  }

  handleResetPassword() {
    const zurl='http://zooniverse.org/reset-password'
    Linking.canOpenURL(zurl).then(supported => {
      if (supported) {
        Linking.openURL(zurl);
      } else {
        Alert.alert(
          'Error',
          'Sorry, but it looks like you are unable to reset your password in your default browser.',
        )
      }
    });
  }

  handleSignIn() {
    //prevent red screen of death thrown by a console.error in javascript-client
    /* eslint-disable no-console */
    console.reportErrorsAsExceptions = false
    this.props.signIn(this.state.login, this.state.password)
  }

  render() {
    const signInDisabled = ( (this.state.login === '') || (this.state.password ===  '') ? true : false )

    return (
      <View style={styles.container}>
        <NavBar showLogo={true} showDrawer={false} />
        <View style={styles.signInContainer}>
          <Button
            handlePress={this.handleRegistration}
            text={'REGISTER FOR ACCOUNT'} />
          <View style={styles.lined}>
            <View style={styles.lineThrough} />
            <Text style={styles.centerText}>OR</Text>
            <View style={styles.lineThrough} />
          </View>

          <StyledText
            textStyle={'headerText'}
            text={'SIGN IN'} />
          <Input
            labelText={'Username or Email Address'}
            handleOnChangeText={(login) => this.setState({login})} />
          <Input
            labelText={'Password'}
            passwordField={true}
            handleOnChangeText={(password) => this.setState({password})} />
          <StyledText
            textStyle={'errorMessage'}
            text={ this.props.errorMessage } />
          <TouchableOpacity
            onPress={this.handleResetPassword}>
            <StyledText
              textStyle={'link'}
              text={ 'Forget your password?' } />
          </TouchableOpacity>

          <Button
            handlePress={this.handleSignIn}
            disabled={signInDisabled}
            text={'Sign In'} />
        </View>
        { this.props.isFetching ? <OverlaySpinner /> : null }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  signInContainer: {
    backgroundColor: 'white',
    margin: 30,
    paddingLeft: 15,
    paddingRight: 15,
  },
  lined: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineThrough: {
    flex: 1,
    height: 1,
    backgroundColor: 'black'
  },
  centerText: {
    margin: 20
  }
});

SignIn.propTypes = {
  isFetching: React.PropTypes.bool.isRequired,
  signIn: React.PropTypes.func.isRequired,
  errorMessage: React.PropTypes.string
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn)
