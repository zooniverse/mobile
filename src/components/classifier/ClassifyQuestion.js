import React from 'react';
import { View, StyleSheet } from 'react-native';
import FontedText from '../common/FontedText';

function ClassifyQuestion({ question }) {
  return (
    <View style={styles.container}>
      <FontedText>{question}</FontedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // height: '20%',
    // borderWidth: 1,
    height: 100,
    justifyContent: 'center',
    padding: 16,
  },
});

export default ClassifyQuestion;
