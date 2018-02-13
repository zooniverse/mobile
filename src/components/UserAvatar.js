import React, { Component } from 'react';
import {
  Image
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet'
import PropTypes from 'prop-types';


class UserAvatar extends Component {
  render() {
    const guestUserLogo =
      <Image source={require('../../images/simple-avatar.png')} style={styles.avatar} />

    const avatar = (
      <Image
        defaultSource={require('../../images/simple-avatar.png')}
        style={styles.avatar}
        source={
          this.props.avatar
          ? {uri: this.props.avatar}
          : require('../../images/simple-avatar.png') } /> )

    return (
      this.props.isGuestUser ? guestUserLogo : avatar
    )
  }
}

const styles = EStyleSheet.create({
  $size: 86,
  avatar: {
    borderWidth: 1,
    borderColor: 'white',
    width: '$size',
    height: '$size',
    borderRadius: '0.5 * $size',
  },
});

UserAvatar.propTypes = {
  isGuestUser: PropTypes.bool,
  avatar: PropTypes.string
}

export default UserAvatar
