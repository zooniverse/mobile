import messaging from '@react-native-firebase/messaging';

import { navRef } from '../navigation/RootNavigator';
import PageKeys from '../constants/PageKeys';
import { store } from '../containers/app';
import { addNotification } from '../reducers/notificationsSlice';

class HandleIncomingNotifications {
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

export const IncomingNotifications = new HandleIncomingNotifications();
