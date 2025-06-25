import { createSlice } from '@reduxjs/toolkit';
import { getLocales } from 'react-native-localize';

// Get device locale information
const getDeviceLocales = () => {
  try {
    return getLocales() || [];
  } catch (error) {
    console.error('Error getting device locales:', error);
    return [];
  }
};

// Get primary device language
const getDeviceLanguage = () => {
  const locales = getDeviceLocales();
  return locales[0]?.languageCode || 'en';
};

const initialState = {
  // Platform language settings
  platformLanguage: getDeviceLanguage(),
};

export const languageSettings = createSlice({
  name: 'languageSettings',
  initialState,
  reducers: {
    // Platform language actions
    setPlatformLanguage: (state, action) => {
      const language = action.payload;
      state.platformLanguage = language;      
    },
    
  }
});

// Actions
export const {
  setPlatformLanguage,
  updateDeviceLocales,
  setProjectLanguages,
  clearProjectLanguages
} = languageSettings.actions;

export default languageSettings.reducer;
