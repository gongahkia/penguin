import {
  Plugin,
  PluginManifest,
  PluginAPI,
  PluginContext,
  PluginInstallOptions,
  PluginUpdateInfo,
  PluginPermission
} from '@/types/plugin';
import { store } from '@/store';
import { openWindow, closeWindow } from '@/store/slices/windowSlice';
import { findNodeByPath, createFile, createDirectory, deleteNode, updateFileContent } from '@/store/slices/fileSystemSlice';

class PluginManager {
  private plugins = new Map<string, Plugin>();
  private enabledPlugins = new Set<string>();
  private pluginAPI: PluginAPI;
  private eventEmitter = new EventTarget();

  constructor() {
    this.pluginAPI = this.createPluginAPI();
    this.loadInstalledPlugins();
  }

  private createPluginAPI(): PluginAPI {
    return {
      fs: {
        readFile: async (path: string) => {
          return await this.secureFileOperation('read', path);
        },
        writeFile: async (path: string, content: string) => {
          await this.secureFileOperation('write', path, content);
        },
        deleteFile: async (path: string) => {
          await this.secureFileOperation('delete', path);
        },
        listFiles: async (path: string) => {
          return await this.secureFileOperation('list', path);
        },
        createDirectory: async (path: string) => {
          await this.secureFileOperation('mkdir', path);
        }
      },

      system: {
        openWindow: async (config) => {
          return await this.openPluginWindow(config);
        },
        closeWindow: async (windowId: string) => {
          await this.closePluginWindow(windowId);
        },
        showNotification: async (message: string, options?) => {
          await this.showPluginNotification(message, options);
        },
        getSystemInfo: async () => {
          return {
            version: '1.0.0',
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: { width: screen.width, height: screen.height },
            theme: 'light' // Get from app state
          };
        }
      },

      storage: {
        get: async (key: string) => {
          const stored = localStorage.getItem(`plugin-storage-${key}`);
          return stored ? JSON.parse(stored) : null;
        },
        set: async (key: string, value: any) => {
          localStorage.setItem(`plugin-storage-${key}`, JSON.stringify(value));
        },
        delete: async (key: string) => {
          localStorage.removeItem(`plugin-storage-${key}`);
        },
        clear: async () => {
          Object.keys(localStorage)
            .filter(key => key.startsWith('plugin-storage-'))
            .forEach(key => localStorage.removeItem(key));
        }
      },

      network: {
        fetch: async (url: string, options?) => {
          if (!this.hasPermission('network')) {
            throw new Error('Network permission denied');
          }
          return fetch(url, options);
        },
        websocket: (url: string) => {
          if (!this.hasPermission('network')) {
            throw new Error('Network permission denied');
          }
          return new WebSocket(url);
        }
      },

      ui: {
        registerContextMenu: async (items) => {
          // Implementation for context menu registration
          console.log('Registering context menu items:', items);
        },
        showDialog: async (options) => {
          return new Promise((resolve) => {
            // Implementation for dialog display
            console.log('Showing dialog:', options);
            resolve(null);
          });
        },
        registerShortcut: async (key: string, callback: () => void) => {
          // Implementation for keyboard shortcuts
          document.addEventListener('keydown', (e) => {
            if (this.matchesShortcut(e, key)) {
              callback();
            }
          });
        }
      },

      events: {
        on: (event: string, callback: Function) => {
          this.eventEmitter.addEventListener(event, callback as EventListener);
        },
        off: (event: string, callback: Function) => {
          this.eventEmitter.removeEventListener(event, callback as EventListener);
        },
        emit: (event: string, data?: any) => {
          this.eventEmitter.dispatchEvent(new CustomEvent(event, { detail: data }));
        }
      }
    };
  }

  async installPlugin(options: PluginInstallOptions): Promise<void> {
    let manifest: PluginManifest;
    let source: string;

    if (options.url) {
      // Download from URL
      const response = await fetch(options.url);
      source = await response.text();
    } else if (options.file) {
      // Install from file
      source = await options.file.text();
    } else if (options.source) {
      // Install from source code
      source = options.source;
    } else {
      throw new Error('No plugin source provided');
    }

    // Parse and validate manifest
    manifest = this.parsePluginManifest(source);
    await this.validatePlugin(manifest, source);

    // Check permissions
    await this.requestPermissions(manifest.permissions);

    // Install plugin
    const plugin: Plugin = {
      manifest,
      main: await this.loadPluginMain(source, manifest),
      isLoaded: false,
      isEnabled: options.autoEnable ?? false
    };

    this.plugins.set(manifest.id, plugin);
    this.savePluginToStorage(manifest.id, source);

    if (options.autoEnable) {
      await this.enablePlugin(manifest.id);
    }

    console.log(`Plugin ${manifest.name} installed successfully`);
  }

  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    if (plugin.isEnabled) {
      return;
    }

    // Create plugin context
    plugin.context = {
      api: this.pluginAPI,
      manifest: plugin.manifest,
      storage: this.createPluginStorage(pluginId),
      logger: this.createPluginLogger(pluginId)
    };

    try {
      await plugin.main.activate(plugin.context);
      plugin.isEnabled = true;
      plugin.isLoaded = true;
      this.enabledPlugins.add(pluginId);

      this.eventEmitter.dispatchEvent(
        new CustomEvent('plugin-enabled', { detail: { pluginId } })
      );

      console.log(`Plugin ${plugin.manifest.name} enabled`);
    } catch (error) {
      console.error(`Failed to enable plugin ${plugin.manifest.name}:`, error);
      throw error;
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || !plugin.isEnabled) {
      return;
    }

    try {
      await plugin.main.deactivate();
      plugin.isEnabled = false;
      plugin.isLoaded = false;
      this.enabledPlugins.delete(pluginId);

      this.eventEmitter.dispatchEvent(
        new CustomEvent('plugin-disabled', { detail: { pluginId } })
      );

      console.log(`Plugin ${plugin.manifest.name} disabled`);
    } catch (error) {
      console.error(`Failed to disable plugin ${plugin.manifest.name}:`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId: string): Promise<void> {
    await this.disablePlugin(pluginId);
    this.plugins.delete(pluginId);
    this.removePluginFromStorage(pluginId);

    this.eventEmitter.dispatchEvent(
      new CustomEvent('plugin-uninstalled', { detail: { pluginId } })
    );

    console.log(`Plugin ${pluginId} uninstalled`);
  }

  async checkForUpdates(pluginId: string): Promise<PluginUpdateInfo> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    // Implementation would check remote registry for updates
    return {
      available: false,
      currentVersion: plugin.manifest.version,
      latestVersion: plugin.manifest.version
    };
  }

  private parsePluginManifest(source: string): PluginManifest {
    // Extract manifest from plugin source
    const manifestMatch = source.match(/\/\*\s*MANIFEST\s*([\s\S]*?)\s*\*\//);
    if (!manifestMatch) {
      throw new Error('Plugin manifest not found');
    }

    try {
      return JSON.parse(manifestMatch[1]);
    } catch (error) {
      throw new Error('Invalid plugin manifest JSON');
    }
  }

  private async validatePlugin(manifest: PluginManifest, source: string): Promise<void> {
    // Validate manifest structure
    const requiredFields = ['id', 'name', 'version', 'description', 'entryPoint'];
    for (const field of requiredFields) {
      if (!manifest[field as keyof PluginManifest]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate permissions
    if (manifest.permissions) {
      for (const permission of manifest.permissions) {
        if (!this.isValidPermission(permission)) {
          throw new Error(`Invalid permission: ${permission.type}`);
        }
      }
    }

    // Basic security checks
    if (this.containsSuspiciousCode(source)) {
      throw new Error('Plugin contains potentially unsafe code');
    }
  }

  private async loadPluginMain(source: string, manifest: PluginManifest): Promise<any> {
    // Create isolated execution context for plugin
    const pluginFunction = new Function('exports', 'require', 'module', source);
    const exports = {};
    const module = { exports };

    // Mock require function for basic dependencies
    const require = (dep: string) => {
      if (dep === 'react') return React;
      throw new Error(`Dependency ${dep} not available`);
    };

    pluginFunction.call(null, exports, require, module);

    return module.exports;
  }

  private async requestPermissions(permissions: PluginPermission[]): Promise<void> {
    // Implementation would show permission dialog to user
    console.log('Requesting permissions:', permissions);
  }

  private isValidPermission(permission: PluginPermission): boolean {
    const validTypes = ['filesystem', 'network', 'system', 'storage', 'notifications'];
    return validTypes.includes(permission.type);
  }

  private containsSuspiciousCode(source: string): boolean {
    const suspiciousPatterns = [
      /eval\s*\(/,
      /Function\s*\(/,
      /document\.write/,
      /window\.location/,
      /localStorage\.clear/,
      /sessionStorage\.clear/
    ];

    return suspiciousPatterns.some(pattern => pattern.test(source));
  }

  private async secureFileOperation(operation: string, path: string, content?: string): Promise<any> {
    // Implement secure file operations with permission checks
    if (!this.hasPermission('filesystem')) {
      throw new Error('Filesystem permission denied');
    }

    const state = store.getState();
    const fileSystem = state.fileSystem;

    switch (operation) {
      case 'read': {
        const node = findNodeByPath(fileSystem.root, path);
        if (!node) throw new Error(`File not found: ${path}`);
        if (node.type !== 'file') throw new Error(`Path is not a file: ${path}`);
        return node.content || '';
      }

      case 'write': {
        const node = findNodeByPath(fileSystem.root, path);
        if (node && node.type === 'file') {
          store.dispatch(updateFileContent({ path, content: content || '' }));
        } else {
          // Create new file
          const parentPath = path.substring(0, path.lastIndexOf('/'));
          const fileName = path.substring(path.lastIndexOf('/') + 1);
          store.dispatch(createFile({ parentPath, name: fileName, content: content || '' }));
        }
        return;
      }

      case 'delete': {
        const node = findNodeByPath(fileSystem.root, path);
        if (!node) throw new Error(`File not found: ${path}`);
        store.dispatch(deleteNode(path));
        return;
      }

      case 'list': {
        const node = findNodeByPath(fileSystem.root, path);
        if (!node) throw new Error(`Directory not found: ${path}`);
        if (node.type !== 'directory') throw new Error(`Path is not a directory: ${path}`);
        return node.children ? node.children.map(child => child.name) : [];
      }

      case 'mkdir': {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const dirName = path.substring(path.lastIndexOf('/') + 1);
        store.dispatch(createDirectory({ parentPath, name: dirName }));
        return;
      }

      default:
        throw new Error(`Unsupported file operation: ${operation}`);
    }
  }

  private hasPermission(type: string): boolean {
    // Check if current plugin has permission
    return true; // Simplified for now
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
    // Parse and match keyboard shortcuts
    const parts = shortcut.toLowerCase().split('+');
    return parts.every(part => {
      switch (part) {
        case 'ctrl': return event.ctrlKey;
        case 'alt': return event.altKey;
        case 'shift': return event.shiftKey;
        case 'meta': return event.metaKey;
        default: return event.key.toLowerCase() === part;
      }
    });
  }

  private async openPluginWindow(config: any): Promise<string> {
    const windowId = `plugin-window-${Date.now()}`;

    store.dispatch(openWindow({
      id: windowId,
      title: config.title,
      appType: 'plugin',
      position: config.position || { x: 100, y: 100 },
      size: config.size || { width: 800, height: 600 },
      isResizable: config.resizable !== false,
      isDraggable: config.draggable !== false
    }));

    return windowId;
  }

  private async closePluginWindow(windowId: string): Promise<void> {
    store.dispatch(closeWindow(windowId));
  }

  private async showPluginNotification(message: string, options?: any): Promise<void> {
    // Create a notification element
    const notification = document.createElement('div');
    notification.className = 'plugin-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">×</button>
      </div>
    `;

    // Add styles if not already present
    if (!document.querySelector('#plugin-notification-styles')) {
      const styles = document.createElement('style');
      styles.id = 'plugin-notification-styles';
      styles.textContent = `
        .plugin-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #333;
          color: white;
          padding: 12px 16px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 10000;
          max-width: 300px;
          animation: slideIn 0.3s ease-out;
        }
        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          padding: 0;
          margin-left: auto;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds or when clicked
    const remove = () => {
      notification.remove();
    };

    notification.querySelector('.notification-close')?.addEventListener('click', remove);
    setTimeout(remove, options?.duration || 5000);
  }

  private createPluginStorage(pluginId: string) {
    return {
      get: async (key: string) => {
        const stored = localStorage.getItem(`plugin-${pluginId}-${key}`);
        return stored ? JSON.parse(stored) : null;
      },
      set: async (key: string, value: any) => {
        localStorage.setItem(`plugin-${pluginId}-${key}`, JSON.stringify(value));
      },
      delete: async (key: string) => {
        localStorage.removeItem(`plugin-${pluginId}-${key}`);
      },
      clear: async () => {
        Object.keys(localStorage)
          .filter(key => key.startsWith(`plugin-${pluginId}-`))
          .forEach(key => localStorage.removeItem(key));
      }
    };
  }

  private createPluginLogger(pluginId: string) {
    const prefix = `[Plugin:${pluginId}]`;
    return {
      log: (message: string, ...args: any[]) => console.log(prefix, message, ...args),
      warn: (message: string, ...args: any[]) => console.warn(prefix, message, ...args),
      error: (message: string, ...args: any[]) => console.error(prefix, message, ...args),
      debug: (message: string, ...args: any[]) => console.debug(prefix, message, ...args)
    };
  }

  private savePluginToStorage(pluginId: string, source: string): void {
    localStorage.setItem(`plugin-source-${pluginId}`, source);
  }

  private removePluginFromStorage(pluginId: string): void {
    localStorage.removeItem(`plugin-source-${pluginId}`);
    Object.keys(localStorage)
      .filter(key => key.startsWith(`plugin-${pluginId}-`))
      .forEach(key => localStorage.removeItem(key));
  }

  private loadInstalledPlugins(): void {
    // Load previously installed plugins from storage
    Object.keys(localStorage)
      .filter(key => key.startsWith('plugin-source-'))
      .forEach(key => {
        const pluginId = key.replace('plugin-source-', '');
        const source = localStorage.getItem(key);
        if (source) {
          try {
            const manifest = this.parsePluginManifest(source);
            const plugin: Plugin = {
              manifest,
              main: {} as any, // Will be loaded when enabled
              isLoaded: false,
              isEnabled: false
            };
            this.plugins.set(pluginId, plugin);
          } catch (error) {
            console.error(`Failed to load plugin ${pluginId}:`, error);
          }
        }
      });
  }

  getInstalledPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getInstalledPlugins().filter(plugin => plugin.isEnabled);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  addEventListener(event: string, callback: EventListener): void {
    this.eventEmitter.addEventListener(event, callback);
  }

  removeEventListener(event: string, callback: EventListener): void {
    this.eventEmitter.removeEventListener(event, callback);
  }
}

export const pluginManager = new PluginManager();
export default PluginManager;