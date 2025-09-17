import React, { useState } from 'react';
import {
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

function ExpandedNotification({ notification }) {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showPopup, setShowPopup] = useState();

  const onPress = () => {
    const project = notification.project;
    const workflows = project.workflows;

    if (workflows.length === 1) {
      const isbeta = project.beta_approved && !project.launch_approved;
      navigateToClassifier(
        dispatch,
        project.isPreview,
        isbeta,
        project,
        navigation,
        workflows[0]
      );
    } else {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 1200);
    }
  };

  return (
    <View style={styles.card}>
      {notification?.project?.avatar_src && (
        <Image
          resizeMode="cover"
          style={[styles.image]}
          source={{ uri: notification.project.avatar_src }}
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
      {notification?.project?.workflows.length > 1 && (
        <FlatList
          data={notification?.project?.workflows}
          renderItem={({ item }) => (
            <NotificationWorkflows
              workflow={item}
              notification={notification}
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
