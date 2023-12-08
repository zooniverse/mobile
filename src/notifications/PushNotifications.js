import { Platform, PermissionsAndroid } from 'react-native';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getAllUserClassifications } from '../api';
import {
  updateBetaNotifications,
  updateEnableNotifications,
  updateNewProjectNotifications,
  updateUrgentHelpNotifications,
} from '../actions/settings';
import { store } from '../containers/app';
import { sendEmailTestingToken } from '../api/email';
import { navRef } from '../navigation/RootNavigator';
import PageKeys from '../constants/PageKeys';
import { addNotification } from '../reducers/notificationsSlice';
import { pushTesters } from './testers';

export const ALL_NOTIFICATIONS = 'all_notifications';
export const NEW_PROJECTS = 'new_projects';
export const NEW_BETA_PROJECTS = 'new_beta_projects';
export const URGENT_HELP = 'urgent_help';
export const PROJECT_SPECIFIC = 'project_';
const INITIAL_SETTINGS_SET = 'INITIAL_SETTINGS_SET';
const SETTING_TRUE = 'SETTING_TRUE';
const SETTING_FALSE = 'SETTING_FALSE';
const EMAILED_TESTING_TOKEN = 'EMAILED_TESTING_TOKEN';

class FirebaseNotifications {
  /**
   * This should run when the user data is loaded or when the user logins.
   * It'll check the projects the user has classified on and subscribe
   * to those push notification topics.
   */
  async subTopicClassifiedProjects(user) {
    if (!this.checkIfEnabled) return;

    // Email a testing token if applicable.
    this.emailTestingToken(user);

    getAllUserClassifications(user.id)
      .then((res) => {
        if (Array.isArray(res)) {
          let projectIds = [];
          for (const classification of res) {
            const projectId = classification?.links?.project;
            if (projectId && !projectIds.includes(projectId)) {
              projectIds.push(projectId);
            }
          }

          for (const projectId of projectIds) {
            /**
             * Runs in the background.
             * No then/catch because there's no action to take if it succeeds or fails.
             */
            this.updateTopic(`${PROJECT_SPECIFIC}${projectId}`, true)
          }
        }
      })
      .catch((err) => {
        throw new Error('Failed to get user classifications', err.message);
      });
  }

  /**
   * The user is logged in and has notifications enabled.
   * See if they are a tester and email the token.
   * This is used to send test messages in Firebase console.
   */
  async emailTestingToken(user) {
    const userName = user?.login;

    try {
      const pushTester = pushTesters.find((p) => p.userName === userName);
      if (pushTester) {
        // Check if the token has already been emailed, it should only email once.
        const alreadyEmailed = await this.getTestingTokenEmailed();
        if (!alreadyEmailed) {
          // Get the token, email it, and then mark in local storage that it has been sent.
          const token = await messaging().getToken();
          const sendEmail = await sendEmailTestingToken(
            token,
            pushTester,
            Platform.OS
          );
          if (sendEmail) {
            this.setTestingTokenEmailed();
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
    try {
      // Check if initial settings have already been set, this should only happen once.
      const alreadySet = await this.getInitialSettings();
      if (alreadySet) {
        return;
      }

      // Check if push is enabled and set the initial settings.
      const enabled = await this.checkIfEnabled();
      this.setInitialSettings(enabled);
    } catch {
      throw new Error('Issue setting the initial settings.');
    }
  }

  // Check if the initial global push settings have already been set.
  getInitialSettings = async () => {
    try {
      const value = await AsyncStorage.getItem(INITIAL_SETTINGS_SET);
      if (value !== null) {
        return true;
      }
    } catch (e) {
      return false;
    }
  };

  /**
   * Sets the global push settings.
   * 1) Updates in redux.
   * 2) Subscribes to the global push topics in Firebase.
   */
  setInitialSettings = async (value) => {
    try {
      // Update redux.
      store.dispatch(updateEnableNotifications(value));
      store.dispatch(updateNewProjectNotifications(value));
      store.dispatch(updateBetaNotifications(value));
      store.dispatch(updateUrgentHelpNotifications(value));

      // Update firebase.
      if (value) {
        this.updateTopic(ALL_NOTIFICATIONS, true);
        this.updateTopic(NEW_PROJECTS, true);
        this.updateTopic(NEW_BETA_PROJECTS, true);
        this.updateTopic(URGENT_HELP, true);
      }

      // Set local storage so it only initializes them once.
      const initialSettings = value ? SETTING_TRUE : SETTING_FALSE;
      await AsyncStorage.setItem(INITIAL_SETTINGS_SET, initialSettings);
    } catch (e) {
      throw new Error(
        'There was an issue setting initial push settings',
        e.message
      );
    }
  };

  // Check if the initial global push settings have already been set.
  getTestingTokenEmailed = async () => {
    try {
      const value = await AsyncStorage.getItem(EMAILED_TESTING_TOKEN);
      if (value !== null) {
        return true;
      }
    } catch (e) {
      return false;
    }
  };

  // Set that the initial global push settings have already been set.
  setTestingTokenEmailed = async () => {
    try {
      await AsyncStorage.setItem(EMAILED_TESTING_TOKEN, 'true');
    } catch (e) {
      throw new Error(
        'There was an issue setting emailed testing token',
        e.message
      );
    }
  };

  // Subscribes or unsubscribes from the Firebase topic.
  updateTopic = (topic, subStatus) => {
    if (subStatus) {
      messaging().subscribeToTopic(topic);
    } else {
      messaging().unsubscribeFromTopic(topic);
    }
  };

  // Message handlers
  handleIncomingNotifications() {

    // App in background - save notification to local storage and navigate to notifications screen.
    messaging().onNotificationOpenedApp((msg) => {
      this.saveMessageToLocalStorage(msg);
      navRef.navigate(PageKeys.NotificationLandingPageScreen, {
        newNotification: msg?.messageId,
      });
    });

    // App is closed - save notification to local storage and navigate to notifications screen.
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          this.saveMessageToLocalStorage(remoteMessage);
          navRef.navigate(PageKeys.NotificationLandingPageScreen, {
            newNotification: remoteMessage?.messageId,
          });
        }
      });

    // App is in foreground - save notification to local storage but do not navigate.
    messaging().onMessage((msg) => {
      this.saveMessageToLocalStorage(msg);
    });

  }

  async saveMessageToLocalStorage(msg) {
    const projectId = msg?.data?.project_id;

    // Need the project id.
    if (!projectId) return;
    const msgData = {
      title: msg?.notification?.title ?? '',
      body: msg?.notification?.body ?? '',
      timestamp: msg?.sentTime,
      id: msg?.messageId,
      projectId,
    };

    store.dispatch(addNotification(msgData));
  }
}

export const PushNotifications = new FirebaseNotifications();
