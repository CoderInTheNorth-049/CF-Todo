import { configureStore } from '@reduxjs/toolkit';
import problemsReducer from './problemsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    problems: problemsReducer,
    settings: settingsReducer,
  },
});
