import { AppPackage, AppManifest, AppCategory, InstallationProgress, UpdateInfo } from '@/types/app-store';

// Sample app packages for the store
const sampleApps: AppPackage[] = [
  {
    id: 'code-editor-pro',
    name: 'Code Editor Pro',
    description: 'Advanced code editor with syntax highlighting, auto-completion, and debugging support for 50+ programming languages.',
    version: '2.1.0',
    author: 'DevTools Inc.',
    authorUrl: 'https://devtools.com',
    category: 'development',
    tags: ['editor', 'programming', 'syntax-highlighting', 'debugging'],
    icon: '/app-store/icons/code-editor-pro.png',
    banner: '/app-store/banners/code-editor-pro.jpg',
    screenshots: [
      '/app-store/screenshots/code-editor-pro-1.png',
      '/app-store/screenshots/code-editor-pro-2.png',
      '/app-store/screenshots/code-editor-pro-3.png'
    ],
    size: 15728640, // 15MB
    downloads: 125430,
    rating: 4.7,
    reviews: 892,
    license: 'MIT',
    homepage: 'https://codeeditorpro.com',
    repository: 'https://github.com/devtools/code-editor-pro',
    minVersion: '1.0.0',
    platforms: ['web', 'desktop'],
    dependencies: [],
    isInstalled: false,
    isEnabled: false,
    updateAvailable: false,
    verified: true,
    signature: 'sha256:abc123...',
    checksum: 'md5:def456...',
    permissions: ['filesystem', 'network'],
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-03-10'),
    publishedAt: new Date('2023-02-01'),
    featured: true,
    premium: false,
    manifest: {
      entryPoint: 'index.js',
      type: 'app',
      component: 'CodeEditorPro',
      memory: 50,
      storage: 10,
      configurable: true,
      settings: [
        {
          key: 'theme',
          name: 'Editor Theme',
          description: 'Choose your preferred editor theme',
          type: 'select',
          defaultValue: 'dark',
          options: ['light', 'dark', 'monokai', 'solarized'],
          required: false
        },
        {
          key: 'fontSize',
          name: 'Font Size',
          description: 'Editor font size in pixels',
          type: 'number',
          defaultValue: 14,
          required: false
        }
      ],
      apis: ['file-system', 'project-manager'],
      events: ['file-changed', 'project-opened'],
      hooks: ['before-save', 'after-save'],
      files: [
        {
          path: 'index.js',
          type: 'js',
          size: 1024000,
          checksum: 'sha256:...',
          url: '/apps/code-editor-pro/index.js'
        },
        {
          path: 'styles.css',
          type: 'css',
          size: 45000,
          checksum: 'sha256:...',
          url: '/apps/code-editor-pro/styles.css'
        }
      ],
      assets: [
        {
          name: 'app-icon',
          type: 'icon',
          url: '/apps/code-editor-pro/icon.svg',
          size: 5000
        }
      ]
    }
  },
  {
    id: 'task-manager-deluxe',
    name: 'Task Manager Deluxe',
    description: 'Comprehensive task and project management app with Kanban boards, time tracking, and team collaboration.',
    version: '1.8.2',
    author: 'Productivity Labs',
    category: 'productivity',
    tags: ['tasks', 'project-management', 'kanban', 'collaboration'],
    icon: '/app-store/icons/task-manager-deluxe.png',
    screenshots: [
      '/app-store/screenshots/task-manager-deluxe-1.png',
      '/app-store/screenshots/task-manager-deluxe-2.png'
    ],
    size: 8388608, // 8MB
    downloads: 89234,
    rating: 4.5,
    reviews: 423,
    license: 'Commercial',
    homepage: 'https://taskmanagerdeluxe.com',
    minVersion: '1.0.0',
    platforms: ['web', 'desktop', 'mobile'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    installDate: new Date('2024-01-15'),
    updateAvailable: true,
    latestVersion: '1.9.0',
    verified: true,
    signature: 'sha256:xyz789...',
    checksum: 'md5:uvw012...',
    permissions: ['notifications', 'storage', 'network'],
    createdAt: new Date('2022-08-20'),
    updatedAt: new Date('2024-03-15'),
    publishedAt: new Date('2022-09-01'),
    featured: true,
    premium: true,
    price: 29.99,
    manifest: {
      entryPoint: 'task-manager.js',
      type: 'app',
      component: 'TaskManagerDeluxe',
      memory: 30,
      storage: 50,
      configurable: true,
      apis: ['notifications', 'calendar'],
      events: ['task-created', 'task-completed'],
      hooks: ['daily-reminder'],
      files: [
        {
          path: 'task-manager.js',
          type: 'js',
          size: 800000,
          checksum: 'sha256:...',
          url: '/apps/task-manager-deluxe/task-manager.js'
        }
      ],
      assets: [
        {
          name: 'notification-sound',
          type: 'sound',
          url: '/apps/task-manager-deluxe/notification.mp3',
          size: 15000
        }
      ]
    }
  },
  {
    id: 'pixel-paint',
    name: 'Pixel Paint',
    description: 'Retro-style pixel art editor with layers, animation support, and sprite sheet creation tools.',
    version: '3.0.1',
    author: 'ArtCraft Studios',
    category: 'graphics',
    tags: ['pixel-art', 'graphics', 'animation', 'sprites'],
    icon: '/app-store/icons/pixel-paint.png',
    screenshots: [
      '/app-store/screenshots/pixel-paint-1.png',
      '/app-store/screenshots/pixel-paint-2.png',
      '/app-store/screenshots/pixel-paint-3.png'
    ],
    video: '/app-store/videos/pixel-paint-demo.mp4',
    size: 12582912, // 12MB
    downloads: 67891,
    rating: 4.8,
    reviews: 334,
    license: 'GPL-3.0',
    homepage: 'https://pixelpaint.art',
    repository: 'https://github.com/artcraft/pixel-paint',
    minVersion: '1.0.0',
    platforms: ['web', 'desktop'],
    dependencies: ['canvas-renderer'],
    isInstalled: false,
    isEnabled: false,
    updateAvailable: false,
    verified: true,
    signature: 'sha256:pqr345...',
    checksum: 'md5:stu678...',
    permissions: ['filesystem'],
    createdAt: new Date('2021-11-10'),
    updatedAt: new Date('2024-02-28'),
    publishedAt: new Date('2021-12-01'),
    featured: false,
    premium: false,
    manifest: {
      entryPoint: 'pixel-paint.js',
      type: 'app',
      component: 'PixelPaint',
      memory: 40,
      storage: 25,
      configurable: true,
      apis: ['canvas', 'file-system'],
      events: ['image-saved', 'animation-exported'],
      hooks: ['before-export'],
      files: [
        {
          path: 'pixel-paint.js',
          type: 'js',
          size: 950000,
          checksum: 'sha256:...',
          url: '/apps/pixel-paint/pixel-paint.js'
        },
        {
          path: 'brushes.json',
          type: 'json',
          size: 25000,
          checksum: 'sha256:...',
          url: '/apps/pixel-paint/brushes.json'
        }
      ],
      assets: [
        {
          name: 'default-palette',
          type: 'image',
          url: '/apps/pixel-paint/palette.png',
          size: 3000
        }
      ]
    }
  },
  {
    id: 'weather-widget',
    name: 'Weather Widget',
    description: 'Beautiful weather widget with hourly forecasts, radar maps, and customizable themes.',
    version: '1.2.3',
    author: 'Weather Apps Co.',
    category: 'utilities',
    tags: ['weather', 'widget', 'forecast'],
    icon: '/app-store/icons/weather-widget.png',
    screenshots: ['/app-store/screenshots/weather-widget-1.png'],
    size: 2097152, // 2MB
    downloads: 156782,
    rating: 4.3,
    reviews: 1247,
    license: 'Apache-2.0',
    minVersion: '1.0.0',
    platforms: ['web', 'desktop', 'mobile'],
    dependencies: [],
    isInstalled: true,
    isEnabled: true,
    installDate: new Date('2024-02-01'),
    updateAvailable: false,
    verified: true,
    signature: 'sha256:mno901...',
    checksum: 'md5:bcd234...',
    permissions: ['network', 'location'],
    createdAt: new Date('2023-05-12'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2023-06-01'),
    featured: false,
    premium: false,
    manifest: {
      entryPoint: 'weather-widget.js',
      type: 'plugin',
      component: 'WeatherWidget',
      memory: 10,
      storage: 5,
      configurable: true,
      apis: ['geolocation', 'http'],
      events: ['weather-updated'],
      hooks: [],
      files: [
        {
          path: 'weather-widget.js',
          type: 'js',
          size: 180000,
          checksum: 'sha256:...',
          url: '/apps/weather-widget/weather-widget.js'
        }
      ],
      assets: [
        {
          name: 'weather-icons',
          type: 'image',
          url: '/apps/weather-widget/icons.svg',
          size: 45000
        }
      ]
    }
  }
];

export class AppStoreManager {
  private apps: Map<string, AppPackage> = new Map();
  private installationProgress: Map<string, InstallationProgress> = new Map();

  constructor() {
    this.initializeApps();
  }

  private initializeApps(): void {
    sampleApps.forEach(app => {
      this.apps.set(app.id, app);
    });
  }

  // App retrieval
  getAllApps(): AppPackage[] {
    return Array.from(this.apps.values());
  }

  getApp(id: string): AppPackage | null {
    return this.apps.get(id) || null;
  }

  getFeaturedApps(): AppPackage[] {
    return Array.from(this.apps.values()).filter(app => app.featured);
  }

  getPopularApps(): AppPackage[] {
    return Array.from(this.apps.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, 20);
  }

  getRecentApps(): AppPackage[] {
    return Array.from(this.apps.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20);
  }

  getInstalledApps(): AppPackage[] {
    return Array.from(this.apps.values()).filter(app => app.isInstalled);
  }

  getAppsWithUpdates(): AppPackage[] {
    return Array.from(this.apps.values()).filter(app => app.updateAvailable);
  }

  getAppsByCategory(category: AppCategory): AppPackage[] {
    return Array.from(this.apps.values()).filter(app => app.category === category);
  }

  searchApps(query: string): AppPackage[] {
    const searchLower = query.toLowerCase();
    return Array.from(this.apps.values()).filter(app =>
      app.name.toLowerCase().includes(searchLower) ||
      app.description.toLowerCase().includes(searchLower) ||
      app.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      app.author.toLowerCase().includes(searchLower)
    );
  }

  // App management
  async installApp(appId: string): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app || app.isInstalled) {
      return false;
    }

    try {
      // Simulate installation process
      this.updateInstallationProgress(appId, 'downloading', 0);
      await this.simulateProgress(appId, 'downloading', 0, 30);

      this.updateInstallationProgress(appId, 'extracting', 30);
      await this.simulateProgress(appId, 'extracting', 30, 60);

      this.updateInstallationProgress(appId, 'installing', 60);
      await this.simulateProgress(appId, 'installing', 60, 90);

      this.updateInstallationProgress(appId, 'configuring', 90);
      await this.simulateProgress(appId, 'configuring', 90, 100);

      // Mark as installed
      app.isInstalled = true;
      app.isEnabled = true;
      app.installDate = new Date();

      this.updateInstallationProgress(appId, 'complete', 100);
      this.installationProgress.delete(appId);

      return true;
    } catch (error) {
      this.updateInstallationProgress(appId, 'error', 0, undefined, undefined, 'Installation failed');
      return false;
    }
  }

  async uninstallApp(appId: string): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app || !app.isInstalled) {
      return false;
    }

    try {
      // Simulate uninstallation
      await new Promise(resolve => setTimeout(resolve, 1000));

      app.isInstalled = false;
      app.isEnabled = false;
      app.installDate = undefined;

      return true;
    } catch (error) {
      return false;
    }
  }

  async updateApp(appId: string): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app || !app.updateAvailable || !app.latestVersion) {
      return false;
    }

    try {
      // Simulate update process
      await new Promise(resolve => setTimeout(resolve, 2000));

      app.version = app.latestVersion;
      app.updateAvailable = false;
      app.latestVersion = undefined;
      app.updatedAt = new Date();

      return true;
    } catch (error) {
      return false;
    }
  }

  enableApp(appId: string): boolean {
    const app = this.apps.get(appId);
    if (!app || !app.isInstalled) {
      return false;
    }

    app.isEnabled = true;
    return true;
  }

  disableApp(appId: string): boolean {
    const app = this.apps.get(appId);
    if (!app || !app.isInstalled) {
      return false;
    }

    app.isEnabled = false;
    return true;
  }

  // Installation progress
  private updateInstallationProgress(
    appId: string,
    phase: InstallationProgress['phase'],
    progress: number,
    speed?: number,
    eta?: number,
    error?: string
  ): void {
    this.installationProgress.set(appId, {
      appId,
      phase,
      progress,
      speed,
      eta,
      error
    });
  }

  private async simulateProgress(
    appId: string,
    phase: InstallationProgress['phase'],
    start: number,
    end: number
  ): Promise<void> {
    const steps = 10;
    const stepSize = (end - start) / steps;
    const delay = 200; // 200ms per step

    for (let i = 0; i <= steps; i++) {
      const progress = start + (stepSize * i);
      this.updateInstallationProgress(appId, phase, progress);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  getInstallationProgress(appId: string): InstallationProgress | null {
    return this.installationProgress.get(appId) || null;
  }

  // Categories
  getCategories(): { id: AppCategory; name: string; count: number }[] {
    const categories = {
      productivity: 'Productivity',
      development: 'Development',
      multimedia: 'Multimedia',
      games: 'Games',
      utilities: 'Utilities',
      education: 'Education',
      graphics: 'Graphics',
      communication: 'Communication',
      finance: 'Finance',
      health: 'Health',
      travel: 'Travel',
      social: 'Social',
      news: 'News',
      business: 'Business',
      entertainment: 'Entertainment',
      system: 'System',
      security: 'Security',
      other: 'Other'
    };

    return Object.entries(categories).map(([id, name]) => ({
      id: id as AppCategory,
      name,
      count: this.getAppsByCategory(id as AppCategory).length
    }));
  }

  // App ratings and reviews
  rateApp(appId: string, rating: number): boolean {
    const app = this.apps.get(appId);
    if (!app) return false;

    // In a real implementation, this would update the user's rating
    // and recalculate the average rating
    app.rating = Math.min(5, Math.max(1, rating));
    return true;
  }

  // Updates
  checkForUpdates(): UpdateInfo[] {
    return Array.from(this.apps.values())
      .filter(app => app.isInstalled && app.updateAvailable)
      .map(app => ({
        appId: app.id,
        currentVersion: app.version,
        latestVersion: app.latestVersion!,
        changes: ['Bug fixes and performance improvements'], // Simplified
        size: app.size * 0.3, // Assume updates are 30% of full size
        critical: false,
        autoUpdate: false
      }));
  }

  // Validation
  validateApp(app: AppPackage): boolean {
    // Basic validation checks
    if (!app.id || !app.name || !app.version || !app.manifest) {
      return false;
    }

    // Check manifest validity
    if (!app.manifest.entryPoint || !app.manifest.type) {
      return false;
    }

    // Verify dependencies
    for (const dep of app.dependencies) {
      const dependency = this.apps.get(dep);
      if (!dependency || !dependency.isInstalled) {
        return false;
      }
    }

    return true;
  }

  // Statistics
  getStoreStats(): {
    totalApps: number;
    installedApps: number;
    featuredApps: number;
    totalDownloads: number;
    averageRating: number;
  } {
    const allApps = this.getAllApps();
    const totalDownloads = allApps.reduce((sum, app) => sum + app.downloads, 0);
    const totalRatings = allApps.reduce((sum, app) => sum + (app.rating * app.reviews), 0);
    const totalReviews = allApps.reduce((sum, app) => sum + app.reviews, 0);

    return {
      totalApps: allApps.length,
      installedApps: this.getInstalledApps().length,
      featuredApps: this.getFeaturedApps().length,
      totalDownloads,
      averageRating: totalReviews > 0 ? totalRatings / totalReviews : 0
    };
  }
}

export const appStoreManager = new AppStoreManager();