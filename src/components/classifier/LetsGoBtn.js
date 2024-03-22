import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const LetsGoBtn = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.text}>Let’s Go!</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#005D69',
    height: 40,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',

    
    // paddingVertical: 10,
    // paddingHorizontal: 20,
    // shadowColor: 'rgba(0, 0, 0, 0.4)', // Shadow color likely needs to be black with some opacity
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 5,
    // elevation: 6, // Elevation for Android shadow
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',

    
  },
});

export default LetsGoBtn;
