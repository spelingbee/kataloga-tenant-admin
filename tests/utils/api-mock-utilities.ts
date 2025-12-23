/**
 * API Mock Utilities for Testing
 * 
 * Utilities for mocking API responses, interceptors, and error scenarios
 * Requirements 8.1, 8.2, 8.3: Mock utilities for comprehensive testing
 */

import { vi, type MockedFunction } from 'vitest';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { 
  ApiResponse, 
  ApiError, 
  EnhancedRequestOptions,
  BulkOperationResult,
  PaginatedResult
} from '~/types/enhanced-api';
import {
  createMockApiResponse,
  createMockErrorResponse,
  createMockPaginatedResult,
  createMockBulkResult,
  createMockBlobResponse
} from '~/utils/test-factories';

// ============================================================================
// Mock API Service Factory
// ============================================================================

/**
 * Create a complete mock API service for testing
 */
export function createMockApiService() {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    getPaginated: vi.fn(),
    bulkOperation: vi.fn(),
    downloadFile: vi.fn(),
    getBlob: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn()
  };
}

/**
 * Create mock axios instance with interceptors
 */
export function createMockAxiosInstance(): AxiosInstance {
  const mockAxios = {
    request: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: {
        use: vi.fn(),
        eject: vi.fn()
      },
      response: {
        use: vi.fn(),
        eject: vi.fn()
      }
    },
    defaults: {
      headers: {
        common: {} as Record<string, string>
      }
    }
  } as any;

  return mockAxios;
}

// ============================================================================
// Response Mock Builders
// ============================================================================

/**
 * Mock successful API response
 */
export function mockSuccessResponse<T>(
  mockFn: MockedFunction<any>,
  data: T,
  options: Partial<{
    statusCode: number;
    meta: any;
    delay: number;
  }> = {}
): void {
  const response = createMockApiResponse(data, {
    statusCode: options.statusCode || 200,
    meta: options.meta
  });

  if (options.delay) {
    mockFn.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(response), options.delay)
      )
    );
  } else {
    mockFn.mockResolvedValue(response);
  }
}

/**
 * Mock error API response
 */
export function mockErrorResponse(
  mockFn: MockedFunction<any>,
  error: Partial<ApiError>,
  statusCode: number = 400,
  delay?: number
): void {
  const errorResponse = createMockErrorResponse(error, statusCode);

  if (delay) {
    mockFn.mockImplementation(() => 
      new Promise((_, reject) => 
        setTimeout(() => reject(errorResponse.error), delay)
      )
    );
  } else {
    mockFn.mockRejectedValue(errorResponse.error);
  }
}

/**
 * Mock paginated response
 */
export function mockPaginatedResponse<T>(
  mockFn: MockedFunction<any>,
  items: T[],
  paginationOverrides: any = {}
): void {
  const result = createMockPaginatedResult(items, paginationOverrides);
  mockFn.mockResolvedValue(result);
}

/**
 * Mock bulk operation response
 */
export function mockBulkOperationResponse<T>(
  mockFn: MockedFunction<any>,
  successful: T[],
  failed: any[] = []
): void {
  const result = createMockBulkResult(successful, failed);
  mockFn.mockResolvedValue(result);
}

/**
 * Mock file download response
 */
export function mockFileDownloadResponse(
  mockFn: MockedFunction<any>,
  content: string = 'Mock file content',
  filename: string = 'test-file.pdf'
): void {
  const blob = createMockBlobResponse(content);
  const response = {
    data: blob,
    headers: {
      'content-disposition': `attachment; filename="${filename}"`
    }
  };
  mockFn.mockResolvedValue(response);
}

// ============================================================================
// Error Scenario Mocks
// ============================================================================

/**
 * Mock network error
 */
export function mockNetworkError(mockFn: MockedFunction<any>): void {
  const error = new Error('Network Error') as AxiosError;
  error.code = 'NETWORK_ERROR';
  error.isAxiosError = true;
  mockFn.mockRejectedValue(error);
}

/**
 * Mock timeout error
 */
export function mockTimeoutError(mockFn: MockedFunction<any>): void {
  const error = new Error('Timeout Error') as AxiosError;
  error.code = 'ECONNABORTED';
  error.isAxiosError = true;
  mockFn.mockRejectedValue(error);
}

/**
 * Mock 401 unauthorized error
 */
export function mock401Error(mockFn: MockedFunction<any>): void {
  mockErrorResponse(mockFn, {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }, 401);
}

/**
 * Mock 403 forbidden error
 */
export function mock403Error(mockFn: MockedFunction<any>): void {
  mockErrorResponse(mockFn, {
    code: 'FORBIDDEN',
    message: 'Insufficient permissions'
  }, 403);
}

/**
 * Mock 404 not found error
 */
export function mock404Error(mockFn: MockedFunction<any>): void {
  mockErrorResponse(mockFn, {
    code: 'NOT_FOUND',
    message: 'Resource not found'
  }, 404);
}

/**
 * Mock 500 server error
 */
export function mock500Error(mockFn: MockedFunction<any>): void {
  mockErrorResponse(mockFn, {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error'
  }, 500);
}

// ============================================================================
// Sequential Response Mocks
// ============================================================================

/**
 * Mock sequential responses (useful for testing retry logic)
 */
export function mockSequentialResponses<T>(
  mockFn: MockedFunction<any>,
  responses: Array<{ type: 'success' | 'error'; data?: T; error?: Partial<ApiError>; statusCode?: number }>
): void {
  responses.forEach((response, index) => {
    if (response.type === 'success') {
      mockFn.mockResolvedValueOnce(createMockApiResponse(response.data));
    } else {
      const errorResponse = createMockErrorResponse(
        response.error || { code: 'TEST_ERROR', message: 'Test error' },
        response.statusCode || 400
      );
      mockFn.mockRejectedValueOnce(errorResponse.error);
    }
  });
}

/**
 * Mock intermittent failures (useful for testing resilience)
 */
export function mockIntermittentFailures<T>(
  mockFn: MockedFunction<any>,
  successData: T,
  failureRate: number = 0.3,
  callCount: number = 10
): void {
  for (let i = 0; i < callCount; i++) {
    if (Math.random() < failureRate) {
      mockErrorResponse(mockFn, {
        code: 'INTERMITTENT_ERROR',
        message: `Intermittent failure ${i + 1}`
      });
    } else {
      mockSuccessResponse(mockFn, successData);
    }
  }
}

// ============================================================================
// Request Validation Mocks
// ============================================================================

/**
 * Mock with request validation
 */
export function mockWithRequestValidation<T>(
  mockFn: MockedFunction<any>,
  validator: (args: any[]) => boolean,
  successData: T,
  errorData: Partial<ApiError> = { code: 'VALIDATION_ERROR', message: 'Invalid request' }
): void {
  mockFn.mockImplementation((...args) => {
    if (validator(args)) {
      return Promise.resolve(createMockApiResponse(successData));
    } else {
      const errorResponse = createMockErrorResponse(errorData);
      return Promise.reject(errorResponse.error);
    }
  });
}

/**
 * Mock with parameter tracking
 */
export function mockWithParameterTracking<T>(
  mockFn: MockedFunction<any>,
  successData: T
): { calls: any[][]; mock: MockedFunction<any> } {
  const calls: any[][] = [];
  
  mockFn.mockImplementation((...args) => {
    calls.push(args);
    return Promise.resolve(createMockApiResponse(successData));
  });

  return { calls, mock: mockFn };
}

// ============================================================================
// Authentication Mock Utilities
// ============================================================================

/**
 * Mock authentication flow
 */
export function mockAuthenticationFlow(apiMock: any) {
  // Mock login success
  mockSuccessResponse(apiMock.post, {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: { id: '1', email: 'test@example.com' },
    expiresIn: 3600
  });

  // Mock token validation
  mockSuccessResponse(apiMock.get, {
    id: '1',
    email: 'test@example.com',
    role: 'TENANT_ADMIN'
  });
}

/**
 * Mock token refresh flow
 */
export function mockTokenRefreshFlow(apiMock: any) {
  // First call fails with 401
  mock401Error(apiMock.get);
  
  // Refresh token succeeds
  mockSuccessResponse(apiMock.post, {
    accessToken: 'new-access-token',
    refreshToken: 'new-refresh-token',
    expiresIn: 3600
  });
  
  // Retry original request succeeds
  mockSuccessResponse(apiMock.get, { data: 'success' });
}

// ============================================================================
// File Operation Mock Utilities
// ============================================================================

/**
 * Mock file upload with progress
 */
export function mockFileUploadWithProgress(
  mockFn: MockedFunction<any>,
  progressCallback?: (progress: number) => void
): void {
  mockFn.mockImplementation((url, data, options) => {
    // Simulate progress updates
    if (progressCallback && options?.onUploadProgress) {
      setTimeout(() => options.onUploadProgress({ loaded: 25, total: 100 }), 100);
      setTimeout(() => options.onUploadProgress({ loaded: 50, total: 100 }), 200);
      setTimeout(() => options.onUploadProgress({ loaded: 75, total: 100 }), 300);
      setTimeout(() => options.onUploadProgress({ loaded: 100, total: 100 }), 400);
    }
    
    return Promise.resolve(createMockApiResponse({
      fileId: 'uploaded-file-id',
      url: 'https://example.com/uploaded-file.jpg'
    }));
  });
}

/**
 * Mock file download with progress
 */
export function mockFileDownloadWithProgress(
  mockFn: MockedFunction<any>,
  progressCallback?: (progress: number) => void
): void {
  mockFn.mockImplementation((url, options) => {
    // Simulate progress updates
    if (progressCallback && options?.onDownloadProgress) {
      setTimeout(() => options.onDownloadProgress({ loaded: 25, total: 100 }), 100);
      setTimeout(() => options.onDownloadProgress({ loaded: 50, total: 100 }), 200);
      setTimeout(() => options.onDownloadProgress({ loaded: 75, total: 100 }), 300);
      setTimeout(() => options.onDownloadProgress({ loaded: 100, total: 100 }), 400);
    }
    
    const blob = createMockBlobResponse('Mock file content');
    return Promise.resolve({
      data: blob,
      headers: {
        'content-disposition': 'attachment; filename="report.pdf"'
      }
    });
  });
}

// ============================================================================
// Test Scenario Builders
// ============================================================================

/**
 * Create complete API mock setup for menu management tests
 */
export function setupMenuManagementMocks(apiMock: any) {
  // Mock menu list
  mockPaginatedResponse(apiMock.getPaginated, [
    { id: '1', name: 'Menu 1', isActive: true },
    { id: '2', name: 'Menu 2', isActive: true }
  ]);

  // Mock menu item operations
  mockSuccessResponse(apiMock.post, { id: '3', name: 'New Item', price: 15.99 });
  mockSuccessResponse(apiMock.patch, { id: '1', name: 'Updated Item', price: 19.99 });
  mockSuccessResponse(apiMock.delete, undefined);

  // Mock bulk operations
  mockBulkOperationResponse(apiMock.bulkOperation, 
    [{ id: '1', name: 'Item 1' }, { id: '2', name: 'Item 2' }],
    []
  );
}

/**
 * Create complete API mock setup for dashboard tests
 */
export function setupDashboardMocks(apiMock: any) {
  // Mock dashboard metrics
  mockSuccessResponse(apiMock.get, {
    totalRevenue: 15000,
    totalOrders: 150,
    averageOrderValue: 100,
    activeMenuItems: 25
  });

  // Mock analytics data
  mockSuccessResponse(apiMock.get, {
    salesTrend: [
      { date: '2023-01-01', revenue: 1000, orders: 10 },
      { date: '2023-01-02', revenue: 1200, orders: 12 }
    ]
  });
}

/**
 * Create error scenario mocks for testing error handling
 */
export function setupErrorScenarioMocks(apiMock: any) {
  // Network errors
  mockNetworkError(apiMock.get);
  
  // Validation errors
  mockErrorResponse(apiMock.post, {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details: [
      { field: 'name', message: 'Name is required' },
      { field: 'price', message: 'Price must be positive' }
    ]
  });
  
  // Permission errors
  mock403Error(apiMock.delete);
}

// ============================================================================
// Mock Cleanup Utilities
// ============================================================================

/**
 * Reset all mocks in an API service
 */
export function resetApiMocks(apiMock: any): void {
  Object.values(apiMock).forEach((mockFn: any) => {
    if (typeof mockFn?.mockReset === 'function') {
      mockFn.mockReset();
    }
  });
}

/**
 * Clear all mock call history
 */
export function clearMockHistory(apiMock: any): void {
  Object.values(apiMock).forEach((mockFn: any) => {
    if (typeof mockFn?.mockClear === 'function') {
      mockFn.mockClear();
    }
  });
}

/**
 * Verify mock was called with specific parameters
 */
export function verifyMockCall(
  mockFn: MockedFunction<any>,
  expectedArgs: any[],
  callIndex: number = 0
): boolean {
  const calls = mockFn.mock.calls;
  if (calls.length <= callIndex) {
    return false;
  }
  
  const actualArgs = calls[callIndex];
  return JSON.stringify(actualArgs) === JSON.stringify(expectedArgs);
}

/**
 * Get mock call statistics
 */
export function getMockCallStats(mockFn: MockedFunction<any>) {
  return {
    callCount: mockFn.mock.calls.length,
    calls: mockFn.mock.calls,
    results: mockFn.mock.results,
    lastCall: mockFn.mock.lastCall
  };
}