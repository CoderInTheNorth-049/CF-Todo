import { createSlice } from '@reduxjs/toolkit';
import { DEFAULT_STATUSES } from '../constants/defaultStatuses';

const initialState = {
  statusOptions: DEFAULT_STATUSES,
  username: '',
  statusesChanged: false, // Flag to show bulk update UI
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Update status options
    setStatusOptions: (state, action) => {
      state.statusOptions = action.payload;
      state.statusesChanged = true;
    },

    // Set username
    setUsername: (state, action) => {
      state.username = action.payload;
    },

    // Clear the status change flag
    clearStatusChangeFlag: (state) => {
      state.statusesChanged = false;
    },

    // Load settings from localStorage
    loadSettings: (state, action) => {
      if (action.payload.statusOptions) {
        state.statusOptions = action.payload.statusOptions;
      }
      if (action.payload.username) {
        state.username = action.payload.username;
      }
    },
  },
});

export const {
  setStatusOptions,
  setUsername,
  clearStatusChangeFlag,
  loadSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
