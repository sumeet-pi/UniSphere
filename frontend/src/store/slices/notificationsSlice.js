import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  notifications: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...action.payload,
      });
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },
    markAsRead: (state, action) => {
      const target = state.notifications.find(n => n.id === action.payload);
      if (target) {
        target.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, markAsRead, clearNotifications } = notificationsSlice.actions;

export default notificationsSlice.reducer;
