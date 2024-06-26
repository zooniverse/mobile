import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';

import PropTypes from 'prop-types';
import { Shadow } from 'react-native-shadow-2';

function PaginateDot({ onPress, active = false }) {
  const overrides = active ? styles.activeDot : styles.inactiveDot;

  /**
   * React Native does not handle shadows very well for Android.
   * In order to match the designs I used the react-native-shadow-2 library
   * but it will only be applied to Android. iOS will use
   * standard shadow styling.
   */
  const DotContainer = ({ children }) => {
    return Platform.OS === 'android' && active ? (
      <Shadow
        distance={4}
        startColor="rgba(0, 93, 105, .4)"
        offset={[0, 0]}
        paintInside={true}
      >
        {children}
      </Shadow>
    ) : (
      children
    );
  };
  return (
    <TouchableOpacity onPress={onPress} style={styles.dotContainer}>
      <DotContainer>
        <View style={[styles.dot, overrides]} />
      </DotContainer>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    ...Platform.select({
      ios: {
        shadowColor: '#005D69',
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
    backgroundColor: '#fff',
  },
  dotContainer: {
    marginTop: 8,
    marginHorizontal: 10,
  },
  inactiveDot: {
    borderWidth: 0.5,
    borderColor: '#272727',
  },
});

PaginateDot.propTypes = {
  onPress: PropTypes.bool,
  active: PropTypes.bool,
  children: PropTypes.node,
};
export default PaginateDot;
