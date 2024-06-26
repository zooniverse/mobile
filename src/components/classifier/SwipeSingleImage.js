import React from 'react';
import { Image, StyleSheet, TouchableWithoutFeedback } from 'react-native';

import PropTypes from 'prop-types';

const SwipeSingleImage = ({ uri, onExpandButtonPressed }) => {
  return (
    <TouchableWithoutFeedback
      style={styles.container}
      onPress={() => onExpandButtonPressed(uri)}
    >
      <Image
        style={[styles.image, styles.imageShadow]}
        source={{ uri }}
        resizeMethod="resize"
        resizeMode="contain"
      />
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderWidth: 0,
  },
  image: {
    flex: 1,
  },
  imageShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expandButton: {
    padding: 16,
  },
});

SwipeSingleImage.propTypes = {
  uri: PropTypes.string,
  onExpandButtonPressed: PropTypes.bool,
};

export default SwipeSingleImage;
