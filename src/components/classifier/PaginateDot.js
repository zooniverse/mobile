import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';

import PropTypes from 'prop-types';

function PaginateDot({ onPress, active = false }) {
  const overrides = active ? styles.activeDot : styles.inactiveDot;

  return (
    <TouchableOpacity onPress={onPress} style={styles.dotContainer}>
      <View style={[styles.dot, overrides]} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    shadowColor: '#005D69',

    ...Platform.select({
      android: {
        elevation: 3,
      },
      ios: {
        shadowOpacity: 1,
        shadowRadius: 3,
        shadowOffset: {
          height: 0,
          width: 0,
        },
      },
    }),
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 10,
    backgroundColor: '#fff',
  },
  dotContainer: {
    marginTop: 8,
  },
  inactiveDot: {
    borderWidth: 0.5,
    borderColor: '#272727',
  },
});

PaginateDot.propTypes = {
  onPress: PropTypes.bool,
  active: PropTypes.bool,
};
export default PaginateDot;
