import { serviceWorkerManager } from './serviceWorker';
import { pwaInstallManager } from './pwaInstall';
import { offlineManager } from './offlineManager';
import { performanceMonitor } from './performance';

interface PWAConfig {
  enableServiceWorker?: boolean;
  enableOfflineMode?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableInstallPrompt?: boolean;
  autoRegisterSW?: boolean;
}

class PWAInitializer {
  private config: PWAConfig;
  private initialized = false;

  constructor(config: PWAConfig = {}) {
    this.config = {
      enableServiceWorker: true,
      enableOfflineMode: true,
      enablePerformanceMonitoring: true,
      enableInstallPrompt: true,
      autoRegisterSW: true,
      ...config
    };
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('PWA already initialized');
      return;
    }

    console.log('Initializing PWA features...');

    try {
      // Initialize performance monitoring first
      if (this.config.enablePerformanceMonitoring) {
        await this.initializePerformanceMonitoring();
      }

      // Initialize service worker
      if (this.config.enableServiceWorker && this.config.autoRegisterSW) {
        await this.initializeServiceWorker();
      }

      // Initialize offline capabilities
      if (this.config.enableOfflineMode) {
        await this.initializeOfflineMode();
      }

      // Initialize install prompt
      if (this.config.enableInstallPrompt) {
        await this.initializeInstallPrompt();
      }

      this.initialized = true;
      console.log('PWA initialization complete');

      // Dispatch custom event for other parts of the app
      window.dispatchEvent(new CustomEvent('pwa-initialized'));

    } catch (error) {
      console.error('PWA initialization failed:', error);
      throw error;
    }
  }

  private async initializePerformanceMonitoring(): Promise<void> {
    console.log('Initializing performance monitoring...');

    // Start monitoring web vitals
    performanceMonitor.enable();

    // Preload critical components after initial load
    setTimeout(() => {
      import('./preloader').then(({ preloader }) => {
        preloader.preloadCritical();
      });
    }, 1000);
  }

  private async initializeServiceWorker(): Promise<void> {
    if (!serviceWorkerManager.isSupported()) {
      console.warn('Service Worker not supported');
      return;
    }

    console.log('Registering service worker...');

    await serviceWorkerManager.register({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully');
      },
      onUpdate: (registration) => {
        console.log('Service Worker update available');
      },
      onError: (error) => {
        console.error('Service Worker registration failed:', error);
      }
    });
  }

  private async initializeOfflineMode(): Promise<void> {
    console.log('Initializing offline capabilities...');

    // Set up network state monitoring
    offlineManager.addNetworkListener((state) => {
      console.log('Network state changed:', state);

      // Show offline indicator if needed
      this.updateOfflineIndicator(state.isOnline);

      // Show network quality indicator
      this.updateNetworkQualityIndicator(offlineManager.getConnectionQuality());
    });

    // Process any pending offline tasks
    if (offlineManager.isOnline()) {
      // Small delay to ensure app is ready
      setTimeout(() => {
        const pendingTasks = offlineManager.getPendingTasks();
        if (pendingTasks.length > 0) {
          console.log(`Processing ${pendingTasks.length} pending offline tasks`);
        }
      }, 2000);
    }
  }

  private async initializeInstallPrompt(): Promise<void> {
    if (!pwaInstallManager.isSupported()) {
      console.warn('PWA installation not supported');
      return;
    }

    console.log('Initializing PWA install prompt...');

    // Listen for install state changes
    pwaInstallManager.addStateListener((state) => {
      console.log('PWA install state changed:', state);

      if (state.canInstall && state.showPrompt && !state.isInstalled) {
        // Show install button/banner after a delay
        setTimeout(() => {
          this.showInstallBanner();
        }, 3000);
      }
    });
  }

  private updateOfflineIndicator(isOnline: boolean): void {
    let indicator = document.getElementById('offline-indicator');

    if (!isOnline) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: #f44336;
          color: white;
          padding: 8px;
          text-align: center;
          z-index: 9999;
          font-size: 14px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        indicator.textContent = 'You are offline. Some features may be limited.';
        document.body.appendChild(indicator);
      }
    } else if (indicator) {
      indicator.remove();
    }
  }

  private updateNetworkQualityIndicator(quality: string): void {
    const indicator = document.getElementById('network-quality-indicator');

    if (quality === 'poor') {
      if (!indicator) {
        const newIndicator = document.createElement('div');
        newIndicator.id = 'network-quality-indicator';
        newIndicator.style.cssText = `
          position: fixed;
          top: 32px;
          left: 0;
          right: 0;
          background: #ff9800;
          color: white;
          padding: 6px;
          text-align: center;
          z-index: 9998;
          font-size: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        newIndicator.textContent = 'Slow network detected. Performance may be affected.';
        document.body.appendChild(newIndicator);
      }
    } else if (indicator) {
      indicator.remove();
    }
  }

  private showInstallBanner(): void {
    if (document.getElementById('pwa-install-banner')) {
      return; // Already showing
    }

    const banner = document.createElement('div');
    banner.id = 'pwa-install-banner';
    banner.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 400px;
      margin: 0 auto;
    `;

    banner.innerHTML = `
      <div>
        <div style="font-weight: 500; margin-bottom: 4px;">Install Penguin OS</div>
        <div style="font-size: 14px; opacity: 0.9;">Get the full desktop experience</div>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="pwa-install-btn" style="
          background: white;
          color: #2196F3;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
        ">Install</button>
        <button id="pwa-dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 8px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 18px;
          line-height: 1;
        ">×</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Handle install button
    const installBtn = banner.querySelector('#pwa-install-btn');
    installBtn?.addEventListener('click', async () => {
      if (pwaInstallManager.canShowPrompt()) {
        await pwaInstallManager.showInstallPrompt();
      } else {
        pwaInstallManager.showInstallInstructions();
      }
      banner.remove();
    });

    // Handle dismiss button
    const dismissBtn = banner.querySelector('#pwa-dismiss-btn');
    dismissBtn?.addEventListener('click', () => {
      pwaInstallManager.dismissPrompt();
      banner.remove();
    });

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (document.body.contains(banner)) {
        banner.remove();
      }
    }, 15000);
  }

  getStatus(): {
    initialized: boolean;
    serviceWorker: boolean;
    offline: boolean;
    installPrompt: boolean;
  } {
    return {
      initialized: this.initialized,
      serviceWorker: serviceWorkerManager.isSupported(),
      offline: offlineManager.isOnline(),
      installPrompt: pwaInstallManager.canShowPrompt()
    };
  }

  async reset(): Promise<void> {
    console.log('Resetting PWA...');

    // Unregister service worker
    await serviceWorkerManager.unregister();

    // Clear offline tasks
    offlineManager.clearFailedTasks();

    // Reset performance monitoring
    performanceMonitor.clear();

    this.initialized = false;
  }
}

// Create singleton instance
export const pwaInitializer = new PWAInitializer();

// Auto-initialize when module is imported
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      pwaInitializer.initialize().catch(console.error);
    });
  } else {
    pwaInitializer.initialize().catch(console.error);
  }
}

export default PWAInitializer;