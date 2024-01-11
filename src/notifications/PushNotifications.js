import { Platform, PermissionsAndroid } from 'react-native';

import messaging from '@react-native-firebase/messaging';

import { store } from '../containers/app';
import { sendEmailTestingToken } from '../api/email';
import {
  setInitialSettings,
  setNotificationProjects,
  toggleEnabledNotifications,
  toggleNewBetaProjects,
  toggleNewProjects,
  toggleNotificationProject,
  toggleUrgentHelpAlerts,
} from '../reducers/notificationSettingsSlice';
import { pushTesters } from './testers';
import { getAllUserClassifications } from '../api';
import { getTestingTokenEmailed, setTestingTokenEmailed } from './testingTokenStorage';

export const ALL_NOTIFICATIONS = 'all_notifications';
export const NEW_PROJECTS = 'new_projects';
export const NEW_BETA_PROJECTS = 'new_beta_projects';
export const URGENT_HELP = 'urgent_help';
export const PROJECT_SPECIFIC = 'project_';

class FirebaseNotifications {
  getProjectSubscriptionName = (projectId) => `${PROJECT_SPECIFIC}${projectId}`;

  async updateProjectListNotifications(projectList, user) {
    if (!Array.isArray(projectList) || projectList.length === 0) return;
    const { projectSpecificNotifications } =
      store.getState().notificationSettings;
    const enabled = await this.checkIfEnabled();

    // New updated list of projects
    let updatedProjectNotificationList = [];
    const loggedOut = user?.isGuestUser;
    let classifiedProjects = {};
    if (!loggedOut && user?._client?.headers?.Authorization && user?.id) {
      const userToken = user?._client?.headers?.Authorization;
      classifiedProjects = await getAllUserClassifications(user.id, userToken);
    }

    // Loop through existing list, removed old projects, check if defaults need set.
    for (const pushProject of projectSpecificNotifications) {
      if (!projectList.some((project) => project.id === pushProject.id)) {
        // Unsubscribe from topic.
        this.updateTopic(
          this.getProjectSubscriptionName(pushProject.id),
          false
        );
      } else {
        // We have their classified projects and they have not had their default set.
        if (!pushProject.defaultSet && !loggedOut) {
          const subscribed = pushProject.id in classifiedProjects;
          if (subscribed) {
            // Subscribe to firebase topic
            this.updateTopic(
              this.getProjectSubscriptionName(pushProject.id),
              true
            );
          }
          /**
           * They are now subscribed if classified and the default is set.
           * If they haven't classified set defaultSet to false.
           * The goal is to keep checking each time in the event that they do classify we want to toggle on.
           */
          updatedProjectNotificationList.push({
            ...pushProject,
            subscribed,
            defaultSet: subscribed,
          });
        } else {
          updatedProjectNotificationList.push(pushProject);
        }
      }
    }

    // Loop through projects list to see if new projects need added.
    for (const project of projectList) {
      if (
        !updatedProjectNotificationList.some(
          (pushProjectId) => pushProjectId.id === project.id
        )
      ) {
        if (!loggedOut && enabled) {
          const subscribed = project.id in classifiedProjects;
          if (subscribed) {
            // New project, user has classified, subscribe to Firebase topic.
            this.updateTopic(this.getProjectSubscriptionName(project.id), true);
          }
          updatedProjectNotificationList.push({
            id: project.id,
            displayName: project.display_name,
            subscribed,
            defaultSet: subscribed,
          });
        } else {
          // User is not logged in, set to false and set defaultSet to false so you can check again when they log in.
          updatedProjectNotificationList.push({
            id: project.id,
            displayName: project.display_name,
            subscribed: false,
            defaultSet: false,
          });
        }
      }
    }

    store.dispatch(setNotificationProjects(updatedProjectNotificationList));
  }

  async userClassifiedProject(projectId) {
    const { projectSpecificNotifications } =
      store.getState().notificationSettings;

    const project = projectSpecificNotifications.find(
      (p) => p.id === projectId
    );

    if (project && !project?.defaultSet) {
      this.projectSettingToggled(project, true);
    }
  }

  /**
   * The user is logged in and has notifications enabled.
   * See if they are a tester and email the token.
   * This is used to send test messages in Firebase console.
   */
  async emailTestingToken(user) {
    const enabled = await this.checkIfEnabled();
    if (!enabled) {
      return;
    }

    const userName = user?.login;

    try {
      const pushTester = pushTesters.find((p) => p.userName === userName);
      if (pushTester) {
        // Check if the token has already been emailed, it should only email once.
        const alreadyEmailed = await getTestingTokenEmailed(userName);
        if (!alreadyEmailed) {
          // Get the token, email it, and then mark in local storage that it has been sent.
          const token = await messaging().getToken();
          const sendEmail = await sendEmailTestingToken(
            token,
            pushTester,
            Platform.OS
          );
          if (sendEmail) {
            setTestingTokenEmailed(userName);
          }
        }
      }
    } catch {
      throw new Error('Issue emailing the testing token');
    }
  }

  /**
   * Check if the device has push notifications enabled.
   * It'll prompt the user to give permission if it has
   * not already done so.
   */
  async checkIfEnabled() {
    try {
      if (Platform.OS === 'ios') {
        // For iOS you must ask permission.
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } else {
        // Android OS < 33 implicitly enables push.
        if (Platform.Version < 33) {
          return true;
        }
        // Android OS >= 33 you must ask for permission.
        const androidPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return androidPermission === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   * Runs when the app is opened.
   * Check if global settings have already been set.
   * If not, check that the device has enabled push notifications.
   * Set global settings.
   */
  async setupPushNotifications() {
    const { initialSettingsSet } = store.getState().notificationSettings;

    // Initial settings already set, nothing else to do here.
    if (initialSettingsSet) {
      return;
    }

    const enabled = await this.checkIfEnabled();
    this.setInitialSettingsAndSubscriptions(enabled);
  }
  /**
   * Sets the global push settings.
   * 1) Updates in redux.
   * 2) Subscribes to the global push topics in Firebase.
   */
  setInitialSettingsAndSubscriptions = async (value) => {
    // Update redux.
    store.dispatch(setInitialSettings(value));

    // Update firebase.
    if (value) {
      this.updateTopic(ALL_NOTIFICATIONS, true);
      this.updateTopic(NEW_PROJECTS, true);
      this.updateTopic(NEW_BETA_PROJECTS, true);
      this.updateTopic(URGENT_HELP, true);
    }
  };

  settingToggled = async (setting, value) => {
    if (setting === ALL_NOTIFICATIONS) {
      const {
        newProjects,
        newBetaProjects,
        urgentHelpAlerts,
        projectSpecificNotifications,
      } = store.getState().notificationSettings;

      // If global settings are toggled on, either subscribe them if "Enable Notifications" is toggled on or unsubscribe if off
      if (newProjects) {
        this.updateTopic(NEW_PROJECTS, value);
      }

      if (newBetaProjects) {
        this.updateTopic(NEW_BETA_PROJECTS, value);
      }

      if (urgentHelpAlerts) {
        this.updateTopic(URGENT_HELP, value);
      }

      // Loop through the projects and do the same.
      for (const project of projectSpecificNotifications) {
        if (project.subscribed) {
          this.updateTopic(this.getProjectSubscriptionName(project.id), value);
        }
      }

      this.updateTopic(ALL_NOTIFICATIONS, value);

      store.dispatch(toggleEnabledNotifications(value));
    } else if (setting === NEW_PROJECTS) {
      store.dispatch(toggleNewProjects(value));
    } else if (setting === NEW_BETA_PROJECTS) {
      store.dispatch(toggleNewBetaProjects(value));
    } else if (setting === URGENT_HELP) {
      store.dispatch(toggleUrgentHelpAlerts(value));
    }

    this.updateTopic(setting, value);
  };

  projectSettingToggled = async (project, value) => {
    this.updateTopic(this.getProjectSubscriptionName(project.id), value);

    const updatedProject = {
      id: project.id,
      displayName: project.displayName,
      subscribed: value,
      defaultSet: true,
    };

    store.dispatch(toggleNotificationProject(updatedProject));
  };

  // Subscribes or unsubscribes from the Firebase topic.
  updateTopic = (topic, subStatus) => {
    if (subStatus) {
      messaging().subscribeToTopic(topic);
    } else {
      messaging().unsubscribeFromTopic(topic);
    }
  };
}

export const PushNotifications = new FirebaseNotifications();
