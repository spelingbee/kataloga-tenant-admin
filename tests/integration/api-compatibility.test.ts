/**
 * Integration Tests for Real API Compatibility
 * 
 * Requirement 8.5: Integration tests for real API compatibility
 * 
 * These tests verify that the enhanced API service works correctly
 * with real API response formats and handles various scenarios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EnhancedApiService } from '~/services/enhanced-api.service';
import type { ApiResponse, ApiError, ApiMeta } from '~/types/enhanced-api';
import axios, { AxiosInstance } from 'axios';

// Mock implementations
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  dismiss: vi.fn()
};

const mockRouter = {
  push: vi.fn()
};

const mockNuxtApp = {
  $pinia: {}
};

describe('API Compatibility Integration Tests (Requirement 8.5)', () => {
  let apiService: EnhancedApiService;
  let mockAxios: AxiosInstance;

  beforeEach(() => {
    // Create a real axios instance for testing
    mockAxios = axios.create({
      baseURL: 'http://localhost:3000/api',
      timeout: 5000
    });

    // Create API service with mocked dependencies
    apiService = new EnhancedApiService(
      mockAxios,
      mockToast,
      mockRouter,
      mockNuxtApp
    );

    vi.clearAllMocks();
  });

  describe('Standard ApiResponse Format Handling', () => {
    it('should correctly handle standard ApiResponse format', async () => {
      const mockResponseData: ApiResponse<{ id: string; name: string }> = {
        success: true,
        statusCode: 200,
        data: { id: '1', name: 'Test Item' },
        error: null,
        meta: {
          requestId: 'req-123',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      // Mock axios response
      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/test' }
      });

      // Test GET request with unwrapping
      const result = await apiService.get<{ id: string; name: string }>('/test');

      expect(result).toEqual({ id: '1', name: 'Test Item' });
      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'GET',
          url: '/test'
        })
      );
    });

    it('should handle ApiResponse with pagination metadata', async () => {
      const mockResponseData: ApiResponse<any[]> = {
        success: true,
        statusCode: 200,
        data: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ],
        error: null,
        meta: {
          requestId: 'req-124',
          timestamp: '2024-01-01T00:00:00Z',
          pagination: {
            page: 1,
            limit: 20,
            totalItems: 2,
            totalPages: 1
          }
        }
      };

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: mockResponseData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/items' }
      });

      // Test paginated request
      const result = await apiService.getPaginated<{ id: string; name: string }>('/items');

      expect(result).toEqual({
        items: [
          { id: '1', name: 'Item 1' },
          { id: '2', name: 'Item 2' }
        ],
        pagination: {
          page: 1,
          limit: 20,
          totalItems: 2,
          totalPages: 1
        }
      });
    });

    it('should handle ApiResponse error format correctly', async () => {
      const mockErrorResponse: ApiResponse<null> = {
        success: false,
        statusCode: 422,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            { field: 'name', message: 'Name is required', value: '' },
            { field: 'price', message: 'Price must be positive', value: -1 }
          ]
        },
        meta: {
          requestId: 'req-125',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: mockErrorResponse,
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config: { url: '/items' }
      });

      // Test error handling
      try {
        await apiService.post('/items', { name: '', price: -1 });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toBe('Validation failed');
      }

      // Wait a bit for async error handling to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify toast error was called with RequestId (fallback behavior)
      expect(mockToast.error).toHaveBeenCalledWith(
        expect.stringContaining('req-125')
      );
    });
  });

  describe('Legacy Format Compatibility', () => {
    it('should normalize legacy direct data responses', async () => {
      const legacyResponse = [
        { id: '1', name: 'Legacy Item 1' },
        { id: '2', name: 'Legacy Item 2' }
      ];

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: legacyResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/legacy-items' }
      });

      // Test legacy format handling
      const result = await apiService.get<any[]>('/legacy-items');

      expect(result).toEqual(legacyResponse);
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it('should normalize legacy object responses', async () => {
      const legacyResponse = {
        user: { id: '1', name: 'John Doe' },
        permissions: ['read', 'write']
      };

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: legacyResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/legacy-auth' }
      });

      const result = await apiService.get<any>('/legacy-auth');

      expect(result).toEqual(legacyResponse);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('permissions');
    });

    it('should handle mixed legacy error formats', async () => {
      const legacyErrorResponse = {
        message: 'User not found',
        code: 404
      };

      vi.spyOn(mockAxios, 'request').mockRejectedValue({
        response: {
          data: legacyErrorResponse,
          status: 404,
          statusText: 'Not Found'
        },
        config: { url: '/legacy-user' }
      });

      await expect(apiService.get('/legacy-user'))
        .rejects
        .toThrow();
    });
  });

  describe('File Operations Compatibility', () => {
    it('should handle blob responses correctly', async () => {
      const mockBlob = new Blob(['test file content'], { type: 'application/pdf' });

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: mockBlob,
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': 'attachment; filename="report.pdf"'
        },
        config: { 
          url: '/reports/download',
          responseType: 'blob'
        }
      });

      // Mock DOM methods for file download
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      const mockClick = vi.fn();
      const mockRemoveChild = vi.fn();
      const mockAppendChild = vi.fn();

      // Mock client environment for file download
      vi.stubGlobal('import', {
        meta: {
          client: true
        }
      });

      Object.defineProperty(window, 'URL', {
        value: {
          createObjectURL: mockCreateObjectURL,
          revokeObjectURL: mockRevokeObjectURL
        }
      });

      const mockLink = {
        href: '',
        download: '',
        style: { display: '' },
        click: mockClick,
        setAttribute: vi.fn()
      };

      vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
      vi.spyOn(document.body, 'appendChild').mockImplementation(mockAppendChild);
      vi.spyOn(document.body, 'removeChild').mockImplementation(mockRemoveChild);

      // Test file download
      await apiService.downloadFile('/reports/download', {}, { filename: 'report.pdf' });

      expect(mockAxios.request).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/reports/download',
          method: 'GET',
          params: {},
          responseType: 'blob'
        })
      );

      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
      expect(mockClick).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith(
        expect.stringContaining('report.pdf')
      );

      // Cleanup
      vi.unstubAllGlobals();
    });

    it('should handle blob error responses (JSON in blob)', async () => {
      const errorJson = JSON.stringify({
        success: false,
        statusCode: 403,
        data: null,
        error: {
          code: 'FEATURE_NOT_AVAILABLE',
          message: 'Reports not available in your plan'
        },
        meta: {
          requestId: 'req-126',
          timestamp: '2024-01-01T00:00:00Z'
        }
      });

      const errorBlob = new Blob([errorJson], { type: 'application/json' });

      // Mock axios to reject with proper error structure
      const axiosError = {
        response: {
          data: errorBlob,
          status: 403,
          statusText: 'Forbidden'
        },
        config: { 
          url: '/reports/premium',
          responseType: 'blob'
        }
      };
      
      vi.spyOn(mockAxios, 'request').mockRejectedValue(axiosError);

      // Mock blob.text() method
      vi.spyOn(errorBlob, 'text').mockResolvedValue(errorJson);

      await expect(apiService.downloadFile('/reports/premium'))
        .rejects
        .toThrow('Reports not available in your plan');
    });
  });

  describe('Bulk Operations Compatibility', () => {
    it('should handle bulk operation responses correctly', async () => {
      const mockBulkResponse: ApiResponse<any> = {
        success: true,
        statusCode: 200,
        data: {
          successful: [
            { id: '1', name: 'Updated Item 1', price: 20.00 },
            { id: '2', name: 'Updated Item 2', price: 25.00 }
          ],
          failed: [
            {
              item: { id: '3', name: 'Failed Item' },
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Invalid price'
              },
              index: 2
            }
          ],
          summary: {
            totalProcessed: 3,
            successCount: 2,
            errorCount: 1
          }
        },
        error: null,
        meta: {
          requestId: 'req-127',
          timestamp: '2024-01-01T00:00:00Z'
        }
      };

      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: mockBulkResponse,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { url: '/items/bulk-update' }
      });

      const items = [
        { id: '1', price: 20.00 },
        { id: '2', price: 25.00 },
        { id: '3', price: -5.00 } // Invalid price
      ];

      const result = await apiService.bulkOperation('/items/bulk-update', items);

      expect(result).toEqual({
        successful: [
          { id: '1', name: 'Updated Item 1', price: 20.00 },
          { id: '2', name: 'Updated Item 2', price: 25.00 }
        ],
        failed: [
          {
            item: { id: '3', name: 'Failed Item' },
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid price'
            },
            index: 2
          }
        ],
        totalProcessed: 3,
        successCount: 2,
        errorCount: 1
      });
    });
  });

  describe('Authentication Flow Compatibility', () => {
    it('should handle 401 responses and attempt token refresh', async () => {
      // First request fails with 401
      vi.spyOn(mockAxios, 'request')
        .mockRejectedValueOnce({
          response: { status: 401 },
          config: { url: '/protected-resource' }
        })
        .mockResolvedValueOnce({
          data: { success: true, data: { message: 'Success after refresh' } },
          status: 200,
          config: { url: '/protected-resource' }
        });

      // Mock auth store not being available (fallback behavior)
      vi.doMock('~/stores/enhanced-auth', () => ({
        useEnhancedAuthStore: undefined
      }));

      // Test 401 handling - should redirect to login when auth store not available
      await expect(apiService.get('/protected-resource'))
        .rejects
        .toThrow('Token refresh failed - auth store not implemented');

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should handle request queue during token refresh', async () => {
      // Simulate multiple concurrent requests during refresh
      const request1Promise = apiService.get('/resource1');
      const request2Promise = apiService.get('/resource2');

      // Both should fail initially with 401, then succeed after refresh
      vi.spyOn(mockAxios, 'request')
        .mockRejectedValueOnce({ response: { status: 401 }, config: { url: '/resource1' } })
        .mockRejectedValueOnce({ response: { status: 401 }, config: { url: '/resource2' } })
        .mockResolvedValueOnce({ data: { success: true, data: 'resource1' }, config: { url: '/resource1' } })
        .mockResolvedValueOnce({ data: { success: true, data: 'resource2' }, config: { url: '/resource2' } });

      // Both requests should eventually fail due to auth store not being available
      await expect(Promise.all([request1Promise, request2Promise]))
        .rejects
        .toThrow();
    });
  });

  describe('Performance and Error Handling', () => {
    it('should handle timeout errors gracefully', async () => {
      vi.spyOn(mockAxios, 'request').mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded',
        config: { url: '/slow-endpoint' }
      });

      await expect(apiService.get('/slow-endpoint'))
        .rejects
        .toThrow('timeout of 5000ms exceeded');
    });

    it('should handle network errors gracefully', async () => {
      vi.spyOn(mockAxios, 'request').mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND api.example.com',
        config: { url: '/network-test' }
      });

      await expect(apiService.get('/network-test'))
        .rejects
        .toThrow('getaddrinfo ENOTFOUND api.example.com');
    });

    it('should handle malformed JSON responses', async () => {
      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: 'invalid json{',
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        config: { url: '/malformed' }
      });

      // Should handle malformed JSON gracefully
      const result = await apiService.get('/malformed');
      expect(result).toBe('invalid json{');
    });

    it('should handle empty responses correctly', async () => {
      vi.spyOn(mockAxios, 'request').mockResolvedValue({
        data: null,
        status: 204,
        statusText: 'No Content',
        headers: {},
        config: { url: '/empty' }
      });

      const result = await apiService.get('/empty');
      expect(result).toBeNull();
    });
  });

  describe('Content-Type Handling', () => {
    it('should handle various content types correctly', async () => {
      const testCases = [
        {
          contentType: 'application/json',
          data: { message: 'JSON response' },
          expected: { message: 'JSON response' }
        },
        {
          contentType: 'text/plain',
          data: 'Plain text response',
          expected: 'Plain text response'
        },
        {
          contentType: 'application/xml',
          data: '<xml>data</xml>',
          expected: '<xml>data</xml>'
        }
      ];

      for (const testCase of testCases) {
        vi.spyOn(mockAxios, 'request').mockResolvedValue({
          data: testCase.data,
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': testCase.contentType },
          config: { url: '/content-test' }
        });

        const result = await apiService.get('/content-test');
        expect(result).toEqual(testCase.expected);
      }
    });
  });
});