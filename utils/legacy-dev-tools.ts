/**
 * Legacy Compatibility Development Tools
 * 
 * Development utilities for monitoring and debugging legacy compatibility
 * Requirement 7.3: Development warnings and monitoring
 */

import { LegacyCompatibilityManager } from './legacy-compatibility';

/**
 * Development console commands for legacy compatibility
 * Available in browser console during development
 */
export class LegacyDevTools {
  private static isInitialized = false;

  /**
   * Initialize development tools (only in development mode)
   */
  static init(): void {
    if (!import.meta.dev || this.isInitialized || !import.meta.client) {
      return;
    }

    // Add global functions to window for console access
    const globalThis = window as any;
    
    globalThis.legacyStats = () => {
      const manager = LegacyCompatibilityManager.getInstance();
      const report = manager.generateCompatibilityReport();
      
      console.group('📊 Legacy Compatibility Report');
      console.log('Total conversions:', report.totalConversions);
      console.log('Format breakdown:', report.formatBreakdown);
      console.log('Error count:', report.errorCount);
      
      if (report.recentErrors.length > 0) {
        console.group('Recent errors:');
        report.recentErrors.forEach(error => {
          console.error(`${error.url}: ${error.error} (${error.timestamp.toISOString()})`);
        });
        console.groupEnd();
      }
      
      if (report.recommendations.length > 0) {
        console.group('Recommendations:');
        report.recommendations.forEach(rec => console.warn(`• ${rec}`));
        console.groupEnd();
      }
      
      console.groupEnd();
      
      return report;
    };

    globalThis.legacyClear = () => {
      const manager = LegacyCompatibilityManager.getInstance();
      manager.clearLogs();
      console.log('✅ Legacy compatibility logs cleared');
    };

    globalThis.legacyHelp = () => {
      console.group('🛠️ Legacy Compatibility Dev Tools');
      console.log('legacyStats() - Show compatibility statistics and report');
      console.log('legacyClear() - Clear compatibility logs');
      console.log('legacyHelp() - Show this help');
      console.groupEnd();
    };

    // Show initialization message
    console.log('🛠️ Legacy Compatibility Dev Tools loaded. Type legacyHelp() for commands.');
    
    this.isInitialized = true;
  }

  /**
   * Monitor legacy conversions and show warnings
   */
  static startMonitoring(): void {
    if (!import.meta.dev || !import.meta.client) {
      return;
    }

    // Check for high conversion rates periodically
    setInterval(() => {
      const manager = LegacyCompatibilityManager.getInstance();
      const stats = manager.getConversionStats();
      const totalConversions = Object.values(stats).reduce((sum, count) => sum + count, 0);
      
      if (totalConversions > 50) {
        console.warn(
          `⚠️ High legacy conversion rate detected (${totalConversions} conversions). ` +
          'Consider updating backend endpoints to use ApiResponse<T> format.'
        );
      }

      // Check if cleanup is needed
      if (manager.needsCleanup()) {
        console.warn('🧹 Legacy compatibility logs are getting large. Consider calling legacyClear().');
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Log legacy conversion with enhanced details
   */
  static logConversion(url: string, format: string, originalResponse: any, normalizedResponse: any): void {
    if (!import.meta.dev) return;

    console.group(`🔄 Legacy Conversion: ${format}`);
    console.log(`URL: ${url}`);
    console.log('Original response:', originalResponse);
    console.log('Normalized response:', normalizedResponse);
    console.groupEnd();
  }

  /**
   * Show migration suggestions for specific endpoints
   */
  static showMigrationSuggestions(): void {
    if (!import.meta.dev) return;

    const manager = LegacyCompatibilityManager.getInstance();
    const stats = manager.getConversionStats();
    
    const suggestions: Record<string, string> = {
      'wrapped_data': 'Replace { data: T } with ApiResponse<T>',
      'wrapped_result': 'Replace { result: T } with ApiResponse<T>',
      'direct_array': 'Wrap arrays in ApiResponse<T> with pagination metadata',
      'direct_object': 'Wrap objects in ApiResponse<T>',
      'legacy_pagination': 'Use standardized pagination format with ApiResponse<PaginatedResult<T>>'
    };

    console.group('🔧 Migration Suggestions');
    
    for (const [key, count] of Object.entries(stats)) {
      const [format, url] = key.split(':');
      const suggestion = suggestions[format];
      
      if (suggestion && count > 5) {
        console.warn(`${url} (${count} conversions): ${suggestion}`);
      }
    }
    
    console.groupEnd();
  }
}

/**
 * Auto-initialize dev tools in development
 */
if (import.meta.dev && import.meta.client) {
  // Initialize on next tick to ensure DOM is ready
  setTimeout(() => {
    LegacyDevTools.init();
    LegacyDevTools.startMonitoring();
  }, 100);
}

export default LegacyDevTools;