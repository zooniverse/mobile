import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

function Tabs({ showTaskTab, setShowTaskTab }) {
  const TaskTab = () => {
    const backgroundColor = showTaskTab ? '#EBEBEB' : '#CBCCCB';
    const fontWeight = showTaskTab ? '700' : '500';
    return (
      <TouchableOpacity
        style={[styles.tab, styles.tabLeft, { backgroundColor }]}
        onPress={() => setShowTaskTab(true)}
      >
        <FontAwesome
          name="pencil-square-o"
          size={18}
          color="#005D69"
          style={styles.icon}
        />
        <Text style={[styles.text, { fontWeight }]}>TASK</Text>
      </TouchableOpacity>
    );
  };
  const TutorialTab = () => {
    const backgroundColor = !showTaskTab ? '#EBEBEB' : '#CBCCCB';
    const fontWeight = !showTaskTab ? '700' : '500';

    return (
      <TouchableOpacity
        style={[styles.tab, styles.tabRight, { backgroundColor }]}
        onPress={() => setShowTaskTab(false)}
      >
        <FontAwesome
          name="question-circle-o"
          size={18}
          color="#005D69"
          style={styles.icon}
        />
        <Text style={[styles.text, { fontWeight }]}>TUTORIAL</Text>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <TaskTab />
      <TutorialTab />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 44,
  },
  icon: { marginTop: 2 },
  tab: {
    // width: '50%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // borderWidth: 1,
    backgroundColor: 'gray',
    flexDirection: 'row',
  },
  tabLeft: {
    borderTopLeftRadius: 16,
  },
  tabRight: {
    borderTopRightRadius: 16,
  },
  text: {
    // fontWeight: '700',
    fontSize: 16,
    lineHeight: 18.7,
    letterSpacing: 1,
    color: '#005D69',
    marginLeft: 8,
  },
});

export default Tabs;
