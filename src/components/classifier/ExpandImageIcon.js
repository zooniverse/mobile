import React from 'react';
import { StyleSheet } from 'react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

function ExpandImageIcon() {
  return <FontAwesome5 name="expand-arrows-alt" size={24} style={styles.iconContainer} />;
}

export default ExpandImageIcon;

const styles = StyleSheet.create({
  iconContainer: {
    color: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
  },
});
