import React from 'react';
import { StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

import PropTypes from 'prop-types';
import DeviceInfo from 'react-native-device-info';

import SizedMarkdown from '../common/SizedMarkdown';

function ButtonAnswer({ selected, text, onPress, fullWidth }) {
  const isTablet = DeviceInfo.isTablet();

  // Handles height, width, and color of button depending on device and state.
  const backgroundColor = selected ? '#005D69' : 'rgba(255, 255, 255, 0.8)';
  let adtlStyles = { backgroundColor };
  if (fullWidth) {
    adtlStyles.minHeight = isTablet ? 72 : 40;
  } else {
    adtlStyles.height = isTablet ? 72 : 40;
  }
  const buttonStyles = [
    styles.container,
    fullWidth ? styles.fullContainer : styles.halfContainer,
    adtlStyles,
  ];
  const color = selected ? '#fff' : '#005D69';

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress}>
      <SizedMarkdown style={{...styles.text, color}} forButton={true}>{text}</SizedMarkdown>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#00979D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullContainer: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  halfContainer: {
    width: Dimensions.get('window').width / 2 - 20,
    maxWidth: 270,
  },
  text: {
    fontWeight: '400',
    fontSize: 18,
    lineHeight: 21.04,
  },
});

ButtonAnswer.propTypes = {
  selected: PropTypes.bool,
  text: PropTypes.string,
  onPress: PropTypes.func,
  fullWidth: PropTypes.bool,
};

export default ButtonAnswer;
