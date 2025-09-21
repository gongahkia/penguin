import { FileSystemNode, FilePermissions, FileOwnership } from '@/types';

let nextInode = 1;
let currentUserId = 1000;
let currentGroupId = 1000;

export const getNextInode = (): number => nextInode++;

export const getCurrentUser = (): string => 'user';
export const getCurrentGroup = (): string => 'users';
export const getCurrentUserId = (): number => currentUserId;
export const getCurrentGroupId = (): number => currentGroupId;

export const createDefaultPermissions = (type: 'file' | 'directory'): FilePermissions => {
  if (type === 'directory') {
    return {
      owner: ['read', 'write', 'execute'],
      group: ['read', 'execute'],
      others: ['read', 'execute'],
      numeric: '755'
    };
  } else {
    return {
      owner: ['read', 'write'],
      group: ['read'],
      others: ['read'],
      numeric: '644'
    };
  }
};

export const createDefaultOwnership = (): FileOwnership => ({
  owner: getCurrentUser(),
  group: getCurrentGroup(),
  uid: getCurrentUserId(),
  gid: getCurrentGroupId()
});

export const permissionsToNumeric = (permissions: FilePermissions): string => {
  const permToNumber = (perms: string[]): number => {
    let num = 0;
    if (perms.includes('read')) num += 4;
    if (perms.includes('write')) num += 2;
    if (perms.includes('execute')) num += 1;
    return num;
  };

  const owner = permToNumber(permissions.owner);
  const group = permToNumber(permissions.group);
  const others = permToNumber(permissions.others);

  return `${owner}${group}${others}`;
};

export const numericToPermissions = (numeric: string): FilePermissions => {
  const numberToPerms = (num: number): ('read' | 'write' | 'execute')[] => {
    const perms: ('read' | 'write' | 'execute')[] = [];
    if (num & 4) perms.push('read');
    if (num & 2) perms.push('write');
    if (num & 1) perms.push('execute');
    return perms;
  };

  const [owner, group, others] = numeric.split('').map(Number);

  return {
    owner: numberToPerms(owner),
    group: numberToPerms(group),
    others: numberToPerms(others),
    numeric
  };
};

export const checkPermission = (
  node: FileSystemNode,
  permission: 'read' | 'write' | 'execute',
  user: string = getCurrentUser(),
  userGroups: string[] = [getCurrentGroup()]
): boolean => {
  // Root user has all permissions
  if (user === 'root') return true;

  // Check owner permissions
  if (node.ownership.owner === user) {
    return node.permissions.owner.includes(permission);
  }

  // Check group permissions
  if (userGroups.includes(node.ownership.group)) {
    return node.permissions.group.includes(permission);
  }

  // Check others permissions
  return node.permissions.others.includes(permission);
};

export const calculateChecksum = async (content: string): Promise<string> => {
  try {
    // Use Web Crypto API if available
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    // Fallback to simple hash
  }

  // Simple hash fallback for browser environment
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const getMimeType = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const mimeTypes: Record<string, string> = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'js': 'text/javascript',
    'ts': 'text/typescript',
    'jsx': 'text/javascript',
    'tsx': 'text/typescript',
    'json': 'application/json',
    'xml': 'application/xml',
    'html': 'text/html',
    'css': 'text/css',
    'scss': 'text/scss',
    'sass': 'text/sass',
    'py': 'text/x-python',
    'java': 'text/x-java-source',
    'c': 'text/x-c',
    'cpp': 'text/x-c++',
    'h': 'text/x-c',
    'php': 'text/x-php',
    'rb': 'text/x-ruby',
    'go': 'text/x-go',
    'rs': 'text/x-rust',
    'sh': 'application/x-sh',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo',
    'pdf': 'application/pdf',
    'zip': 'application/zip',
    'tar': 'application/x-tar',
    'gz': 'application/gzip'
  };

  return mimeTypes[ext] || 'application/octet-stream';
};

export const createEnhancedNode = (
  name: string,
  type: 'file' | 'directory' | 'symlink' | 'hardlink',
  path: string,
  parentPath: string | null,
  options: {
    content?: string;
    permissions?: FilePermissions;
    ownership?: FileOwnership;
    linkTarget?: string;
    isHidden?: boolean;
    tags?: string[];
    metadata?: Record<string, any>;
  } = {}
): FileSystemNode => {
  const now = new Date();
  const {
    content = '',
    permissions = createDefaultPermissions(type === 'symlink' ? 'file' : type),
    ownership = createDefaultOwnership(),
    linkTarget,
    isHidden = name.startsWith('.'),
    tags = [],
    metadata = {}
  } = options;

  const node: FileSystemNode = {
    name,
    type,
    path,
    parentPath,
    created: now,
    lastModified: now,
    accessed: now,
    permissions,
    ownership,
    linkCount: type === 'directory' ? 2 : 1,
    inode: getNextInode(),
    isHidden,
    tags,
    metadata
  };

  if (type === 'file' || type === 'symlink' || type === 'hardlink') {
    node.content = content;
    node.size = content.length;
    node.mimeType = getMimeType(name);
    // Calculate checksum synchronously using simple hash for now
    node.checksum = calculateSimpleChecksum(content);
  }

  if (type === 'symlink' || type === 'hardlink') {
    node.linkTarget = linkTarget;
  }

  if (type === 'directory') {
    node.children = [];
  }

  return node;
};

export const calculateSimpleChecksum = (content: string): string => {
  let hash = 0;
  if (content.length === 0) return hash.toString();
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
};

export const resolveSymlink = (node: FileSystemNode, root: FileSystemNode): FileSystemNode | null => {
  if (node.type !== 'symlink' || !node.linkTarget) {
    return node;
  }

  const findNodeByPath = (currentNode: FileSystemNode, targetPath: string): FileSystemNode | null => {
    if (currentNode.path === targetPath) return currentNode;

    if (currentNode.children) {
      for (const child of currentNode.children) {
        const found = findNodeByPath(child, targetPath);
        if (found) return found;
      }
    }

    return null;
  };

  // Resolve relative paths
  let targetPath = node.linkTarget;
  if (!targetPath.startsWith('/')) {
    const parentPath = node.parentPath || '/';
    targetPath = `${parentPath}/${targetPath}`.replace(/\/+/g, '/');
  }

  return findNodeByPath(root, targetPath);
};

export const isValidFilename = (name: string): boolean => {
  // Check for invalid characters
  const invalidChars = /[<>:"|?*\x00-\x1f]/;
  if (invalidChars.test(name)) return false;

  // Check for reserved names
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
  if (reservedNames.includes(name.toUpperCase())) return false;

  // Check length
  if (name.length === 0 || name.length > 255) return false;

  // Check for dots only
  if (/^\.+$/.test(name)) return false;

  return true;
};

export const getFileIcon = (node: FileSystemNode): string => {
  if (node.type === 'directory') {
    return '📁';
  }

  if (node.type === 'symlink') {
    return '🔗';
  }

  if (!node.mimeType) {
    return '📄';
  }

  const iconMap: Record<string, string> = {
    'text/plain': '📄',
    'text/markdown': '📝',
    'text/javascript': '📜',
    'text/typescript': '📜',
    'application/json': '📋',
    'text/html': '🌐',
    'text/css': '🎨',
    'image/png': '🖼️',
    'image/jpeg': '🖼️',
    'image/gif': '🖼️',
    'image/svg+xml': '🖼️',
    'audio/mpeg': '🎵',
    'audio/wav': '🎵',
    'video/mp4': '🎬',
    'video/x-msvideo': '🎬',
    'application/pdf': '📕',
    'application/zip': '🗜️',
    'application/x-tar': '🗜️',
    'application/gzip': '🗜️',
    'application/x-sh': '⚡'
  };

  return iconMap[node.mimeType] || '📄';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const formatPermissions = (permissions: FilePermissions): string => {
  const formatPerms = (perms: string[]): string => {
    let result = '';
    result += perms.includes('read') ? 'r' : '-';
    result += perms.includes('write') ? 'w' : '-';
    result += perms.includes('execute') ? 'x' : '-';
    return result;
  };

  return formatPerms(permissions.owner) +
         formatPerms(permissions.group) +
         formatPerms(permissions.others);
};