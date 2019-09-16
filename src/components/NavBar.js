import React, { Component } from 'react';
import {
  Image,
  Platform,
  TouchableOpacity,
  View
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import { connect } from 'react-redux'
import {Actions} from 'react-native-router-flux'
import Icon from 'react-native-vector-icons/FontAwesome'
import PropTypes from 'prop-types';

import UserAvatar from './UserAvatar'
import CircleRibbon from './CircleRibbon'
import FontedText from './common/FontedText'

const mapStateToProps = (state) => {
  const { pageShowing, pageSettings } = state.navBar
  const navbarSettings = pageSettings[pageShowing]
  return {
    user: state.user,
    title: navbarSettings ? navbarSettings.title : '',
    showBack: navbarSettings ? navbarSettings.showBack : false,
    hamburgerMenuShowing: navbarSettings ? navbarSettings.hamburgerMenuShowing : false,
    isPreview: navbarSettings ? navbarSettings.isPreview : false,
    centerType: navbarSettings ? navbarSettings.centerType : 'title'
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
      Actions.pop()
    }
  }

  handleSideDrawer(){
    Actions.drawerOpen()
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

    const LeftContainer = ({isActive}) => {
      const colorStyle = isActive ? {} : styles.disabledIcon
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

    const RightContainer = ({isActive}) => {
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
          <View style={[styles.navBar, selectBackgroundStyle(this.props.isPreview)]}>
            <LeftContainer isActive={this.props.showBack} />
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

const selectBackgroundStyle = (isPreview) => {
  return isPreview ? styles.previewBackgroundColor : styles.defaultBackgroundColor
}

const styles = EStyleSheet.create({
  defaultBackgroundColor: {
    backgroundColor: '$headerColor',
  },
  previewBackgroundColor: {
    backgroundColor: '$testRed'
  },
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
  hamburgerMenuShowing: PropTypes.bool,
  onBack: PropTypes.func,
  user: PropTypes.object,
  title: PropTypes.string,
  isPreview: PropTypes.bool,
  centerType: PropTypes.oneOf(['title', 'logo', 'avatar'])

}
NavBar.defaultProps = {
  showLogo: false,
  showAvatar: false,
  title: undefined
}

export default connect(mapStateToProps)(NavBar)
