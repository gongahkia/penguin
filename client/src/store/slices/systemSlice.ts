import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SystemState, Process } from '@/types';

interface SystemSliceState extends SystemState {
  bootTime: Date;
  isLocked: boolean;
  notifications: Notification[];
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  autoClose?: boolean;
}

const initialState: SystemSliceState = {
  currentUser: 'user',
  uptime: 0,
  runningProcesses: [],
  memoryUsage: 0,
  cpuUsage: 0,
  bootTime: new Date(),
  isLocked: false,
  notifications: [],
};

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    updateUptime: (state) => {
      const now = new Date();
      state.uptime = Math.floor((now.getTime() - state.bootTime.getTime()) / 1000);
    },

    startProcess: (state, action: PayloadAction<Omit<Process, 'startTime'>>) => {
      const process: Process = {
        ...action.payload,
        startTime: new Date(),
      };
      state.runningProcesses.push(process);
    },

    terminateProcess: (state, action: PayloadAction<string>) => {
      const processIndex = state.runningProcesses.findIndex(p => p.id === action.payload);
      if (processIndex !== -1) {
        state.runningProcesses[processIndex].status = 'terminated';
      }
    },

    removeProcess: (state, action: PayloadAction<string>) => {
      state.runningProcesses = state.runningProcesses.filter(p => p.id !== action.payload);
    },

    updateProcessStats: (state, action: PayloadAction<{ id: string; memoryUsage?: number; cpuUsage?: number }>) => {
      const { id, memoryUsage, cpuUsage } = action.payload;
      const process = state.runningProcesses.find(p => p.id === id);
      if (process) {
        if (memoryUsage !== undefined) process.memoryUsage = memoryUsage;
        if (cpuUsage !== undefined) process.cpuUsage = cpuUsage;
      }
    },

    updateSystemStats: (state, action: PayloadAction<{ memoryUsage?: number; cpuUsage?: number }>) => {
      const { memoryUsage, cpuUsage } = action.payload;
      if (memoryUsage !== undefined) state.memoryUsage = memoryUsage;
      if (cpuUsage !== undefined) state.cpuUsage = cpuUsage;
    },

    lockSystem: (state) => {
      state.isLocked = true;
    },

    unlockSystem: (state) => {
      state.isLocked = false;
    },

    addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString() + Math.random(),
        timestamp: new Date(),
      };
      state.notifications.push(notification);

      // Keep only last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(-50);
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    setCurrentUser: (state, action: PayloadAction<string>) => {
      state.currentUser = action.payload;
    },
  },
});

export const {
  updateUptime,
  startProcess,
  terminateProcess,
  removeProcess,
  updateProcessStats,
  updateSystemStats,
  lockSystem,
  unlockSystem,
  addNotification,
  removeNotification,
  clearNotifications,
  setCurrentUser,
} = systemSlice.actions;

export default systemSlice.reducer;
export type { Notification };