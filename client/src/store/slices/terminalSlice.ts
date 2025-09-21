import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TerminalInstance, TerminalOutputLine } from '@/types';

interface TerminalSliceState {
  instances: Record<string, TerminalInstance>;
  activeInstanceId: string | null;
}

const createNewInstance = (): TerminalInstance => ({
  output: [{
    id: Date.now().toString(),
    content: 'Welcome to Penguin OS Terminal v1.0.0',
    type: 'system',
    timestamp: new Date(),
  }],
  input: '',
  history: [],
  historyIndex: -1,
  isProcessing: false,
  workingDirectory: '~',
});

const initialState: TerminalSliceState = {
  instances: {},
  activeInstanceId: null,
};

const terminalSlice = createSlice({
  name: 'terminal',
  initialState,
  reducers: {
    createTerminalInstance: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      state.instances[instanceId] = createNewInstance();
      state.activeInstanceId = instanceId;
    },

    destroyTerminalInstance: (state, action: PayloadAction<string>) => {
      const instanceId = action.payload;
      delete state.instances[instanceId];

      if (state.activeInstanceId === instanceId) {
        const remainingIds = Object.keys(state.instances);
        state.activeInstanceId = remainingIds.length > 0 ? remainingIds[0] : null;
      }
    },

    setActiveInstance: (state, action: PayloadAction<string>) => {
      if (state.instances[action.payload]) {
        state.activeInstanceId = action.payload;
      }
    },

    updateInput: (state, action: PayloadAction<{ instanceId: string; input: string }>) => {
      const { instanceId, input } = action.payload;
      const instance = state.instances[instanceId];
      if (instance) {
        instance.input = input;
      }
    },

    addOutput: (state, action: PayloadAction<{
      instanceId: string;
      content: string;
      type: TerminalOutputLine['type'];
    }>) => {
      const { instanceId, content, type } = action.payload;
      const instance = state.instances[instanceId];
      if (instance) {
        const outputLine: TerminalOutputLine = {
          id: Date.now().toString() + Math.random(),
          content,
          type,
          timestamp: new Date(),
        };
        instance.output.push(outputLine);

        if (instance.output.length > 1000) {
          instance.output = instance.output.slice(-1000);
        }
      }
    },

    executeCommand: (state, action: PayloadAction<{ instanceId: string; command: string }>) => {
      const { instanceId, command } = action.payload;
      const instance = state.instances[instanceId];
      if (instance) {
        instance.output.push({
          id: Date.now().toString() + Math.random(),
          content: `${instance.workingDirectory}$ ${command}`,
          type: 'input',
          timestamp: new Date(),
        });

        if (command.trim()) {
          instance.history.unshift(command);
          if (instance.history.length > 100) {
            instance.history = instance.history.slice(0, 100);
          }
        }

        instance.input = '';
        instance.historyIndex = -1;
        instance.isProcessing = true;
      }
    },

    setProcessingComplete: (state, action: PayloadAction<string>) => {
      const instance = state.instances[action.payload];
      if (instance) {
        instance.isProcessing = false;
      }
    },

    navigateHistory: (state, action: PayloadAction<{ instanceId: string; direction: 'up' | 'down' }>) => {
      const { instanceId, direction } = action.payload;
      const instance = state.instances[instanceId];
      if (instance && instance.history.length > 0) {
        if (direction === 'up') {
          if (instance.historyIndex < instance.history.length - 1) {
            instance.historyIndex++;
            instance.input = instance.history[instance.historyIndex];
          }
        } else {
          if (instance.historyIndex > 0) {
            instance.historyIndex--;
            instance.input = instance.history[instance.historyIndex];
          } else if (instance.historyIndex === 0) {
            instance.historyIndex = -1;
            instance.input = '';
          }
        }
      }
    },

    clearTerminal: (state, action: PayloadAction<string>) => {
      const instance = state.instances[action.payload];
      if (instance) {
        instance.output = [];
      }
    },

    changeDirectory: (state, action: PayloadAction<{ instanceId: string; directory: string }>) => {
      const { instanceId, directory } = action.payload;
      const instance = state.instances[instanceId];
      if (instance) {
        instance.workingDirectory = directory;
      }
    },
  },
});

export const {
  createTerminalInstance,
  destroyTerminalInstance,
  setActiveInstance,
  updateInput,
  addOutput,
  executeCommand,
  setProcessingComplete,
  navigateHistory,
  clearTerminal,
  changeDirectory,
} = terminalSlice.actions;

export default terminalSlice.reducer;