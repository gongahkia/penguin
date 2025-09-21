import React from 'react';
import { AppType, AppConfig } from '@/types';

// Lazy load app components for better performance
const Terminal = React.lazy(() => import('@/apps/Terminal/Terminal'));
const TextEditor = React.lazy(() => import('@/apps/TextEditor/TextEditor'));
const FileExplorer = React.lazy(() => import('@/apps/FileExplorer/FileExplorer'));
const MediaPlayer = React.lazy(() => import('@/apps/MediaPlayer/MediaPlayer'));
const Calculator = React.lazy(() => import('@/apps/Calculator/Calculator'));
const Notepad = React.lazy(() => import('@/apps/Notepad/Notepad'));
const Settings = React.lazy(() => import('@/apps/Settings/Settings'));
const PluginManager = React.lazy(() => import('@/apps/PluginManager/PluginManager'));
const ScriptEditor = React.lazy(() => import('@/apps/ScriptEditor/ScriptEditor'));
const WorkspaceManager = React.lazy(() => import('@/apps/WorkspaceManager/WorkspaceManager'));

// App registry with configurations
export const appConfigs: Record<AppType, AppConfig> = {
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    type: 'terminal',
    icon: '💻',
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 100, y: 100 },
    isResizable: true,
    isDraggable: true,
    component: Terminal,
  },
  textEditor: {
    id: 'textEditor',
    name: 'Text Editor',
    type: 'textEditor',
    icon: '📝',
    defaultSize: { width: 900, height: 700 },
    defaultPosition: { x: 150, y: 150 },
    isResizable: true,
    isDraggable: true,
    component: TextEditor,
  },
  fileExplorer: {
    id: 'fileExplorer',
    name: 'File Explorer',
    type: 'fileExplorer',
    icon: '📁',
    defaultSize: { width: 1000, height: 650 },
    defaultPosition: { x: 200, y: 100 },
    isResizable: true,
    isDraggable: true,
    component: FileExplorer,
  },
  mediaPlayer: {
    id: 'mediaPlayer',
    name: 'Media Player',
    type: 'mediaPlayer',
    icon: '🎵',
    defaultSize: { width: 600, height: 400 },
    defaultPosition: { x: 300, y: 200 },
    isResizable: true,
    isDraggable: true,
    component: MediaPlayer,
  },
  calculator: {
    id: 'calculator',
    name: 'Calculator',
    type: 'calculator',
    icon: '🧮',
    defaultSize: { width: 300, height: 400 },
    defaultPosition: { x: 400, y: 150 },
    isResizable: false,
    isDraggable: true,
    component: Calculator,
  },
  notepad: {
    id: 'notepad',
    name: 'Notepad',
    type: 'notepad',
    icon: '📋',
    defaultSize: { width: 600, height: 500 },
    defaultPosition: { x: 250, y: 175 },
    isResizable: true,
    isDraggable: true,
    component: Notepad,
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    type: 'settings',
    icon: '⚙️',
    defaultSize: { width: 800, height: 600 },
    defaultPosition: { x: 200, y: 100 },
    isResizable: true,
    isDraggable: true,
    component: Settings,
  },
  pluginManager: {
    id: 'pluginManager',
    name: 'Plugin Manager',
    type: 'pluginManager',
    icon: '🧩',
    defaultSize: { width: 900, height: 700 },
    defaultPosition: { x: 150, y: 50 },
    isResizable: true,
    isDraggable: true,
    component: PluginManager,
  },
  scriptEditor: {
    id: 'scriptEditor',
    name: 'Script Editor',
    type: 'scriptEditor',
    icon: '📜',
    defaultSize: { width: 1000, height: 700 },
    defaultPosition: { x: 100, y: 75 },
    isResizable: true,
    isDraggable: true,
    component: ScriptEditor,
  },
  workspaceManager: {
    id: 'workspaceManager',
    name: 'Workspace Manager',
    type: 'workspaceManager',
    icon: '👥',
    defaultSize: { width: 900, height: 650 },
    defaultPosition: { x: 125, y: 100 },
    isResizable: true,
    isDraggable: true,
    component: WorkspaceManager,
  },
};

// Get app component by type
export const getAppComponent = (appType: AppType): React.ComponentType<any> => {
  const config = appConfigs[appType];
  if (!config) {
    throw new Error(`Unknown app type: ${appType}`);
  }
  return config.component;
};

// Get app config by type
export const getAppConfig = (appType: AppType): AppConfig => {
  const config = appConfigs[appType];
  if (!config) {
    throw new Error(`Unknown app type: ${appType}`);
  }
  return config;
};

// Get all available apps
export const getAllApps = (): AppConfig[] => {
  return Object.values(appConfigs);
};