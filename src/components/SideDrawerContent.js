import React, {Component} from 'react';
import {Alert, Image, Linking, TouchableOpacity, View} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
// import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import FontedText from './common/FontedText';
import Separator from './common/Separator';
import {signOut} from '../actions/auth';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {DrawerActions} from '@react-navigation/native';

const mapStateToProps = state => ({
  user: state.user,
  isGuestUser: state.user.isGuestUser,
});

const mapDispatchToProps = dispatch => ({
  signOut(navigation) {
    dispatch(signOut(navigation));
  },
});

export class SideDrawerContent extends Component {
  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.goHome = this.goHome.bind(this);
    this.signOut = this.signOut.bind(this);
    this.goToAbout = this.goToAbout.bind(this);
    this.goToPublications = this.goToPublications.bind(this);
    this.settings = this.settings.bind(this);
    this.signIn = this.signIn.bind(this);
  }
  close() {
    // Actions.drawerClose();
    this.props.navigation.dispatch(DrawerActions.closeDrawer());
  }

  goHome() {
    console.log('drawer props', this.props.navigation);
    this.close();
    // Actions.reset('ZooniverseApp')
    this.props.navigation.navigate('ZooniverseApp', {refresh: true});
  }

  signIn() {
    this.close();
    // Actions.SignIn()
    this.props.navigation.navigate('SignIn');
  }

  signOut() {
    this.close();
    this.props.signOut(this.props.navigation);
  }

  goToAbout() {
    this.close();
    // Actions.About()
    this.props.navigation.navigate('About');
  }

  goToPublications() {
    this.close();
    // Actions.Publications()
    this.props.navigation.navigate('Publications');
  }

  settings() {
    this.close();
    // Actions.Settings()
    this.props.navigation.navigate('Settings');
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../images/logo.png')}
            style={styles.logoStyle}
          />
          <TouchableOpacity onPress={this.close}>
            <SimpleLineIcons name="close" style={styles.closeIcon} />
          </TouchableOpacity>
        </View>

        <Separator color="white" style={styles.separatorPadding} />

        <MenuButton onPress={this.goHome} text={'Home'} />

        {this.props.isGuestUser ? (
          <MenuButton onPress={this.signIn} text={'Sign In / Register'} />
        ) : null}

        <MenuButton onPress={this.goToAbout} text={'About'} />

        <MenuButton onPress={this.goToPublications} text={'Publications'} />

        <MenuButton onPress={this.settings} text={'Settings'} />

        <FontedText style={styles.connextText}>CONNECT</FontedText>

        <View style={styles.socialMediaContainer}>
          <SocialMediaLink
            mediaLink="https://twitter.com/the_zooniverse"
            iconName="twitter"
          />
          <SocialMediaLink
            mediaLink="http://www.facebook.com/therealzooniverse"
            iconName="facebook-f"
          />
          <SocialMediaLink
            mediaLink="http://dailyzooniverse.tumblr.com/"
            iconName="tumblr"
          />
          <SocialMediaLink
            mediaLink="https://plus.google.com/+ZooniverseOrgReal/"
            iconName="google-plus"
          />
        </View>

        <View style={styles.signOutView}>
          {this.props.isGuestUser ? null : (
            <MenuButton onPress={this.signOut} text={'Sign Out'} />
          )}
        </View>
      </View>
    );
  }
}

const MenuButton = ({onPress, text}) => (
  <View style={styles.linkContainer}>
    <TouchableOpacity onPress={onPress}>
      <FontedText style={styles.menuButtonText}>{text}</FontedText>
    </TouchableOpacity>
  </View>
);

const SocialMediaLink = ({mediaLink, iconName}) => (
  <TouchableOpacity onPress={() => openSocialMediaLink(mediaLink)}>
    <Icon name={iconName} style={styles.socialMediaIcon} />
  </TouchableOpacity>
);

const openSocialMediaLink = link => {
  Linking.canOpenURL(link).then(supported => {
    if (supported) {
      Linking.openURL(link);
    } else {
      Alert.alert(
        'Error',
        'Sorry, but it looks like you are unable to open the link ' +
          link +
          ' in your default browser.',
      );
    }
  });
};

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,93,105,1)',
    flex: 1,
    paddingTop: 15,
    paddingLeft: 25,
    zIndex: 200,
  },
  icon: {
    color: '$zooniverseTeal',
    fontSize: 24,
    padding: 10,
  },
  linkContainer: {
    paddingTop: 17.5,
    paddingBottom: 17.5,
  },
  menuButtonText: {
    fontSize: 22,
    color: 'white',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: -15,
  },
  socialMediaIcon: {
    color: 'white',
    fontSize: 18,
    marginHorizontal: 15,
  },
  signOutView: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 18.5,
  },
  logoContainer: {
    marginVertical: 25,
    marginRight: 25,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logoStyle: {
    width: 125,
    height: 15,
    resizeMode: 'contain',
  },
  closeIcon: {
    fontSize: 20,
    color: 'white',
  },
  separatorPadding: {
    marginBottom: 18,
  },
  connextText: {
    marginTop: 45,
    marginBottom: 25,
    color: 'white',
    fontWeight: 'bold',
  },
});

MenuButton.propTypes = {
  onPress: PropTypes.func,
  text: PropTypes.string,
};

SocialMediaLink.propTypes = {
  mediaLink: PropTypes.string,
  iconName: PropTypes.string,
};

SideDrawerContent.propTypes = {
  user: PropTypes.object,
  isGuestUser: PropTypes.bool,
  signOut: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SideDrawerContent);
