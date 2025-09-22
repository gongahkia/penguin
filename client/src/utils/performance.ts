import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceData {
  metric: string;
  value: number;
  id?: string;
  name?: string;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceData[] = [];
  private isEnabled: boolean = true;

  constructor() {
    if (this.isEnabled) {
      this.initializeWebVitals();
    }
  }

  private initializeWebVitals() {
    onCLS((metric) => this.logMetric('CLS', metric.value, metric.id, metric.name));
    onFID((metric) => this.logMetric('FID', metric.value, metric.id, metric.name));
    onFCP((metric) => this.logMetric('FCP', metric.value, metric.id, metric.name));
    onLCP((metric) => this.logMetric('LCP', metric.value, metric.id, metric.name));
    onTTFB((metric) => this.logMetric('TTFB', metric.value, metric.id, metric.name));
  }

  private logMetric(metricName: string, value: number, id?: string, name?: string) {
    const performanceData: PerformanceData = {
      metric: metricName,
      value,
      id,
      name,
      timestamp: Date.now()
    };

    this.metrics.push(performanceData);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${metricName}`, performanceData);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToAnalytics(performanceData);
    }
  }

  private sendToAnalytics(data: PerformanceData) {
    // Example implementation - replace with your analytics service
    try {
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).catch(console.error);
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }

  public getMetrics(): PerformanceData[] {
    return [...this.metrics];
  }

  public measureRenderTime(componentName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;

      this.logMetric('ComponentRender', renderTime, undefined, componentName);
    };
  }

  public measureAsyncOperation(operationName: string): (error?: Error) => void {
    const startTime = performance.now();

    return (error?: Error) => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (error) {
        this.logMetric('AsyncOperationError', duration, undefined, operationName);
      } else {
        this.logMetric('AsyncOperation', duration, undefined, operationName);
      }
    };
  }

  public measureUserInteraction(interactionName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      this.logMetric('UserInteraction', duration, undefined, interactionName);
    };
  }

  public clear() {
    this.metrics = [];
  }

  public disable() {
    this.isEnabled = false;
  }

  public enable() {
    this.isEnabled = true;
  }

  public getBundleSize(): Promise<number> {
    return new Promise((resolve) => {
      if ('connection' in navigator) {
        // Estimate bundle size from resource timing
        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const jsResources = resources.filter(r => r.name.endsWith('.js'));
        const totalSize = jsResources.reduce((total, resource) => {
          return total + (resource.transferSize || resource.encodedBodySize || 0);
        }, 0);
        resolve(totalSize);
      } else {
        resolve(0);
      }
    });
  }

  public analyzeMemoryUsage(): any {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  public checkForMemoryLeaks(): void {
    const initialMemory = this.analyzeMemoryUsage();

    // Check memory after 30 seconds
    setTimeout(() => {
      const currentMemory = this.analyzeMemoryUsage();
      if (initialMemory && currentMemory) {
        const memoryIncrease = currentMemory.usedJSHeapSize - initialMemory.usedJSHeapSize;
        if (memoryIncrease > 10 * 1024 * 1024) { // 10MB threshold
          this.logMetric('MemoryLeak', memoryIncrease, undefined, 'MemoryGrowth');
        }
      }
    }, 30000);
  }

  public optimizeImages(): void {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.loading) {
        img.loading = 'lazy';
      }
      if (!img.decoding) {
        img.decoding = 'async';
      }
    });
  }

  public preloadCriticalResources(urls: string[]): void {
    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;

      if (url.endsWith('.js')) {
        link.as = 'script';
      } else if (url.endsWith('.css')) {
        link.as = 'style';
      } else if (url.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
        link.as = 'image';
      }

      document.head.appendChild(link);
    });
  }
}

export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;