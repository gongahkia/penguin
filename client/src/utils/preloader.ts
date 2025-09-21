import { AppType } from '@/types';

type PreloadFunction = () => Promise<any>;

interface PreloadRegistry {
  [key: string]: PreloadFunction;
}

class ComponentPreloader {
  private preloadRegistry: PreloadRegistry = {};
  private preloadedComponents = new Set<string>();
  private isPreloading = new Set<string>();

  constructor() {
    this.registerApps();
  }

  private registerApps() {
    // Register app preload functions
    this.preloadRegistry = {
      calculator: () => import('@/apps/Calculator/Calculator'),
      terminal: () => import('@/apps/Terminal/Terminal'),
      textEditor: () => import('@/apps/TextEditor/TextEditor'),
      fileExplorer: () => import('@/apps/FileExplorer/FileExplorer'),
      mediaPlayer: () => import('@/apps/MediaPlayer/MediaPlayer'),
      notepad: () => import('@/apps/Notepad/Notepad'),
      settings: () => import('@/apps/Settings/Settings'),
    };
  }

  async preload(componentKey: string): Promise<void> {
    if (this.preloadedComponents.has(componentKey) || this.isPreloading.has(componentKey)) {
      return;
    }

    const preloadFn = this.preloadRegistry[componentKey];
    if (!preloadFn) {
      console.warn(`No preload function registered for: ${componentKey}`);
      return;
    }

    this.isPreloading.add(componentKey);

    try {
      await preloadFn();
      this.preloadedComponents.add(componentKey);
      console.log(`Preloaded component: ${componentKey}`);
    } catch (error) {
      console.error(`Failed to preload component ${componentKey}:`, error);
    } finally {
      this.isPreloading.delete(componentKey);
    }
  }

  async preloadMultiple(componentKeys: string[]): Promise<void> {
    const preloadPromises = componentKeys.map(key => this.preload(key));
    await Promise.allSettled(preloadPromises);
  }

  preloadOnIdle(componentKey: string): void {
    if (this.preloadedComponents.has(componentKey)) {
      return;
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preload(componentKey);
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        this.preload(componentKey);
      }, 100);
    }
  }

  preloadOnHover(element: HTMLElement, componentKey: string): void {
    let timeoutId: NodeJS.Timeout;

    const handleMouseEnter = () => {
      timeoutId = setTimeout(() => {
        this.preload(componentKey);
      }, 100); // Small delay to avoid preloading on brief hovers
    };

    const handleMouseLeave = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup function
    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }

  async preloadCritical(): Promise<void> {
    // Preload the most commonly used apps
    const criticalApps = ['calculator', 'terminal', 'textEditor'];
    await this.preloadMultiple(criticalApps);
  }

  async preloadAll(): Promise<void> {
    const allKeys = Object.keys(this.preloadRegistry);
    await this.preloadMultiple(allKeys);
  }

  isPreloaded(componentKey: string): boolean {
    return this.preloadedComponents.has(componentKey);
  }

  getPreloadedComponents(): string[] {
    return Array.from(this.preloadedComponents);
  }

  reset(): void {
    this.preloadedComponents.clear();
    this.isPreloading.clear();
  }
}

export const preloader = new ComponentPreloader();
export default ComponentPreloader;