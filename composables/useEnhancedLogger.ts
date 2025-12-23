/**
 * Enhanced Logger Composable
 * 
 * Provides easy access to the enhanced logging system with automatic context injection
 */

import { enhancedLogger, type LogContext, type LoggerConfig } from '~/services/enhanced-logger.service';
import type { ApiError } from '~/types/enhanced-api';

export function useEnhancedLogger() {
  const { $router } = useNuxtApp();
  
  /**
   * Get base context for logging
   */
  const getBaseContext = (): LogContext => {
    const context: LogContext = {
      timestamp: new Date().toISOString()
    };

    // Add tenant context if available
    if (import.meta.client) {
      try {
        const { getTenantSlug } = useTenant();
        const tenantSlug = getTenantSlug();
        if (tenantSlug) {
          context.tenantId = tenantSlug;
        }
      } catch (error) {
        // Tenant composable might not be available
      }

      // Add user agent
      context.userAgent = navigator.userAgent;
      
      // Add current route
      if ($router?.currentRoute?.value) {
        context.url = $router.currentRoute.value.fullPath;
      }
    }

    return context;
  };

  /**
   * Log API error with enhanced context
   * Requirement 9.1: RequestId correlation
   * Requirement 9.3: Full error context
   */
  const logApiError = (
    error: ApiError | Error,
    additionalContext: Partial<LogContext> = {},
    message?: string
  ) => {
    const context = {
      ...getBaseContext(),
      ...additionalContext
    };

    enhancedLogger.logApiError(error, context, message);
  };

  /**
   * Log legacy format detection
   * Requirement 9.4: Legacy format detection
   */
  const logLegacyDetection = (
    url: string,
    format: string,
    requestId: string,
    responseStructure?: any
  ) => {
    enhancedLogger.logLegacyDetection(url, format, requestId, responseStructure);
  };

  /**
   * Log warning with context
   */
  const logWarning = (message: string, additionalContext: Partial<LogContext> = {}) => {
    const context = {
      ...getBaseContext(),
      ...additionalContext
    };

    enhancedLogger.logWarning(message, context);
  };

  /**
   * Log info message (development only)
   */
  const logInfo = (message: string, additionalContext: Partial<LogContext> = {}) => {
    const context = {
      ...getBaseContext(),
      ...additionalContext
    };

    enhancedLogger.logInfo(message, context);
  };

  /**
   * Log debug message (development only)
   */
  const logDebug = (message: string, additionalContext: Partial<LogContext> = {}) => {
    const context = {
      ...getBaseContext(),
      ...additionalContext
    };

    enhancedLogger.logDebug(message, context);
  };

  /**
   * Track performance metrics
   * Requirement 9.5: Performance logging
   */
  const trackPerformance = (
    operation: string,
    duration: number,
    additionalContext: Partial<LogContext> = {}
  ) => {
    const context = {
      ...getBaseContext(),
      ...additionalContext
    };

    enhancedLogger.trackPerformance(operation, duration, context);
  };

  /**
   * Create performance tracker for measuring operation duration
   */
  const createPerformanceTracker = (operation: string, additionalContext: Partial<LogContext> = {}) => {
    const startTime = performance.now();
    
    return {
      finish: () => {
        const duration = performance.now() - startTime;
        trackPerformance(operation, duration, additionalContext);
        return duration;
      },
      
      finishWithResult: <T>(result: T): T => {
        const duration = performance.now() - startTime;
        trackPerformance(operation, duration, additionalContext);
        return result;
      }
    };
  };

  /**
   * Configure logger settings
   */
  const configureLogger = (config: Partial<LoggerConfig>) => {
    enhancedLogger.configure(config);
  };

  /**
   * Get error statistics
   */
  const getErrorStats = () => {
    return enhancedLogger.getErrorStats();
  };

  /**
   * Get legacy detection report
   */
  const getLegacyReport = () => {
    return enhancedLogger.getLegacyDetectionReport();
  };

  /**
   * Clear all logs
   */
  const clearLogs = () => {
    enhancedLogger.clearLogs();
  };

  /**
   * Export logs for analysis
   */
  const exportLogs = () => {
    return enhancedLogger.exportLogs();
  };

  return {
    // Core logging methods
    logApiError,
    logLegacyDetection,
    logWarning,
    logInfo,
    logDebug,
    
    // Performance tracking
    trackPerformance,
    createPerformanceTracker,
    
    // Configuration and monitoring
    configureLogger,
    getErrorStats,
    getLegacyReport,
    clearLogs,
    exportLogs,
    
    // Direct access to logger instance
    logger: enhancedLogger
  };
}