import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import PaginateDot from './PaginateDot';

function ClassifyTutorialDots({
  tutorialIndex,
  setTutorialIndex,
  count,
  swiperRef,
}) {

  return (
    <View style={styles.container}>
      {count.map((_, i) => (
        <PaginateDot
          key={i}
          active={tutorialIndex === i}
          onPress={() => {
            swiperRef.current.scrollBy(i);
            // setTutorialIndex(i);
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
  },
});

export default ClassifyTutorialDots;
