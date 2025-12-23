/**
 * Enhanced Logger Service Tests
 * 
 * Tests for the enhanced logging system
 * Requirement 9.1: RequestId correlation
 * Requirement 9.2: Production-optimized logging
 * Requirement 9.3: Error context logging
 * Requirement 9.4: Legacy format detection
 * Requirement 9.5: Performance logging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enhancedLogger } from '~/services/enhanced-logger.service';
import type { ApiError, LogContext } from '~/services/enhanced-logger.service';

describe('Enhanced Logger Service', () => {
  beforeEach(() => {
    // Clear logs before each test
    enhancedLogger.clearLogs();
    
    // Mock console methods
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
  });

  describe('Error Logging', () => {
    it('should log API errors with context', () => {
      const error: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data'
      };

      const context: LogContext = {
        requestId: 'test-req-123',
        url: '/api/test',
        method: 'POST',
        tenantId: 'test-tenant'
      };

      enhancedLogger.logApiError(error, context);

      const stats = enhancedLogger.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.errorsByType['VALIDATION_ERROR']).toBe(1);
      expect(stats.recentErrors).toHaveLength(1);
      expect(stats.recentErrors[0].message).toBe('Invalid input data');
      expect(stats.recentErrors[0].context.requestId).toBe('test-req-123');
    });

    it('should track multiple error types', () => {
      const errors = [
        { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        { code: 'NETWORK_ERROR', message: 'Network timeout' },
        { code: 'VALIDATION_ERROR', message: 'Another validation error' }
      ];

      errors.forEach((error, index) => {
        enhancedLogger.logApiError(error as ApiError, {
          requestId: `req-${index}`,
          url: `/api/test-${index}`
        });
      });

      const stats = enhancedLogger.getErrorStats();
      expect(stats.totalErrors).toBe(3);
      expect(stats.errorsByType['VALIDATION_ERROR']).toBe(2);
      expect(stats.errorsByType['NETWORK_ERROR']).toBe(1);
    });
  });

  describe('Legacy Detection Logging', () => {
    it('should log legacy format detection', () => {
      enhancedLogger.logLegacyDetection(
        '/api/legacy-endpoint',
        'direct-array',
        'legacy-req-456',
        { data: [1, 2, 3] }
      );

      const report = enhancedLogger.getLegacyDetectionReport();
      expect(report.totalDetections).toBe(1);
      expect(report.urlBreakdown['/api/legacy-endpoint']).toBe(1);
      expect(report.formatBreakdown['direct-array']).toBe(1);
      expect(report.recentDetections).toHaveLength(1);
      expect(report.recentDetections[0].url).toBe('/api/legacy-endpoint');
      expect(report.recentDetections[0].format).toBe('direct-array');
      expect(report.recentDetections[0].requestId).toBe('legacy-req-456');
    });

    it('should track multiple legacy detections by URL and format', () => {
      const detections = [
        { url: '/api/users', format: 'direct-array' },
        { url: '/api/posts', format: 'wrapped-data' },
        { url: '/api/users', format: 'direct-array' },
        { url: '/api/comments', format: 'direct-array' }
      ];

      detections.forEach((detection, index) => {
        enhancedLogger.logLegacyDetection(
          detection.url,
          detection.format,
          `legacy-req-${index}`
        );
      });

      const report = enhancedLogger.getLegacyDetectionReport();
      expect(report.totalDetections).toBe(4);
      expect(report.urlBreakdown['/api/users']).toBe(2);
      expect(report.urlBreakdown['/api/posts']).toBe(1);
      expect(report.urlBreakdown['/api/comments']).toBe(1);
      expect(report.formatBreakdown['direct-array']).toBe(3);
      expect(report.formatBreakdown['wrapped-data']).toBe(1);
    });
  });

  describe('Performance Logging', () => {
    it('should track performance metrics', () => {
      enhancedLogger.trackPerformance('GET /api/users', 150, {
        requestId: 'perf-req-1',
        url: '/api/users'
      });

      enhancedLogger.trackPerformance('POST /api/posts', 300, {
        requestId: 'perf-req-2',
        url: '/api/posts'
      });

      const stats = enhancedLogger.getErrorStats();
      expect(Object.keys(stats.performanceMetrics)).toContain('GET /api/users:/api/users');
      expect(Object.keys(stats.performanceMetrics)).toContain('POST /api/posts:/api/posts');
    });

    it('should log warnings for slow operations', () => {
      enhancedLogger.trackPerformance('SLOW /api/heavy-operation', 6000, {
        requestId: 'slow-req-1',
        url: '/api/heavy-operation'
      });

      const stats = enhancedLogger.getErrorStats();
      // Should have logged a warning for the slow operation
      expect(stats.recentErrors.some(entry => 
        entry.level === 'warn' && 
        entry.message.includes('Slow operation detected')
      )).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should respect log level configuration', () => {
      // Configure to only log errors
      enhancedLogger.configure({ logLevel: 'error' });

      // Try to log info and warning messages
      enhancedLogger.logInfo('This should not be logged', { requestId: 'info-1' });
      enhancedLogger.logWarning('This should not be logged', { requestId: 'warn-1' });
      
      // Log an error
      enhancedLogger.logApiError(
        { code: 'TEST_ERROR', message: 'This should be logged' } as ApiError,
        { requestId: 'error-1' }
      );

      const stats = enhancedLogger.getErrorStats();
      expect(stats.totalErrors).toBe(1);
      expect(stats.recentErrors).toHaveLength(1);
      expect(stats.recentErrors[0].level).toBe('error');
    });

    it('should limit log buffer size', () => {
      // Configure small buffer size
      enhancedLogger.configure({ maxLogEntries: 2 });

      // Log more entries than the buffer size
      for (let i = 0; i < 5; i++) {
        enhancedLogger.logApiError(
          { code: 'TEST_ERROR', message: `Error ${i}` } as ApiError,
          { requestId: `req-${i}` }
        );
      }

      const stats = enhancedLogger.getErrorStats();
      // Should only keep the last 2 entries
      expect(stats.recentErrors).toHaveLength(2);
      expect(stats.recentErrors[0].message).toBe('Error 3');
      expect(stats.recentErrors[1].message).toBe('Error 4');
    });
  });

  describe('Log Export', () => {
    it('should export logs with configuration and timestamps', () => {
      // Add some test data
      enhancedLogger.logApiError(
        { code: 'EXPORT_TEST', message: 'Test error for export' } as ApiError,
        { requestId: 'export-req-1' }
      );

      enhancedLogger.logLegacyDetection(
        '/api/export-test',
        'test-format',
        'export-legacy-1'
      );

      const exported = enhancedLogger.exportLogs();

      expect(exported).toHaveProperty('config');
      expect(exported).toHaveProperty('logs');
      expect(exported).toHaveProperty('legacyDetections');
      expect(exported).toHaveProperty('exportTimestamp');
      
      expect(exported.logs).toHaveLength(1);
      expect(exported.legacyDetections).toHaveLength(1);
      expect(exported.logs[0].message).toBe('Test error for export');
      expect(exported.legacyDetections[0].url).toBe('/api/export-test');
    });
  });

  describe('Clear Logs', () => {
    it('should clear all logs and metrics', () => {
      // Add some test data
      enhancedLogger.logApiError(
        { code: 'CLEAR_TEST', message: 'Test error' } as ApiError,
        { requestId: 'clear-req-1' }
      );

      enhancedLogger.logLegacyDetection('/api/clear-test', 'test-format', 'clear-legacy-1');
      enhancedLogger.trackPerformance('CLEAR /api/test', 100, { requestId: 'clear-perf-1' });

      // Verify data exists
      expect(enhancedLogger.getErrorStats().totalErrors).toBe(1);
      expect(enhancedLogger.getLegacyDetectionReport().totalDetections).toBe(1);

      // Clear logs
      enhancedLogger.clearLogs();

      // Verify data is cleared
      const stats = enhancedLogger.getErrorStats();
      const legacyReport = enhancedLogger.getLegacyDetectionReport();

      expect(stats.totalErrors).toBe(0);
      expect(stats.recentErrors).toHaveLength(0);
      expect(Object.keys(stats.performanceMetrics)).toHaveLength(0);
      expect(legacyReport.totalDetections).toBe(0);
      expect(legacyReport.recentDetections).toHaveLength(0);
    });
  });
});