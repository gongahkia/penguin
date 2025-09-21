import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { navigateToPath, createFile, createDirectory, deleteNode, renameNode } from '@/store/slices/fileSystemSlice';
import { findNodeByPath } from '@/store/slices/fileSystemSlice';
import { openWindow } from '@/store/slices/windowSlice';
import { getAppConfig } from '@/utils/appRegistry';
import { FileSystemNode } from '@/types';
import { Folder, File, ArrowLeft, Home, Plus, Trash2, Edit3, FolderPlus, FileText } from 'lucide-react';
import './FileExplorer.css';

interface FileExplorerProps {
  windowId: string;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ windowId }) => {
  const dispatch = useDispatch();
  const { root, currentPath } = useSelector((state: RootState) => state.fileSystem);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string | null } | null>(null);
  const [renamingItem, setRenamingItem] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const currentNode = findNodeByPath(root, currentPath);
  const pathParts = currentPath.split('/').filter(Boolean);

  const handleNavigate = (path: string) => {
    dispatch(navigateToPath(path));
    setSelectedItems(new Set());
  };

  const handleItemClick = (item: FileSystemNode, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.path)) {
        newSelected.delete(item.path);
      } else {
        newSelected.add(item.path);
      }
      setSelectedItems(newSelected);
    } else {
      setSelectedItems(new Set([item.path]));
    }
  };

  const handleItemDoubleClick = (item: FileSystemNode) => {
    if (item.type === 'directory') {
      handleNavigate(item.path);
    } else {
      // Open file in text editor
      const config = getAppConfig('textEditor');
      const windowId = `textEditor-${Date.now()}`;

      dispatch(openWindow({
        id: windowId,
        title: `${config.name} - ${item.name}`,
        appType: config.type,
        position: config.defaultPosition,
        size: config.defaultSize,
        isResizable: config.isResizable,
        isDraggable: config.isDraggable,
      }));
    }
  };

  const handleContextMenu = (event: React.MouseEvent, item?: FileSystemNode) => {
    event.preventDefault();
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      path: item?.path || null
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleCreateFile = () => {
    const name = prompt('Enter file name:');
    if (name) {
      dispatch(createFile({ parentPath: currentPath, name, content: '' }));
    }
    closeContextMenu();
  };

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:');
    if (name) {
      dispatch(createDirectory({ parentPath: currentPath, name }));
    }
    closeContextMenu();
  };

  const handleDelete = (path: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      dispatch(deleteNode(path));
      setSelectedItems(new Set());
    }
    closeContextMenu();
  };

  const handleRename = (path: string) => {
    const node = findNodeByPath(root, path);
    if (node) {
      setRenamingItem(path);
      setNewName(node.name);
    }
    closeContextMenu();
  };

  const confirmRename = () => {
    if (renamingItem && newName.trim()) {
      dispatch(renameNode({ path: renamingItem, newName: newName.trim() }));
    }
    setRenamingItem(null);
    setNewName('');
  };

  const cancelRename = () => {
    setRenamingItem(null);
    setNewName('');
  };

  const formatFileSize = (size?: number): string => {
    if (!size) return '-';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClick = () => closeContextMenu();
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="file-explorer" onClick={closeContextMenu}>
      <div className="file-explorer-toolbar">
        <div className="toolbar-left">
          <button
            className="toolbar-btn"
            onClick={() => handleNavigate('/')}
            title="Home"
          >
            <Home size={16} />
          </button>
          <button
            className="toolbar-btn"
            onClick={() => {
              const parentPath = pathParts.slice(0, -1).join('/') || '/';
              handleNavigate(parentPath);
            }}
            disabled={currentPath === '/'}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="address-bar">
          <span
            className="path-segment clickable"
            onClick={() => handleNavigate('/')}
          >
            /
          </span>
          {pathParts.map((part, index) => {
            const partPath = '/' + pathParts.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={partPath}>
                <span className="path-separator">/</span>
                <span
                  className="path-segment clickable"
                  onClick={() => handleNavigate(partPath)}
                >
                  {part}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        <div className="toolbar-right">
          <button className="toolbar-btn" onClick={handleCreateFile} title="New File">
            <FileText size={16} />
          </button>
          <button className="toolbar-btn" onClick={handleCreateFolder} title="New Folder">
            <FolderPlus size={16} />
          </button>
        </div>
      </div>

      <div className="file-explorer-content" onContextMenu={handleContextMenu}>
        {currentNode && currentNode.children && (
          <div className="file-list">
            <div className="file-list-header">
              <div className="header-name">Name</div>
              <div className="header-size">Size</div>
              <div className="header-modified">Modified</div>
            </div>

            {currentNode.children
              .sort((a, b) => {
                if (a.type !== b.type) {
                  return a.type === 'directory' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
              })
              .map((item) => (
                <div
                  key={item.path}
                  className={`file-item ${selectedItems.has(item.path) ? 'selected' : ''}`}
                  onClick={(e) => handleItemClick(item, e)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                  onContextMenu={(e) => handleContextMenu(e, item)}
                >
                  <div className="file-item-name">
                    {item.type === 'directory' ? (
                      <Folder size={16} className="file-icon folder" />
                    ) : (
                      <File size={16} className="file-icon file" />
                    )}
                    {renamingItem === item.path ? (
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onBlur={confirmRename}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename();
                          if (e.key === 'Escape') cancelRename();
                        }}
                        autoFocus
                        className="rename-input"
                      />
                    ) : (
                      <span className="file-name">{item.name}</span>
                    )}
                  </div>
                  <div className="file-item-size">
                    {item.type === 'file' ? formatFileSize(item.size) : '-'}
                  </div>
                  <div className="file-item-modified">
                    {formatDate(item.lastModified)}
                  </div>
                </div>
              ))}

            {currentNode.children.length === 0 && (
              <div className="empty-folder">
                This folder is empty
              </div>
            )}
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.path ? (
            // Context menu for empty space
            <>
              <div className="context-menu-item" onClick={handleCreateFile}>
                <FileText size={14} />
                New File
              </div>
              <div className="context-menu-item" onClick={handleCreateFolder}>
                <FolderPlus size={14} />
                New Folder
              </div>
            </>
          ) : (
            // Context menu for specific item
            <>
              <div className="context-menu-item" onClick={() => handleRename(contextMenu.path!)}>
                <Edit3 size={14} />
                Rename
              </div>
              <div className="context-menu-separator" />
              <div
                className="context-menu-item danger"
                onClick={() => handleDelete(contextMenu.path!)}
              >
                <Trash2 size={14} />
                Delete
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default FileExplorer;