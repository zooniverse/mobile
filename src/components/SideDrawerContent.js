import React, { Component } from 'react'
import {
  Alert,
  Image,
  Linking,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import Icon from 'react-native-vector-icons/FontAwesome'
import Feather from 'react-native-vector-icons/Feather'
import Fontisto from 'react-native-vector-icons/Fontisto'
import LinearGradient from 'react-native-linear-gradient';
import DeviceInfo from 'react-native-device-info'
import FontedText from './common/FontedText'
import { signOut } from '../actions/auth'
import { connect } from 'react-redux'
import PropTypes from 'prop-types';
import {DrawerActions} from '@react-navigation/native';
import PageKeys from '../constants/PageKeys'
import { withTranslation } from 'react-i18next'

const mapStateToProps = (state) => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser
})

const mapDispatchToProps = (dispatch) => ({
  signOut(navigation) {
    dispatch(signOut(navigation))
  },
})

export class SideDrawerContent extends Component {
  constructor(props) {
    super(props)
    this.close = this.close.bind(this)
    this.goHome = this.goHome.bind(this)
    this.signOut = this.signOut.bind(this)
    this.goToAbout = this.goToAbout.bind(this)
    this.settings = this.settings.bind(this)
    this.signIn = this.signIn.bind(this)
    this.notifications = this.notifications.bind(this)
  }

  close() {
    this.props.navigation.dispatch(DrawerActions.closeDrawer());
  }

  goHome(){
    this.close()
    this.props.navigation.navigate('ZooniverseApp', {refresh: true});
  }

  signIn(){
    this.close()
    this.props.navigation.navigate('SignIn');
  }

  signOut(){
    this.close()
    this.props.signOut(this.props.navigation);
  }

  goToAbout(){
    this.close()
    this.props.navigation.navigate('About');
  }

  settings(){
    this.close()
    this.props.navigation.navigate('Settings');
  }

  notifications() {
    this.close()
    this.props.navigation.navigate(PageKeys.NotificationLandingPageScreen)
  }

  openLink(link) {
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
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../images/logo.png')}
            style={styles.logoStyle} 
          />
          <TouchableOpacity onPress={this.close} >
            <Fontisto name="close" style={styles.closeIcon} />
          </TouchableOpacity>
        </View>
        
        <LinearGradient
          colors={['rgba(0,93,105,1)', '#FFFFFF', 'rgba(0,93,105,1)']}
          style={styles.linearGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        <ScrollView>
        <MenuButton 
            onPress={this.goHome} 
            text={ this.props.t('Mobile.sideMenu.home', 'Home')} 
            />
          
          { this.props.isGuestUser ? 
            <MenuButton 
            onPress={this.signIn} 
            text={ this.props.t('signIn.title', 'Sign In / Register')} 
            /> 
            : null 
          }
          
          <MenuButton 
            onPress={this.goToAbout} 
            text={ this.props.t('Mobile.sideMenu.aboutTheZooniverse', 'About the Zooniverse')} 
          />

          <MenuButton 
            onPress={() => this.openLink('https://www.zooniverse.org/about/publications')} 
            text={ this.props.t('about.index.nav.publications', 'Publications')} 
            externalOpenIcon={true}
          />

          <MenuButton 
            onPress={this.settings} 
            text={ this.props.t('ZooHeader.UserMenu.userNavListLabels.settings', 'Settings')} 
          />

          <MenuButton 
            onPress={this.notifications} 
            text={ this.props.t('ZooHeader.SignedInUserNavigation.navListLabels.notifications_zero', 'Notifications')} 
          />

          <Menuheader title={ this.props.t('ZooFooter.aboutLabels.about', 'about')} />

          <MenuButton 
            onPress={() => this.openLink('https://www.zooniverse.org/privacy')} 
            text={ this.props.t('ZooFooter.policyLabels.privacyPolicy', 'Privacy Policy')} 
            externalOpenIcon={true}
          />

          <MenuButton 
            text={`${this.props.t('Mobile.sideMenu.version', 'Privacy')} ${DeviceInfo.getVersion()}/${DeviceInfo.getBuildNumber()}`}
          />

          <Menuheader title={ this.props.t('Mobile.sideMenu.help', 'HELP')} />

          <MenuButton 
            onPress={() => this.openLink('https://www.zooniverse.org/about/contact')} 
            text={ this.props.t('ZooFooter.aboutLabels.contact', 'Contact Us')} 
            externalOpenIcon={true}
          />

          { this.props.isGuestUser ? null :
            <MenuButton 
              onPress={this.signOut}
              text={ this.props.t('ZooHeader.UserMenu.userNavListLabels.signOut', 'Sign Out')} 
            />
          }
        </ScrollView>
      </View>
    )
  }
}

const Menuheader = ({ title }) => (
  <View>
    <FontedText style={styles.menuHeader}>{title}</FontedText>
  </View>
)

const MenuButton = ({ onPress = false, text, externalOpenIcon = false }) => {
  return onPress ? (
    <TouchableOpacity onPress={onPress} style={styles.linkContainer}>
      <FontedText style={styles.menuButtonText}>
        {text}
      </FontedText>
      {externalOpenIcon && (
        <Feather name="external-link" color="#fff" size={18} style={{marginLeft: 8, marginTop: 4}} />
      )}
    </TouchableOpacity>
  ) : (
      <View style={styles.linkContainer}>
        <FontedText style={styles.menuButtonText}>
          {text}
        </FontedText>
      </View>
  )
}

const SocialMediaLink = ({mediaLink, iconName}) => 
  <TouchableOpacity onPress={() => openSocialMediaLink(mediaLink)}>
    <Icon name={iconName} style={styles.socialMediaIcon} />
  </TouchableOpacity>

const openSocialMediaLink = (link) => {
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


const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,93,105,1)',
    flex: 1,
    paddingLeft: 25,
    zIndex: 200,
  },
  icon: {
    color: '$zooniverseTeal',
    fontSize: 24,
    padding: 10
  },
  linearGradient: {
    height: 1,
    width: '90%',
  },
  linkContainer: {
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButtonText: {
    fontSize: 24,
    lineHeight: 28.06,
    color: '#fff',
  },
  menuHeader: {
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 1.5,
    color: '#fff',
    paddingVertical: 8,
    textTransform: 'uppercase'
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: -15
  },
  socialMediaIcon: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 15,
  },
  signOutView: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 18.5
  },
  logoContainer: {
    marginVertical: 25,
    marginRight: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoStyle: {
    width: '70%',
    height: 20,
    resizeMode: 'contain',
  },
  closeIcon: {
    fontSize: 20,
    color: 'white'
  },
  separatorPadding: {
    marginBottom: 8
  },
  connextText: {
    marginTop: 45,
    marginBottom: 25,
    color: 'white',
    fontWeight: 'bold'
  }
});

MenuButton.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string
}

SocialMediaLink.propTypes = {
  mediaLink: PropTypes.string,
  iconName: PropTypes.string
}

SideDrawerContent.propTypes = {
  user: PropTypes.object,
  isGuestUser: PropTypes.bool,
  signOut: PropTypes.func,
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }).isRequired
}

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(SideDrawerContent))
