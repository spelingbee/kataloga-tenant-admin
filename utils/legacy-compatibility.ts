/**
 * Legacy Compatibility Layer
 * 
 * Comprehensive utilities for handling legacy API response formats
 * Implements requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

import type { 
  ApiResponse, 
  ApiError, 
  PaginatedResult,
  ResponseTypeInfo 
} from '~/types/enhanced-api';
import { 
  analyzeResponseType, 
  safeLegacyDetection,
  validateLegacyStructure,
  safeExtractResponseData,
  getLegacyConversionStrategy
} from './type-guards';
import { 
  normalizeResponse,
  safeNormalizeResponse,
  createErrorResponse,
  logLegacyDetection,
  normalizeLegacyPagination
} from './response-normalizer';

/**
 * Legacy Compatibility Manager
 * Central class for handling all legacy compatibility operations
 */
export class LegacyCompatibilityManager {
  private static instance: LegacyCompatibilityManager;
  private conversionStats: Map<string, number> = new Map();
  private errorLog: Array<{ url: string; error: string; timestamp: Date }> = [];

  static getInstance(): LegacyCompatibilityManager {
    if (!LegacyCompatibilityManager.instance) {
      LegacyCompatibilityManager.instance = new LegacyCompatibilityManager();
    }
    return LegacyCompatibilityManager.instance;
  }

  /**
   * Main entry point for legacy compatibility processing
   * Requirement 7.1: Adaptive parsing with comprehensive error handling
   */
  processResponse<T>(
    response: any, 
    requestUrl?: string,
    options: {
      enableLogging?: boolean;
      enableStats?: boolean;
      strictValidation?: boolean;
    } = {}
  ): ApiResponse<T> {
    const { enableLogging = import.meta.dev, enableStats = true, strictValidation = false } = options;

    try {
      // Analyze response type
      const analysis = analyzeResponseType(response);
      
      // Track conversion statistics
      if (enableStats && requestUrl) {
        this.trackConversion(requestUrl, analysis.format || 'unknown');
      }

      // If already in correct format, return as-is
      if (analysis.isApiResponse) {
        return response as ApiResponse<T>;
      }

      // Handle legacy formats
      if (analysis.isLegacy) {
        return this.handleLegacyResponse<T>(response, requestUrl, enableLogging, strictValidation);
      }

      // Handle blob responses
      if (analysis.isBlob) {
        return this.handleBlobResponse<T>(response, requestUrl);
      }

      // Unknown format - create error response
      const errorMsg = `Unknown response format detected for ${requestUrl || 'unknown endpoint'}`;
      this.logError(requestUrl || 'unknown', errorMsg);
      
      return createErrorResponse<T>(
        'UNKNOWN_RESPONSE_FORMAT',
        errorMsg,
        { originalResponse: response, analysis }
      );

    } catch (error) {
      const errorMsg = `Legacy compatibility processing failed: ${error instanceof Error ? error.message : String(error)}`;
      this.logError(requestUrl || 'unknown', errorMsg);
      
      return createErrorResponse<T>(
        'COMPATIBILITY_PROCESSING_ERROR',
        errorMsg,
        { originalResponse: response, error: String(error) }
      );
    }
  }

  /**
   * Handle legacy response with comprehensive validation
   * Requirement 7.2: Legacy normalization with error handling
   */
  private handleLegacyResponse<T>(
    response: any,
    requestUrl?: string,
    enableLogging: boolean = true,
    strictValidation: boolean = false
  ): ApiResponse<T> {
    try {
      // Validate legacy structure
      const validation = validateLegacyStructure(response);
      
      if (strictValidation && !validation.isValid) {
        const errorMsg = `Legacy response validation failed: ${validation.issues.join(', ')}`;
        this.logError(requestUrl || 'unknown', errorMsg);
        
        return createErrorResponse<T>(
          'LEGACY_VALIDATION_ERROR',
          errorMsg,
          { originalResponse: response, validationIssues: validation.issues }
        );
      }

      // Get conversion strategy
      const strategy = getLegacyConversionStrategy(response);
      
      // Log legacy detection if enabled
      if (enableLogging) {
        logLegacyDetection(response, requestUrl, strategy.strategy);
      }

      // Perform safe normalization
      const normalized = safeNormalizeResponse<T>(response, requestUrl);
      
      // Log successful conversion
      if (enableLogging && normalized.success) {
        console.log(`✅ Legacy response converted successfully using strategy: ${strategy.strategy}`);
      }

      return normalized;

    } catch (error) {
      const errorMsg = `Legacy response handling failed: ${error instanceof Error ? error.message : String(error)}`;
      this.logError(requestUrl || 'unknown', errorMsg);
      
      return createErrorResponse<T>(
        'LEGACY_HANDLING_ERROR',
        errorMsg,
        { originalResponse: response, error: String(error) }
      );
    }
  }

  /**
   * Handle blob responses
   * Requirement 7.1: Proper blob handling without JSON parsing
   */
  private handleBlobResponse<T>(response: Blob, requestUrl?: string): ApiResponse<T> {
    return {
      success: true,
      statusCode: 200,
      data: response as unknown as T,
      error: null,
      meta: {
        requestId: `blob-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...(requestUrl && { blobUrl: requestUrl })
      }
    };
  }

  /**
   * Track conversion statistics
   * Requirement 7.3: Development monitoring and logging
   */
  private trackConversion(url: string, format: string): void {
    const key = `${format}:${url}`;
    const current = this.conversionStats.get(key) || 0;
    this.conversionStats.set(key, current + 1);
  }

  /**
   * Log errors for debugging
   * Requirement 7.4: Error logging and tracing
   */
  private logError(url: string, error: string): void {
    this.errorLog.push({
      url,
      error,
      timestamp: new Date()
    });

    // Keep only last 100 errors to prevent memory leaks
    if (this.errorLog.length > 100) {
      this.errorLog.shift();
    }

    // Log to console in development
    if (import.meta.dev) {
      console.error(`[Legacy Compatibility Error] ${url}: ${error}`);
    }
  }

  /**
   * Get conversion statistics for debugging
   * Requirement 7.3: Development monitoring
   */
  getConversionStats(): Record<string, number> {
    return Object.fromEntries(this.conversionStats);
  }

  /**
   * Get recent errors for debugging
   * Requirement 7.4: Error reporting
   */
  getRecentErrors(limit: number = 10): Array<{ url: string; error: string; timestamp: Date }> {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear statistics and error logs
   */
  clearLogs(): void {
    this.conversionStats.clear();
    this.errorLog.length = 0;
  }

  /**
   * Check if cleanup is needed (for production environments)
   * Requirement 7.5: Production readiness
   */
  needsCleanup(): boolean {
    return this.conversionStats.size > 1000 || this.errorLog.length > 50;
  }

  /**
   * Generate compatibility report for debugging
   * Requirement 7.3: Development reporting
   */
  generateCompatibilityReport(): {
    totalConversions: number;
    formatBreakdown: Record<string, number>;
    errorCount: number;
    recentErrors: Array<{ url: string; error: string; timestamp: Date }>;
    recommendations: string[];
  } {
    const formatCounts: Record<string, number> = {};
    let totalConversions = 0;

    // Aggregate format statistics
    for (const [key, count] of this.conversionStats) {
      const format = key.split(':')[0];
      formatCounts[format] = (formatCounts[format] || 0) + count;
      totalConversions += count;
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (formatCounts['wrapped_data'] > 10) {
      recommendations.push('Consider updating endpoints to return ApiResponse<T> instead of { data: T }');
    }
    
    if (formatCounts['direct_array'] > 5) {
      recommendations.push('Array responses should be wrapped in ApiResponse<T> with pagination metadata');
    }
    
    if (this.errorLog.length > 10) {
      recommendations.push('High error rate detected - review legacy response handling');
    }

    return {
      totalConversions,
      formatBreakdown: formatCounts,
      errorCount: this.errorLog.length,
      recentErrors: this.getRecentErrors(5),
      recommendations
    };
  }
}

/**
 * Convenience function for processing responses
 * Requirement 7.1: Simple API for response processing
 */
export function processLegacyResponse<T>(
  response: any,
  requestUrl?: string,
  options?: {
    enableLogging?: boolean;
    enableStats?: boolean;
    strictValidation?: boolean;
  }
): ApiResponse<T> {
  const manager = LegacyCompatibilityManager.getInstance();
  return manager.processResponse<T>(response, requestUrl, options);
}

/**
 * Check if response needs legacy processing
 * Requirement 7.1: Quick format detection
 */
export function needsLegacyProcessing(response: any): boolean {
  const analysis = analyzeResponseType(response);
  return !analysis.isApiResponse;
}

/**
 * Get legacy compatibility statistics
 * Requirement 7.3: Development monitoring
 */
export function getLegacyStats(): Record<string, number> {
  const manager = LegacyCompatibilityManager.getInstance();
  return manager.getConversionStats();
}

/**
 * Generate legacy compatibility report
 * Requirement 7.3: Development reporting
 */
export function generateLegacyReport() {
  const manager = LegacyCompatibilityManager.getInstance();
  return manager.generateCompatibilityReport();
}

/**
 * Clear legacy compatibility logs (for production)
 * Requirement 7.5: Production cleanup
 */
export function clearLegacyLogs(): void {
  const manager = LegacyCompatibilityManager.getInstance();
  manager.clearLogs();
}