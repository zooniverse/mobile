import { createSlice } from '@reduxjs/toolkit';
import { getLocales } from 'react-native-localize';
import languages from '../i18n/languages';

// Get device locale information
const getDeviceLocales = () => {
  try {
    return getLocales() || [];
  } catch (error) {
    console.error('Error getting device locales:', error);
    return [];
  }
};

// Get primary device language to use as a default.
const getDeviceLanguage = () => {
  const locales = getDeviceLocales();
  if (Array.isArray(locales)) {
    for (const locale of locales) {
      const languageCode = locale['languageCode'];
      if (languageCode in languages) {
        return languageCode;
      }
    }
  }
  return 'en';
};

const initialState = {
  platformLanguage: getDeviceLanguage(),
};

export const languageSettings = createSlice({
  name: 'languageSettings',
  initialState,
  reducers: {
    setPlatformLanguage: (state, action) => {
      const language = action.payload;
      state.platformLanguage = language;
    },
  },
});

export const {
  setPlatformLanguage,
  updateDeviceLocales,
  setProjectLanguages,
  clearProjectLanguages,
} = languageSettings.actions;

export default languageSettings.reducer;
