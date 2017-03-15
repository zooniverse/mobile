import React, { Component } from 'react'
import {
  Alert,
  Linking,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'
import StyledText from './StyledText'
import { signOut } from '../actions/auth'
import { connect } from 'react-redux'
import GoogleAnalytics from 'react-native-google-analytics-bridge'

const mapStateToProps = (state) => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser
})

const mapDispatchToProps = (dispatch) => ({
  signOut() {
    dispatch(signOut())
  },
})

export class SideDrawerContent extends Component {
  constructor(props) {
    super(props)
    this.close = this.close.bind(this)
    this.goHome = this.goHome.bind(this)
    this.signOut = this.signOut.bind(this)
    this.goToAbout = this.goToAbout.bind(this)
    this.goToPublications = this.goToPublications.bind(this)
    this.settings = this.settings.bind(this)
    this.signIn = this.signIn.bind(this)
  }

  close() {
    //Timeout used due to open issue:  https://github.com/aksonov/react-native-router-flux/issues/1125
    setTimeout(() => Actions.refresh({key: 'drawer', open: false }), 0)
  }

  goHome(){
    this.close()
    Actions.ZooniverseApp()
  }

  signIn(){
    this.close()
    Actions.SignIn()
  }

  signOut(){
    this.close()
    this.props.signOut()
  }

  goToAbout(){
    this.close()
    Actions.About()
  }

  goToPublications(){
    this.close()
    Actions.Publications()
  }

  settings(){
    this.close()
    Actions.Settings()
  }

  openSocialMediaLink(link) {
    GoogleAnalytics.trackEvent('view', link)

    Linking.canOpenURL(link).then(supported => {
      if (supported) {
        Linking.openURL(link);
      } else {
        Alert.alert(
          'Error', 'Sorry, but it looks like you are unable to open the link ' + link + ' in your default browser.',
        )
      }
    });
  }

  render() {
    const signIn =
      <TouchableOpacity onPress={this.signIn} style={styles.linkContainer}>
        <StyledText
          textStyle={'largeLink'}
          text={ 'Sign In / Register' } />
      </TouchableOpacity>

    const signOut =
      <TouchableOpacity onPress={this.signOut} style={styles.linkContainer}>
        <StyledText
          textStyle={'largeLink'}
          text={ 'Sign Out' } />
      </TouchableOpacity>

    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.5}
          onPress={this.close}
          style={styles.closeIcon}>
          <Icon name="times" style={styles.icon} />
        </TouchableOpacity>

        <TouchableOpacity onPress={this.goHome} style={styles.linkContainer}>
          <StyledText
            textStyle={'largeLink'}
            text={'Home'} />
        </TouchableOpacity>

        { this.props.isGuestUser ? signIn : null }

        <TouchableOpacity onPress={this.goToAbout} style={styles.linkContainer}>
          <StyledText
            textStyle={'largeLink'}
            text={'About'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={this.goToPublications} style={styles.linkContainer}>
          <StyledText
            textStyle={'largeLink'}
            text={'Publications'} />
        </TouchableOpacity>

        <TouchableOpacity onPress={this.settings} style={styles.linkContainer}>
          <StyledText
            textStyle={'largeLink'}
            text={'Settings'} />
        </TouchableOpacity>

        { this.props.isGuestUser ? null : signOut }


        <View style={styles.socialMediaContainer}>
          <TouchableOpacity onPress={() => this.openSocialMediaLink('https://twitter.com/the_zooniverse')}>
            <Icon name="twitter" style={styles.socialMediaIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.openSocialMediaLink('http://www.facebook.com/therealzooniverse')}>
            <Icon name="facebook-official" style={styles.socialMediaIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.openSocialMediaLink('http://dailyzooniverse.tumblr.com/')}>
            <Icon name="tumblr" style={styles.socialMediaIcon} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => this.openSocialMediaLink('https://plus.google.com/+ZooniverseOrgReal/')}>
            <Icon name="google-plus" style={styles.socialMediaIcon} />
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80
  },
  closeIcon: {
    position: 'absolute',
    right: 5,
    top: 24
  },
  icon: {
    color: '$headerColor',
    fontSize: 24,
    padding: 10
  },
  linkContainer: {
    paddingLeft: 25,
    paddingTop: 8,
    paddingBottom: 8
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: 15,
    paddingLeft: 15
  },
  socialMediaIcon: {
    color: '$darkTextColor',
    fontSize: 18,
    padding: 12,
  }
});

SideDrawerContent.propTypes = {
  user: React.PropTypes.object,
  isGuestUser: React.PropTypes.bool,
  signOut: React.PropTypes.func
}

export default connect(mapStateToProps, mapDispatchToProps)(SideDrawerContent)
