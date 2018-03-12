import React, { Component } from 'react';
import {
  Image,
  Platform,
  Text,
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

const mapStateToProps = (state) => ({
  user: state.user,
})

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

    const CenterContainer = ({shouldShowTitle, shouldShowLogo}) => {
      let centerElement = null;
      if (shouldShowTitle){
        centerElement = 
          <Text style={styles.title} numberOfLines={1}>
            { this.props.title }
        </Text>
      } else if (shouldShowLogo) {
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
        <View style={styles.navBar}>
          <LeftContainer isActive={this.props.showBack} />
          <CenterContainer shouldShowTitle={this.props.title} shouldShowLogo={this.props.showLogo} />
          <RightContainer isActive={this.props.showDrawer} />
        </View>
        <View>
          { this.props.showAvatar ? avatar : null }
        </View>
      </View>
    );
  }
}

const navBarHeight = (Platform.OS === 'ios') ? 74 : 62
const navBarPadding = (Platform.OS === 'ios') ? 36 : 24

const styles = EStyleSheet.create({
  navBarContainer: {
    flexDirection: 'column',
    height: navBarHeight
  },
  navBar: {
    backgroundColor: '$headerColor',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: navBarPadding,
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
    fontFamily: 'OpenSans-Semibold',
    fontSize: 20,
    lineHeight: 30,
    textAlign: 'center',
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
    alignItems: 'center'
  },
  disabledIcon: {
    color: '$transparent'
  }
})

NavBar.propTypes = {
  showLogo: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showBack: PropTypes.bool,
  showDrawer: PropTypes.bool,
  onBack: PropTypes.func,
  user: PropTypes.object,
  title: PropTypes.string,
}
NavBar.defaultProps = {
  showLogo: false,
  showAvatar: false,
  showBack: false,
  showDrawer: true
}

export default connect(mapStateToProps)(NavBar)
