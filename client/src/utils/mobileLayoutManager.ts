interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  touchSupport: boolean;
}

interface LayoutBreakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

interface MobileLayoutOptions {
  enableSwipeNavigation?: boolean;
  enablePullToRefresh?: boolean;
  enableTouchScrolling?: boolean;
  autoHideToolbars?: boolean;
  adaptiveTextSize?: boolean;
  largerTouchTargets?: boolean;
  simplifiedInterface?: boolean;
}

class MobileLayoutManager {
  private viewportInfo: ViewportInfo;
  private breakpoints: LayoutBreakpoints = {
    mobile: 768,
    tablet: 1024,
    desktop: 1200
  };
  private options: MobileLayoutOptions;
  private eventListeners = new Map<string, EventListener>();
  private resizeObserver: ResizeObserver | null = null;

  constructor(options: MobileLayoutOptions = {}) {
    this.options = {
      enableSwipeNavigation: true,
      enablePullToRefresh: true,
      enableTouchScrolling: true,
      autoHideToolbars: true,
      adaptiveTextSize: true,
      largerTouchTargets: true,
      simplifiedInterface: true,
      ...options
    };

    this.viewportInfo = this.detectViewport();
    this.setupEventListeners();
    this.applyInitialLayout();
  }

  private detectViewport(): ViewportInfo {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const orientation = width > height ? 'landscape' : 'portrait';

    const isMobile = width < this.breakpoints.mobile;
    const isTablet = width >= this.breakpoints.mobile && width < this.breakpoints.desktop;
    const isDesktop = width >= this.breakpoints.desktop;

    const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    return {
      width,
      height,
      devicePixelRatio,
      orientation,
      isMobile,
      isTablet,
      isDesktop,
      touchSupport
    };
  }

  private setupEventListeners(): void {
    const resizeListener = () => {
      this.handleResize();
    };

    const orientationListener = () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100); // Delay to ensure viewport is updated
    };

    window.addEventListener('resize', resizeListener);
    window.addEventListener('orientationchange', orientationListener);

    this.eventListeners.set('resize', resizeListener);
    this.eventListeners.set('orientationchange', orientationListener);

    // Setup ResizeObserver for viewport meta tag updates
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateViewportMeta();
      });
      this.resizeObserver.observe(document.body);
    }
  }

  private applyInitialLayout(): void {
    this.updateViewportMeta();
    this.applyMobileStyles();
    this.setupTouchOptimizations();
    this.configureScrolling();
    this.setupAccessibilityFeatures();
  }

  private handleResize(): void {
    const oldViewport = { ...this.viewportInfo };
    this.viewportInfo = this.detectViewport();

    // Check if device type changed
    if (
      oldViewport.isMobile !== this.viewportInfo.isMobile ||
      oldViewport.isTablet !== this.viewportInfo.isTablet ||
      oldViewport.isDesktop !== this.viewportInfo.isDesktop
    ) {
      this.applyLayoutChanges();
    }

    this.updateViewportMeta();
  }

  private handleOrientationChange(): void {
    const oldOrientation = this.viewportInfo.orientation;
    this.viewportInfo = this.detectViewport();

    if (oldOrientation !== this.viewportInfo.orientation) {
      this.applyOrientationChanges();
    }
  }

  private updateViewportMeta(): void {
    let viewportMeta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;

    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }

    if (this.viewportInfo.isMobile) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover';
    } else {
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }
  }

  private applyMobileStyles(): void {
    const root = document.documentElement;

    if (this.viewportInfo.isMobile) {
      root.classList.add('mobile-layout');
      root.classList.remove('tablet-layout', 'desktop-layout');

      if (this.options.adaptiveTextSize) {
        root.style.setProperty('--base-font-size', '16px');
        root.style.setProperty('--line-height', '1.5');
      }

      if (this.options.largerTouchTargets) {
        root.style.setProperty('--touch-target-size', '44px');
        root.style.setProperty('--button-padding', '12px 16px');
      }
    } else if (this.viewportInfo.isTablet) {
      root.classList.add('tablet-layout');
      root.classList.remove('mobile-layout', 'desktop-layout');

      root.style.setProperty('--base-font-size', '15px');
      root.style.setProperty('--touch-target-size', '40px');
    } else {
      root.classList.add('desktop-layout');
      root.classList.remove('mobile-layout', 'tablet-layout');

      root.style.setProperty('--base-font-size', '14px');
      root.style.setProperty('--touch-target-size', '32px');
    }

    // Add device-specific classes
    if (this.viewportInfo.touchSupport) {
      root.classList.add('touch-device');
    } else {
      root.classList.add('no-touch');
    }

    root.classList.add(`orientation-${this.viewportInfo.orientation}`);
  }

  private setupTouchOptimizations(): void {
    if (!this.viewportInfo.touchSupport) return;

    const style = document.createElement('style');
    style.textContent = `
      /* Touch optimizations */
      * {
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
        -webkit-touch-callout: none;
      }

      button, .clickable {
        cursor: pointer;
        touch-action: manipulation;
      }

      .draggable {
        touch-action: pan-x pan-y;
      }

      .zoomable {
        touch-action: pinch-zoom;
      }

      /* Improve scrolling on iOS */
      .scrollable {
        -webkit-overflow-scrolling: touch;
        overflow-scrolling: touch;
      }

      /* Mobile-specific UI improvements */
      .mobile-layout .window {
        border-radius: 0;
        box-shadow: none;
        border: none;
      }

      .mobile-layout .taskbar {
        height: 60px;
        padding: 8px 16px;
      }

      .mobile-layout .desktop-icons {
        padding: 20px;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 20px;
      }

      .mobile-layout .window-content {
        padding: 16px;
      }

      /* Touch-friendly form elements */
      .mobile-layout input,
      .mobile-layout textarea,
      .mobile-layout select {
        min-height: 44px;
        font-size: 16px; /* Prevent zoom on iOS */
        padding: 12px;
        border-radius: 8px;
      }

      .mobile-layout button {
        min-height: var(--touch-target-size, 44px);
        padding: var(--button-padding, 12px 16px);
        border-radius: 8px;
        font-size: 16px;
      }

      /* Responsive text */
      .mobile-layout {
        font-size: var(--base-font-size, 16px);
        line-height: var(--line-height, 1.5);
      }

      /* Hide elements on mobile if needed */
      .mobile-layout .desktop-only {
        display: none !important;
      }

      .desktop-layout .mobile-only {
        display: none !important;
      }

      /* Orientation-specific styles */
      .orientation-landscape .mobile-layout .taskbar {
        height: 50px;
      }

      .orientation-portrait .mobile-layout .window {
        max-height: calc(100vh - 120px);
      }
    `;

    document.head.appendChild(style);
  }

  private configureScrolling(): void {
    if (this.options.enableTouchScrolling && this.viewportInfo.touchSupport) {
      // Add smooth scrolling behavior
      document.body.style.scrollBehavior = 'smooth';

      // Prevent elastic bouncing on iOS for the body
      document.body.style.overscrollBehavior = 'none';

      // Add pull-to-refresh prevention for the main app area
      const preventPullToRefresh = (e: TouchEvent) => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop === 0 && e.touches[0].clientY > e.touches[0].clientY) {
          e.preventDefault();
        }
      };

      if (!this.options.enablePullToRefresh) {
        document.addEventListener('touchstart', preventPullToRefresh, { passive: false });
      }
    }
  }

  private setupAccessibilityFeatures(): void {
    // Enhanced focus management for touch devices
    if (this.viewportInfo.touchSupport) {
      const style = document.createElement('style');
      style.textContent = `
        /* Enhanced focus indicators for touch devices */
        .touch-device *:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        /* Improve button accessibility */
        .touch-device button:focus,
        .touch-device .clickable:focus {
          transform: scale(1.05);
          transition: transform 0.1s ease;
        }

        /* Screen reader improvements */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `;
      document.head.appendChild(style);
    }

    // Add ARIA labels for better screen reader support
    this.enhanceAriaLabels();
  }

  private enhanceAriaLabels(): void {
    // Add mobile-specific ARIA labels
    const elements = document.querySelectorAll('[data-mobile-label]');
    elements.forEach(element => {
      const mobileLabel = element.getAttribute('data-mobile-label');
      if (mobileLabel && this.viewportInfo.isMobile) {
        element.setAttribute('aria-label', mobileLabel);
      }
    });
  }

  private applyLayoutChanges(): void {
    this.applyMobileStyles();

    // Trigger layout recalculation for windows
    const windows = document.querySelectorAll('.window');
    windows.forEach(window => {
      if (this.viewportInfo.isMobile) {
        this.adaptWindowForMobile(window as HTMLElement);
      } else {
        this.restoreWindowDesktopLayout(window as HTMLElement);
      }
    });

    // Dispatch custom event for components to respond to layout changes
    window.dispatchEvent(new CustomEvent('layout-changed', {
      detail: {
        viewport: this.viewportInfo,
        isMobile: this.viewportInfo.isMobile,
        isTablet: this.viewportInfo.isTablet,
        isDesktop: this.viewportInfo.isDesktop
      }
    }));
  }

  private applyOrientationChanges(): void {
    const root = document.documentElement;
    root.classList.remove('orientation-portrait', 'orientation-landscape');
    root.classList.add(`orientation-${this.viewportInfo.orientation}`);

    // Adjust layout for orientation change
    if (this.viewportInfo.isMobile) {
      const windows = document.querySelectorAll('.window');
      windows.forEach(window => {
        this.adaptWindowForOrientation(window as HTMLElement);
      });
    }

    window.dispatchEvent(new CustomEvent('orientation-changed', {
      detail: {
        orientation: this.viewportInfo.orientation,
        viewport: this.viewportInfo
      }
    }));
  }

  private adaptWindowForMobile(window: HTMLElement): void {
    // Make windows full-screen on mobile
    window.style.position = 'fixed';
    window.style.top = '60px'; // Account for taskbar
    window.style.left = '0';
    window.style.width = '100%';
    window.style.height = 'calc(100vh - 60px)';
    window.style.borderRadius = '0';
    window.style.border = 'none';
    window.style.boxShadow = 'none';
    window.style.zIndex = '1000';
  }

  private restoreWindowDesktopLayout(window: HTMLElement): void {
    // Restore desktop window styling
    window.style.position = '';
    window.style.top = '';
    window.style.left = '';
    window.style.width = '';
    window.style.height = '';
    window.style.borderRadius = '';
    window.style.border = '';
    window.style.boxShadow = '';
    window.style.zIndex = '';
  }

  private adaptWindowForOrientation(window: HTMLElement): void {
    if (this.viewportInfo.orientation === 'landscape') {
      window.style.height = 'calc(100vh - 50px)';
    } else {
      window.style.height = 'calc(100vh - 60px)';
    }
  }

  // Public methods
  isMobile(): boolean {
    return this.viewportInfo.isMobile;
  }

  isTablet(): boolean {
    return this.viewportInfo.isTablet;
  }

  isDesktop(): boolean {
    return this.viewportInfo.isDesktop;
  }

  hasTouchSupport(): boolean {
    return this.viewportInfo.touchSupport;
  }

  getViewportInfo(): ViewportInfo {
    return { ...this.viewportInfo };
  }

  getOrientation(): 'portrait' | 'landscape' {
    return this.viewportInfo.orientation;
  }

  // Enable/disable specific mobile features
  setMobileFeature(feature: keyof MobileLayoutOptions, enabled: boolean): void {
    this.options[feature] = enabled;
    this.applyLayoutChanges();
  }

  // Force layout recalculation
  recalculateLayout(): void {
    this.viewportInfo = this.detectViewport();
    this.applyLayoutChanges();
  }

  // Clean up
  destroy(): void {
    this.eventListeners.forEach((listener, event) => {
      window.removeEventListener(event, listener);
    });

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    const root = document.documentElement;
    root.classList.remove('mobile-layout', 'tablet-layout', 'desktop-layout');
    root.classList.remove('touch-device', 'no-touch');
    root.classList.remove('orientation-portrait', 'orientation-landscape');
  }
}

export { MobileLayoutManager, ViewportInfo, MobileLayoutOptions };
export default MobileLayoutManager;