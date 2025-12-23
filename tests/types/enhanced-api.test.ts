/**
 * Tests for Enhanced API Types
 * 
 * Basic type checking and factory validation tests
 */

import { describe, it, expect } from 'vitest';
import { UserRole } from '~/types/enhanced-api';
import { 
  isApiResponse, 
  isApiError, 
  isValidApiMeta,
  isLegacyResponse,
  extractResponseData,
  analyzeResponseType
} from '~/utils/type-guards';
import {
  createMockApiResponse,
  createMockErrorResponse,
  createMockApiMeta,
  createMockApiError,
  createMockValidationError,
  createMockUser,
  createMockPaginatedResult
} from '~/utils/test-factories';

describe('Enhanced API Types', () => {
  describe('Type Guards', () => {
    it('should correctly identify valid ApiResponse', () => {
      const response = createMockApiResponse({ test: 'data' });
      expect(isApiResponse(response)).toBe(true);
    });

    it('should correctly identify invalid ApiResponse', () => {
      const invalidResponse = { data: 'test' };
      expect(isApiResponse(invalidResponse)).toBe(false);
    });

    it('should correctly identify ApiError', () => {
      const error = createMockApiError();
      expect(isApiError(error)).toBe(true);
    });

    it('should correctly identify valid ApiMeta', () => {
      const meta = createMockApiMeta();
      expect(isValidApiMeta(meta)).toBe(true);
    });

    it('should correctly identify legacy response', () => {
      const legacyResponse = { data: 'test' };
      expect(isLegacyResponse(legacyResponse)).toBe(true);
      
      const apiResponse = createMockApiResponse('test');
      expect(isLegacyResponse(apiResponse)).toBe(false);
    });

    it('should extract data from different response formats', () => {
      // ApiResponse format
      const apiResponse = createMockApiResponse('test-data');
      expect(extractResponseData(apiResponse)).toBe('test-data');

      // Legacy format
      const legacyResponse = { data: 'legacy-data' };
      expect(extractResponseData(legacyResponse)).toBe('legacy-data');

      // Direct data
      const directData = 'direct-data';
      expect(extractResponseData(directData)).toBe('direct-data');
    });

    it('should analyze response type correctly', () => {
      const apiResponse = createMockApiResponse('test');
      const analysis = analyzeResponseType(apiResponse);
      
      expect(analysis.isApiResponse).toBe(true);
      expect(analysis.isLegacy).toBe(false);
      expect(analysis.isBlob).toBe(false);
    });
  });

  describe('Test Factories', () => {
    it('should create valid ApiResponse with factory', () => {
      const data = { id: '1', name: 'test' };
      const response = createMockApiResponse(data);
      
      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.error).toBeNull();
      expect(response.meta).toBeDefined();
      expect(response.meta.requestId).toBeDefined();
    });

    it('should create error response with factory', () => {
      const error = { code: 'TEST_ERROR', message: 'Test message' };
      const response = createMockErrorResponse(error);
      
      expect(response.success).toBe(false);
      expect(response.data).toBeNull();
      expect(response.error).toEqual(expect.objectContaining(error));
    });

    it('should create validation error with field details', () => {
      const fieldErrors = {
        'name': 'Name is required',
        'email': 'Invalid email format'
      };
      const error = createMockValidationError(fieldErrors);
      
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.details).toHaveLength(2);
      expect(error.details).toBeDefined();
      expect(Array.isArray(error.details)).toBe(true);
      if (Array.isArray(error.details)) {
        expect(error.details[0]).toEqual({
          field: 'name',
          message: 'Name is required',
          value: null
        });
      }
    });

    it('should create mock user with defaults', () => {
      const user = createMockUser();
      
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.role).toBe('TENANT_ADMIN');
      expect(user.tenantId).toBeDefined();
    });

    it('should create mock user with overrides', () => {
      const overrides = {
        email: 'custom@example.com',
        role: UserRole.TENANT_STAFF
      };
      const user = createMockUser(overrides);
      
      expect(user.email).toBe('custom@example.com');
      expect(user.role).toBe('TENANT_STAFF');
    });

    it('should create paginated result with correct structure', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const result = createMockPaginatedResult(items, { limit: 5 });
      
      expect(result.items).toEqual(items);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.totalPages).toBe(1);
    });
  });

  describe('Error Handling', () => {
    it('should handle null and undefined values gracefully', () => {
      expect(isApiResponse(null)).toBe(false);
      expect(isApiResponse(undefined)).toBe(false);
      expect(isLegacyResponse(null)).toBe(false);
      expect(extractResponseData(null)).toBeNull();
    });

    it('should handle malformed objects', () => {
      const malformed = { success: 'not-boolean' };
      expect(isApiResponse(malformed)).toBe(false);
      
      const partialMeta = { requestId: 'test' }; // missing timestamp
      expect(isValidApiMeta(partialMeta)).toBe(false);
    });
  });
});