import AsyncStorage from '@react-native-async-storage/async-storage';

const EMAILED_TESTING_TOKEN = 'EMAILED_TESTING_TOKEN';

// Check if the initial global push settings have already been set.
export const getTestingTokenEmailed = async (userName) => {
  try {
    const value = await AsyncStorage.getItem(
      `${EMAILED_TESTING_TOKEN}_${userName}`
    );
    if (value !== null) {
      return true;
    }
  } catch (e) {
    return false;
  }
};

// Set that the initial global push settings have already been set.
export const setTestingTokenEmailed = async (userName) => {
  try {
    await AsyncStorage.setItem(`${EMAILED_TESTING_TOKEN}_${userName}`, 'true');
  } catch (e) {
    throw new Error(
      `There was an issue setting emailed testing token ${e.message}`
    );
  }
};
