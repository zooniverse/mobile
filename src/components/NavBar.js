import React, { Component } from 'react';
import {
  Image,
  Platform,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

import UserAvatar from './UserAvatar'
import CircleRibbon from './CircleRibbon'
import FontedText from './common/FontedText'

import theme from '../theme'
import { DrawerActions } from '@react-navigation/native';

const mapStateToProps = (state) => {
  const { pageShowing, pageSettings } = state.navBar
  const navbarSettings = pageSettings[pageShowing]

  if ( ! navbarSettings ) {
    return {user: state.user,}
  }

  return {
    user: state.user,
    title: navbarSettings.title,
    showBack: navbarSettings.showBack,
    showIcon: navbarSettings.showIcon,
    hamburgerMenuShowing: navbarSettings.hamburgerMenuShowing,
    centerType: navbarSettings.centerType,
    backgroundColor: navbarSettings.backgroundColor,
  }
}

export class NavBar extends Component {
  constructor(props) {
    super(props)
    this.handleOnBack = this.handleOnBack.bind(this)
  }

  handleOnBack(){
    if (this.props.onBack) {
      this.props.onBack()
    } else {
      this.props.navigation.goBack();
    }
  }

  handleSideDrawer() {
    this.props.navigation.dispatch(DrawerActions.openDrawer())
  }

  render() {
    const userAvatar = ( this.props.user.avatar === undefined ? null : this.props.user.avatar.src )

    const avatar =
      <View style={styles.userAvatarContainer}>
        <UserAvatar avatar={ userAvatar } isGuestUser={ this.props.user.isGuestUser } />
        <CircleRibbon />
      </View>

    const CenterContainer = () => {
      let centerElement = null;
      if ('title' === this.props.centerType){
        centerElement = 
          <FontedText style={styles.title} numberOfLines={1}>
            { this.props.title }
          </FontedText>
      } else if ('logo' === this.props.centerType) {
        centerElement = <Image source={require('../../images/logo.png')} style={styles.logo} />
      }

      return (
        <View style={styles.centerContainer}>
          {centerElement}
        </View>
      );
    };

    const LeftContainer = ({isActive, showIcon}) => {
      const colorStyle = isActive ? {} : styles.disabledIcon

      if (showIcon) {
        return (
          <View>
            <Image
              source={require('../../images/zooni-nav-logo.png')}
              style={styles.navIcon}
            />
          </View>
        )
      }
      
      return (
        <View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.handleOnBack}
            disabled={!isActive}
          >
            <Icon name="chevron-left" style={[styles.leftIcon, styles.icon, colorStyle]} />
          </TouchableOpacity>
        </View>
      )
    }

    const RightContainer = ({ isActive }) => {
      const colorStyle = isActive ? {} : styles.disabledIcon
      return (
        <View>
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={this.handleSideDrawer.bind(this)}
            disabled={!isActive}
          >
            <Icon name="bars" style={[styles.icon, styles.rightIcon, colorStyle]} />
          </TouchableOpacity>
        </View>
      );
    }

    return (
        <View style={[styles.navBarContainer]}>
          <View style={[styles.navBar, { backgroundColor: this.props.backgroundColor }]}>
          <LeftContainer isActive={this.props.showBack} showIcon={this.props.showIcon} />
            <CenterContainer />
            <RightContainer isActive={this.props.hamburgerMenuShowing} />
          </View>
          <View>
            { this.props.centerType === 'avatar' ? avatar : null }
          </View>
        </View>
    );
  }
}

const navBarHeight = 62
const navBarPadding = 24

const styles = EStyleSheet.create({
  navBarContainer: {
    flexDirection: 'column',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: navBarPadding,
    height: navBarHeight
  },
  centerContainer: {
    flex: 1,
  },
  leftIcon: {
    paddingLeft: 25,
    paddingRight: 15,
    fontSize: 26
  },
  rightIcon: {
    paddingLeft: 15,
    paddingRight: 25,
    alignContent: 'flex-end',
    fontSize: 26
  },
  icon: {
    backgroundColor: '$transparent',
    color: '$textColor',
  },
  navIcon: {
    width: 22,
    height: 22,
    color: '#fff',
    marginLeft: 16,
    alignSelf: 'center',
    marginTop: 4,
  },
  title: {
    color: '$textColor',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28
  },
  logo: {
    flex: 1,
    width: '70%',
    resizeMode: 'contain',
    alignSelf: 'center'
  },
  userAvatarContainer: {
    flex: 1,
    marginTop: -25,
    alignSelf: 'center',
    alignItems: 'center',
    height: 86
  },
  disabledIcon: {
    color: '$transparent'
  },
})

NavBar.propTypes = {
  showLogo: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showBack: PropTypes.bool,
  showIcons: PropTypes.bool,
  hamburgerMenuShowing: PropTypes.bool,
  onBack: PropTypes.func,
  user: PropTypes.object,
  title: PropTypes.string,
  backgroundColor: PropTypes.string,
  centerType: PropTypes.oneOf(['title', 'logo', 'avatar']),
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
  }).isRequired
}
NavBar.defaultProps = {
  backgroundColor: theme.$zooniverseTeal,
  centerType: 'title',
  hamburgerMenuShowing: false,
  showAvatar: false,
  showBack: false,
  showIcon:  false,
  showLogo: false,
  title: '',
}

export default connect(mapStateToProps)(NavBar)
