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
import { sendEmail } from '../api/email';

const ALL_NOTIFICATIONS = 'all_notifications';
const NEW_PROJECTS = 'new_projects';
const NEW_BETA_PROJECTS = 'new_beta_projects';
const URGENT_HELP = 'urgent_help';
const PROJECT_SPECIFIC = 'project_';
const INITIAL_SETTINGS_SET = 'INITIAL_SETTINGS_SET';
const SETTING_TRUE = 'SETTING_TRUE';
const SETTING_FALSE = 'SETTING_FALSE';

class FirebaseNotifications {
  /**
   * This should run when the user data is loaded or when the user logins.
   * It'll check the projects the user has classified on and subscribe
   * to those push notification topics.
   */
  async subTopicClassifiedProjects(userId) {
    if (!this.checkIfEnabled) return;
    getAllUserClassifications(userId)
      .then((res) => {
        if (Array.isArray(res)) {
          let projectIds = [];
          for (const classification of res) {
            const projectId = classification?.links?.project;
            if (projectId && !projectIds.includes(projectId)) {
              projectIds.push(projectId);
            }
          }

          sendEmail(`sub to projects: ${projectIds.join(', ')}`);
          for (const projectId of projectIds) {
            /**
             * Runs in the background.
             * No then/catch because there's no action to take if it succeeds or fails.
             */
            messaging().subscribeToTopic(`${PROJECT_SPECIFIC}${projectId}`);
          }
        }
      })
      .catch((err) => {
        throw new Error('Failed to get user classifications', err.message);
      });
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
      const alreadySet = await this.getInitialSettings();
      if (alreadySet) {
        return;
      }

      const enabled = await this.checkIfEnabled();

      if (!enabled) {
        this.setInitialSettings(false);
        return;
      }

      if (Platform.OS === 'ios') {
        /**
         * To avoid getting the following error:
         * "The operation couldn’t be completed. No APNS token specified before fetching FCM Token"
         * you must add the delay via https://github.com/invertase/react-native-firebase/issues/6893
         */
        const delay = (ms) => new Promise((res) => setTimeout(res, ms));
        await delay(1000);
      }
      const token = await messaging().getToken();
      sendEmail(`${Platform.OS} token: ${token}`);
      this.setInitialSettings(true);
    } catch {
      // Do nothing if this fails. It runs in the background and will attempt again later.
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

  updateTopic = (topic, subStatus) => {
    if (subStatus) {
      messaging().subscribeToTopic(topic);
    } else {
      messaging().unsubscribeFromTopic(topic);
    }
  };
}

export const PushNotifications = new FirebaseNotifications();
