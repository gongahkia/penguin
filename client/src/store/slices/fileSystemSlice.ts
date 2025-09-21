import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FileSystemNode } from '@/types';

interface FileSystemSliceState {
  root: FileSystemNode;
  currentPath: string;
  clipboard: FileSystemNode | null;
  clipboardAction: 'copy' | 'cut' | null;
}

const createInitialFileSystem = (): FileSystemNode => ({
  name: 'root',
  type: 'directory',
  path: '/',
  parentPath: null,
  lastModified: new Date(),
  created: new Date(),
  children: [
    {
      name: 'home',
      type: 'directory',
      path: '/home',
      parentPath: '/',
      lastModified: new Date(),
      created: new Date(),
      children: [
        {
          name: 'user',
          type: 'directory',
          path: '/home/user',
          parentPath: '/home',
          lastModified: new Date(),
          created: new Date(),
          children: [
            {
              name: 'Documents',
              type: 'directory',
              path: '/home/user/Documents',
              parentPath: '/home/user',
              lastModified: new Date(),
              created: new Date(),
              children: [
                {
                  name: 'welcome.txt',
                  type: 'file',
                  path: '/home/user/Documents/welcome.txt',
                  parentPath: '/home/user/Documents',
                  content: 'Welcome to Penguin OS!\n\nThis is a custom operating system simulation running in your browser.\n\nFeatures:\n- Interactive desktop environment\n- Terminal with command line interface\n- File system simulation\n- Multiple applications\n\nEnjoy exploring!',
                  size: 245,
                  lastModified: new Date(),
                  created: new Date(),
                },
              ],
            },
            {
              name: 'Desktop',
              type: 'directory',
              path: '/home/user/Desktop',
              parentPath: '/home/user',
              lastModified: new Date(),
              created: new Date(),
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: 'bin',
      type: 'directory',
      path: '/bin',
      parentPath: '/',
      lastModified: new Date(),
      created: new Date(),
      children: [],
    },
    {
      name: 'etc',
      type: 'directory',
      path: '/etc',
      parentPath: '/',
      lastModified: new Date(),
      created: new Date(),
      children: [],
    },
  ],
});

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

    createFile: (state, action: PayloadAction<{ parentPath: string; name: string; content?: string }>) => {
      const { parentPath, name, content = '' } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);
      
      if (parentNode && parentNode.type === 'directory') {
        const newFile: FileSystemNode = {
          name,
          type: 'file',
          path: `${parentPath}/${name}`,
          parentPath,
          content,
          size: content.length,
          lastModified: new Date(),
          created: new Date(),
        };
        
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newFile);
        parentNode.lastModified = new Date();
      }
    },

    createDirectory: (state, action: PayloadAction<{ parentPath: string; name: string }>) => {
      const { parentPath, name } = action.payload;
      const parentNode = findNodeByPath(state.root, parentPath);
      
      if (parentNode && parentNode.type === 'directory') {
        const newDir: FileSystemNode = {
          name,
          type: 'directory',
          path: `${parentPath}/${name}`,
          parentPath,
          lastModified: new Date(),
          created: new Date(),
          children: [],
        };
        
        if (!parentNode.children) parentNode.children = [];
        parentNode.children.push(newDir);
        parentNode.lastModified = new Date();
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
      
      if (node && node.type === 'file') {
        node.content = content;
        node.size = content.length;
        node.lastModified = new Date();
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
  deleteNode,
  renameNode,
  updateFileContent,
  copyToClipboard,
  cutToClipboard,
  pasteFromClipboard,
} = fileSystemSlice.actions;

export default fileSystemSlice.reducer;
export { findNodeByPath };