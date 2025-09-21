interface OfflineTask {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

interface NetworkState {
  isOnline: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

class OfflineManager {
  private tasks: OfflineTask[] = [];
  private maxRetries = 3;
  private retryDelay = 1000;
  private networkState: NetworkState = { isOnline: navigator.onLine };
  private listeners: Set<(state: NetworkState) => void> = new Set();

  constructor() {
    this.setupNetworkListeners();
    this.loadOfflineTasks();
    this.processQueuePeriodically();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.updateNetworkState({ isOnline: true });
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.updateNetworkState({ isOnline: false });
    });

    // Enhanced network information if available
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateConnectionInfo = () => {
        this.updateNetworkState({
          isOnline: navigator.onLine,
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt
        });
      };

      connection.addEventListener('change', updateConnectionInfo);
      updateConnectionInfo();
    }
  }

  private updateNetworkState(newState: Partial<NetworkState>) {
    this.networkState = { ...this.networkState, ...newState };
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.networkState);
      } catch (error) {
        console.error('Error in network state listener:', error);
      }
    });
  }

  addNetworkListener(listener: (state: NetworkState) => void) {
    this.listeners.add(listener);

    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }

  async queueTask(type: string, data: any, maxRetries = this.maxRetries): Promise<string> {
    const task: OfflineTask = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries
    };

    this.tasks.push(task);
    this.saveOfflineTasks();

    console.log(`Queued offline task: ${type}`, task);

    // Try to process immediately if online
    if (this.networkState.isOnline) {
      this.processOfflineQueue();
    }

    return task.id;
  }

  private async processOfflineQueue() {
    if (!this.networkState.isOnline || this.tasks.length === 0) {
      return;
    }

    console.log(`Processing ${this.tasks.length} offline tasks`);

    const tasksToProcess = [...this.tasks];
    this.tasks = [];

    for (const task of tasksToProcess) {
      try {
        await this.processTask(task);
        console.log(`Successfully processed task: ${task.type}`, task);
      } catch (error) {
        console.error(`Failed to process task: ${task.type}`, error);

        task.retryCount++;

        if (task.retryCount < task.maxRetries) {
          // Re-queue for retry
          this.tasks.push(task);
          console.log(`Re-queued task for retry: ${task.type} (${task.retryCount}/${task.maxRetries})`);
        } else {
          console.error(`Task exceeded max retries: ${task.type}`, task);
          this.handleFailedTask(task);
        }
      }
    }

    this.saveOfflineTasks();
  }

  private async processTask(task: OfflineTask): Promise<void> {
    switch (task.type) {
      case 'save-file':
        return this.processSaveFile(task.data);
      case 'user-preference':
        return this.processUserPreference(task.data);
      case 'terminal-command':
        return this.processTerminalCommand(task.data);
      case 'app-state':
        return this.processAppState(task.data);
      default:
        console.warn(`Unknown task type: ${task.type}`);
    }
  }

  private async processSaveFile(data: any): Promise<void> {
    const response = await fetch('/api/files/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to save file: ${response.statusText}`);
    }
  }

  private async processUserPreference(data: any): Promise<void> {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to save preferences: ${response.statusText}`);
    }
  }

  private async processTerminalCommand(data: any): Promise<void> {
    const response = await fetch('/api/terminal/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to save command: ${response.statusText}`);
    }
  }

  private async processAppState(data: any): Promise<void> {
    const response = await fetch('/api/app-state', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Failed to save app state: ${response.statusText}`);
    }
  }

  private handleFailedTask(task: OfflineTask) {
    // Store failed tasks for manual retry or user notification
    const failedTasks = this.getFailedTasks();
    failedTasks.push(task);
    localStorage.setItem('penguin-os-failed-tasks', JSON.stringify(failedTasks));
  }

  private processQueuePeriodically() {
    setInterval(() => {
      if (this.networkState.isOnline && this.tasks.length > 0) {
        this.processOfflineQueue();
      }
    }, 30000); // Check every 30 seconds
  }

  private saveOfflineTasks() {
    try {
      localStorage.setItem('penguin-os-offline-tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save offline tasks:', error);
    }
  }

  private loadOfflineTasks() {
    try {
      const stored = localStorage.getItem('penguin-os-offline-tasks');
      if (stored) {
        this.tasks = JSON.parse(stored);
        console.log(`Loaded ${this.tasks.length} offline tasks`);
      }
    } catch (error) {
      console.error('Failed to load offline tasks:', error);
      this.tasks = [];
    }
  }

  getNetworkState(): NetworkState {
    return { ...this.networkState };
  }

  getPendingTasks(): OfflineTask[] {
    return [...this.tasks];
  }

  getFailedTasks(): OfflineTask[] {
    try {
      const stored = localStorage.getItem('penguin-os-failed-tasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load failed tasks:', error);
      return [];
    }
  }

  clearFailedTasks() {
    localStorage.removeItem('penguin-os-failed-tasks');
  }

  retryFailedTasks() {
    const failedTasks = this.getFailedTasks();
    failedTasks.forEach(task => {
      task.retryCount = 0; // Reset retry count
      this.tasks.push(task);
    });

    this.clearFailedTasks();
    this.saveOfflineTasks();

    if (this.networkState.isOnline) {
      this.processOfflineQueue();
    }
  }

  isOnline(): boolean {
    return this.networkState.isOnline;
  }

  getConnectionQuality(): 'excellent' | 'good' | 'poor' | 'offline' {
    if (!this.networkState.isOnline) return 'offline';

    const { effectiveType, rtt, downlink } = this.networkState;

    if (effectiveType === '4g' && (rtt || 0) < 100 && (downlink || 0) > 10) {
      return 'excellent';
    } else if (effectiveType === '4g' || (effectiveType === '3g' && (rtt || 0) < 300)) {
      return 'good';
    } else {
      return 'poor';
    }
  }
}

export const offlineManager = new OfflineManager();
export default OfflineManager;