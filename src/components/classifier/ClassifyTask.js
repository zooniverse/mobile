import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import ClassifyQuestion from './ClassifyQuestion';
import WorkflowTypeSwipe from './WorkflowTypeSwipe';
import WorkflowTypeMultiple from './WorkflowTypeMultiple';
import WorkflowTypeSingle from './WorkflowTypeSingle';
import WorkflowTypeDrawing from './WorkflowTypeDrawing';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import reactotron from 'reactotron-react-native';

function ClassifyTask({ task, workflow }) {
  const WorkflowTypeClassifier = () => {
    reactotron.log({workflow})
    switch (workflow?.type) {
      case 'swipe':
        return <WorkflowTypeSwipe task={task} workflow={workflow} />;
      case 'multiple':
        // return <WorkflowTypeMultiple task={task} />;
        return <WorkflowTypeSingle task={task} />;
      case 'single':
        return <WorkflowTypeSingle task={task} />;
      case 'drawing':
        return <WorkflowTypeDrawing task={task} />;
      default:
        return null;
    }
  };
  return (
    <View style={styles.container}>
      {/* <View style={{ borderWidth: 1, height: '20%' }}>
        <ClassifyQuestion question={task?.question} />
      </View> */}
      <View style={{ borderWidth: 0, flex: 1 }}>
        <WorkflowTypeClassifier />
      </View>
      <View style={{ height: 80, borderWidth: 0, alignItems: 'center', paddingTop: 16, }}>
        <Text style={styles.needHelpTxt}>I NEED HELP WITH THIS TASK</Text>
        <TouchableOpacity
          style={{
            borderWidth: 0.5,
            borderColor: '#00979D',
            borderTopRightRadius: 24,
            borderTopLeftRadius: 24,
            width: 128,

            height: 40,
            position: 'absolute',
            bottom: -8,
            // backgroundColor: '#FFF',
          }}
        >
          <LinearGradient
            colors={['#FFFFFF', '#FFFFFF', '#CBCCCB']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            locations={[0, 0.8201, 1]}
            style={{
              width: '100%',
              height: '100%',
              borderTopRightRadius: 24,
              borderTopLeftRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'row',
            }}
          >
            <Feather name="map" size={16} color="#005D69" />
            <Text
              style={{
                fontWeight: '500',
                fontSize: 12,
                // lineHeight: 10.52,
                letterSpacing: 0.5,
                color: '#005D69',
                marginLeft: 4,
              }}
            >
              FIELD GUIDE
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // borderWidth: 1,
    flex: 1,
  },
  needHelpTxt: {
    fontSize: 12,
    lineHeight: 14.03,
    letterSpacing: 0.5,
    color: '#272727',
  },
});

export default ClassifyTask;
