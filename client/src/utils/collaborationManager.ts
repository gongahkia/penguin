import { io, Socket } from 'socket.io-client';
import {
  Workspace,
  User,
  CollaborativeSession,
  ChatMessage,
  Activity,
  CursorPosition,
  SharedWindow,
  ChangeOperation,
  ConflictResolution
} from '@/types/collaboration';

interface CollaborationEvents {
  'workspace-joined': (data: { workspace: Workspace; users: User[] }) => void;
  'workspace-left': (data: { userId: string }) => void;
  'user-joined': (user: User) => void;
  'user-left': (userId: string) => void;
  'cursor-moved': (data: { userId: string; cursor: CursorPosition }) => void;
  'window-shared': (window: SharedWindow) => void;
  'window-updated': (data: { windowId: string; changes: any }) => void;
  'file-changed': (data: { path: string; changes: ChangeOperation[] }) => void;
  'file-locked': (data: { path: string; lockedBy: string }) => void;
  'file-unlocked': (data: { path: string }) => void;
  'chat-message': (message: ChatMessage) => void;
  'activity-logged': (activity: Activity) => void;
  'conflict-detected': (conflict: ConflictResolution) => void;
  'conflict-resolved': (data: { conflictId: string; resolution: any }) => void;
  'screen-share-started': (data: { sessionId: string; hostId: string }) => void;
  'screen-share-ended': (data: { sessionId: string }) => void;
  'voice-chat-started': (data: { sessionId: string; participants: string[] }) => void;
  'voice-chat-ended': (data: { sessionId: string }) => void;
  'workspace-settings-changed': (settings: any) => void;
  'permission-changed': (data: { userId: string; permissions: any }) => void;
}

class CollaborationManager {
  private socket: Socket | null = null;
  private currentWorkspace: Workspace | null = null;
  private currentUser: User | null = null;
  private connectedUsers = new Map<string, User>();
  private eventListeners = new Map<keyof CollaborationEvents, Function[]>();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private cursorUpdateThrottle = 100; // ms
  private lastCursorUpdate = 0;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Initialize event listener maps
    Object.keys({} as CollaborationEvents).forEach(event => {
      this.eventListeners.set(event as keyof CollaborationEvents, []);
    });
  }

  async connect(serverUrl: string = 'http://localhost:3001'): Promise<void> {
    try {
      this.socket = io(serverUrl, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        timeout: 5000
      });

      this.setupSocketEventHandlers();

      return new Promise((resolve, reject) => {
        if (!this.socket) {
          // Fallback to demo mode
          this.enableDemoMode();
          resolve();
          return;
        }

        const connectTimeout = setTimeout(() => {
          console.log('Connection timeout, falling back to demo mode');
          this.enableDemoMode();
          resolve();
        }, 3000);

        this.socket.on('connect', () => {
          clearTimeout(connectTimeout);
          console.log('Connected to collaboration server');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          clearTimeout(connectTimeout);
          console.log('Connection error, falling back to demo mode:', error);
          this.enableDemoMode();
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('Disconnected from collaboration server:', reason);
          this.isConnected = false;
          this.handleDisconnection(reason);
        });
      });
    } catch (error) {
      console.log('Failed to connect to collaboration server, using demo mode:', error);
      this.enableDemoMode();
    }
  }

  private enableDemoMode(): void {
    console.log('🎭 Collaboration demo mode enabled');
    this.isConnected = true; // Simulate connection for demo

    // Add some demo data after a delay
    setTimeout(() => {
      this.simulateDemoActivity();
    }, 1000);
  }

  private simulateDemoActivity(): void {
    // Simulate some users joining
    const demoUsers: User[] = [
      {
        id: 'demo-user-1',
        username: 'Alice',
        email: 'alice@example.com',
        isOnline: true,
        lastSeen: new Date(),
        permissions: {
          canEdit: true,
          canView: true,
          canInvite: false,
          canManage: false,
          isOwner: false
        }
      },
      {
        id: 'demo-user-2',
        username: 'Bob',
        email: 'bob@example.com',
        isOnline: true,
        lastSeen: new Date(),
        permissions: {
          canEdit: true,
          canView: true,
          canInvite: true,
          canManage: true,
          isOwner: false
        }
      }
    ];

    demoUsers.forEach((user, index) => {
      setTimeout(() => {
        this.handleUserJoined(user);
      }, (index + 1) * 2000);
    });

    // Simulate some activities
    setTimeout(() => {
      const activities: Activity[] = [
        {
          id: 'activity-1',
          userId: 'demo-user-1',
          type: 'file_created',
          target: '/home/user/project.txt',
          description: 'Alice created project.txt',
          metadata: {},
          timestamp: new Date(Date.now() - 300000)
        },
        {
          id: 'activity-2',
          userId: 'demo-user-2',
          type: 'window_opened',
          target: 'TextEditor',
          description: 'Bob opened Text Editor',
          metadata: {},
          timestamp: new Date(Date.now() - 180000)
        }
      ];

      activities.forEach(activity => this.emit('activity-logged', activity));
    }, 3000);

    // Simulate chat messages
    setTimeout(() => {
      const messages: ChatMessage[] = [
        {
          id: 'msg-1',
          workspaceId: 'demo-workspace',
          userId: 'Alice',
          content: 'Hey everyone! Welcome to the demo workspace 👋',
          type: 'text',
          timestamp: new Date(Date.now() - 120000),
          reactions: []
        },
        {
          id: 'msg-2',
          workspaceId: 'demo-workspace',
          userId: 'Bob',
          content: 'This collaboration feature looks great! 🎉',
          type: 'text',
          timestamp: new Date(Date.now() - 60000),
          reactions: []
        }
      ];

      messages.forEach(message => this.emit('chat-message', message));
    }, 4000);
  }

  private setupSocketEventHandlers() {
    if (!this.socket) return;

    this.socket.on('workspace-state', (data) => {
      this.handleWorkspaceState(data);
    });

    this.socket.on('user-joined', (user: User) => {
      this.handleUserJoined(user);
    });

    this.socket.on('user-left', (userId: string) => {
      this.handleUserLeft(userId);
    });

    this.socket.on('cursor-moved', (data) => {
      this.handleCursorMoved(data);
    });

    this.socket.on('window-shared', (window: SharedWindow) => {
      this.emit('window-shared', window);
    });

    this.socket.on('window-updated', (data) => {
      this.emit('window-updated', data);
    });

    this.socket.on('file-changed', (data) => {
      this.emit('file-changed', data);
    });

    this.socket.on('chat-message', (message: ChatMessage) => {
      this.emit('chat-message', message);
    });

    this.socket.on('activity-logged', (activity: Activity) => {
      this.emit('activity-logged', activity);
    });

    this.socket.on('conflict-detected', (conflict: ConflictResolution) => {
      this.emit('conflict-detected', conflict);
    });

    this.socket.on('error', (error) => {
      console.error('Collaboration error:', error);
    });
  }

  async joinWorkspace(workspaceId: string, user: User): Promise<Workspace> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to collaboration server');
    }

    this.currentUser = user;

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('join-workspace', { workspaceId, user }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          this.currentWorkspace = response.workspace;
          this.handleWorkspaceJoined(response);
          resolve(response.workspace);
        }
      });
    });
  }

  async leaveWorkspace(): Promise<void> {
    if (!this.socket || !this.currentWorkspace) return;

    return new Promise((resolve) => {
      if (!this.socket) {
        resolve();
        return;
      }

      this.socket.emit('leave-workspace', { workspaceId: this.currentWorkspace!.id }, () => {
        this.currentWorkspace = null;
        this.connectedUsers.clear();
        resolve();
      });
    });
  }

  async createWorkspace(workspace: Partial<Workspace>): Promise<Workspace> {
    if (!this.socket || !this.isConnected) {
      throw new Error('Not connected to collaboration server');
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('create-workspace', workspace, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.workspace);
        }
      });
    });
  }

  updateCursor(cursor: CursorPosition): void {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) return;

    const now = Date.now();
    if (now - this.lastCursorUpdate < this.cursorUpdateThrottle) return;

    this.lastCursorUpdate = now;
    this.socket.emit('cursor-update', {
      workspaceId: this.currentWorkspace.id,
      userId: this.currentUser.id,
      cursor
    });
  }

  shareWindow(windowId: string, permissions: any): void {
    if (!this.socket || !this.currentWorkspace) return;

    this.socket.emit('share-window', {
      workspaceId: this.currentWorkspace.id,
      windowId,
      permissions
    });
  }

  updateWindow(windowId: string, changes: any): void {
    if (!this.socket || !this.currentWorkspace) return;

    this.socket.emit('window-update', {
      workspaceId: this.currentWorkspace.id,
      windowId,
      changes
    });
  }

  editFile(path: string, changes: ChangeOperation[]): void {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) return;

    this.socket.emit('file-edit', {
      workspaceId: this.currentWorkspace.id,
      path,
      changes: changes.map(change => ({
        ...change,
        userId: this.currentUser!.id,
        timestamp: new Date()
      }))
    });
  }

  lockFile(path: string): void {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) return;

    this.socket.emit('file-lock', {
      workspaceId: this.currentWorkspace.id,
      path,
      userId: this.currentUser.id
    });
  }

  unlockFile(path: string): void {
    if (!this.socket || !this.currentWorkspace) return;

    this.socket.emit('file-unlock', {
      workspaceId: this.currentWorkspace.id,
      path
    });
  }

  sendChatMessage(content: string, type: 'text' | 'code' | 'file' = 'text'): void {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) return;

    const message: Partial<ChatMessage> = {
      workspaceId: this.currentWorkspace.id,
      userId: this.currentUser.id,
      content,
      type,
      timestamp: new Date()
    };

    this.socket.emit('chat-message', message);
  }

  startScreenShare(): Promise<string> {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) {
      return Promise.reject(new Error('Not ready for screen sharing'));
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('start-screen-share', {
        workspaceId: this.currentWorkspace!.id,
        hostId: this.currentUser!.id
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.sessionId);
        }
      });
    });
  }

  stopScreenShare(sessionId: string): void {
    if (!this.socket) return;

    this.socket.emit('stop-screen-share', { sessionId });
  }

  startVoiceChat(): Promise<string> {
    if (!this.socket || !this.currentWorkspace || !this.currentUser) {
      return Promise.reject(new Error('Not ready for voice chat'));
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('start-voice-chat', {
        workspaceId: this.currentWorkspace!.id,
        userId: this.currentUser!.id
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.sessionId);
        }
      });
    });
  }

  stopVoiceChat(sessionId: string): void {
    if (!this.socket) return;

    this.socket.emit('stop-voice-chat', { sessionId });
  }

  inviteUser(email: string, role: 'admin' | 'editor' | 'viewer'): Promise<void> {
    if (!this.socket || !this.currentWorkspace) {
      return Promise.reject(new Error('Not ready to invite users'));
    }

    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not available'));
        return;
      }

      this.socket.emit('invite-user', {
        workspaceId: this.currentWorkspace!.id,
        email,
        role
      }, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve();
        }
      });
    });
  }

  updateUserPermissions(userId: string, permissions: any): void {
    if (!this.socket || !this.currentWorkspace) return;

    this.socket.emit('update-permissions', {
      workspaceId: this.currentWorkspace.id,
      userId,
      permissions
    });
  }

  resolveConflict(conflictId: string, resolution: any): void {
    if (!this.socket || !this.currentWorkspace) return;

    this.socket.emit('resolve-conflict', {
      workspaceId: this.currentWorkspace.id,
      conflictId,
      resolution
    });
  }

  // Event handling
  on<K extends keyof CollaborationEvents>(event: K, callback: CollaborationEvents[K]): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(callback);
    this.eventListeners.set(event, listeners);
  }

  off<K extends keyof CollaborationEvents>(event: K, callback: CollaborationEvents[K]): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emit<K extends keyof CollaborationEvents>(event: K, ...args: Parameters<CollaborationEvents[K]>): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }

  private handleWorkspaceState(data: any): void {
    // Update workspace state from server
    console.log('Workspace state updated:', data);
  }

  private handleWorkspaceJoined(data: any): void {
    data.users.forEach((user: User) => {
      this.connectedUsers.set(user.id, user);
    });

    this.emit('workspace-joined', data);
  }

  private handleUserJoined(user: User): void {
    this.connectedUsers.set(user.id, user);
    this.emit('user-joined', user);
  }

  private handleUserLeft(userId: string): void {
    this.connectedUsers.delete(userId);
    this.emit('user-left', userId);
  }

  private handleCursorMoved(data: { userId: string; cursor: CursorPosition }): void {
    const user = this.connectedUsers.get(data.userId);
    if (user) {
      user.cursor = data.cursor;
      this.connectedUsers.set(data.userId, user);
    }
    this.emit('cursor-moved', data);
  }

  private handleDisconnection(reason: string): void {
    console.log('Handling disconnection:', reason);

    if (reason === 'io server disconnect') {
      // Server disconnected - try to reconnect
      this.attemptReconnection();
    }
  }

  private attemptReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    setTimeout(() => {
      if (this.socket) {
        this.socket.connect();
      }
    }, delay);
  }

  // Getters
  getCurrentWorkspace(): Workspace | null {
    return this.currentWorkspace;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getConnectedUsers(): User[] {
    return Array.from(this.connectedUsers.values());
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentWorkspace = null;
    this.connectedUsers.clear();
  }
}

export const collaborationManager = new CollaborationManager();
export default CollaborationManager;