import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGGED_TESTING_TOKEN = 'LOGGED_TESTING_TOKEN';

export const getTestingTokenLogged = async (userName) => {
  try {
    const value = await AsyncStorage.getItem(
      `${LOGGED_TESTING_TOKEN}_${userName}`
    );
    if (value !== null) {
      return true;
    }
  } catch (e) {
    return false;
  }
};

export const setTestingTokenLogged = async (userName) => {
  try {
    await AsyncStorage.setItem(`${LOGGED_TESTING_TOKEN}_${userName}`, 'true');
  } catch (e) {
    throw new Error(
      `There was an issue setting logged testing token ${e.message}`
    );
  }
};
