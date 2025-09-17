import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  initialSettingsSet: false,
  enableNotifications: false,
  newProjects: false,
  newBetaProjects: false,
  urgentHelpAlerts: false,
  projectSpecificNotifications: [],
};

export const notificationSettings = createSlice({
  name: 'notificationSettings',
  initialState,
  reducers: {
    setInitialSettings: (state, action) => {
      const enabled = action.payload;
      state.enableNotifications = enabled;
      state.newProjects = enabled;
      state.newBetaProjects = enabled;
      state.urgentHelpAlerts = enabled;
      state.initialSettingsSet = true;
    },
    toggleEnabledNotifications: (state, action) => {
      state.enableNotifications = action.payload;
    },
    toggleNewProjects: (state, action) => {
      state.newProjects = action.payload;
    },
    toggleNewBetaProjects: (state, action) => {
      state.newBetaProjects = action.payload;
    },
    toggleUrgentHelpAlerts: (state, action) => {
      state.urgentHelpAlerts = action.payload;
    },
    setNotificationProjects: (state, action) => {
      state.projectSpecificNotifications = action.payload;
    },
    toggleNotificationProject: (state, action) => {
      state.projectSpecificNotifications =
        state.projectSpecificNotifications.map((p) => {
          if (p.id === action.payload.id) {
            return action.payload;
          }
          return p;
        });
    },
  },
});

export const {
  setInitialSettings,
  toggleEnabledNotifications,
  toggleNewProjects,
  toggleNewBetaProjects,
  toggleUrgentHelpAlerts,
  setNotificationProjects,
  toggleNotificationProject
} = notificationSettings.actions;

export default notificationSettings.reducer;
