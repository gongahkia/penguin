import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '@/types';

interface UserSliceState {
  preferences: UserPreferences;
  isAuthenticated: boolean;
  username: string | null;
  sessionId: string | null;
}

const initialPreferences: UserPreferences = {
  theme: 'dark',
  wallpaper: '/wallpapers/default.jpg',
  soundEnabled: true,
  animationsEnabled: true,
  terminalTheme: 'dark',
  fontSize: 14,
};

const initialState: UserSliceState = {
  preferences: initialPreferences,
  isAuthenticated: true, // Default to authenticated for demo
  username: 'user',
  sessionId: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; sessionId: string }>) => {
      state.isAuthenticated = true;
      state.username = action.payload.username;
      state.sessionId = action.payload.sessionId;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.username = null;
      state.sessionId = null;
    },

    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },

    setTheme: (state, action: PayloadAction<UserPreferences['theme']>) => {
      state.preferences.theme = action.payload;
    },

    setWallpaper: (state, action: PayloadAction<string>) => {
      state.preferences.wallpaper = action.payload;
    },

    toggleSound: (state) => {
      state.preferences.soundEnabled = !state.preferences.soundEnabled;
    },

    toggleAnimations: (state) => {
      state.preferences.animationsEnabled = !state.preferences.animationsEnabled;
    },

    setTerminalTheme: (state, action: PayloadAction<string>) => {
      state.preferences.terminalTheme = action.payload;
    },

    setFontSize: (state, action: PayloadAction<number>) => {
      state.preferences.fontSize = Math.max(8, Math.min(32, action.payload));
    },

    resetPreferences: (state) => {
      state.preferences = initialPreferences;
    },
  },
});

export const {
  login,
  logout,
  updatePreferences,
  setTheme,
  setWallpaper,
  toggleSound,
  toggleAnimations,
  setTerminalTheme,
  setFontSize,
  resetPreferences,
} = userSlice.actions;

export default userSlice.reducer;