import React from 'react'
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';
import { signIn, continueAsGuest } from '../actions/auth'
import { connect } from 'react-redux';
import Button from './Button'
import Input from './Input'
import NavBar from './NavBar'
import OverlaySpinner from './OverlaySpinner'
import StyledText from './StyledText'
import { Actions } from 'react-native-router-flux'

const mapStateToProps = (state) => ({
  isFetching: state.main.isFetching,
  errorMessage: state.main.errorMessage,
})

const mapDispatchToProps = (dispatch) => ({
  signIn(login, password) {
    dispatch(signIn(login, password))
  },
  continueAsGuest() {
    dispatch(continueAsGuest())
  },
})

export class SignIn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {login: '', password: ''}
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleResetPassword = this.handleResetPassword.bind(this)
    this.handleSignIn = this.handleSignIn.bind(this)
    this.continueAsGuest = this.continueAsGuest.bind(this)
  }

  handleRegistration() {
    Actions.Register()
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

  continueAsGuest() {
    this.props.continueAsGuest()
  }

  static renderNavigationBar() {
    return <NavBar showLogo={true} showDrawer={false} />;
  }

  render() {
    const signInDisabled = ( (this.state.login === '') || (this.state.password ===  '') ? true : false )
    const continueTinted = !signInDisabled

    const errorMessage =
      <StyledText
      textStyle={'errorMessage'}
      text={ this.props.errorMessage } />

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <View style={styles.signInContainer}>
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
            { this.props.errorMessage ? errorMessage : null }
            <TouchableOpacity
              onPress={this.handleResetPassword} style={styles.forgotPasswordContainer}>
              <StyledText
                textStyle={'link'}
                text={ 'Forget your password?' } />
            </TouchableOpacity>

            <Button
              handlePress={this.handleSignIn}
              disabled={signInDisabled}
              buttonStyle={ signInDisabled ? 'disabledButton' : null }
              text={'Sign In'} />

            <View style={styles.lined}>
              <View style={styles.lineThrough} />
              <Text style={styles.centerText}>OR</Text>
              <View style={styles.lineThrough} />
            </View>

            <Button
              handlePress={this.continueAsGuest}
              buttonStyle={ continueTinted ? 'disabledButton' : null }
              text={'Continue without signing in'} />

            <Button
              handlePress={this.handleRegistration}
              buttonStyle={'registerButton'}
              text={'Register for account'} />
          </View>
        </ScrollView>
        { this.props.isFetching ? <OverlaySpinner /> : null }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
  },
  signInContainer: {
    backgroundColor: 'transparent',
    margin: 30,
    marginTop: 20,
    paddingLeft: 15,
    paddingRight: 15,
  },
  lined: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    marginTop: 20,
    marginBottom: 10
  },
  lineThrough: {
    flex: 1,
    height: 1,
    backgroundColor: 'black'
  },
  centerText: {
    height: 20,
    lineHeight: 20,
    margin: 20
  },
  forgotPasswordContainer: {
    paddingTop: 10,
    paddingBottom: 10
  }
});

SignIn.propTypes = {
  isFetching: PropTypes.bool,
  signIn: PropTypes.func,
  continueAsGuest: PropTypes.func,
  errorMessage: PropTypes.string
}
export default connect(mapStateToProps, mapDispatchToProps)(SignIn)