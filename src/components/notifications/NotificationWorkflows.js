import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import PropTypes from 'prop-types';

import Separator from '../common/Separator';
import navigateToClassifier from '../../navigators/classifierNavigator';
import FontedText from '../common/FontedText';

function NotificationWorkflows({ workflow, notification }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const workflowPressed = (workflow) => {
    const project = notification?.project;
    const isbeta = project.beta_approved && !project.launch_approved;

    navigateToClassifier(
      dispatch,
      project.isPreview,
      isbeta,
      project,
      navigation,
      workflow
    );
  };

  return (
    <View>
      <Separator />
      <View>
        <TouchableOpacity onPress={() => workflowPressed(workflow)}>
          <View style={styles.cell}>
            <View style={styles.descriptionContent}>
              <FontedText style={styles.cellTitle}>
                {workflow.display_name}
              </FontedText>
            </View>
            <View style={styles.chevronContainer}>
              <Icon name="chevron-right" style={styles.chevronIcon} />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  cellTitle: {
    fontWeight: 'bold',
    color: 'rgba(92,92,92,1)',
    paddingVertical: 15,
    paddingRight: 15,
    flex: 1,
  },
  chevronContainer: {
    justifyContent: 'center',
  },
  chevronIcon: {
    fontSize: 15,
    color: 'rgba(166,167,169, 1)',
  },
  descriptionContent: {
    flex: 1,
  },
});

NotificationWorkflows.propTypes = {
  notification: PropTypes.object.isRequired,
  workflow: PropTypes.object.isRequired,
};

export default NotificationWorkflows;
