import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  RefreshControl,
  View
} from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import R from 'ramda'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { GLOBALS, loggedInDisciplineTags } from '../constants/globals'
import PropTypes from 'prop-types';
import Discipline from './Discipline'
import { setPushPrompted } from '../actions/user'
import FontedText from '../components/common/FontedText'
import * as projectActions from '../actions/projects'
import * as settingsActions from '../actions/settings'
import { makeCancelable } from '../utils/promiseUtils'
import { extractSwipeEnabledProjects } from '../utils/projectUtils'
import { setNavbarSettingsForPage } from '../actions/navBar'
import PageKeys from '../constants/PageKeys'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { useRoute } from '@react-navigation/native';
import { PushNotifications } from '../notifications/PushNotifications';

const mapStateToProps = (state) => {
  const nativePreviewProjects = state.projects.previewProjectList.filter(
      (project) => R.any((workflow) => workflow.mobile_verified)(project.workflows)
  )
  const hasPreviewProjects = !R.isEmpty(nativePreviewProjects)
  const hasBetaProjects = !R.isEmpty(state.projects.betaProjectList.count)
  return {
    user: state.user,
    isGuestUser: state.user.isGuestUser,
    isConnected: state.main.isConnected,
    projectList: state.projects.projectList || [],
    hasPreviewProjects,
    hasBetaProjects,
    hasRecentProjects: state.user.projects && !R.isEmpty(state.user.projects),
    isSuccess: state.projects.isSuccess,
    isLoading: state.projects.isLoading
  }
}

const mapDispatchToProps = (dispatch) => ({
  setNavbarSettingsForPage: (settings, page) => dispatch(setNavbarSettingsForPage(settings, page)),
  projectActions: bindActionCreators(projectActions, dispatch),
  settingsActions: bindActionCreators(settingsActions, dispatch),
  setPushPrompted(value) {
    dispatch(setPushPrompted(value))
  },
})

function ProjectDisciplines({ ...props }) {
  const [refreshing, setRefreshing] = useState(true);
  const route = useRoute();

  useEffect(() => {
    props.setNavbarSettingsForPage(
      {
        centerType: 'avatar',
      },
      PageKeys.ProjectDisciplines
    );
    if (shouldPromptForPermissions()) {
      setTimeout(() => {
        promptRequestPermissions();
      }, 500);
    }

    refreshProjects();

    return () => {
      if (this.fetchProjectPromise) {
        this.fetchProjectPromise.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (route?.params?.refresh) {
      route.params.refresh = false;
      refreshProjects();
    }
  }, [route]);

  function shouldPromptForPermissions() {
    return Platform.OS === 'ios' && !props.user.pushPrompted;
  }

  const promptRequestPermissions = () => {
    PushNotificationIOS.checkPermissions((permissions) => {
      if (permissions.alert === 0){
        Alert.alert(
          'Allow Notifications?',
          'Zooniverse would like to occasionally send you info about new projects or projects needing help.',
          [
            {text: 'Not Now', onPress: () => requestIOSPermissions(false)},
            {text: 'OK', onPress: () => requestIOSPermissions(true)},
          ]
        )
      }
    })
  };

  function requestIOSPermissions(accepted) {
    if (accepted) {
      PushNotificationIOS.requestPermissions();
    }
    props.setPushPrompted(true);
  }

  function renderItem({ item, navigation }) {
    const { faIcon, value, label, color, description } = item;
    return (
      <Discipline
        faIcon={faIcon}
        icon={value}
        title={label}
        tag={value}
        color={color}
        description={description}
        navigation={props.navigation}
      />
    );
  }

  function refreshProjects() {
    setRefreshing(true);
    fetchProjectPromise = makeCancelable(props.projectActions.fetchProjects());

    fetchProjectPromise.promise
      .then((projectList) => {
        fetchProjectPromise = null;
        setRefreshing(false);

        // Handle push subscriptions
        const notificationProjects = extractSwipeEnabledProjects(
          projectList.filter((project) => !project.isPreview)
        );
        PushNotifications.updateProjectListNotifications(notificationProjects, props.user)
      })
      .catch((error) => {
        if (!error.isCanceled) {
          Alert.alert(
            'Error',
            'The following error occurred.  Please close down Zooniverse and try again.  If it persists please notify us.  \n\n' +
              error
          );
        }
      });
  }
  const totalClassifications = props.user.totalClassifications;
  const pluralizeClassification = totalClassifications > 1 ? 'S' : '';
  const totalClassificationsDisiplay = (
    <FontedText style={styles.totalClassifications}>
      {`${totalClassifications} TOTAL CLASSIFICATION${pluralizeClassification}`}
    </FontedText>
  );

  const disciplineInProjectList = (discipline) => {
    const { user, hasPreviewProjects, hasRecentProjects, hasBetaProjects } =
      props;
    const isForLoggedInUser =
      !user.isGuestUser &&
      loggedInDisciplineTags(hasRecentProjects, hasPreviewProjects).includes(
        discipline.value
      );
    const isTagged =
      props.projectList.find((project) =>
        project.tags.includes(discipline.value)
      ) !== undefined;
    const isBeta = hasBetaProjects && discipline.value === 'beta';
    const isForAllProjects = discipline.value === 'all projects';
    return isForLoggedInUser || isTagged || isBeta || isForAllProjects;
  };
  const disciplineList = props.isSuccess
    ? R.filter(disciplineInProjectList, GLOBALS.DISCIPLINES)
    : [];
  const listView = (
    <FlatList
      contentContainerStyle={styles.listContainer}
      data={disciplineList}
      renderItem={(item) => renderItem(item, props.navigation)}
      keyExtractor={(item, index) => `${index}`}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refreshProjects} />
      }
    />
  );
  const activityIndicator = (
    <View style={activityIndicator}>
      <ActivityIndicator size="large" />
    </View>
  );
  return (
    <View style={styles.container}>
      <View style={styles.subNavContainer}>
        <FontedText style={styles.userName}>
          {props.isGuestUser ? 'Guest User' : props.user.display_name}
        </FontedText>
        {/* {totalClassifications > 0 ? totalClassificationsDisiplay : null} */}
      </View>
      {props.isLoading && !props.isSuccess ? activityIndicator : listView}
    </View>
  );
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  subNavContainer: {
    paddingTop: Platform.OS === 'ios' ? 25 : 74,
    paddingBottom: 25,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  userName: {
    color: '$headerGrey',
    fontSize: 26,
    lineHeight: 31,
    marginTop: 50,
  },
  totalClassifications: {
    color: '$headerGrey',
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 17
  },
  signOut: {
    backgroundColor: '$transparent',
  },
  signOutText: {
    color: '$darkTextColor',
    fontSize: 11,
  },
  messageContainer: {
    padding: 15,
  },
  innerContainer: {
    flex: 1,
    marginTop: 10,
  },
  activityIndicator: {
    flex: 1,
    paddingBottom: 75,
    justifyContent: 'center'
  },
  listContainer: {
    paddingBottom: 25
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(ProjectDisciplines)
