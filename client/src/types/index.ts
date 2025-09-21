export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface WindowState {
  id: string;
  title: string;
  appType: AppType;
  position: Position;
  size: Size;
  isMinimized: boolean;
  isMaximized: boolean;
  isActive: boolean;
  zIndex: number;
  isResizable: boolean;
  isDraggable: boolean;
}

export type AppType =
  | 'terminal'
  | 'textEditor'
  | 'fileExplorer'
  | 'mediaPlayer'
  | 'calculator'
  | 'notepad'
  | 'settings';

export interface AppConfig {
  id: string;
  name: string;
  type: AppType;
  icon: string;
  defaultSize: Size;
  defaultPosition: Position;
  isResizable: boolean;
  isDraggable: boolean;
  component: React.ComponentType<any>;
}

export interface TerminalCommand {
  name: string;
  description: string;
  usage: string;
  handler: (args: string[], terminal: TerminalInstance) => Promise<string> | string;
}

export interface TerminalInstance {
  output: TerminalOutputLine[];
  input: string;
  history: string[];
  historyIndex: number;
  isProcessing: boolean;
  workingDirectory: string;
}

export interface TerminalOutputLine {
  id: string;
  content: string;
  type: 'output' | 'error' | 'input' | 'system';
  timestamp: Date;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  path: string;
  parentPath: string | null;
  size?: number;
  content?: string;
  lastModified: Date;
  created: Date;
  children?: FileSystemNode[];
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  wallpaper: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  terminalTheme: string;
  fontSize: number;
}

export interface SystemState {
  currentUser: string | null;
  uptime: number;
  runningProcesses: Process[];
  memoryUsage: number;
  cpuUsage: number;
}

export interface Process {
  id: string;
  name: string;
  type: 'app' | 'system';
  status: 'running' | 'suspended' | 'terminated';
  memoryUsage: number;
  cpuUsage: number;
  startTime: Date;
}