import React from 'react';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  icon?: string;
  permissions: PluginPermission[];
  entryPoint: string;
  dependencies?: string[];
  minPenguinVersion: string;
  tags?: string[];
  screenshots?: string[];
  homepage?: string;
  repository?: string;
  license?: string;
}

export interface PluginPermission {
  type: 'filesystem' | 'network' | 'system' | 'storage' | 'notifications' | 'camera' | 'microphone';
  scope?: string;
  description: string;
}

export interface PluginAPI {
  // File system operations
  fs: {
    readFile: (path: string) => Promise<string>;
    writeFile: (path: string, content: string) => Promise<void>;
    deleteFile: (path: string) => Promise<void>;
    listFiles: (path: string) => Promise<string[]>;
    createDirectory: (path: string) => Promise<void>;
  };

  // System operations
  system: {
    openWindow: (config: WindowConfig) => Promise<string>;
    closeWindow: (windowId: string) => Promise<void>;
    showNotification: (message: string, options?: NotificationOptions) => Promise<void>;
    getSystemInfo: () => Promise<SystemInfo>;
  };

  // Storage operations
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
    clear: () => Promise<void>;
  };

  // Network operations
  network: {
    fetch: (url: string, options?: RequestInit) => Promise<Response>;
    websocket: (url: string) => WebSocket;
  };

  // UI operations
  ui: {
    registerContextMenu: (items: ContextMenuItem[]) => Promise<void>;
    showDialog: (options: DialogOptions) => Promise<any>;
    registerShortcut: (key: string, callback: () => void) => Promise<void>;
  };

  // Events
  events: {
    on: (event: string, callback: Function) => void;
    off: (event: string, callback: Function) => void;
    emit: (event: string, data?: any) => void;
  };
}

export interface WindowConfig {
  title: string;
  component: React.ComponentType<any>;
  size: { width: number; height: number };
  position?: { x: number; y: number };
  resizable?: boolean;
  draggable?: boolean;
  modal?: boolean;
}

export interface SystemInfo {
  version: string;
  platform: string;
  userAgent: string;
  screenSize: { width: number; height: number };
  theme: string;
}

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: string;
  action: () => void;
  separator?: boolean;
  submenu?: ContextMenuItem[];
}

export interface DialogOptions {
  type: 'alert' | 'confirm' | 'prompt' | 'custom';
  title: string;
  message: string;
  buttons?: string[];
  defaultValue?: string;
  component?: React.ComponentType<any>;
}

export interface Plugin {
  manifest: PluginManifest;
  main: PluginMain;
  isLoaded: boolean;
  isEnabled: boolean;
  context?: PluginContext;
}

export interface PluginMain {
  activate: (context: PluginContext) => Promise<void>;
  deactivate: () => Promise<void>;
}

export interface PluginContext {
  api: PluginAPI;
  manifest: PluginManifest;
  storage: PluginStorage;
  logger: PluginLogger;
}

export interface PluginStorage {
  get: (key: string) => Promise<any>;
  set: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface PluginLogger {
  log: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export interface PluginInstallOptions {
  url?: string;
  file?: File;
  source?: string;
  autoEnable?: boolean;
}

export interface PluginUpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  changelog?: string;
}

export interface PluginRegistry {
  plugins: PluginManifest[];
  categories: string[];
  featured: string[];
  trending: string[];
}

export interface PluginSearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  sortBy?: 'name' | 'downloads' | 'rating' | 'updated';
  limit?: number;
  offset?: number;
}