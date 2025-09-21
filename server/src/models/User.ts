import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    wallpaper: string;
    soundEnabled: boolean;
    animationsEnabled: boolean;
    terminalTheme: string;
    fontSize: number;
  };
  fileSystem: any; // Will store the user's file system structure
  sessions: Array<{
    sessionId: string;
    lastAccess: Date;
    ipAddress?: string;
    userAgent?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    match: /^[a-zA-Z0-9_-]+$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    wallpaper: {
      type: String,
      default: '/wallpapers/default.jpg'
    },
    soundEnabled: {
      type: Boolean,
      default: true
    },
    animationsEnabled: {
      type: Boolean,
      default: true
    },
    terminalTheme: {
      type: String,
      default: 'dark'
    },
    fontSize: {
      type: Number,
      default: 14,
      min: 8,
      max: 32
    }
  },
  fileSystem: {
    type: Schema.Types.Mixed,
    default: () => ({
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
                      content: 'Welcome to Penguin OS!\\n\\nThis is your personal file system.\\nAll changes are automatically saved.\\n\\nEnjoy exploring!',
                      size: 125,
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
      ],
    })
  },
  sessions: [{
    sessionId: {
      type: String,
      required: true
    },
    lastAccess: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String
  }]
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(this: IUser, next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.sessions;
  return userObject;
};

// Index for performance
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ 'sessions.sessionId': 1 });

export default mongoose.model<IUser>('User', UserSchema);