export interface AppPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  authorUrl?: string;
  category: AppCategory;
  tags: string[];

  // Visual assets
  icon: string;
  banner?: string;
  screenshots: string[];
  video?: string;

  // Metadata
  size: number;
  downloads: number;
  rating: number;
  reviews: number;
  license: string;
  homepage?: string;
  repository?: string;

  // Compatibility
  minVersion: string;
  maxVersion?: string;
  platforms: Platform[];
  dependencies: string[];
  conflicts?: string[];

  // Status
  isInstalled: boolean;
  isEnabled: boolean;
  installDate?: Date;
  updateAvailable: boolean;
  latestVersion?: string;

  // Security
  verified: boolean;
  signature: string;
  checksum: string;
  permissions: Permission[];

  // Dates
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date;

  // Store metadata
  featured: boolean;
  premium: boolean;
  price?: number;
  salePrice?: number;

  // App manifest
  manifest: AppManifest;
}

export interface AppManifest {
  entryPoint: string;
  type: 'app' | 'plugin' | 'theme' | 'extension';
  component?: string;

  // Resource requirements
  memory?: number;
  storage?: number;

  // App configuration
  configurable: boolean;
  settings?: AppSetting[];

  // Integration
  apis: string[];
  events: string[];
  hooks: string[];

  // Files
  files: AppFile[];
  assets: AppAsset[];
}

export interface AppFile {
  path: string;
  type: 'js' | 'css' | 'html' | 'json' | 'md' | 'txt' | 'image';
  size: number;
  checksum: string;
  url: string;
}

export interface AppAsset {
  name: string;
  type: 'icon' | 'image' | 'font' | 'sound' | 'video';
  url: string;
  size: number;
}

export interface AppSetting {
  key: string;
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'color' | 'file';
  defaultValue: any;
  options?: any[];
  required: boolean;
  validation?: string;
}

export type AppCategory =
  | 'productivity'
  | 'development'
  | 'multimedia'
  | 'games'
  | 'utilities'
  | 'education'
  | 'graphics'
  | 'communication'
  | 'finance'
  | 'health'
  | 'travel'
  | 'social'
  | 'news'
  | 'business'
  | 'entertainment'
  | 'system'
  | 'security'
  | 'other';

export type Platform = 'web' | 'desktop' | 'mobile' | 'tablet';

export type Permission =
  | 'filesystem'
  | 'network'
  | 'notifications'
  | 'camera'
  | 'microphone'
  | 'location'
  | 'contacts'
  | 'calendar'
  | 'storage'
  | 'system'
  | 'clipboard'
  | 'background';

export interface AppStoreState {
  // Store data
  categories: StoreCategory[];
  featured: AppPackage[];
  popular: AppPackage[];
  recent: AppPackage[];
  updates: AppPackage[];
  installed: AppPackage[];

  // Search and filters
  searchQuery: string;
  selectedCategory: AppCategory | null;
  sortBy: 'name' | 'downloads' | 'rating' | 'date' | 'size' | 'price';
  sortOrder: 'asc' | 'desc';
  showFreeOnly: boolean;
  showPremiumOnly: boolean;
  showVerifiedOnly: boolean;

  // UI state
  currentView: 'store' | 'installed' | 'updates' | 'details';
  selectedApp: AppPackage | null;
  isLoading: boolean;
  error: string | null;

  // Installation
  installing: Set<string>;
  uninstalling: Set<string>;
  updating: Set<string>;

  // Settings
  autoUpdate: boolean;
  downloadLocation: string;
  allowExperimental: boolean;
  checkSignatures: boolean;
}

export interface StoreCategory {
  id: AppCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  count: number;
  featured: AppPackage[];
}

export interface InstallationProgress {
  appId: string;
  phase: 'downloading' | 'extracting' | 'installing' | 'configuring' | 'complete' | 'error';
  progress: number;
  speed?: number;
  eta?: number;
  error?: string;
}

export interface UpdateInfo {
  appId: string;
  currentVersion: string;
  latestVersion: string;
  changes: string[];
  size: number;
  critical: boolean;
  autoUpdate: boolean;
}

export interface AppReview {
  id: string;
  appId: string;
  userId: string;
  username: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  reported: number;
  createdAt: Date;
  updatedAt: Date;
  version: string;
}

export interface AppDeveloper {
  id: string;
  name: string;
  email: string;
  website?: string;
  avatar?: string;
  verified: boolean;
  apps: string[];
  totalDownloads: number;
  averageRating: number;
  joinedAt: Date;
}

export type AppAction =
  | 'install'
  | 'uninstall'
  | 'update'
  | 'enable'
  | 'disable'
  | 'configure'
  | 'rate'
  | 'review'
  | 'report'
  | 'share'
  | 'favorite'
  | 'purchase';

export interface AppActionPayload {
  action: AppAction;
  appId: string;
  data?: any;
}