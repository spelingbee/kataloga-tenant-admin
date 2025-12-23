/**
 * Test Scenario Builders
 * 
 * Pre-built test scenarios for common testing patterns
 * Requirements 8.2, 8.3: Component and error testing scenarios
 */

import { vi } from 'vitest';
import type { 
  ApiError,
  BulkOperationResult,
  PaginatedResult
} from '~/types/enhanced-api';
import type {
  Menu,
  MenuItem,
  Category,
  Location,
  DashboardMetrics,
  TeamMember,
  User
} from '~/types/business';
import {
  createMockMenu,
  createMockMenuItem,
  createMockMenuItems,
  createMockCategories,
  createMockLocations,
  createMockDashboardMetrics,
  createMockTeamMember,
  createMockUser,
  createMockPaginatedResult,
  createMockBulkResult,
  createMockValidationError,
  createMockApiError
} from '~/utils/test-factories';
import {
  createMockApiService,
  mockSuccessResponse,
  mockErrorResponse,
  mockPaginatedResponse,
  mockBulkOperationResponse
} from './api-mock-utilities';

// ============================================================================
// Store Test Scenarios
// ============================================================================

/**
 * Create test scenario for menu store testing
 */
export function createMenuStoreTestScenario() {
  const categories = createMockCategories(3);
  const locations = createMockLocations(2);
  const menuItems = createMockMenuItems(10);
  const menus = [
    createMockMenu({ 
      id: 'menu-1', 
      name: 'Main Menu',
      items: menuItems.slice(0, 5)
    }),
    createMockMenu({ 
      id: 'menu-2', 
      name: 'Drinks Menu',
      items: menuItems.slice(5)
    })
  ];

  const apiMock = createMockApiService();
  
  // Setup default successful responses
  mockSuccessResponse(apiMock.get, menus);
  mockPaginatedResponse(apiMock.getPaginated, menuItems);
  mockSuccessResponse(apiMock.post, menuItems[0]);
  mockSuccessResponse(apiMock.patch, { ...menuItems[0], name: 'Updated Item' });
  mockSuccessResponse(apiMock.delete, undefined);
  mockBulkOperationResponse(apiMock.bulkOperation, menuItems.slice(0, 3), []);

  return {
    data: {
      categories,
      locations,
      menus,
      menuItems,
      currentMenu: menus[0],
      selectedItems: new Set([menuItems[0].id, menuItems[1].id])
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      totalMenus: menus.length,
      totalItems: menuItems.length,
      selectedCount: 2
    }
  };
}

/**
 * Create test scenario for dashboard store testing
 */
export function createDashboardStoreTestScenario() {
  const metrics = createMockDashboardMetrics();
  const apiMock = createMockApiService();
  
  // Setup widget-specific responses
  mockSuccessResponse(apiMock.get, metrics);
  
  // Mock individual widget endpoints
  const widgetEndpoints = {
    '/dashboard/metrics': metrics,
    '/dashboard/sales-trend': metrics.recentOrders,
    '/dashboard/top-items': metrics.topSellingItems
  };

  Object.entries(widgetEndpoints).forEach(([endpoint, data]) => {
    apiMock.get.mockImplementation((url: string) => {
      if (url === endpoint) {
        return Promise.resolve(data);
      }
      return Promise.resolve(metrics);
    });
  });

  return {
    data: {
      metrics,
      widgets: ['metrics', 'sales-trend', 'top-items']
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      totalRevenue: metrics.totalRevenue,
      totalOrders: metrics.totalOrders,
      widgetCount: 3
    }
  };
}

/**
 * Create test scenario for auth store testing
 */
export function createAuthStoreTestScenario() {
  const user = createMockUser({ role: 'TENANT_ADMIN' });
  const loginResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user,
    expiresIn: 3600
  };
  
  const apiMock = createMockApiService();
  
  // Setup auth flow responses
  mockSuccessResponse(apiMock.post, loginResponse); // login
  mockSuccessResponse(apiMock.get, user); // profile validation
  
  return {
    data: {
      user,
      loginResponse,
      credentials: {
        email: 'test@example.com',
        password: 'password123'
      }
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      isAuthenticated: true,
      userRole: 'TENANT_ADMIN'
    }
  };
}

// ============================================================================
// Error Handling Test Scenarios
// ============================================================================

/**
 * Create validation error test scenario
 */
export function createValidationErrorScenario() {
  const validationError = createMockValidationError({
    'name': 'Name is required',
    'items.0.price': 'Price must be greater than 0',
    'items.1.name': 'Item name cannot be empty',
    'category.displayOrder': 'Display order must be a positive number'
  });

  const apiMock = createMockApiService();
  mockErrorResponse(apiMock.post, validationError, 400);

  return {
    data: {
      error: validationError,
      formData: {
        name: '',
        items: [
          { price: -5 },
          { name: '' }
        ],
        category: { displayOrder: -1 }
      }
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      errorCode: 'VALIDATION_ERROR',
      fieldErrorCount: 4,
      hasNestedErrors: true
    }
  };
}

/**
 * Create permission error test scenario
 */
export function createPermissionErrorScenario() {
  const permissionError = createMockApiError({
    code: 'FORBIDDEN',
    message: 'Insufficient permissions to perform this action'
  });

  const apiMock = createMockApiService();
  mockErrorResponse(apiMock.delete, permissionError, 403);

  return {
    data: {
      error: permissionError,
      user: createMockUser({ role: 'TENANT_STAFF' }) // Limited permissions
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      errorCode: 'FORBIDDEN',
      statusCode: 403,
      shouldRedirect: false
    }
  };
}

/**
 * Create network error test scenario
 */
export function createNetworkErrorScenario() {
  const networkError = createMockApiError({
    code: 'NETWORK_ERROR',
    message: 'Network connection failed'
  });

  const apiMock = createMockApiService();
  apiMock.get.mockRejectedValue(networkError);

  return {
    data: {
      error: networkError
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      errorCode: 'NETWORK_ERROR',
      shouldRetry: true,
      showOfflineMessage: true
    }
  };
}

/**
 * Create feature access error scenario (plan limitation)
 */
export function createFeatureAccessErrorScenario() {
  const featureError = createMockApiError({
    code: 'FEATURE_NOT_AVAILABLE',
    message: 'This feature is not available in your current plan'
  });

  const apiMock = createMockApiService();
  mockErrorResponse(apiMock.get, featureError, 403);

  return {
    data: {
      error: featureError,
      feature: 'advanced_analytics',
      currentPlan: 'basic'
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      errorCode: 'FEATURE_NOT_AVAILABLE',
      shouldShowUpgrade: true,
      fallbackContent: true
    }
  };
}

// ============================================================================
// Bulk Operation Test Scenarios
// ============================================================================

/**
 * Create successful bulk operation scenario
 */
export function createSuccessfulBulkOperationScenario() {
  const items = createMockMenuItems(5);
  const bulkResult = createMockBulkResult(items, []);
  
  const apiMock = createMockApiService();
  mockBulkOperationResponse(apiMock.bulkOperation, items, []);

  return {
    data: {
      items,
      bulkResult,
      operation: 'update',
      changes: { isActive: false }
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      successCount: items.length,
      errorCount: 0,
      totalProcessed: items.length
    }
  };
}

/**
 * Create partial bulk operation failure scenario
 */
export function createPartialBulkFailureScenario() {
  const items = createMockMenuItems(10);
  const successful = items.slice(0, 7);
  const failed = items.slice(7).map((item, index) => ({
    item,
    error: createMockApiError({
      code: 'UPDATE_FAILED',
      message: `Failed to update item ${item.name}`
    }),
    index: index + 7
  }));
  
  const bulkResult = createMockBulkResult(successful, failed);
  
  const apiMock = createMockApiService();
  mockBulkOperationResponse(apiMock.bulkOperation, successful, failed);

  return {
    data: {
      items,
      bulkResult,
      successful,
      failed
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      successCount: 7,
      errorCount: 3,
      totalProcessed: 10,
      hasPartialFailure: true
    }
  };
}

/**
 * Create complete bulk operation failure scenario
 */
export function createCompleteBulkFailureScenario() {
  const items = createMockMenuItems(3);
  const failed = items.map((item, index) => ({
    item,
    error: createMockApiError({
      code: 'BULK_OPERATION_FAILED',
      message: `Operation failed for item ${item.name}`
    }),
    index
  }));
  
  const bulkResult = createMockBulkResult([], failed);
  
  const apiMock = createMockApiService();
  mockBulkOperationResponse(apiMock.bulkOperation, [], failed);

  return {
    data: {
      items,
      bulkResult,
      failed
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      successCount: 0,
      errorCount: 3,
      totalProcessed: 3,
      hasCompleteFailure: true
    }
  };
}

// ============================================================================
// Form Testing Scenarios
// ============================================================================

/**
 * Create form validation test scenario
 */
export function createFormValidationScenario() {
  const validationError = createMockValidationError({
    'name': 'Name is required',
    'price': 'Price must be a positive number',
    'category': 'Category is required'
  });

  const formData = {
    name: '',
    price: -10,
    category: null
  };

  return {
    data: {
      error: validationError,
      formData,
      validFormData: {
        name: 'Valid Item Name',
        price: 15.99,
        category: 'category-1'
      }
    },
    expectations: {
      hasFieldErrors: true,
      fieldErrorCount: 3,
      canSubmit: false
    }
  };
}

/**
 * Create nested form validation scenario
 */
export function createNestedFormValidationScenario() {
  const validationError = createMockValidationError({
    'items.0.name': 'Item name is required',
    'items.0.price': 'Price must be positive',
    'items.1.category': 'Category is required',
    'locations.primary.address': 'Address is required',
    'settings.currency': 'Invalid currency code'
  });

  const formData = {
    items: [
      { name: '', price: -5 },
      { name: 'Valid Item', category: null }
    ],
    locations: {
      primary: { address: '' }
    },
    settings: {
      currency: 'INVALID'
    }
  };

  return {
    data: {
      error: validationError,
      formData
    },
    expectations: {
      hasNestedErrors: true,
      nestedFieldCount: 5,
      hasArrayErrors: true,
      hasObjectErrors: true
    }
  };
}

// ============================================================================
// Pagination Test Scenarios
// ============================================================================

/**
 * Create pagination test scenario
 */
export function createPaginationScenario() {
  const allItems = createMockMenuItems(25);
  const pageSize = 10;
  const totalPages = Math.ceil(allItems.length / pageSize);
  
  const pages = Array.from({ length: totalPages }, (_, pageIndex) => {
    const startIndex = pageIndex * pageSize;
    const endIndex = Math.min(startIndex + pageSize, allItems.length);
    const pageItems = allItems.slice(startIndex, endIndex);
    
    return createMockPaginatedResult(pageItems, {
      page: pageIndex + 1,
      limit: pageSize,
      totalItems: allItems.length,
      totalPages
    });
  });

  const apiMock = createMockApiService();
  
  // Mock paginated responses based on page parameter
  apiMock.getPaginated.mockImplementation((url: string, params: any) => {
    const page = params?.page || 1;
    const pageIndex = page - 1;
    return Promise.resolve(pages[pageIndex] || pages[0]);
  });

  return {
    data: {
      allItems,
      pages,
      pageSize,
      totalPages
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      totalItems: allItems.length,
      totalPages,
      pageSize
    }
  };
}

// ============================================================================
// File Operation Test Scenarios
// ============================================================================

/**
 * Create file download test scenario
 */
export function createFileDownloadScenario() {
  const fileContent = 'Mock PDF content';
  const filename = 'sales-report.pdf';
  const blob = new Blob([fileContent], { type: 'application/pdf' });
  
  const apiMock = createMockApiService();
  apiMock.getBlob.mockResolvedValue(blob);
  apiMock.downloadFile.mockResolvedValue(undefined);

  return {
    data: {
      fileContent,
      filename,
      blob,
      reportParams: {
        type: 'sales',
        format: 'pdf',
        dateFrom: '2023-01-01',
        dateTo: '2023-01-31'
      }
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      fileSize: fileContent.length,
      mimeType: 'application/pdf',
      shouldDownload: true
    }
  };
}

/**
 * Create file upload test scenario
 */
export function createFileUploadScenario() {
  const file = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
  const uploadResponse = {
    fileId: 'uploaded-file-123',
    url: 'https://example.com/uploads/test-image.jpg',
    size: file.size,
    mimeType: file.type
  };
  
  const apiMock = createMockApiService();
  mockSuccessResponse(apiMock.post, uploadResponse);

  return {
    data: {
      file,
      uploadResponse
    },
    mocks: {
      api: apiMock
    },
    expectations: {
      fileId: uploadResponse.fileId,
      uploadUrl: uploadResponse.url,
      shouldShowProgress: true
    }
  };
}

// ============================================================================
// Integration Test Scenarios
// ============================================================================

/**
 * Create complete menu management integration scenario
 */
export function createMenuManagementIntegrationScenario() {
  const menuScenario = createMenuStoreTestScenario();
  const validationScenario = createValidationErrorScenario();
  const bulkScenario = createSuccessfulBulkOperationScenario();
  
  return {
    menu: menuScenario,
    validation: validationScenario,
    bulk: bulkScenario,
    workflow: {
      steps: [
        'Load menus',
        'Select menu items',
        'Perform bulk operation',
        'Handle validation errors',
        'Update local state'
      ]
    }
  };
}

/**
 * Create complete dashboard integration scenario
 */
export function createDashboardIntegrationScenario() {
  const dashboardScenario = createDashboardStoreTestScenario();
  const errorScenario = createFeatureAccessErrorScenario();
  
  return {
    dashboard: dashboardScenario,
    error: errorScenario,
    workflow: {
      widgets: ['metrics', 'analytics', 'recent-orders'],
      errorHandling: 'isolated',
      fallbackStrategy: 'default-values'
    }
  };
}

// ============================================================================
// Scenario Utilities
// ============================================================================

/**
 * Combine multiple scenarios for complex testing
 */
export function combineScenarios(...scenarios: any[]) {
  return {
    scenarios,
    data: scenarios.reduce((acc, scenario) => ({ ...acc, ...scenario.data }), {}),
    mocks: scenarios.reduce((acc, scenario) => ({ ...acc, ...scenario.mocks }), {}),
    expectations: scenarios.reduce((acc, scenario) => ({ ...acc, ...scenario.expectations }), {})
  };
}

/**
 * Create scenario with custom timing
 */
export function createTimedScenario(baseScenario: any, delays: Record<string, number>) {
  const { mocks } = baseScenario;
  
  // Add delays to mock responses
  Object.entries(delays).forEach(([method, delay]) => {
    if (mocks.api[method]) {
      const originalMock = mocks.api[method];
      mocks.api[method] = vi.fn().mockImplementation((...args) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const result = originalMock(...args);
            if (result instanceof Promise) {
              result.then(resolve).catch(reject);
            } else {
              resolve(result);
            }
          }, delay);
        });
      });
    }
  });

  return {
    ...baseScenario,
    timing: delays
  };
}

/**
 * Reset all scenario mocks
 */
export function resetScenarioMocks(scenario: any) {
  if (scenario.mocks?.api) {
    Object.values(scenario.mocks.api).forEach((mock: any) => {
      if (typeof mock?.mockReset === 'function') {
        mock.mockReset();
      }
    });
  }
}