export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  cursor?: CursorPosition;
  currentWorkspace?: string;
  permissions: UserPermissions;
}

export interface CursorPosition {
  x: number;
  y: number;
  windowId?: string;
  appType?: string;
  color: string;
}

export interface UserPermissions {
  canEdit: boolean;
  canView: boolean;
  canInvite: boolean;
  canManage: boolean;
  isOwner: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  members: WorkspaceMember[];
  settings: WorkspaceSettings;
  created: Date;
  modified: Date;
  isActive: boolean;
}

export interface WorkspaceMember {
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  permissions: UserPermissions;
  lastActive: Date;
}

export interface WorkspaceSettings {
  isPublic: boolean;
  allowGuestAccess: boolean;
  maxMembers: number;
  autoSave: boolean;
  conflictResolution: 'first-win' | 'last-win' | 'merge';
  shareableLink?: string;
  requireApproval: boolean;
}

export interface CollaborativeSession {
  workspaceId: string;
  sessionId: string;
  participants: SessionParticipant[];
  sharedState: SharedWorkspaceState;
  activities: Activity[];
  startTime: Date;
  lastActivity: Date;
}

export interface SessionParticipant {
  userId: string;
  socketId: string;
  joinedAt: Date;
  cursor: CursorPosition;
  isActive: boolean;
  permissions: UserPermissions;
}

export interface SharedWorkspaceState {
  windows: SharedWindow[];
  fileSystem: SharedFileSystem;
  applications: SharedApplication[];
  variables: Record<string, any>;
  preferences: SharedPreferences;
}

export interface SharedWindow {
  id: string;
  ownerId: string;
  title: string;
  appType: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  isShared: boolean;
  collaborators: string[];
  permissions: WindowPermissions;
  lastModified: Date;
  lastModifiedBy: string;
}

export interface WindowPermissions {
  canView: string[];
  canEdit: string[];
  canControl: string[];
  isLocked: boolean;
}

export interface SharedFileSystem {
  files: SharedFile[];
  permissions: FilePermissions[];
  locks: FileLock[];
}

export interface SharedFile {
  path: string;
  content: string;
  ownerId: string;
  lastModified: Date;
  lastModifiedBy: string;
  isLocked: boolean;
  lockedBy?: string;
  version: number;
  history: FileVersion[];
}

export interface FileVersion {
  version: number;
  content: string;
  modifiedBy: string;
  modifiedAt: Date;
  changes: ChangeOperation[];
}

export interface ChangeOperation {
  type: 'insert' | 'delete' | 'replace';
  position: number;
  content: string;
  length?: number;
  userId: string;
  timestamp: Date;
}

export interface FilePermissions {
  path: string;
  ownerId: string;
  canRead: string[];
  canWrite: string[];
  canDelete: string[];
}

export interface FileLock {
  path: string;
  lockedBy: string;
  lockedAt: Date;
  expiresAt: Date;
  type: 'read' | 'write' | 'exclusive';
}

export interface SharedApplication {
  windowId: string;
  appType: string;
  state: any;
  ownerId: string;
  isShared: boolean;
  collaborators: string[];
  lastSync: Date;
}

export interface SharedPreferences {
  theme: string;
  wallpaper: string;
  layout: string;
  sharedByDefault: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  target: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
}

export type ActivityType =
  | 'user_joined'
  | 'user_left'
  | 'window_opened'
  | 'window_closed'
  | 'file_edited'
  | 'file_created'
  | 'file_deleted'
  | 'permission_changed'
  | 'workspace_settings_changed'
  | 'cursor_moved'
  | 'message_sent'
  | 'screen_shared'
  | 'voice_chat_started'
  | 'voice_chat_ended';

export interface ChatMessage {
  id: string;
  workspaceId: string;
  userId: string;
  content: string;
  type: 'text' | 'system' | 'file' | 'code' | 'image';
  timestamp: Date;
  reactions: MessageReaction[];
  threadId?: string;
  replyTo?: string;
  metadata?: Record<string, any>;
}

export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Date;
}

export interface WorkspaceInvitation {
  id: string;
  workspaceId: string;
  invitedBy: string;
  invitedEmail: string;
  role: 'admin' | 'editor' | 'viewer';
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface ConflictResolution {
  fileId: string;
  conflictId: string;
  participants: string[];
  versions: ConflictVersion[];
  resolution?: ConflictVersion;
  resolvedBy?: string;
  resolvedAt?: Date;
  status: 'pending' | 'resolved' | 'abandoned';
}

export interface ConflictVersion {
  userId: string;
  content: string;
  timestamp: Date;
  changes: ChangeOperation[];
}

export interface ScreenShareSession {
  id: string;
  workspaceId: string;
  hostId: string;
  participants: string[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  quality: 'low' | 'medium' | 'high';
  permissions: ScreenSharePermissions;
}

export interface ScreenSharePermissions {
  canView: string[];
  canControl: string[];
  canAnnotate: string[];
}

export interface VoiceChatSession {
  id: string;
  workspaceId: string;
  participants: VoiceChatParticipant[];
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  settings: VoiceChatSettings;
}

export interface VoiceChatParticipant {
  userId: string;
  isMuted: boolean;
  isDeafened: boolean;
  joinedAt: Date;
  leftAt?: Date;
  volume: number;
}

export interface VoiceChatSettings {
  autoMute: boolean;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  maxParticipants: number;
}

export interface WorkspaceAnalytics {
  workspaceId: string;
  totalMembers: number;
  activeMembers: number;
  totalSessions: number;
  averageSessionDuration: number;
  mostUsedApps: AppUsageStats[];
  collaborationMetrics: CollaborationMetrics;
  period: { start: Date; end: Date };
}

export interface AppUsageStats {
  appType: string;
  usageCount: number;
  totalDuration: number;
  uniqueUsers: number;
}

export interface CollaborationMetrics {
  totalEdits: number;
  totalMessages: number;
  conflictsResolved: number;
  screenShareSessions: number;
  voiceChatSessions: number;
  filesCreated: number;
  filesShared: number;
}