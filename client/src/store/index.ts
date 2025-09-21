import { configureStore } from '@reduxjs/toolkit';
import windowReducer from './slices/windowSlice';
import terminalReducer from './slices/terminalSlice';
import fileSystemReducer from './slices/fileSystemSlice';
import systemReducer from './slices/systemSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    windows: windowReducer,
    terminal: terminalReducer,
    fileSystem: fileSystemReducer,
    system: systemReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;