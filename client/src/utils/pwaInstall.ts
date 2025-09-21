interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallState {
  canInstall: boolean;
  isInstalled: boolean;
  isStandalone: boolean;
  platform: string | null;
  showPrompt: boolean;
}

class PWAInstallManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private state: PWAInstallState = {
    canInstall: false,
    isInstalled: false,
    isStandalone: false,
    platform: null,
    showPrompt: false
  };
  private listeners: Set<(state: PWAInstallState) => void> = new Set();

  constructor() {
    this.setupEventListeners();
    this.detectPlatform();
    this.checkStandaloneMode();
    this.checkInstallation();
  }

  private setupEventListeners() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.updateState({ canInstall: true, showPrompt: true });
      console.log('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.updateState({
        isInstalled: true,
        canInstall: false,
        showPrompt: false
      });
      console.log('PWA was installed');
    });

    // Listen for display mode changes
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      this.updateState({ isStandalone: e.matches });
    });
  }

  private detectPlatform() {
    let platform = 'unknown';

    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
      platform = 'ios';
    } else if (navigator.userAgent.includes('Android')) {
      platform = 'android';
    } else if (navigator.userAgent.includes('Windows')) {
      platform = 'windows';
    } else if (navigator.userAgent.includes('Mac')) {
      platform = 'macos';
    } else if (navigator.userAgent.includes('Linux')) {
      platform = 'linux';
    }

    this.updateState({ platform });
  }

  private checkStandaloneMode() {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    this.updateState({ isStandalone });
  }

  private checkInstallation() {
    // Check if PWA is already installed
    const isInstalled = this.state.isStandalone || this.isInstalled();
    this.updateState({ isInstalled });
  }

  private updateState(updates: Partial<PWAInstallState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.state);
      } catch (error) {
        console.error('Error in PWA install state listener:', error);
      }
    });
  }

  addStateListener(listener: (state: PWAInstallState) => void) {
    this.listeners.add(listener);

    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }

  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.warn('No install prompt available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      console.log(`Install prompt result: ${outcome}`);

      if (outcome === 'accepted') {
        this.updateState({ isInstalled: true, canInstall: false, showPrompt: false });
        return true;
      } else {
        this.updateState({ showPrompt: false });
        return false;
      }
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    } finally {
      this.deferredPrompt = null;
    }
  }

  showInstallInstructions(): void {
    const instructions = this.getInstallInstructions();
    this.showInstructionsModal(instructions);
  }

  private getInstallInstructions(): string[] {
    switch (this.state.platform) {
      case 'ios':
        return [
          'Tap the Share button at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install Penguin OS'
        ];
      case 'android':
        return [
          'Tap the menu button (three dots) in your browser',
          'Select "Add to Home screen" or "Install app"',
          'Follow the prompts to install Penguin OS'
        ];
      default:
        return [
          'Look for an install button in your browser\'s address bar',
          'Or check your browser\'s menu for "Install" or "Add to desktop" options',
          'Follow the prompts to install Penguin OS'
        ];
    }
  }

  private showInstructionsModal(instructions: string[]): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      margin: 20px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    `;

    content.innerHTML = `
      <h2 style="margin: 0 0 16px 0; color: #333;">Install Penguin OS</h2>
      <p style="margin: 0 0 16px 0; color: #666;">
        To install Penguin OS as an app on your device:
      </p>
      <ol style="margin: 0 0 24px 0; padding-left: 20px; color: #555;">
        ${instructions.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
      </ol>
      <button id="close-instructions" style="
        background: #2196F3;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        width: 100%;
      ">Got it</button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    const closeBtn = content.querySelector('#close-instructions');
    const close = () => document.body.removeChild(modal);

    closeBtn?.addEventListener('click', close);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  canShowPrompt(): boolean {
    return this.state.canInstall && this.state.showPrompt;
  }

  isInstalled(): boolean {
    return this.state.isInstalled || this.state.isStandalone;
  }

  getState(): PWAInstallState {
    return { ...this.state };
  }

  dismissPrompt(): void {
    this.updateState({ showPrompt: false });
  }

  // Check if device supports PWA installation
  isSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get install prompt based on platform
  getInstallButtonText(): string {
    if (this.isInstalled()) {
      return 'Already Installed';
    }

    switch (this.state.platform) {
      case 'ios':
        return 'Add to Home Screen';
      case 'android':
        return 'Install App';
      default:
        return 'Install Penguin OS';
    }
  }
}

export const pwaInstallManager = new PWAInstallManager();
export default PWAInstallManager;