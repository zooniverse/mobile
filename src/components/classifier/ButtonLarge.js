import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';

import FontedText from '../common/FontedText';

function ButtonLarge({ disabled = false, text, onPress }) {

  // Handle button color and height depending on device & state.
  const backgroundColor = disabled
    ? 'rgba(0, 93, 105, 0.3)'
    : 'rgba(0, 93, 105, 1)';
  const isTablet = DeviceInfo.isTablet();
  const btnStyles = [styles.container, { backgroundColor, height: isTablet ? 44 : 40  }]

  const ButtonText = () => <FontedText style={styles.text}>{text}</FontedText>;
  return disabled ? (
    <View style={btnStyles}>
      <ButtonText />
    </View>
  ) : (
    <TouchableOpacity
      style={btnStyles}
      onPress={onPress}
    >
      <ButtonText />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    borderWidth: 0.5,
    borderColor: '#ffffff',
    backgroundColor: '#005D69',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  text: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 21.04,
    color: '#fff',
  },
});

ButtonLarge.propTypes = {
  disabled: PropTypes.bool,
  text: PropTypes.string,
  onPress: PropTypes.func,
};

export default ButtonLarge;
