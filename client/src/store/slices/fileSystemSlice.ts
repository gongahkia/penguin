import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileSystemNode, FilePermissions, FileOwnership } from '@/types';
import {
  createEnhancedNode,
  checkPermission,
  resolveSymlink,
  getCurrentUser,
  isValidFilename,
  calculateChecksum,
  createDefaultPermissions,
  createDefaultOwnership
} from '@/utils/fileSystemUtils';

interface FileSystemSliceState {
  root: FileSystemNode;
  currentPath: string;
  clipboard: FileSystemNode | null;
  clipboardAction: 'copy' | 'cut' | null;
}

const createInitialFileSystem = (): FileSystemNode => {
  const welcomeContent = `Welcome to Penguin OS!

This is a custom operating system simulation running in your browser.

Features:
- Interactive desktop environment
- Terminal with command line interface
- Advanced file system with permissions and symlinks
- Multiple applications
- Plugin system

Enjoy exploring!`;

  const root = createEnhancedNode('root', 'directory', '/', null, {
    permissions: {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'execute'],
      others: ['read', 'execute'],
      numeric: '755'
    },
    ownership: { owner: 'root', group: 'root', uid: 0, gid: 0 }
  });

  const home = createEnhancedNode('home', 'directory', '/home', '/', {
    permissions: {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'execute'],
      others: ['read', 'execute'],
      numeric: '755'
    },
    ownership: { owner: 'root', group: 'root', uid: 0, gid: 0 }
  });

  const user = createEnhancedNode('user', 'directory', '/home/user', '/home');
  const documents = createEnhancedNode('Documents', 'directory', '/home/user/Documents', '/home/user');
  const desktop = createEnhancedNode('Desktop', 'directory', '/home/user/Desktop', '/home/user');
  const welcomeFile = createEnhancedNode('welcome.txt', 'file', '/home/user/Documents/welcome.txt', '/home/user/Documents', {
    content: welcomeContent
  });

  // Create system directories
  const bin = createEnhancedNode('bin', 'directory', '/bin', '/', {
    permissions: {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'execute'],
      others: ['read', 'execute'],
      numeric: '755'
    },
    ownership: { owner: 'root', group: 'root', uid: 0, gid: 0 }
  });

  const etc = createEnhancedNode('etc', 'directory', '/etc', '/', {
    permissions: {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'execute'],
      others: ['read'],
      numeric: '754'
    },
    ownership: { owner: 'root', group: 'root', uid: 0, gid: 0 }
  });

  const tmp = createEnhancedNode('tmp', 'directory', '/tmp', '/', {
    permissions: {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'write', 'execute'],
      others: ['read', 'write', 'execute'],
      numeric: '777'
    },
    ownership: { owner: 'root', group: 'root', uid: 0, gid: 0 }
  });

  // Create some example symlinks
  const desktopWelcome = createEnhancedNode('welcome_link.txt', 'symlink', '/home/user/Desktop/welcome_link.txt', '/home/user/Desktop', {
    linkTarget: '/home/user/Documents/welcome.txt'
  });

  // Add some hidden files
  const bashrc = createEnhancedNode('.bashrc', 'file', '/home/user/.bashrc', '/home/user', {
    content: '# Penguin OS bash configuration\nexport PS1="$ "\nalias ll="ls -la"\nalias la="ls -A"\n',
    isHidden: true
  });

  const profile = createEnhancedNode('.profile', 'file', '/home/user/.profile', '/home/user', {
    content: '# User profile for Penguin OS\nexport PATH="/bin:/usr/bin:/usr/local/bin"\n',
    isHidden: true
  });

  // Build the tree structure
  documents.children = [welcomeFile];
  desktop.children = [desktopWelcome];
  user.children = [documents, desktop, bashrc, profile];
  home.children = [user];
  root.children = [home, bin, etc, tmp];

  return root;
};

const initialState: FileSystemSliceState = {
  root: createInitialFileSystem(),
  currentPath: '/home/user',
  clipboard: null,
  clipboardAction: null,
};

const findNodeByPath = (root: FileSystemNode, path: string): FileSystemNode | null => {
  if (root.path === path) return root;
  
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeByPath(child, path);
      if (found) return found;
    }
  }
  
  return null;
};

const fileSystemSlice = createSlice({
  name: 'fileSystem',
  initialState,
  reducers: {
    navigateToPath: (state, action: PayloadAction<string>) => {
      const node = findNodeByPath(state.root, action.payload);
      if (node && node.type === 'directory') {
        state.currentPath = action.payload;
      }
    },

    createFile: (state, action: PayloadAction<{
      parentPath: string;
      name: string;
      content?: string;
      permissions?: FilePermissions;
      ownership?: FileOwnership;
    }>) => {
      const { parentPath, name, content = '', permissions, ownership } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);

      if (!isValidFilename(name)) return;

      if (parentNode && parentNode.type === 'directory' &&
          checkPermission(parentNode, 'write')) {

        const newFile = createEnhancedNode(name, 'file', `${parentPath}/${name}`, parentPath, {
          content,
          permissions,
          ownership
        });

        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newFile);
        parentNode.lastModified = new Date();
        parentNode.accessed = new Date();
      }
    },

    createDirectory: (state, action: PayloadAction<{
      parentPath: string;
      name: string;
      permissions?: FilePermissions;
      ownership?: FileOwnership;
    }>) => {
      const { parentPath, name, permissions, ownership } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);

      if (!isValidFilename(name)) return;

      if (parentNode && parentNode.type === 'directory' &&
          checkPermission(parentNode, 'write')) {

        const newDir = createEnhancedNode(name, 'directory', `${parentPath}/${name}`, parentPath, {
          permissions,
          ownership
        });

        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newDir);
        parentNode.lastModified = new Date();
        parentNode.accessed = new Date();
      }
    },

    createSymlink: (state, action: PayloadAction<{
      parentPath: string;
      name: string;
      linkTarget: string;
      permissions?: FilePermissions;
      ownership?: FileOwnership;
    }>) => {
      const { parentPath, name, linkTarget, permissions, ownership } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);

      if (!isValidFilename(name)) return;

      if (parentNode && parentNode.type === 'directory' &&
          checkPermission(parentNode, 'write')) {

        const newSymlink = createEnhancedNode(name, 'symlink', `${parentPath}/${name}`, parentPath, {
          linkTarget,
          permissions,
          ownership
        });

        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newSymlink);
        parentNode.lastModified = new Date();
        parentNode.accessed = new Date();
      }
    },

    createHardlink: (state, action: PayloadAction<{
      parentPath: string;
      name: string;
      linkTarget: string;
    }>) => {
      const { parentPath, name, linkTarget } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);
      const targetNode = findNodeByPath(state.root, linkTarget);

      if (!isValidFilename(name)) return;

      if (parentNode && parentNode.type === 'directory' &&
          checkPermission(parentNode, 'write') &&
          targetNode && targetNode.type === 'file') {

        const newHardlink = createEnhancedNode(name, 'hardlink', `${parentPath}/${name}`, parentPath, {
          content: targetNode.content,
          linkTarget,
          permissions: targetNode.permissions,
          ownership: targetNode.ownership
        });

        // Update link count for target
        targetNode.linkCount++;
        newHardlink.linkCount = targetNode.linkCount;
        newHardlink.inode = targetNode.inode;

        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newHardlink);
        parentNode.lastModified = new Date();
        parentNode.accessed = new Date();
      }
    },

    deleteNode: (state, action: PayloadAction<string>) => {
      const nodePath = action.payload;
      const node = findNodeByPath(state.root, nodePath);
      
      if (node && node.parentPath) {
        const parentNode = findNodeByPath(state.root, node.parentPath);
        if (parentNode && parentNode.children) {
          parentNode.children = parentNode.children.filter(child => child.path !== nodePath);
          parentNode.lastModified = new Date();
        }
      }
    },

    renameNode: (state, action: PayloadAction<{ path: string; newName: string }>) => {
      const { path, newName } = action.payload;
      const node = findNodeByPath(state.root, path);
      
      if (node && node.parentPath) {
        const oldName = node.name;
        const newPath = path.replace(new RegExp(`/${oldName}$`), `/${newName}`);
        
        node.name = newName;
        node.path = newPath;
        node.lastModified = new Date();
        
        // Update children paths recursively if it's a directory
        const updateChildrenPaths = (parentNode: FileSystemNode, oldBasePath: string, newBasePath: string) => {
          if (parentNode.children) {
            parentNode.children.forEach(child => {
              child.path = child.path.replace(oldBasePath, newBasePath);
              child.parentPath = newBasePath;
              if (child.type === 'directory') {
                updateChildrenPaths(child, oldBasePath, newBasePath);
              }
            });
          }
        };
        
        if (node.type === 'directory') {
          updateChildrenPaths(node, path, newPath);
        }
      }
    },

    updateFileContent: (state, action: PayloadAction<{ path: string; content: string }>) => {
      const { path, content } = action.payload;
      const node = findNodeByPath(state.root, path);

      if (node && (node.type === 'file' || node.type === 'hardlink') &&
          checkPermission(node, 'write')) {
        node.content = content;
        node.size = content.length;
        node.lastModified = new Date();
        node.accessed = new Date();
        node.checksum = calculateChecksum(content);

        // Update all hard links pointing to the same inode
        if (node.type === 'hardlink' || node.linkCount > 1) {
          const updateHardlinks = (currentNode: FileSystemNode) => {
            if (currentNode.children) {
              currentNode.children.forEach(child => {
                if (child.inode === node.inode && child.path !== path) {
                  child.content = content;
                  child.size = content.length;
                  child.lastModified = new Date();
                  child.checksum = node.checksum;
                }
                updateHardlinks(child);
              });
            }
          };
          updateHardlinks(state.root);
        }
      }
    },

    changePermissions: (state, action: PayloadAction<{ path: string; permissions: FilePermissions }>) => {
      const { path, permissions } = action.payload;
      const node = findNodeByPath(state.root, path);
      const currentUser = getCurrentUser();

      if (node && (node.ownership.owner === currentUser || currentUser === 'root')) {
        node.permissions = permissions;
        node.lastModified = new Date();
      }
    },

    changeOwnership: (state, action: PayloadAction<{ path: string; ownership: FileOwnership }>) => {
      const { path, ownership } = action.payload;
      const node = findNodeByPath(state.root, path);
      const currentUser = getCurrentUser();

      if (node && (node.ownership.owner === currentUser || currentUser === 'root')) {
        node.ownership = ownership;
        node.lastModified = new Date();
      }
    },

    addTag: (state, action: PayloadAction<{ path: string; tag: string }>) => {
      const { path, tag } = action.payload;
      const node = findNodeByPath(state.root, path);

      if (node && checkPermission(node, 'write')) {
        if (!node.tags) node.tags = [];
        if (!node.tags.includes(tag)) {
          node.tags.push(tag);
          node.lastModified = new Date();
        }
      }
    },

    removeTag: (state, action: PayloadAction<{ path: string; tag: string }>) => {
      const { path, tag } = action.payload;
      const node = findNodeByPath(state.root, path);

      if (node && checkPermission(node, 'write') && node.tags) {
        node.tags = node.tags.filter(t => t !== tag);
        node.lastModified = new Date();
      }
    },

    setMetadata: (state, action: PayloadAction<{ path: string; key: string; value: any }>) => {
      const { path, key, value } = action.payload;
      const node = findNodeByPath(state.root, path);

      if (node && checkPermission(node, 'write')) {
        if (!node.metadata) node.metadata = {};
        node.metadata[key] = value;
        node.lastModified = new Date();
      }
    },

    accessNode: (state, action: PayloadAction<string>) => {
      const path = action.payload;
      const node = findNodeByPath(state.root, path);

      if (node && checkPermission(node, 'read')) {
        node.accessed = new Date();
      }
    },

    copyToClipboard: (state, action: PayloadAction<string>) => {
      const node = findNodeByPath(state.root, action.payload);
      if (node) {
        state.clipboard = { ...node };
        state.clipboardAction = 'copy';
      }
    },

    cutToClipboard: (state, action: PayloadAction<string>) => {
      const node = findNodeByPath(state.root, action.payload);
      if (node) {
        state.clipboard = { ...node };
        state.clipboardAction = 'cut';
      }
    },

    pasteFromClipboard: (state, action: PayloadAction<string>) => {
      const targetPath = action.payload;
      const targetNode = findNodeByPath(state.root, targetPath);
      
      if (state.clipboard && targetNode && targetNode.type === 'directory') {
        const newPath = `${targetPath}/${state.clipboard.name}`;
        const copiedNode: FileSystemNode = {
          ...state.clipboard,
          path: newPath,
          parentPath: targetPath,
          created: new Date(),
          lastModified: new Date(),
        };
        
        if (!targetNode.children) targetNode.children = [];
        targetNode.children.push(copiedNode);
        
        if (state.clipboardAction === 'cut') {
          // Remove from original location
          const originalParentNode = findNodeByPath(state.root, state.clipboard.parentPath!);
          if (originalParentNode && originalParentNode.children) {
            originalParentNode.children = originalParentNode.children.filter(
              child => child.path !== state.clipboard!.path
            );
          }
          state.clipboard = null;
          state.clipboardAction = null;
        }
      }
    },
  },
});

export const {
  navigateToPath,
  createFile,
  createDirectory,
  createSymlink,
  createHardlink,
  deleteNode,
  renameNode,
  updateFileContent,
  changePermissions,
  changeOwnership,
  addTag,
  removeTag,
  setMetadata,
  accessNode,
  copyToClipboard,
  cutToClipboard,
  pasteFromClipboard,
} = fileSystemSlice.actions;

export default fileSystemSlice.reducer;
export { findNodeByPath };