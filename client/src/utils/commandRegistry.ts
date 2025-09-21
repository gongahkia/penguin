import { TerminalCommand, TerminalInstance } from '@/types';
import { store } from '@/store';
import { openWindow } from '@/store/slices/windowSlice';
import { getAppConfig, getAllApps } from './appRegistry';
import { navigateToPath, createFile, createDirectory, deleteNode } from '@/store/slices/fileSystemSlice';
import { findNodeByPath } from '@/store/slices/fileSystemSlice';

// Core terminal commands
export const commandRegistry: Record<string, TerminalCommand> = {
  help: {
    name: 'help',
    description: 'Lists available commands',
    usage: 'help [command]',
    handler: (args) => {
      if (args.length > 0) {
        const commandName = args[0];
        const command = commandRegistry[commandName];
        if (command) {
          return `${command.name}: ${command.description}\\nUsage: ${command.usage}`;
        } else {
          return `Command '${commandName}' not found. Type 'help' to see all available commands.`;
        }
      }

      const commands = Object.values(commandRegistry)
        .map(cmd => `  ${cmd.name.padEnd(15)} - ${cmd.description}`)
        .join('\\n');

      return `Available commands:\\n\\n${commands}\\n\\nType 'help <command>' for detailed information about a specific command.`;
    },
  },

  clear: {
    name: 'clear',
    description: 'Clears the terminal screen',
    usage: 'clear',
    handler: () => {
      // This will be handled specially in the terminal component
      return '__CLEAR_TERMINAL__';
    },
  },

  echo: {
    name: 'echo',
    description: 'Outputs the given message',
    usage: 'echo <message>',
    handler: (args) => {
      return args.join(' ') || '';
    },
  },

  open: {
    name: 'open',
    description: 'Opens an application',
    usage: 'open <app_name>',
    handler: (args) => {
      if (args.length === 0) {
        const apps = getAllApps();
        const appList = apps.map(app => `  ${app.type.padEnd(15)} - ${app.name}`).join('\\n');
        return `Available applications:\\n\\n${appList}\\n\\nUsage: open <app_name>`;
      }

      const appName = args[0].toLowerCase();
      const apps = getAllApps();
      const app = apps.find(a =>
        a.type.toLowerCase() === appName ||
        a.name.toLowerCase() === appName ||
        a.name.toLowerCase().replace(' ', '') === appName
      );

      if (!app) {
        return `Application '${appName}' not found. Type 'open' to see available applications.`;
      }

      const config = getAppConfig(app.type);
      const windowId = `${app.type}-${Date.now()}`;

      store.dispatch(openWindow({
        id: windowId,
        title: config.name,
        appType: config.type,
        position: config.defaultPosition,
        size: config.defaultSize,
        isResizable: config.isResizable,
        isDraggable: config.isDraggable,
      }));

      return `Opened ${config.name}`;
    },
  },

  list: {
    name: 'list',
    description: 'Lists currently open windows',
    usage: 'list',
    handler: () => {
      const state = store.getState();
      const windows = state.windows.windows;

      if (windows.length === 0) {
        return 'No windows are currently open.';
      }

      const windowList = windows
        .map((window, index) => {
          const status = window.isMinimized ? '(minimized)' : window.isActive ? '(active)' : '';
          return `  ${(index + 1).toString().padStart(2)}. ${window.title} ${status}`;
        })
        .join('\\n');

      return `Open windows:\\n\\n${windowList}`;
    },
  },

  close: {
    name: 'close',
    description: 'Closes a window by name or ID',
    usage: 'close <window_name>',
    handler: (args) => {
      if (args.length === 0) {
        return 'Usage: close <window_name>\\nType "list" to see open windows.';
      }

      const state = store.getState();
      const windows = state.windows.windows;
      const targetName = args.join(' ').toLowerCase();

      const window = windows.find(w =>
        w.title.toLowerCase().includes(targetName) ||
        w.appType.toLowerCase() === targetName
      );

      if (!window) {
        return `Window '${targetName}' not found. Type 'list' to see open windows.`;
      }

      store.dispatch({ type: 'windows/closeWindow', payload: window.id });
      return `Closed ${window.title}`;
    },
  },

  pwd: {
    name: 'pwd',
    description: 'Shows current working directory',
    usage: 'pwd',
    handler: () => {
      const state = store.getState();
      return state.fileSystem.currentPath;
    },
  },

  ls: {
    name: 'ls',
    description: 'Lists files and directories',
    usage: 'ls [path]',
    handler: (args) => {
      const state = store.getState();
      const targetPath = args.length > 0 ? args[0] : state.fileSystem.currentPath;

      const node = findNodeByPath(state.fileSystem.root, targetPath);

      if (!node) {
        return `ls: ${targetPath}: No such file or directory`;
      }

      if (node.type === 'file') {
        return node.name;
      }

      if (!node.children || node.children.length === 0) {
        return 'Directory is empty';
      }

      const items = node.children
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'directory' ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        })
        .map(child => {
          const prefix = child.type === 'directory' ? 'd' : '-';
          const size = child.type === 'file' ? child.size?.toString().padStart(8) : '     dir';
          return `${prefix}  ${child.name.padEnd(20)} ${size}`;
        })
        .join('\\n');

      return items;
    },
  },

  cd: {
    name: 'cd',
    description: 'Changes current directory',
    usage: 'cd <path>',
    handler: (args, terminal) => {
      const state = store.getState();
      let targetPath: string;

      if (args.length === 0 || args[0] === '~') {
        targetPath = '/home/user';
      } else if (args[0] === '..') {
        const currentPath = state.fileSystem.currentPath;
        const pathParts = currentPath.split('/').filter(Boolean);
        pathParts.pop();
        targetPath = pathParts.length > 0 ? '/' + pathParts.join('/') : '/';
      } else if (args[0].startsWith('/')) {
        targetPath = args[0];
      } else {
        const currentPath = state.fileSystem.currentPath;
        targetPath = currentPath === '/' ? `/${args[0]}` : `${currentPath}/${args[0]}`;
      }

      const node = findNodeByPath(state.fileSystem.root, targetPath);

      if (!node) {
        return `cd: ${args[0]}: No such file or directory`;
      }

      if (node.type !== 'directory') {
        return `cd: ${args[0]}: Not a directory`;
      }

      store.dispatch(navigateToPath(targetPath));
      store.dispatch({
        type: 'terminal/changeDirectory',
        payload: { instanceId: terminal.workingDirectory, directory: targetPath }
      });

      return '';
    },
  },

  mkdir: {
    name: 'mkdir',
    description: 'Creates a new directory',
    usage: 'mkdir <directory_name>',
    handler: (args) => {
      if (args.length === 0) {
        return 'mkdir: missing operand\\nUsage: mkdir <directory_name>';
      }

      const state = store.getState();
      const currentPath = state.fileSystem.currentPath;
      const dirName = args[0];

      if (dirName.includes('/')) {
        return 'mkdir: invalid directory name';
      }

      store.dispatch(createDirectory({ parentPath: currentPath, name: dirName }));
      return `Directory '${dirName}' created`;
    },
  },

  touch: {
    name: 'touch',
    description: 'Creates a new empty file',
    usage: 'touch <filename>',
    handler: (args) => {
      if (args.length === 0) {
        return 'touch: missing operand\\nUsage: touch <filename>';
      }

      const state = store.getState();
      const currentPath = state.fileSystem.currentPath;
      const fileName = args[0];

      if (fileName.includes('/')) {
        return 'touch: invalid file name';
      }

      store.dispatch(createFile({ parentPath: currentPath, name: fileName, content: '' }));
      return `File '${fileName}' created`;
    },
  },

  rm: {
    name: 'rm',
    description: 'Removes a file or directory',
    usage: 'rm <filename>',
    handler: (args) => {
      if (args.length === 0) {
        return 'rm: missing operand\\nUsage: rm <filename>';
      }

      const state = store.getState();
      const currentPath = state.fileSystem.currentPath;
      const fileName = args[0];
      const filePath = fileName.startsWith('/') ? fileName : `${currentPath}/${fileName}`;

      const node = findNodeByPath(state.fileSystem.root, filePath);

      if (!node) {
        return `rm: ${fileName}: No such file or directory`;
      }

      store.dispatch(deleteNode(filePath));
      return `Removed '${fileName}'`;
    },
  },

  cat: {
    name: 'cat',
    description: 'Displays file contents',
    usage: 'cat <filename>',
    handler: (args) => {
      if (args.length === 0) {
        return 'cat: missing operand\\nUsage: cat <filename>';
      }

      const state = store.getState();
      const currentPath = state.fileSystem.currentPath;
      const fileName = args[0];
      const filePath = fileName.startsWith('/') ? fileName : `${currentPath}/${fileName}`;

      const node = findNodeByPath(state.fileSystem.root, filePath);

      if (!node) {
        return `cat: ${fileName}: No such file or directory`;
      }

      if (node.type !== 'file') {
        return `cat: ${fileName}: Is a directory`;
      }

      return node.content || '';
    },
  },

  date: {
    name: 'date',
    description: 'Displays current date and time',
    usage: 'date',
    handler: () => {
      return new Date().toString();
    },
  },

  whoami: {
    name: 'whoami',
    description: 'Displays current username',
    usage: 'whoami',
    handler: () => {
      const state = store.getState();
      return state.system.currentUser || 'user';
    },
  },

  uptime: {
    name: 'uptime',
    description: 'Shows system uptime',
    usage: 'uptime',
    handler: () => {
      const state = store.getState();
      const uptimeSeconds = state.system.uptime;
      const hours = Math.floor(uptimeSeconds / 3600);
      const minutes = Math.floor((uptimeSeconds % 3600) / 60);
      const seconds = uptimeSeconds % 60;

      return `up ${hours}h ${minutes}m ${seconds}s`;
    },
  },
};

// Function to execute a command
export const executeCommand = async (
  commandLine: string,
  terminal: TerminalInstance
): Promise<string> => {
  const trimmed = commandLine.trim();
  if (!trimmed) return '';

  const parts = trimmed.split(/\\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = commandRegistry[commandName];
  if (!command) {
    return `Command '${commandName}' not found. Type 'help' for available commands.`;
  }

  try {
    const result = await command.handler(args, terminal);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    return `Error executing '${commandName}': ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};