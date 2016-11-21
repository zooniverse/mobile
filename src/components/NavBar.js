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
import UserAvatar from './UserAvatar'
import CircleRibbon from './CircleRibbon'

const topPadding = (Platform.OS === 'ios') ? 22 : 10
const height = 48 + topPadding

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
    Actions.refresh({key: 'drawer', open: true })
  }

  render() {
    const containerHeight = (this.props.showAvatar ? height + 70 : height )
    const logo = <Image source={require('../../images/logo.png')} style={styles.logo} />
    const userAvatar = ( this.props.user.avatar === undefined ? null : this.props.user.avatar.src )

    const avatar =
      <View style={styles.userAvatarContainer}>
        <UserAvatar avatar={ userAvatar }/>
        <CircleRibbon />
      </View>

    const title =
      <Text style={styles.title}>
        { this.props.title }
      </Text>

    const back =
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={this.handleOnBack}
        style={styles.leftIcon}>
        <Icon name="angle-left" style={styles.icon} />
      </TouchableOpacity>

    const drawer =
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={this.handleSideDrawer.bind(this)}
        style={styles.rightIcon}>
        <Icon name="bars" style={[styles.icon, styles.iconBar]} />
      </TouchableOpacity>

    return (
      <View style={[styles.navBarContainer, {height: containerHeight}]}>
        <View style={styles.navBar}>
          { this.props.showBack ? back : null }
          { this.props.title ? title : null }
          { this.props.showLogo ? logo : null }
          { this.props.showDrawer ? drawer : null }
        </View>
        { this.props.showAvatar ? avatar : null }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  navBarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  navBar: {
    backgroundColor: '$headerColor',
    alignItems: 'center',
    justifyContent: 'center',
    height: height,
    paddingBottom: 10,
    paddingTop: topPadding,
  },
  leftIcon: {
    position: 'absolute',
    left: 5,
    top: topPadding - 2
  },
  rightIcon: {
    position: 'absolute',
    right: 10,
    top: topPadding,
  },
  icon: {
    backgroundColor: '$transparent',
    color: '$textColor',
    fontSize: 30,
    width: 40,
    padding: 10
  },
  iconBar: {
    fontSize: 24
  },
  title: {
    color: '$textColor',
    fontFamily: 'OpenSans-Semibold',
    fontSize: 20,
    lineHeight: 30
  },
  logo: {
    width: '40%',
    height: 50,
    resizeMode: 'contain',
    position: 'relative',
    top: 5
  },
  userAvatarContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: topPadding + 20,
    left: 60,
    right: 60,
  }
})

NavBar.propTypes = {
  showLogo: React.PropTypes.bool,
  showAvatar: React.PropTypes.bool,
  showBack: React.PropTypes.bool,
  showDrawer: React.PropTypes.bool,
  user: React.PropTypes.object,
  title: React.PropTypes.string,
}
NavBar.defaultProps = {
  showLogo: false,
  showAvatar: false,
  showBack: false,
  showDrawer: true
}

export default connect(mapStateToProps)(NavBar)
