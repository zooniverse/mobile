import React from 'react';
import { Text, StyleSheet } from 'react-native';

import PropTypes from 'prop-types';

import { convertTimestampReadable } from '../../notifications/helpers';

function Timestamp({ timestamp }) {
  return (
    <>
      <Text style={styles.separator}>•</Text>
      <Text style={styles.timestamp}>
        {convertTimestampReadable(timestamp)}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  separator: {
    fontSize: 16,
    paddingBottom: 2,
    marginLeft: 2,
    marginRight: 2,
  },
  timestamp: {
    fontSize: 11,
    lineHeight: 12.89,
    color: '#5C5C5C',
  },
});

Timestamp.propTypes = {
  timestamp: PropTypes.string.isRequired,
};

export default Timestamp;
