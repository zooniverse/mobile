import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_HISTORY = 'NOTIFICATION_HISTORY';

// Get previous notifications from local storage.
export const getNotificationHistory = async () => {
  try {
    const jsonNotifications = await AsyncStorage.getItem(NOTIFICATION_HISTORY);
    return jsonNotifications != null ? JSON.parse(jsonNotifications) : [];
  } catch (e) {
    throw new Error('Issue getting notification history:', e.message);
  }
};

// Add a new notification to local storage for usage later.
export const addToNotificationHistory = async (newNotification) => {
  try {
    const currentNotifications = await getNotificationHistory();

    if (!Array.isArray(currentNotifications)) return;

    const updatedNotifications = [newNotification, ...currentNotifications];

    const jsonNotifications = JSON.stringify(updatedNotifications);
    await AsyncStorage.setItem(NOTIFICATION_HISTORY, jsonNotifications);
  } catch (e) {
    throw new Error('Issue setting notification history:', e.message);
  }
};
