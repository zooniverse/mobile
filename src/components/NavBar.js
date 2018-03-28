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

const mapStateToProps = (state, ownProps) => ({
  user: state.user,
  dynamicTitle: state.navBar.titles[ownProps.pageKey],
  dynamicColor: state.navBar.backgroundColors[ownProps.pageKey]
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
          <FontedText style={styles.title} numberOfLines={1}>
            { this.props.title !== undefined ? this.props.title : this.props.dynamicTitle }
        </FontedText>
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

    const dynamicColorStyle = this.props.dynamicColor !== undefined ? {backgroundColor: this.props.dynamicColor} : null
    return (
        <View style={[styles.navBarContainer]}>
          <View style={[styles.navBar, dynamicColorStyle]}>
            <LeftContainer isActive={this.props.showBack} />
            <CenterContainer shouldShowTitle={!this.props.showLogo && !this.props.showAvatar} shouldShowLogo={this.props.showLogo} />
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
  },
  navBar: {
    backgroundColor: '$headerColor',
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
    alignItems: 'center'
  },
  disabledIcon: {
    color: '$transparent'
  },
  totalClassifications: {
    color: '$darkTextColor',
  },
  userName: {
    color: '$darkTextColor',
    fontWeight: 'bold'
  },
})

NavBar.propTypes = {
  showLogo: PropTypes.bool,
  showAvatar: PropTypes.bool,
  showBack: PropTypes.bool,
  showDrawer: PropTypes.bool,
  onBack: PropTypes.func,
  user: PropTypes.object,
  title: PropTypes.string,
  dynamicTitle: PropTypes.string,
  dynamicColor: PropTypes.string,
  pageKey: PropTypes.string
}
NavBar.defaultProps = {
  showLogo: false,
  showAvatar: false,
  showBack: false,
  showDrawer: true,
  title: undefined
}

export default connect(mapStateToProps)(NavBar)
