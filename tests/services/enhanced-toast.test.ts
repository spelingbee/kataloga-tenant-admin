/**
 * Enhanced Toast Service Tests
 * 
 * Tests for the enhanced toast system with RequestId support
 * Requirement 9.1: RequestId display in toast notifications
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { enhancedToast } from '~/services/enhanced-toast.service';
import type { ApiError, ApiMeta } from '~/types/enhanced-api';

// Mock DOM methods
Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      id: '',
      className: '',
      innerHTML: '',
      style: {},
      setAttribute: vi.fn(),
      addEventListener: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      querySelector: vi.fn(),
      getElementById: vi.fn()
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn()
    },
    head: {
      appendChild: vi.fn()
    },
    getElementById: vi.fn()
  },
  writable: true
});

Object.defineProperty(global, 'window', {
  value: {
    URL: {
      createObjectURL: vi.fn(() => 'mock-url'),
      revokeObjectURL: vi.fn()
    }
  },
  writable: true
});

describe('Enhanced Toast Service', () => {
  beforeEach(() => {
    // Clear any existing toasts
    enhancedToast.dismissAll();
  });

  describe('Basic Toast Messages', () => {
    it('should create success toast', () => {
      const id = enhancedToast.success('Operation completed successfully');
      
      expect(id).toBeTruthy();
      expect(id).toMatch(/^toast-\d+-[a-z0-9]+$/);
      
      const activeToasts = enhancedToast.getActiveToasts();
      expect(activeToasts).toHaveLength(1);
      expect(activeToasts[0].type).toBe('success');
      expect(activeToasts[0].message).toBe('Operation completed successfully');
      expect(activeToasts[0].title).toBe('Успех');
    });

    it('should create error toast with RequestId', () => {
      const id = enhancedToast.error('Something went wrong', 'req-123');
      
      const activeToasts = enhancedToast.getActiveToasts();
      expect(activeToasts).toHaveLength(1);
      expect(activeToasts[0].type).toBe('error');
      expect(activeToasts[0].message).toBe('Something went wrong (ID: req-123)');
      expect(activeToasts[0].requestId).toBe('req-123');
      expect(activeToasts[0].options.showRequestId).toBe(true);
      expect(activeToasts[0].options.allowCopy).toBe(true);
      expect(activeToasts[0].options.duration).toBe(0); // Persistent
    });

    it('should create warning toast', () => {
      const id = enhancedToast.warning('This is a warning', 'warn-456');
      
      const activeToasts = enhancedToast.getActiveToasts();
      expect(activeToasts).toHaveLength(1);
      expect(activeToasts[0].type).toBe('warning');
      expect(activeToasts[0].message).toBe('This is a warning (ID: warn-456)');
      expect(activeToasts[0].requestId).toBe('warn-456');
    });

    it('should create info toast', () => {
      const id = enhancedToast.info('Information message');
      
      const activeToasts = enhancedToast.getActiveToasts();
      expect(activeToasts).toHaveLength(1);
      expect(activeToasts[0].type).toBe('info');
      expect(activeToasts[0].message).toBe('Information message');
      expect(activeToasts[0].title).toBe('Информация');
      expect(activeToasts[0].requestId).toBeUndefined();
    });
  });

  describe('API Error Toast', () => {
    it('should create API error toast with full context', () => {
      const error: ApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data'
      };

      const meta: ApiMeta = {
        requestId: 'api-req-789',
        timestamp: '2023-01-01T00:00:00Z',
        tenantId: 'test-tenant'
      };

      const id = enhancedToast.apiError(error, meta);
      
      const activeToasts = enhancedToast.getActiveToasts();
      expect(activeToasts).toHaveLength(1);
      expect(activeToasts[0].type).toBe('error');
      expect(activeToasts[0].title).toBe('Ошибка API');
      expect(activeToasts[0].message).toBe('Invalid input data (ID: api-req-789)');
      expect(activeToasts[0].requestId).toBe('api-req-789');
      expect(activeToasts[0].options.showRequestId).toBe(true);
      expect(activeToasts[0].options.allowCopy).toBe(true);
      expect(activeToasts[0].options.duration).toBe(0); // Persistent
    });
  });

  describe('Toast Management', () => {
    it('should dismiss specific toast by ID', () => {
      const id1 = enhancedToast.success('First message');
      const id2 = enhancedToast.info('Second message');
      
      expect(enhancedToast.getActiveToasts()).toHaveLength(2);
      
      enhancedToast.dismiss(id1);
      
      const remaining = enhancedToast.getActiveToasts();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].message).toBe('Second message');
    });

    it('should dismiss all toasts', () => {
      enhancedToast.success('Message 1');
      enhancedToast.error('Message 2', 'req-1');
      enhancedToast.warning('Message 3');
      
      expect(enhancedToast.getActiveToasts()).toHaveLength(3);
      
      enhancedToast.dismissAll();
      
      expect(enhancedToast.getActiveToasts()).toHaveLength(0);
    });

    it('should handle multiple toasts with different types', () => {
      enhancedToast.success('Success message');
      enhancedToast.error('Error message', 'err-1');
      enhancedToast.warning('Warning message', 'warn-1');
      enhancedToast.info('Info message');
      
      const toasts = enhancedToast.getActiveToasts();
      expect(toasts).toHaveLength(4);
      
      const types = toasts.map(t => t.type);
      expect(types).toContain('success');
      expect(types).toContain('error');
      expect(types).toContain('warning');
      expect(types).toContain('info');
    });
  });

  describe('Toast Options', () => {
    it('should respect custom duration', () => {
      const id = enhancedToast.success('Custom duration', { duration: 3000 });
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.options.duration).toBe(3000);
    });

    it('should respect custom position', () => {
      const id = enhancedToast.info('Custom position', { position: 'bottom-left' });
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.options.position).toBe('bottom-left');
    });

    it('should handle persistent toasts', () => {
      const id = enhancedToast.error('Persistent error', 'req-1', { persistent: true });
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.options.persistent).toBe(true);
      expect(toast.options.duration).toBe(0);
    });
  });

  describe('RequestId Features', () => {
    it('should show RequestId for error toasts by default', () => {
      const id = enhancedToast.error('Error with ID', 'req-show-123');
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.options.showRequestId).toBe(true);
      expect(toast.options.allowCopy).toBe(true);
    });

    it('should allow copying RequestId', () => {
      const id = enhancedToast.error('Copyable error', 'req-copy-456');
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.options.allowCopy).toBe(true);
      expect(toast.requestId).toBe('req-copy-456');
    });

    it('should handle toasts without RequestId', () => {
      const id = enhancedToast.error('Error without ID');
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.requestId).toBeUndefined();
      expect(toast.options.showRequestId).toBe(false);
      expect(toast.options.allowCopy).toBe(false);
      expect(toast.message).toBe('Error without ID');
    });
  });

  describe('Toast Timestamps', () => {
    it('should add timestamps to toasts', () => {
      const beforeTime = new Date();
      const id = enhancedToast.success('Timestamped message');
      const afterTime = new Date();
      
      const toast = enhancedToast.getActiveToasts()[0];
      expect(toast.timestamp).toBeInstanceOf(Date);
      expect(toast.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(toast.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});