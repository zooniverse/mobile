import React, { useState } from 'react';
import {
  Alert,
  View,
  StyleSheet,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

import Timestamp from './Timestamp';
import PopupMessage from '../projects/PopupMessage';
import NotificationWorkflows from './NotificationWorkflows';
import navigateToClassifier from '../../navigators/classifierNavigator';
import { fetchProjectForClassification } from '../../actions/projects';

function ExpandedNotification({ notification }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState();
  const [project, setProject] = useState(notification.project);

  const onPress = async () => {
    let loadedProject
    try {
      loadedProject = await dispatch(fetchProjectForClassification(project));
    } catch (error) {
      return
    }
    setProject(loadedProject);
    const workflows = loadedProject.workflows;

    if (workflows.length === 1) {
      const isbeta = loadedProject.beta_approved && !loadedProject.launch_approved;
      navigateToClassifier(
        dispatch,
        loadedProject.isPreview,
        isbeta,
        loadedProject,
        navigation,
        workflows[0]
      );
    } else if (workflows.length > 1) {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 1200);
    } else {
      Alert.alert(
        'No mobile workflows available',
        'This project does not currently have a workflow supported by the mobile app.'
      );
    }
  };

  return (
    <View style={styles.card}>
      {project?.avatar_src && (
        <Image
          resizeMode="cover"
          style={[styles.image]}
          source={{ uri: project.avatar_src }}
        />
      )}
      <View style={styles.innerExpandedContainer}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{notification?.title}</Text>
          <Timestamp timestamp={notification?.timestamp} />
        </View>
        <View style={styles.bodyContainer}>
          <Text style={styles.body}>{notification?.body}</Text>
        </View>
        <TouchableOpacity onPress={onPress}>
          <LinearGradient
            colors={['#00979D', '#fff', '#00979D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnOuter}
          >
            <View style={styles.btnInner}>
              <Text style={styles.btnText}>Classify Now</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
        {showPopup && <PopupMessage />}
      </View>
      {project?.workflows?.length > 1 && (
        <FlatList
          data={project.workflows}
          renderItem={({ item }) => (
            <NotificationWorkflows
              workflow={item}
              notification={{ ...notification, project }}
            />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 12,
    lineHeight: 14.03,
    color: '#000',
    marginBottom: 16,
  },
  bodyContainer: {
    borderTopWidth: 0.5,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 8,
    borderColor: '#A6A7A9',
  },
  btnInner: {
    borderRadius: 32, // <-- Inner Border Radius
    flex: 1,
    margin: 1, // <-- Border Width
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  btnOuter: {
    height: 44,
    borderRadius: 32, // <-- Outer Border Radius
    marginTop: 8,
  },
  btnText: {
    fontWeight: '600',
    fontSize: 24,
    lineHeight: 28.06,
    textAlign: 'center',
    color: '#00979D',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    marginTop: 24,
    borderRadius: 8,
    backgroundColor: '#fff',
    // Android
    elevation: 6,
    // iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 2,
  },
  image: {
    height: 220,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  innerExpandedContainer: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 16.37,
    color: '#000',
    textTransform: 'uppercase',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
});

ExpandedNotification.propTypes = {
  notification: PropTypes.object.isRequired,
};

export default ExpandedNotification;
