import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

export const notifications = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      // Add newest notification to the beginning of the list.
      const exists = state.notifications.find(
        (n) => n.id === action.payload.id
      );
      if (!exists) {
        state.notifications = [action.payload, ...state.notifications];
      }
    },
  },
});

export const { addNotification } = notifications.actions;

export default notifications.reducer;
