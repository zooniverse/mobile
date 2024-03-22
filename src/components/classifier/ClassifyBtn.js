import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

function ClassifyBtn({ text, onPress, leftBtn = false }) {
  const marginRight = leftBtn ? 8 : 0;
  return (
    <TouchableOpacity
      style={[styles.btnContainer, { marginRight }]}
      onPress={onPress}
    >
      <Text numberOfLines={1} style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btnContainer: {
    borderWidth: 0.5,
    borderColor: '#00979D',
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    // width: '50%'
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 21.04,
    color: '#005D69',
  },
});

export default ClassifyBtn;
