/**
 * Enhanced Logger Service for Tenant Admin
 * 
 * Features:
 * - RequestId correlation for error tracking
 * - Production-optimized logging (Requirement 9.2)
 * - Structured error context (Requirement 9.3)
 * - Legacy format detection logging (Requirement 9.4)
 * - Performance optimization (Requirement 9.5)
 */

import type { ApiError, ApiMeta } from '~/types/enhanced-api';

export interface LogContext {
  requestId?: string;
  url?: string;
  method?: string;
  payload?: any;
  tenantId?: string;
  userId?: string;
  timestamp?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface ErrorLogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context: LogContext;
  error?: Error | ApiError;
  stack?: string;
}

export interface LegacyDetectionLog {
  url: string;
  format: string;
  timestamp: Date;
  requestId: string;
  responseStructure?: any;
}

export interface LoggerConfig {
  enableConsoleLogging: boolean;
  enableProductionLogging: boolean;
  enableLegacyDetection: boolean;
  enablePerformanceLogging: boolean;
  maxLogEntries: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export class EnhancedLoggerService {
  private static instance: EnhancedLoggerService;
  private config: LoggerConfig;
  private logBuffer: ErrorLogEntry[] = [];
  private legacyDetectionLogs: LegacyDetectionLog[] = [];
  private performanceMetrics: Map<string, number> = new Map();

  private constructor() {
    this.config = this.getDefaultConfig();
  }

  public static getInstance(): EnhancedLoggerService {
    if (!EnhancedLoggerService.instance) {
      EnhancedLoggerService.instance = new EnhancedLoggerService();
    }
    return EnhancedLoggerService.instance;
  }

  /**
   * Get default configuration based on environment
   * Requirement 9.2: Production-optimized logging
   */
  private getDefaultConfig(): LoggerConfig {
    const isProduction = !import.meta.dev;
    
    return {
      enableConsoleLogging: !isProduction,
      enableProductionLogging: isProduction,
      enableLegacyDetection: true,
      enablePerformanceLogging: isProduction,
      maxLogEntries: isProduction ? 100 : 1000,
      logLevel: isProduction ? 'warn' : 'debug'
    };
  }

  /**
   * Update logger configuration
   */
  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log API error with full context
   * Requirement 9.3: Error context with URL, RequestId, and Payload
   */
  public logApiError(
    error: ApiError | Error,
    context: LogContext,
    message?: string
  ): void {
    const logEntry: ErrorLogEntry = {
      level: 'error',
      message: message || error.message || 'API Error occurred',
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString(),
        userAgent: import.meta.client ? navigator.userAgent : undefined
      },
      error,
      stack: error.stack
    };

    this.addLogEntry(logEntry);

    // Console logging for development
    if (this.config.enableConsoleLogging) {
      this.logToConsole(logEntry);
    }

    // Performance logging
    if (this.config.enablePerformanceLogging) {
      this.trackErrorMetrics(context.url || 'unknown', error);
    }
  }

  /**
   * Log legacy format detection
   * Requirement 9.4: Legacy format detection logging
   */
  public logLegacyDetection(
    url: string,
    format: string,
    requestId: string,
    responseStructure?: any
  ): void {
    const logEntry: LegacyDetectionLog = {
      url,
      format,
      timestamp: new Date(),
      requestId,
      responseStructure: this.config.enableConsoleLogging ? responseStructure : undefined
    };

    this.legacyDetectionLogs.push(logEntry);

    // Trim logs to prevent memory leaks
    if (this.legacyDetectionLogs.length > this.config.maxLogEntries) {
      this.legacyDetectionLogs = this.legacyDetectionLogs.slice(-this.config.maxLogEntries);
    }

    // Console warning in development
    if (this.config.enableConsoleLogging && this.config.enableLegacyDetection) {
      console.group(`🔄 Legacy Response Detected [${requestId}]`);
      console.warn(`URL: ${url}`);
      console.warn(`Format: ${format}`);
      console.warn(`Timestamp: ${logEntry.timestamp.toISOString()}`);
      if (responseStructure) {
        console.warn('Response structure:', responseStructure);
      }
      console.warn('⚠️ Please update backend to return ApiResponse<T>');
      console.groupEnd();
    }

    // Production logging
    if (this.config.enableProductionLogging) {
      this.logWarning('Legacy format detected', {
        url,
        requestId,
        format,
        timestamp: logEntry.timestamp.toISOString()
      });
    }
  }

  /**
   * Log warning message
   */
  public logWarning(message: string, context: LogContext): void {
    const logEntry: ErrorLogEntry = {
      level: 'warn',
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      }
    };

    this.addLogEntry(logEntry);

    if (this.config.enableConsoleLogging) {
      console.warn(`[${logEntry.context.requestId || 'NO-ID'}] ${message}`, context);
    }
  }

  /**
   * Log info message (only in development)
   */
  public logInfo(message: string, context: LogContext): void {
    if (!this.shouldLog('info')) return;

    const logEntry: ErrorLogEntry = {
      level: 'info',
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      }
    };

    this.addLogEntry(logEntry);

    if (this.config.enableConsoleLogging) {
      console.info(`[${logEntry.context.requestId || 'NO-ID'}] ${message}`, context);
    }
  }

  /**
   * Log debug message (only in development)
   */
  public logDebug(message: string, context: LogContext): void {
    if (!this.shouldLog('debug')) return;

    const logEntry: ErrorLogEntry = {
      level: 'debug',
      message,
      context: {
        ...context,
        timestamp: context.timestamp || new Date().toISOString()
      }
    };

    this.addLogEntry(logEntry);

    if (this.config.enableConsoleLogging) {
      console.debug(`[${logEntry.context.requestId || 'NO-ID'}] ${message}`, context);
    }
  }

  /**
   * Track performance metrics
   * Requirement 9.5: Performance logging
   */
  public trackPerformance(operation: string, duration: number, context: LogContext): void {
    if (!this.config.enablePerformanceLogging) return;

    const key = `${operation}:${context.url || 'unknown'}`;
    const currentAvg = this.performanceMetrics.get(key) || 0;
    const newAvg = currentAvg === 0 ? duration : (currentAvg + duration) / 2;
    
    this.performanceMetrics.set(key, newAvg);

    // Log slow operations
    if (duration > 5000) { // 5 seconds
      this.logWarning(`Slow operation detected: ${operation}`, {
        ...context,
        payload: { duration, averageDuration: newAvg }
      });
    }
  }

  /**
   * Get error statistics for monitoring
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: ErrorLogEntry[];
    legacyDetections: number;
    performanceMetrics: Record<string, number>;
  } {
    const errorsByType: Record<string, number> = {};
    
    this.logBuffer.forEach(entry => {
      if (entry.level === 'error') {
        const errorCode = (entry.error as ApiError)?.code || 'UNKNOWN_ERROR';
        errorsByType[errorCode] = (errorsByType[errorCode] || 0) + 1;
      }
    });

    return {
      totalErrors: this.logBuffer.filter(entry => entry.level === 'error').length,
      errorsByType,
      recentErrors: this.logBuffer.slice(-10),
      legacyDetections: this.legacyDetectionLogs.length,
      performanceMetrics: Object.fromEntries(this.performanceMetrics)
    };
  }

  /**
   * Get legacy detection report
   */
  public getLegacyDetectionReport(): {
    totalDetections: number;
    urlBreakdown: Record<string, number>;
    formatBreakdown: Record<string, number>;
    recentDetections: LegacyDetectionLog[];
  } {
    const urlBreakdown: Record<string, number> = {};
    const formatBreakdown: Record<string, number> = {};

    this.legacyDetectionLogs.forEach(log => {
      urlBreakdown[log.url] = (urlBreakdown[log.url] || 0) + 1;
      formatBreakdown[log.format] = (formatBreakdown[log.format] || 0) + 1;
    });

    return {
      totalDetections: this.legacyDetectionLogs.length,
      urlBreakdown,
      formatBreakdown,
      recentDetections: this.legacyDetectionLogs.slice(-10)
    };
  }

  /**
   * Clear logs (for testing and maintenance)
   */
  public clearLogs(): void {
    this.logBuffer = [];
    this.legacyDetectionLogs = [];
    this.performanceMetrics.clear();
  }

  /**
   * Export logs for external analysis
   */
  public exportLogs(): {
    config: LoggerConfig;
    logs: ErrorLogEntry[];
    legacyDetections: LegacyDetectionLog[];
    exportTimestamp: string;
  } {
    return {
      config: this.config,
      logs: [...this.logBuffer],
      legacyDetections: [...this.legacyDetectionLogs],
      exportTimestamp: new Date().toISOString()
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private shouldLog(level: 'debug' | 'info' | 'warn' | 'error'): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const requestedLevelIndex = levels.indexOf(level);
    
    return requestedLevelIndex >= currentLevelIndex;
  }

  private addLogEntry(entry: ErrorLogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    this.logBuffer.push(entry);

    // Trim buffer to prevent memory leaks
    if (this.logBuffer.length > this.config.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.config.maxLogEntries);
    }
  }

  private logToConsole(entry: ErrorLogEntry): void {
    const prefix = `[${entry.context.requestId || 'NO-ID'}]`;
    const contextInfo = {
      url: entry.context.url,
      method: entry.context.method,
      tenantId: entry.context.tenantId,
      timestamp: entry.context.timestamp
    };

    switch (entry.level) {
      case 'error':
        console.group(`❌ ${prefix} ${entry.message}`);
        console.error('Error details:', entry.error);
        console.error('Context:', contextInfo);
        if (entry.context.payload) {
          console.error('Payload:', entry.context.payload);
        }
        if (entry.stack) {
          console.error('Stack trace:', entry.stack);
        }
        console.groupEnd();
        break;

      case 'warn':
        console.warn(`⚠️ ${prefix} ${entry.message}`, contextInfo);
        break;

      case 'info':
        console.info(`ℹ️ ${prefix} ${entry.message}`, contextInfo);
        break;

      case 'debug':
        console.debug(`🐛 ${prefix} ${entry.message}`, contextInfo);
        break;
    }
  }

  private trackErrorMetrics(url: string, error: Error | ApiError): void {
    const errorType = (error as ApiError).code || error.constructor.name;
    const key = `error:${errorType}:${url}`;
    
    const count = this.performanceMetrics.get(key) || 0;
    this.performanceMetrics.set(key, count + 1);
  }
}

// Export singleton instance
export const enhancedLogger = EnhancedLoggerService.getInstance();