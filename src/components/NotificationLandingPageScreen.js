import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, FlatList, Image, Alert } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import PropTypes from 'prop-types';

import { setNavbarSettingsForPage } from '../actions/navBar';
import PageKeys from '../constants/PageKeys';
import Notification from './notifications/Notification';
import OverlaySpinner from './OverlaySpinner';
import { useTranslation } from 'react-i18next';

function NotificationLandingPageScreen({ route }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { notifications } = useSelector((state) => state.notifications);
  const { projectList } = useSelector((state) => state.projects);
  const [loading, setLoading] = useState(false);
  const [expandedNotification, setExpandedNotification] = useState(
    route?.params?.newNotification ?? null
  );
  const checkedForProjects = useRef(false); // Used to ensure the setTimeout is only run once.


  // Take the list of notifications and associate with a cooresponding project.
  const notificationsWithProject = [];
  notifications.forEach((notification) => {
    const hasProject = projectList.find((p) => p.id === notification.projectId);
    if (hasProject) {
      notificationsWithProject.push({ ...notification, project: hasProject });
    }
  });

  /**
   * Projects are loaded into state when the app is opened. 
   * In the event that the app is closed and the user clicks on a notification,
   * you will need to wait for the projects to load before showing anything.
   * This code will show a loading indicator that is removed as soon as projects are available.
   * If for some reason after 20 seconds the projects still haven't loaded,
   * then it will stop loading and show an error message. This is to prevent the user from
   * being stuck in a loading state.
   */
  useEffect(() => {
    if (checkedForProjects.current) return;
    let projectTimeout;

    if (projectList.length === 0) {
      setLoading(true);
      projectTimeout = setTimeout(() => {
        checkedForProjects.current = true;
        setLoading(false);
        Alert.alert(
          'Cannot retrieve projects',
          'There was an issue retrieving the projects for your notifications. Please try again by clicking "Notifications" from the menu on the right.'
        );
      }, 20000);
    } else {
      setLoading(false);
      checkedForProjects.current = true;
    }

    return () => clearTimeout(projectTimeout);
  }, [projectList]);

  // Update the navigation header with the title and zoon icon.
  useEffect(() => {
    dispatch(
      setNavbarSettingsForPage(
        {
          title: t(
            'ZooHeader.SignedInUserNavigation.navListLabels.notifications_zero',
            'Notifications'
          ),
          showBack: false,
          showIcon: true,
          centerType: 'title',
        },
        PageKeys.NotificationLandingPageScreen
      )
    );
  }, []);

  /**
   * If the user clicks on a notification from outside of the app, 
   * it should open the app with that notification expanded.
   */
  useEffect(() => {
    if (route?.params?.newNotification) {
      setExpandedNotification(route.params.newNotification);
      route.params.newNotification = null;
    }
  }, [route?.params]);

  // Empty state when there are no notifications.
  const Empty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No New Notifications</Text>
      <LinearGradient
        colors={['#FFFFFF', '#A6A7A9', '#FFFFFF']}
        style={styles.linearGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      />
      <Image
        source={require('../../images/zooni-logo.png')}
        style={styles.logo}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <OverlaySpinner overrideVisibility={true} />
      ) : (
        <FlatList
          data={notificationsWithProject}
          ListEmptyComponent={Empty}
          renderItem={({ item, index }) => {
            return (
              <Notification
                notification={item}
                expandedNotification={expandedNotification}
                setExpandedNotification={setExpandedNotification}
                index={index}
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 160,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 21.04,
    marginBottom: 16,
    color: '#5C5C5C',
  },
  linearGradient: {
    height: 1,
    width: '100%',
  },
  logo: {
    flex: 1,
    width: '70%',
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 32,
  },
});

NotificationLandingPageScreen.propTypes = {
  route: PropTypes.object.isRequired,
};

export default NotificationLandingPageScreen;
