import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import ClassifyQuestion from './ClassifyQuestion';
import reactotron from 'reactotron-react-native';
import { useSelector } from 'react-redux';
import ImageSingle from './ImageSingle';
import ClassifyBtn from './ClassifyBtn';
import { TouchableOpacity } from 'react-native-gesture-handler';

function WorkflowTypeSingle({ task }) {
  const { subject } = useSelector((state) => state.classifier);
  const displays = subject?.displays ?? [];
  const answers = task?.answers ?? [];
  const btnRows = new Array(Math.floor(answers.length / 2)).fill(null);

  return (
    <View style={styles.container}>
      <ClassifyQuestion question={task?.question} />
      <ScrollView>
        <ImageSingle displays={displays} />
        <View
          style={{
            // borderWidth: 1,
            flex: 1,
            // flexWrap: 'wrap',
            // flexDirection: 'row',
            marginHorizontal: 16,
          }}
        >
          {btnRows.map((_, i) => {
            const left = i === 0 ? 0 : i * 2;
            const right = i === 0 ? 1 : i * 2 + 1;
            return (
              <View
                key={i}
                style={{
                  flexDirection: 'row',
                  borderWidth: 0,
                  marginBottom: 8,
                }}
              >
                <ClassifyBtn
                  key={i}
                  text={answers[left]?.label}
                  leftBtn={true}
                />
                {answers[right] && (
                  <ClassifyBtn key={i} text={answers[right]?.label} />
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default WorkflowTypeSingle;
