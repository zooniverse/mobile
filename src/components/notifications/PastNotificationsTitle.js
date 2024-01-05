import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function PastNotificationsTitle() {
  return (
    <View style={styles.pastNotificationsContainer}>
      <Text style={styles.pastNotificationsText}>PAST NOTIFICATIONS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pastNotificationsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 0.25,
    borderColor: '#A6A7A9',
    paddingVertical: 16,
  },
  pastNotificationsText: {
    fontWeight: '700',
    fontSize: 18,
    lineHeight: 21.04,
    color: '#5C5C5C',
  },
});

export default PastNotificationsTitle;
