import { Workbox } from 'workbox-window';

interface ServiceWorkerConfig {
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private wb: Workbox | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private updateAvailable = false;

  constructor() {
    if ('serviceWorker' in navigator) {
      this.wb = new Workbox('/sw.js');
      this.setupEventListeners();
    }
  }

  private setupEventListeners() {
    if (!this.wb) return;

    this.wb.addEventListener('waiting', (event) => {
      this.updateAvailable = true;
      console.log('Service Worker update available');

      // Show update notification to user
      this.showUpdateNotification();
    });

    this.wb.addEventListener('controlling', (event) => {
      console.log('Service Worker is now controlling the page');
      window.location.reload();
    });

    this.wb.addEventListener('activated', (event) => {
      console.log('Service Worker activated');
    });

    this.wb.addEventListener('redundant', (event) => {
      console.log('Service Worker became redundant');
    });
  }

  async register(config: ServiceWorkerConfig = {}): Promise<ServiceWorkerRegistration | undefined> {
    if (!this.wb) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      this.registration = await this.wb.register();
      console.log('Service Worker registered successfully');

      if (config.onSuccess) {
        config.onSuccess(this.registration);
      }

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);

      if (config.onError) {
        config.onError(error as Error);
      }
    }
  }

  async update(): Promise<void> {
    if (!this.wb || !this.updateAvailable) {
      console.log('No update available');
      return;
    }

    try {
      await this.wb.messageSkipWaiting();
      console.log('Service Worker update applied');
    } catch (error) {
      console.error('Failed to update Service Worker:', error);
    }
  }

  private showUpdateNotification() {
    // Create a simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2196F3;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      max-width: 300px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    notification.innerHTML = `
      <div style="margin-bottom: 12px;">
        <strong>Update Available</strong>
      </div>
      <div style="margin-bottom: 16px; font-size: 14px; opacity: 0.9;">
        A new version of Penguin OS is available.
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="sw-update-btn" style="
          background: white;
          color: #2196F3;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
        ">Update</button>
        <button id="sw-dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.5);
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Handle update button click
    const updateBtn = notification.querySelector('#sw-update-btn');
    updateBtn?.addEventListener('click', () => {
      this.update();
      document.body.removeChild(notification);
    });

    // Handle dismiss button click
    const dismissBtn = notification.querySelector('#sw-dismiss-btn');
    dismissBtn?.addEventListener('click', () => {
      document.body.removeChild(notification);
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }

  async getRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (this.registration) {
      return this.registration;
    }

    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.getRegistration();
        return this.registration;
      } catch (error) {
        console.error('Failed to get service worker registration:', error);
      }
    }

    return null;
  }

  async unregister(): Promise<boolean> {
    const registration = await this.getRegistration();

    if (registration) {
      try {
        const result = await registration.unregister();
        console.log('Service Worker unregistered:', result);
        return result;
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
      }
    }

    return false;
  }

  isUpdateAvailable(): boolean {
    return this.updateAvailable;
  }

  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

export const serviceWorkerManager = new ServiceWorkerManager();
export default ServiceWorkerManager;