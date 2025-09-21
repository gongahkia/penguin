import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WindowState, Position, Size, AppType } from '@/types';

interface WindowSliceState {
  windows: WindowState[];
  activeWindowId: string | null;
  maxZIndex: number;
}

const initialState: WindowSliceState = {
  windows: [],
  activeWindowId: null,
  maxZIndex: 1000,
};

const windowSlice = createSlice({
  name: 'windows',
  initialState,
  reducers: {
    openWindow: (state, action: PayloadAction<{
      id: string;
      title: string;
      appType: AppType;
      position?: Position;
      size?: Size;
      isResizable?: boolean;
      isDraggable?: boolean;
    }>) => {
      const existingWindow = state.windows.find(w => w.id === action.payload.id);

      if (existingWindow) {
        existingWindow.isMinimized = false;
        state.activeWindowId = existingWindow.id;
        existingWindow.zIndex = ++state.maxZIndex;
        return;
      }

      const newWindow: WindowState = {
        id: action.payload.id,
        title: action.payload.title,
        appType: action.payload.appType,
        position: action.payload.position || { x: 100, y: 100 },
        size: action.payload.size || { width: 800, height: 600 },
        isMinimized: false,
        isMaximized: false,
        isActive: true,
        zIndex: ++state.maxZIndex,
        isResizable: action.payload.isResizable ?? true,
        isDraggable: action.payload.isDraggable ?? true,
      };

      state.windows.forEach(w => w.isActive = false);
      state.windows.push(newWindow);
      state.activeWindowId = newWindow.id;
    },

    closeWindow: (state, action: PayloadAction<string>) => {
      state.windows = state.windows.filter(w => w.id !== action.payload);

      if (state.activeWindowId === action.payload) {
        const remainingWindows = state.windows.filter(w => !w.isMinimized);
        if (remainingWindows.length > 0) {
          const topWindow = remainingWindows.reduce((prev, current) =>
            prev.zIndex > current.zIndex ? prev : current
          );
          state.activeWindowId = topWindow.id;
          topWindow.isActive = true;
        } else {
          state.activeWindowId = null;
        }
      }
    },

    minimizeWindow: (state, action: PayloadAction<string>) => {
      const window = state.windows.find(w => w.id === action.payload);
      if (window) {
        window.isMinimized = true;
        window.isActive = false;

        if (state.activeWindowId === action.payload) {
          const visibleWindows = state.windows.filter(w => !w.isMinimized);
          if (visibleWindows.length > 0) {
            const topWindow = visibleWindows.reduce((prev, current) =>
              prev.zIndex > current.zIndex ? prev : current
            );
            state.activeWindowId = topWindow.id;
            topWindow.isActive = true;
          } else {
            state.activeWindowId = null;
          }
        }
      }
    },

    maximizeWindow: (state, action: PayloadAction<string>) => {
      const window = state.windows.find(w => w.id === action.payload);
      if (window) {
        window.isMaximized = !window.isMaximized;
        windowSlice.caseReducers.focusWindow(state, { payload: action.payload, type: 'windows/focusWindow' });
      }
    },

    focusWindow: (state, action: PayloadAction<string>) => {
      const window = state.windows.find(w => w.id === action.payload);
      if (window) {
        state.windows.forEach(w => w.isActive = false);
        window.isActive = true;
        window.isMinimized = false;
        window.zIndex = ++state.maxZIndex;
        state.activeWindowId = window.id;
      }
    },

    updateWindowPosition: (state, action: PayloadAction<{ id: string; position: Position }>) => {
      const window = state.windows.find(w => w.id === action.payload.id);
      if (window) {
        window.position = action.payload.position;
      }
    },

    updateWindowSize: (state, action: PayloadAction<{ id: string; size: Size }>) => {
      const window = state.windows.find(w => w.id === action.payload.id);
      if (window) {
        window.size = action.payload.size;
      }
    },

    restoreWindow: (state, action: PayloadAction<string>) => {
      const window = state.windows.find(w => w.id === action.payload);
      if (window) {
        window.isMinimized = false;
        windowSlice.caseReducers.focusWindow(state, { payload: action.payload, type: 'windows/focusWindow' });
      }
    },
  },
});

export const {
  openWindow,
  closeWindow,
  minimizeWindow,
  maximizeWindow,
  focusWindow,
  updateWindowPosition,
  updateWindowSize,
  restoreWindow,
} = windowSlice.actions;

export default windowSlice.reducer;