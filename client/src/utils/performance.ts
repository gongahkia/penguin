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
}

export const performanceMonitor = new PerformanceMonitor();
export default PerformanceMonitor;