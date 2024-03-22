import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

function PaginateDot({ onPress, active = false }) {
  const overrides = active
    ? {
        shadowColor: '#005D69',
        shadowOpacity: 3,
        shadowRadius: 3,
        shadowOffset: {
          height: 0,
          width: 0,
        },
      }
    : {
        borderWidth: 0.5,
        borderColor: '#272727',
      };
  return (
    <TouchableOpacity onPress={onPress} style={{ marginTop: 8 }}>
      <View
        style={[{
          width: 16,
          height: 16,
          // borderWidth: 0.5,
          // borderColor: '#272727',
          borderRadius: 8,
          marginHorizontal: 10,
          backgroundColor: 'white',

          // shadowColor: '#005D69',
          // shadowOpacity: 3,
          // shadowRadius: 3,
          // shadowOffset: {
          //   height: 0,
          //   width: 0,
          // },
        }, overrides]}
      />
      {/* <FontAwesome
        // key={dotIdx}0
        // solid
        size={18}
        name="circle"
        color="gray"
        style={{ marginHorizontal: 10, color:'white', borderWidth: 1 }}
      /> */}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default PaginateDot;
