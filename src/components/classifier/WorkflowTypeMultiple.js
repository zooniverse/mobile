import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ClassifyQuestion from './ClassifyQuestion';
import { useSelector } from 'react-redux';
import reactotron from 'reactotron-react-native';

function WorkflowTypeMultiple({ task }) {
  const { subject } = useSelector((state) => state.classifier);
  reactotron.log({subject})

  return (
    <View style={styles.container}>
      <ClassifyQuestion question={task?.question} />

      <Text>Multiple</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});

export default WorkflowTypeMultiple;
