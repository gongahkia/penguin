import React, { useState, useEffect } from 'react';
import { Workspace, User, ChatMessage, Activity } from '@/types/collaboration';
import { collaborationManager } from '@/utils/collaborationManager';
import './WorkspaceManager.css';

interface WorkspaceManagerProps {
  windowId: string;
}

const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({ windowId }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<User[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedTab, setSelectedTab] = useState<'workspaces' | 'chat' | 'users' | 'activity'>('workspaces');
  const [isConnected, setIsConnected] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);

  useEffect(() => {
    initializeCollaboration();
    setupEventListeners();

    return () => {
      cleanupEventListeners();
    };
  }, []);

  const initializeCollaboration = async () => {
    try {
      await collaborationManager.connect();
      setIsConnected(true);
      loadWorkspaces();
    } catch (error) {
      console.error('Failed to connect to collaboration server:', error);
      setIsConnected(false);
    }
  };

  const setupEventListeners = () => {
    collaborationManager.on('workspace-joined', handleWorkspaceJoined);
    collaborationManager.on('user-joined', handleUserJoined);
    collaborationManager.on('user-left', handleUserLeft);
    collaborationManager.on('chat-message', handleChatMessage);
    collaborationManager.on('activity-logged', handleActivity);
  };

  const cleanupEventListeners = () => {
    collaborationManager.off('workspace-joined', handleWorkspaceJoined);
    collaborationManager.off('user-joined', handleUserJoined);
    collaborationManager.off('user-left', handleUserLeft);
    collaborationManager.off('chat-message', handleChatMessage);
    collaborationManager.off('activity-logged', handleActivity);
  };

  const handleWorkspaceJoined = (data: { workspace: Workspace; users: User[] }) => {
    setCurrentWorkspace(data.workspace);
    setConnectedUsers(data.users);
  };

  const handleUserJoined = (user: User) => {
    setConnectedUsers(prev => [...prev, user]);
  };

  const handleUserLeft = (userId: string) => {
    setConnectedUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const handleActivity = (activity: Activity) => {
    setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
  };

  const loadWorkspaces = () => {
    // In a real implementation, this would fetch from an API
    const mockWorkspaces: Workspace[] = [
      {
        id: 'ws-1',
        name: 'Team Project Alpha',
        description: 'Collaborative development workspace for Project Alpha',
        ownerId: 'user-1',
        members: [],
        settings: {
          isPublic: false,
          allowGuestAccess: true,
          maxMembers: 10,
          autoSave: true,
          conflictResolution: 'last-win',
          requireApproval: false
        },
        created: new Date('2024-01-15'),
        modified: new Date(),
        isActive: true
      },
      {
        id: 'ws-2',
        name: 'Design Review',
        description: 'UI/UX design collaboration space',
        ownerId: 'user-2',
        members: [],
        settings: {
          isPublic: true,
          allowGuestAccess: true,
          maxMembers: 5,
          autoSave: true,
          conflictResolution: 'merge',
          requireApproval: true
        },
        created: new Date('2024-02-01'),
        modified: new Date(),
        isActive: true
      }
    ];

    setWorkspaces(mockWorkspaces);
  };

  const createWorkspace = async (workspaceData: Partial<Workspace>) => {
    try {
      const workspace = await collaborationManager.createWorkspace(workspaceData);
      setWorkspaces(prev => [...prev, workspace]);
      setIsCreatingWorkspace(false);
    } catch (error) {
      console.error('Failed to create workspace:', error);
      alert('Failed to create workspace');
    }
  };

  const joinWorkspace = async (workspace: Workspace) => {
    try {
      const mockUser: User = {
        id: 'user-current',
        username: 'Current User',
        email: 'user@example.com',
        isOnline: true,
        lastSeen: new Date(),
        permissions: {
          canEdit: true,
          canView: true,
          canInvite: false,
          canManage: false,
          isOwner: false
        }
      };

      await collaborationManager.joinWorkspace(workspace.id, mockUser);
      setSelectedTab('chat');
    } catch (error) {
      console.error('Failed to join workspace:', error);
      alert('Failed to join workspace');
    }
  };

  const leaveWorkspace = async () => {
    try {
      await collaborationManager.leaveWorkspace();
      setCurrentWorkspace(null);
      setConnectedUsers([]);
      setChatMessages([]);
      setActivities([]);
      setSelectedTab('workspaces');
    } catch (error) {
      console.error('Failed to leave workspace:', error);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    collaborationManager.sendChatMessage(newMessage.trim());
    setNewMessage('');
  };

  const inviteUser = async () => {
    const email = prompt('Enter user email to invite:');
    if (!email) return;

    try {
      await collaborationManager.inviteUser(email, 'editor');
      alert('Invitation sent successfully');
    } catch (error) {
      console.error('Failed to invite user:', error);
      alert('Failed to send invitation');
    }
  };

  const startScreenShare = async () => {
    try {
      const sessionId = await collaborationManager.startScreenShare();
      alert(`Screen sharing started. Session ID: ${sessionId}`);
    } catch (error) {
      console.error('Failed to start screen share:', error);
      alert('Failed to start screen sharing');
    }
  };

  const startVoiceChat = async () => {
    try {
      const sessionId = await collaborationManager.startVoiceChat();
      alert(`Voice chat started. Session ID: ${sessionId}`);
    } catch (error) {
      console.error('Failed to start voice chat:', error);
      alert('Failed to start voice chat');
    }
  };

  return (
    <div className="workspace-manager">
      <div className="workspace-header">
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢' : '🔴'}
          </div>
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>

        {currentWorkspace && (
          <div className="current-workspace">
            <h2>{currentWorkspace.name}</h2>
            <button onClick={leaveWorkspace} className="leave-btn">
              Leave Workspace
            </button>
          </div>
        )}
      </div>

      <div className="workspace-tabs">
        <button
          className={selectedTab === 'workspaces' ? 'active' : ''}
          onClick={() => setSelectedTab('workspaces')}
        >
          Workspaces
        </button>
        {currentWorkspace && (
          <>
            <button
              className={selectedTab === 'chat' ? 'active' : ''}
              onClick={() => setSelectedTab('chat')}
            >
              Chat ({chatMessages.length})
            </button>
            <button
              className={selectedTab === 'users' ? 'active' : ''}
              onClick={() => setSelectedTab('users')}
            >
              Users ({connectedUsers.length})
            </button>
            <button
              className={selectedTab === 'activity' ? 'active' : ''}
              onClick={() => setSelectedTab('activity')}
            >
              Activity
            </button>
          </>
        )}
      </div>

      <div className="workspace-content">
        {selectedTab === 'workspaces' && (
          <WorkspaceList
            workspaces={workspaces}
            onJoinWorkspace={joinWorkspace}
            onCreateWorkspace={() => setIsCreatingWorkspace(true)}
            isConnected={isConnected}
          />
        )}

        {selectedTab === 'chat' && currentWorkspace && (
          <ChatPanel
            messages={chatMessages}
            newMessage={newMessage}
            onMessageChange={setNewMessage}
            onSendMessage={sendMessage}
          />
        )}

        {selectedTab === 'users' && currentWorkspace && (
          <UsersPanel
            users={connectedUsers}
            currentWorkspace={currentWorkspace}
            onInviteUser={inviteUser}
            onStartScreenShare={startScreenShare}
            onStartVoiceChat={startVoiceChat}
          />
        )}

        {selectedTab === 'activity' && currentWorkspace && (
          <ActivityPanel activities={activities} />
        )}
      </div>

      {isCreatingWorkspace && (
        <CreateWorkspaceModal
          onCancel={() => setIsCreatingWorkspace(false)}
          onSubmit={createWorkspace}
        />
      )}
    </div>
  );
};

interface WorkspaceListProps {
  workspaces: Workspace[];
  onJoinWorkspace: (workspace: Workspace) => void;
  onCreateWorkspace: () => void;
  isConnected: boolean;
}

const WorkspaceList: React.FC<WorkspaceListProps> = ({
  workspaces,
  onJoinWorkspace,
  onCreateWorkspace,
  isConnected
}) => (
  <div className="workspace-list">
    <div className="list-header">
      <h3>Available Workspaces</h3>
      <button
        onClick={onCreateWorkspace}
        disabled={!isConnected}
        className="create-workspace-btn"
      >
        Create New
      </button>
    </div>

    {workspaces.length === 0 ? (
      <div className="empty-state">
        <p>No workspaces available</p>
        <button onClick={onCreateWorkspace} disabled={!isConnected}>
          Create your first workspace
        </button>
      </div>
    ) : (
      <div className="workspace-grid">
        {workspaces.map(workspace => (
          <div key={workspace.id} className="workspace-card">
            <h4>{workspace.name}</h4>
            <p>{workspace.description}</p>
            <div className="workspace-meta">
              <span className="member-count">
                {workspace.members.length} members
              </span>
              <span className={`status ${workspace.isActive ? 'active' : 'inactive'}`}>
                {workspace.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button
              onClick={() => onJoinWorkspace(workspace)}
              disabled={!isConnected}
              className="join-btn"
            >
              Join
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

interface ChatPanelProps {
  messages: ChatMessage[];
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  newMessage,
  onMessageChange,
  onSendMessage
}) => (
  <div className="chat-panel">
    <div className="chat-messages">
      {messages.length === 0 ? (
        <div className="no-messages">
          <p>No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map(message => (
          <div key={message.id} className="chat-message">
            <div className="message-header">
              <span className="username">{message.userId}</span>
              <span className="timestamp">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))
      )}
    </div>

    <div className="chat-input">
      <input
        type="text"
        value={newMessage}
        onChange={(e) => onMessageChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
        placeholder="Type a message..."
        className="message-input"
      />
      <button onClick={onSendMessage} className="send-btn">
        Send
      </button>
    </div>
  </div>
);

interface UsersPanelProps {
  users: User[];
  currentWorkspace: Workspace;
  onInviteUser: () => void;
  onStartScreenShare: () => void;
  onStartVoiceChat: () => void;
}

const UsersPanel: React.FC<UsersPanelProps> = ({
  users,
  currentWorkspace,
  onInviteUser,
  onStartScreenShare,
  onStartVoiceChat
}) => (
  <div className="users-panel">
    <div className="panel-header">
      <h3>Connected Users</h3>
      <div className="user-actions">
        <button onClick={onInviteUser} className="invite-btn">
          Invite User
        </button>
        <button onClick={onStartScreenShare} className="screen-share-btn">
          Share Screen
        </button>
        <button onClick={onStartVoiceChat} className="voice-chat-btn">
          Voice Chat
        </button>
      </div>
    </div>

    <div className="user-list">
      {users.map(user => (
        <div key={user.id} className="user-item">
          <div className="user-avatar">
            {user.avatar || '👤'}
          </div>
          <div className="user-info">
            <div className="username">{user.username}</div>
            <div className="user-status">
              <span className={`status-indicator ${user.isOnline ? 'online' : 'offline'}`}>
                {user.isOnline ? '🟢' : '⚫'}
              </span>
              {user.isOnline ? 'Online' : `Last seen ${user.lastSeen.toLocaleString()}`}
            </div>
          </div>
          <div className="user-permissions">
            {user.permissions.isOwner && <span className="badge owner">Owner</span>}
            {user.permissions.canManage && <span className="badge admin">Admin</span>}
            {user.permissions.canEdit && <span className="badge editor">Editor</span>}
            {!user.permissions.canEdit && <span className="badge viewer">Viewer</span>}
          </div>
        </div>
      ))}
    </div>
  </div>
);

interface ActivityPanelProps {
  activities: Activity[];
}

const ActivityPanel: React.FC<ActivityPanelProps> = ({ activities }) => (
  <div className="activity-panel">
    <h3>Recent Activity</h3>
    <div className="activity-list">
      {activities.length === 0 ? (
        <div className="no-activity">
          <p>No recent activity</p>
        </div>
      ) : (
        activities.map(activity => (
          <div key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-description">{activity.description}</div>
              <div className="activity-time">
                {activity.timestamp.toLocaleString()}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

interface CreateWorkspaceModalProps {
  onCancel: () => void;
  onSubmit: (workspace: Partial<Workspace>) => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  onCancel,
  onSubmit
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert('Workspace name is required');
      return;
    }

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      settings: {
        isPublic,
        allowGuestAccess: true,
        maxMembers: 10,
        autoSave: true,
        conflictResolution: 'last-win',
        requireApproval: false
      }
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New Workspace</h3>

        <div className="form-group">
          <label>Workspace Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workspace name"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter workspace description"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Make workspace public
          </label>
        </div>

        <div className="modal-actions">
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
          <button onClick={handleSubmit} className="submit-btn">
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const getActivityIcon = (type: string): string => {
  switch (type) {
    case 'user_joined': return '👋';
    case 'user_left': return '👋';
    case 'file_edited': return '📝';
    case 'file_created': return '📄';
    case 'file_deleted': return '🗑️';
    case 'window_opened': return '🪟';
    case 'window_closed': return '❌';
    case 'message_sent': return '💬';
    case 'screen_shared': return '🖥️';
    case 'voice_chat_started': return '🎤';
    default: return '📋';
  }
};

export default WorkspaceManager;