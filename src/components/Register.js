import React from 'react'
import {
  Alert,
  Linking,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import PropTypes from 'prop-types';
import EStyleSheet from 'react-native-extended-stylesheet'
import { setState } from '../actions/index'
import { register } from '../actions/auth'
import { connect } from 'react-redux'
import Button from './Button'
import Input from './Input'
import OverlaySpinner from './OverlaySpinner'
import StyledText from './StyledText'
import Checkbox from './Checkbox'
import { any, isEmpty, converge, isNil, or } from 'ramda'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'

import { isValidEmail } from '../utils/is-valid-email'
import { isValidLogin } from '../utils/is-valid-login'
import { Translation } from 'react-i18next';

const mapStateToProps = (state) => ({
  isFetching: state.main.isFetching,
  errorMessage: state.main.errorMessage,
  isConnected: state.main.isConnected,
  registration: state.main.registration
})

const mapDispatchToProps = (dispatch) => ({
  register(navigation) {
    dispatch(register(navigation))
  },
  setField(fieldName, text) {
    dispatch(setState(`registration.${fieldName}`, text))
  },
  setError(errorMessage) {
    dispatch(setState('errorMessage', errorMessage))
  },
  setNavbarSettingsForPage: (settings) => dispatch(setNavbarSettingsForPage(settings, PageKeys.Register))
})

export class Register extends React.Component {
  constructor(props) {
    super(props)
    this.state = {showPasswordText: true}
    this.handleRegister = this.handleRegister.bind(this)
    this.handleOpenPrivacyPolicy = this.handleOpenPrivacyPolicy.bind(this)
  }

  handleRegister() {
    //prevent red screen of death thrown by a console.error in javascript-client
    /* eslint-disable no-console */
    console.reportErrorsAsExceptions = false

    let error  = this.validateForm()
    this.props.setError(error)

    if (!error) {
      this.props.register(this.props.navigation)
    }
  }

  validateForm() {
    const MIN_PASSWORD_LENGTH = 8
    if (!isValidLogin(this.props.registration.login)) {
      return 'User Name can\'t contain spaces, dashes or apostrophes'
    } else if (!isValidEmail(this.props.registration.email)) {
      return 'Email must be valid'
    } else if (this.props.registration.password.length < MIN_PASSWORD_LENGTH) {
      return `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
    } else {
      return null
    }

  }

  handleOpenPrivacyPolicy() {
    const url='https://www.zooniverse.org/privacy'
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert(
          'Error', 'Sorry, but it looks like you are unable to open the privacy policy in your default browser.',
        )
      }
    })
  }

  componentDidMount() {
    const Title = <Translation ns="platform">
      { (t) => (t('AuthModal.RegisterForm.register', 'Register'))}
    </Translation>
    this.props.setNavbarSettingsForPage({
      showHamburgerMenu: false,
      showBack: true,
      title: Title,
      centerType: 'title'
    })
  }

  render() {
    const registerDisabled = any(converge(or, [isEmpty, isNil]), [this.props.registration.login, this.props.registration.password, this.props.registration.email])
    const emailChecked = this.props.registration.global_email_communication

    const errorMessageDisplay =
      <StyledText
        textStyle={'errorMessage'}
        text={ this.props.errorMessage } />

    return (
      <Translation ns="platform">
        { (t) => (
          <View style={styles.container}>
            <ScrollView>
              <View style={styles.registerContainer}>
                <Input
                  labelText={t('AuthModal.RegisterForm.username', 'User Name')}
                  handleOnChangeText={(text) => this.props.setField('login', text)} />
                <Input
                  labelText={t('AuthModal.RegisterForm.email', 'Email Address')}
                  keyboardType={'email-address'}
                  handleOnChangeText={(text) => this.props.setField('email', text)} />

                <View style={styles.rowContainer}>
                  <Input
                    labelText={t('AuthModal.RegisterForm.password', 'Password')}
                    addLabel={'Min 8 chars'}
                    inputStyle={'small'}
                    passwordField={!this.state.showPasswordText}
                    handleOnChangeText={(text) => this.props.setField('password', text)} />

                    <View style={[styles.rowContainer, styles.checkboxRowContainer]}>
                    <Checkbox
                        onSelect={() => this.setState({ showPasswordText: !this.state.showPasswordText })}
                        selected={this.state.showPasswordText} />
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => this.setState({ showPasswordText: !this.state.showPasswordText })}>
                      <StyledText
                        textStyle={'small'}
                        text={ 'Show password' } />
                    </TouchableOpacity>
                    </View>
                </View>

                <Input
                  labelText={t('AuthModal.RegisterForm.realName', 'Real name')}
                  addLabel={'Optional'}
                  subLabelText={t('AuthModal.RegisterForm.realNameHelp', 'We\'ll use this to give you credit in scientific papers, etc.')}
                  handleOnChangeText={(text) => this.props.setField('credited_name', text)} />
                <View style={styles.rowContainer}>
                  <Checkbox
                    onSelect={() => this.props.setField('global_email_communication', !emailChecked)}
                    selected={emailChecked}
                    leftAligned={true}
                  />
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => this.props.setField('global_email_communication', !emailChecked)}>
                    <StyledText
                      textStyle={'small'}
                      text={t('AuthModal.RegisterForm.emailListSignUp', 'It’s okay to send me email occasionally.')}
                    />
                  </TouchableOpacity>
                </View>

                { this.props.errorMessage ? errorMessageDisplay : null }
                <Button
                  handlePress={this.handleRegister}
                  disabled={registerDisabled}
                  buttonStyle={ registerDisabled ? 'disabledRegisterButton' : 'registerButton' }
                  text={t('AuthModal.RegisterForm.register', 'Register')} />

                <View style={styles.privacyPolicyContainer}>
                  <StyledText
                    textStyle={'small'}
                    text={ 'By signing up, I agree to Zooniverse\'s ' }
                  />
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={this.handleOpenPrivacyPolicy}
                    style={styles.touchContainer} >
                    <StyledText
                      textStyle={'smallLink'}
                      text={t('ZooFooter.policyLabels.privacyPolicy', 'Privacy Policy')}
                    />
                  </TouchableOpacity>
                </View>

              </View>
            </ScrollView>
            { this.props.isFetching ? <OverlaySpinner /> : null }
          </View>
        )}
      </Translation>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  registerContainer: {
    flex: 1,
    margin: 20,
    paddingLeft: 10,
    paddingRight: 10,
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  privacyPolicyContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  touchContainer: {
    paddingTop: 3,
    paddingBottom: 15
  }
});

Register.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  register: PropTypes.func.isRequired,
  setField: PropTypes.func.isRequired,
  setError: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  registration: PropTypes.object,
  setNavbarSettingsForPage: PropTypes.func,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
}

export default connect(mapStateToProps, mapDispatchToProps)(Register)
