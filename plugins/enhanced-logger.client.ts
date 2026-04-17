/**
 * Enhanced Logger Plugin
 * 
 * Initializes the enhanced logging system and integrates with toast notifications
 * Requirement 9.1: RequestId display in toast notifications
 */

import { enhancedLogger } from '~/services/enhanced-logger.service';

export default defineNuxtPlugin((nuxtApp) => {
  // Configure logger based on environment
  const isProduction = !import.meta.dev;
  
  enhancedLogger.configure({
    enableConsoleLogging: !isProduction,
    enableProductionLogging: isProduction,
    enableLegacyDetection: true,
    enablePerformanceLogging: true,
    logLevel: isProduction ? 'warn' : 'debug'
  });

  // Add global error handler for unhandled errors
  if (import.meta.client) {
    window.addEventListener('error', (event) => {
      // Ensure event is valid and has expected properties
      const errorMessage = event.message || 'Unknown window error';
      const filename = event.filename || 'unknown';
      const lineno = event.lineno || 0;
      const colno = event.colno || 0;

      enhancedLogger.logApiError(
        new Error(errorMessage),
        {
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          requestId: `unhandled-${Date.now()}`,
          payload: {
            filename,
            lineno,
            colno
          }
        },
        'Unhandled JavaScript error'
      );
    });

    window.addEventListener('unhandledrejection', (event) => {
      enhancedLogger.logApiError(
        new Error(event.reason?.message || 'Unhandled promise rejection'),
        {
          url: window.location.href,
          requestId: `unhandled-promise-${Date.now()}`,
          payload: {
            reason: event.reason
          }
        },
        'Unhandled promise rejection'
      );
    });
  }

  // Add development tools in development mode
  if (import.meta.dev && import.meta.client) {
    // Add global logger access for debugging
    (globalThis as any).enhancedLogger = enhancedLogger;
    
    // Add helper functions
    (globalThis as any).loggerStats = () => {
      const stats = enhancedLogger.getErrorStats();
      const legacyReport = enhancedLogger.getLegacyDetectionReport();
      
      console.group('📊 Enhanced Logger Statistics');
      console.log('Error Stats:', stats);
      console.log('Legacy Detection Report:', legacyReport);
      console.groupEnd();
      
      return { stats, legacyReport };
    };
    
    (globalThis as any).loggerClear = () => {
      enhancedLogger.clearLogs();
      console.log('✅ Enhanced logger logs cleared');
    };
    
    (globalThis as any).loggerExport = () => {
      const exported = enhancedLogger.exportLogs();
      console.log('📤 Exported logs:', exported);
      return exported;
    };
    
    (globalThis as any).loggerHelp = () => {
      console.group('🛠️ Enhanced Logger Dev Tools');
      console.log('loggerStats() - Show error statistics and legacy detection report');
      console.log('loggerClear() - Clear all logs');
      console.log('loggerExport() - Export logs for analysis');
      console.log('loggerHelp() - Show this help');
      console.log('enhancedLogger - Direct access to logger instance');
      console.groupEnd();
    };
    
    console.log('🛠️ Enhanced Logger Dev Tools loaded. Type loggerHelp() for commands.');
  }

  // Provide logger to the app
  return {
    provide: {
      enhancedLogger
    }
  };
});