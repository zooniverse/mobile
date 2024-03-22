import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import ClassifierHeader from '../../navigation/ClassifierHeader';
import Tabs from './Tabs';
import ClassifyTask from './ClassifyTask';
import ClassifyTutorial from './ClassifyTutorial';
import { getTaskFromWorkflow } from '../../utils/workflow-utils';
import { useSelector } from 'react-redux';
import reactotron from 'reactotron-react-native';

function Classifier({ navigation, route }) {
  reactotron.log('all params', route.params)
  const project = route?.params?.project ?? {};
  const workflow = route?.params?.workflow ?? {};
  const title = route?.params?.display_name ?? '';
  const inPreviewMode = route?.params?.inPreviewMode ?? false;
  const inBetaMode = route?.params?.inBetaMode ?? false;
  const { needsTutorial } = useSelector((state) => state.classifier);
  const wfNeedsTutorial = needsTutorial[workflow?.id] ?? false;
  const task = getTaskFromWorkflow(workflow);

  // needsTutorial: state.classifier.needsTutorial[ownProps.route.params.workflow.id] || false,

  const [showTaskTab, setShowTaskTab] = React.useState(true);

  return (
    <View style={styles.container}>
      <ClassifierHeader title={title} bkgImage={project?.avatar_src} />
      {wfNeedsTutorial ? (
        <View style={styles.innerContainer}>
          <ClassifyTutorial
            workflowId={workflow?.id}
            needsTutorial={true}
            projectId={project?.id}
          />
        </View>
      ) : (
        <View style={[styles.innerContainer, styles.classifyContainer]}>
          <Tabs showTaskTab={showTaskTab} setShowTaskTab={setShowTaskTab} />
          {showTaskTab ? (
            <ClassifyTask task={task} workflow={workflow} />
          ) : (
            <ClassifyTutorial
              workflowId={workflow?.id}
              needsTutorial={false}
              setShowTaskTab={setShowTaskTab}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  classifyContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderTopRightRadius: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 64,
    borderBottomRightRadius: 64,
  },
  container: {
    backgroundColor: '#979797',
    flex: 1,
  },
  innerContainer: {
    // borderWidth: 1,
    backgroundColor: '#EBEBEB',
    marginTop: -50,
    flex: 1,
  },
});

export default Classifier;
