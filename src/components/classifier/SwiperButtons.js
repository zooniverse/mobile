import React from 'react';
import { View, StyleSheet } from 'react-native';
import ClassifyBtn from './ClassifyBtn';
import reactotron from 'reactotron-react-native';

function SwiperButtons() {
  return (
    <View style={styles.container}>
      <ClassifyBtn text="No" onPress={() => reactotron.log('no')} leftBtn />
      <ClassifyBtn text="Yes" onPress={() => reactotron.log('Yes')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
  },
});

export default SwiperButtons;
