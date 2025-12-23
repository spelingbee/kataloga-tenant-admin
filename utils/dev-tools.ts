/**
 * Development Tools Utilities
 * 
 * Utilities for adding development tools and debugging panels
 */

/**
 * Add logging debug panel to the current page (development only)
 */
export function addLoggingDebugPanel(): void {
  if (!import.meta.dev || !import.meta.client) return;

  // Check if panel already exists
  if (document.getElementById('logging-debug-panel-container')) return;

  // Create container for the debug panel
  const container = document.createElement('div');
  container.id = 'logging-debug-panel-container';
  document.body.appendChild(container);

  // Import and mount the debug panel component
  import('~/components/dev/LoggingDebugPanel.vue').then((module) => {
    // The component will be automatically mounted via the template
    console.log('🛠️ Logging Debug Panel available in development mode');
  }).catch((error) => {
    console.warn('Failed to load logging debug panel:', error);
  });
}

/**
 * Initialize development tools
 */
export function initDevTools(): void {
  if (!import.meta.dev || !import.meta.client) return;

  // Add logging debug panel
  addLoggingDebugPanel();

  // Add global dev tools to window
  (globalThis as any).devTools = {
    addLoggingPanel: addLoggingDebugPanel,
    
    // Enhanced logger shortcuts
    loggerStats: () => {
      const { getErrorStats, getLegacyReport } = useEnhancedLogger();
      const stats = getErrorStats();
      const legacyReport = getLegacyReport();
      
      console.group('📊 Enhanced Logger Statistics');
      console.log('Error Stats:', stats);
      console.log('Legacy Detection Report:', legacyReport);
      console.groupEnd();
      
      return { stats, legacyReport };
    },
    
    loggerClear: () => {
      const { clearLogs } = useEnhancedLogger();
      clearLogs();
      console.log('✅ Enhanced logger logs cleared');
    },
    
    loggerExport: () => {
      const { exportLogs } = useEnhancedLogger();
      const exported = exportLogs();
      console.log('📤 Exported logs:', exported);
      return exported;
    },
    
    // Toast testing
    testToasts: () => {
      const { success, error, warning, info } = useEnhancedToast();
      
      success('Test success message');
      setTimeout(() => error('Test error message', 'test-req-123'), 1000);
      setTimeout(() => warning('Test warning message', 'test-req-456'), 2000);
      setTimeout(() => info('Test info message'), 3000);
      
      console.log('🧪 Test toasts triggered');
    },
    
    help: () => {
      console.group('🛠️ Development Tools Help');
      console.log('devTools.addLoggingPanel() - Add logging debug panel');
      console.log('devTools.loggerStats() - Show logger statistics');
      console.log('devTools.loggerClear() - Clear all logs');
      console.log('devTools.loggerExport() - Export logs');
      console.log('devTools.testToasts() - Test toast notifications');
      console.log('devTools.help() - Show this help');
      console.groupEnd();
    }
  };

  console.log('🛠️ Development tools loaded. Type devTools.help() for commands.');
}

/**
 * Performance monitoring utilities
 */
export class DevPerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static start(label: string): void {
    if (!import.meta.dev) return;
    this.measurements.set(label, performance.now());
  }

  static end(label: string): number | undefined {
    if (!import.meta.dev) return;
    
    const startTime = this.measurements.get(label);
    if (!startTime) {
      console.warn(`Performance measurement '${label}' was not started`);
      return;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    console.log(`⚡ Performance: ${label} took ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    if (!import.meta.dev) return fn();
    
    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!import.meta.dev) return fn();
    
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

/**
 * API call monitoring for development
 */
export function monitorApiCalls(): void {
  if (!import.meta.dev || !import.meta.client) return;

  // Monitor fetch calls
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const url = args[0]?.toString() || 'unknown';
    const startTime = performance.now();
    
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - startTime;
      
      console.log(`🌐 API Call: ${response.status} ${url} (${duration.toFixed(2)}ms)`);
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`🌐 API Call Failed: ${url} (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  };

  console.log('🌐 API call monitoring enabled');
}