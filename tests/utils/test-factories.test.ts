/**
 * Tests for Test Factories
 * 
 * Unit tests to ensure mock factories generate valid data
 * Requirements 8.1: Mock data generation validation
 */

import { describe, it, expect } from 'vitest';
import {
  createMockApiResponse,
  createMockErrorResponse,
  createMockUser,
  createMockMenuItem,
  createMockMenu,
  createMockPaginatedResult,
  createMockBulkResult,
  createMockValidationError,
  createMockDashboardMetrics,
  createMockComplexValidationError,
  createMockAuthError,
  createMockPermissionError,
  createMockFeatureAccessError,
  createMockBulkRequest,
  createMockBulkResponse,
  createMockPartialBulkFailure,
  createMockFileDownloadOptions,
  createMockReportRequest,
  createMockBlobResponse,
  createMockLegacyDataResponse,
  createMockLegacyResultResponse,
  createMockDirectArrayResponse,
  generateRandomApiResponse,
  generateRandomMenuItem,
  generateRandomValidationError,
  createMenuManagementScenario,
  createDashboardAnalyticsScenario,
  createTeamManagementScenario,
  createErrorScenarios
} from '~/utils/test-factories';
import { UserRole } from '~/types/enhanced-api';

describe('Test Factories', () => {
  describe('Basic API Response Factories', () => {
    it('should create valid ApiResponse with data', () => {
      const testData = { id: '1', name: 'Test' };
      const response = createMockApiResponse(testData);

      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(testData);
      expect(response.error).toBeNull();
      expect(response.meta).toBeDefined();
      expect(response.meta.requestId).toBeDefined();
      expect(response.meta.timestamp).toBeDefined();
    });

    it('should create valid error ApiResponse', () => {
      const errorData = { code: 'TEST_ERROR', message: 'Test error' };
      const response = createMockErrorResponse(errorData, 400);

      expect(response.success).toBe(false);
      expect(response.statusCode).toBe(400);
      expect(response.data).toBeNull();
      expect(response.error).toEqual(expect.objectContaining(errorData));
      expect(response.meta).toBeDefined();
    });

    it('should create validation error with field details', () => {
      const fieldErrors = {
        'name': 'Name is required',
        'email': 'Invalid email format'
      };
      const error = createMockValidationError(fieldErrors);

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Validation failed');
      expect(Array.isArray(error.details)).toBe(true);
      expect(error.details).toHaveLength(2);
      
      if (Array.isArray(error.details)) {
        expect(error.details[0]).toEqual({
          field: 'name',
          message: 'Name is required',
          value: null
        });
      }
    });
  });

  describe('Business Entity Factories', () => {
    it('should create valid User', () => {
      const user = createMockUser();

      expect(user.id).toBeDefined();
      expect(user.email).toContain('@');
      expect(user.firstName).toBeDefined();
      expect(user.lastName).toBeDefined();
      expect(Object.values(UserRole)).toContain(user.role);
      expect(user.tenantId).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
    });

    it('should create User with overrides', () => {
      const overrides = {
        email: 'custom@example.com',
        role: UserRole.TENANT_STAFF
      };
      const user = createMockUser(overrides);

      expect(user.email).toBe('custom@example.com');
      expect(user.role).toBe(UserRole.TENANT_STAFF);
    });

    it('should create valid MenuItem', () => {
      const item = createMockMenuItem();

      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(typeof item.price).toBe('number');
      expect(item.price).toBeGreaterThan(0);
      expect(typeof item.isActive).toBe('boolean');
      expect(item.menuId).toBeDefined();
      expect(item.createdAt).toBeDefined();
      expect(item.updatedAt).toBeDefined();
    });

    it('should create valid Menu with items', () => {
      const menu = createMockMenu();

      expect(menu.id).toBeDefined();
      expect(menu.name).toBeDefined();
      expect(typeof menu.isActive).toBe('boolean');
      expect(menu.tenantId).toBeDefined();
      expect(menu.createdAt).toBeDefined();
      expect(menu.updatedAt).toBeDefined();
    });
  });

  describe('Pagination Factories', () => {
    it('should create valid PaginatedResult', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const result = createMockPaginatedResult(items, { limit: 5 });

      expect(result.items).toEqual(items);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.totalPages).toBe(1);
      expect(result.pagination.page).toBe(1);
    });

    it('should calculate pagination correctly', () => {
      const items = Array.from({ length: 25 }, (_, i) => ({ id: String(i + 1) }));
      const result = createMockPaginatedResult(items, { limit: 10 });

      expect(result.pagination.totalItems).toBe(25);
      expect(result.pagination.limit).toBe(10);
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('Bulk Operation Factories', () => {
    it('should create valid BulkOperationResult', () => {
      const successful = [{ id: '1' }, { id: '2' }];
      const failed = [{ item: { id: '3' }, error: { code: 'ERROR', message: 'Failed' }, index: 2 }];
      const result = createMockBulkResult(successful, failed);

      expect(result.successful).toEqual(successful);
      expect(result.failed).toEqual(failed);
      expect(result.totalProcessed).toBe(3);
      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(1);
    });

    it('should create partial bulk failure scenario', () => {
      const items = Array.from({ length: 10 }, (_, i) => ({ id: String(i + 1) }));
      const result = createMockPartialBulkFailure(items, 0.3);

      expect(result.totalProcessed).toBe(10);
      expect(result.errorCount).toBe(3); // 30% of 10
      expect(result.successCount).toBe(7);
      expect(result.successful).toHaveLength(7);
      expect(result.failed).toHaveLength(3);
    });
  });

  describe('Enhanced Mock Factories', () => {
    it('should create valid DashboardMetrics', () => {
      const metrics = createMockDashboardMetrics();

      expect(typeof metrics.totalRevenue).toBe('number');
      expect(metrics.totalRevenue).toBeGreaterThan(0);
      expect(typeof metrics.totalOrders).toBe('number');
      expect(metrics.totalOrders).toBeGreaterThan(0);
      expect(typeof metrics.averageOrderValue).toBe('number');
      expect(metrics.averageOrderValue).toBeGreaterThan(0);
      expect(Array.isArray(metrics.topSellingItems)).toBe(true);
      expect(Array.isArray(metrics.recentOrders)).toBe(true);
    });

    it('should create complex validation error', () => {
      const error = createMockComplexValidationError();

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(error.details)).toBe(true);
      
      if (Array.isArray(error.details)) {
        // Should have nested field errors
        const hasNestedError = error.details.some(detail => 
          detail.field.includes('.') || detail.field.includes('[')
        );
        expect(hasNestedError).toBe(true);
      }
    });
  });

  describe('Error Scenario Factories', () => {
    it('should create authentication error', () => {
      const error = createMockAuthError();
      expect(error.code).toBe('UNAUTHORIZED');
      expect(error.message).toBeDefined();
    });

    it('should create permission error', () => {
      const error = createMockPermissionError();
      expect(error.code).toBe('FORBIDDEN');
      expect(error.message).toBeDefined();
    });

    it('should create feature access error', () => {
      const error = createMockFeatureAccessError();
      expect(error.code).toBe('FEATURE_NOT_AVAILABLE');
      expect(error.message).toBeDefined();
    });
  });

  describe('File Operation Factories', () => {
    it('should create file download options', () => {
      const options = createMockFileDownloadOptions();

      expect(options.filename).toBeDefined();
      expect(options.successMessage).toBeDefined();
      expect(typeof options.showProgress).toBe('boolean');
      expect(typeof options.onProgress).toBe('function');
    });

    it('should create report request', () => {
      const request = createMockReportRequest();

      expect(request.type).toBeDefined();
      expect(request.format).toBeDefined();
      expect(request.dateFrom).toBeDefined();
      expect(request.dateTo).toBeDefined();
      expect(request.filters).toBeDefined();
    });

    it('should create blob response', () => {
      const blob = createMockBlobResponse('test content', 'text/plain');

      expect(blob instanceof Blob).toBe(true);
      expect(blob.type).toBe('text/plain');
    });
  });

  describe('Legacy Response Factories', () => {
    it('should create legacy data response', () => {
      const data = { id: '1', name: 'Test' };
      const response = createMockLegacyDataResponse(data);

      expect(response.data).toEqual(data);
    });

    it('should create legacy result response', () => {
      const result = { id: '1', name: 'Test' };
      const response = createMockLegacyResultResponse(result);

      expect(response.result).toEqual(result);
    });

    it('should create direct array response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const response = createMockDirectArrayResponse(items);

      expect(response).toEqual(items);
      expect(Array.isArray(response)).toBe(true);
    });
  });

  describe('Property-Based Testing Generators', () => {
    it('should generate random API response', () => {
      const dataGenerator = () => ({ id: Math.random().toString() });
      const response = generateRandomApiResponse(dataGenerator);

      expect(typeof response.success).toBe('boolean');
      expect(typeof response.statusCode).toBe('number');
      expect(response.meta).toBeDefined();
      
      if (response.success) {
        expect(response.data).toBeDefined();
        expect(response.error).toBeNull();
      } else {
        expect(response.data).toBeNull();
        expect(response.error).toBeDefined();
      }
    });

    it('should generate random menu item', () => {
      const item = generateRandomMenuItem();

      expect(item.id).toBeDefined();
      expect(item.name).toBeDefined();
      expect(typeof item.price).toBe('number');
      expect(item.price).toBeGreaterThan(0);
      expect(typeof item.isActive).toBe('boolean');
    });

    it('should generate random validation error', () => {
      const error = generateRandomValidationError();

      expect(error.code).toBe('VALIDATION_ERROR');
      expect(Array.isArray(error.details)).toBe(true);
      
      if (Array.isArray(error.details)) {
        expect(error.details.length).toBeGreaterThan(0);
        error.details.forEach(detail => {
          expect(detail.field).toBeDefined();
          expect(detail.message).toBeDefined();
        });
      }
    });
  });

  describe('Test Scenario Builders', () => {
    it('should create menu management scenario', () => {
      const scenario = createMenuManagementScenario();

      expect(Array.isArray(scenario.categories)).toBe(true);
      expect(Array.isArray(scenario.locations)).toBe(true);
      expect(Array.isArray(scenario.menus)).toBe(true);
      expect(scenario.currentMenu).toBeDefined();
      expect(scenario.selectedItems instanceof Set).toBe(true);
      expect(scenario.selectedItems.size).toBeGreaterThan(0);
    });

    it('should create dashboard analytics scenario', () => {
      const scenario = createDashboardAnalyticsScenario();

      expect(scenario.metrics).toBeDefined();
      expect(scenario.salesAnalytics).toBeDefined();
      expect(Array.isArray(scenario.salesHistory)).toBe(true);
      expect(Array.isArray(scenario.auditLogs)).toBe(true);
    });

    it('should create team management scenario', () => {
      const scenario = createTeamManagementScenario();

      expect(Array.isArray(scenario.members)).toBe(true);
      expect(Array.isArray(scenario.invitations)).toBe(true);
      expect(scenario.currentUser).toBeDefined();
      expect(scenario.currentUser.role).toBe(UserRole.TENANT_ADMIN);
    });

    it('should create error scenarios', () => {
      const scenarios = createErrorScenarios();

      expect(scenarios.validationError).toBeDefined();
      expect(scenarios.authError).toBeDefined();
      expect(scenarios.permissionError).toBeDefined();
      expect(scenarios.featureAccessError).toBeDefined();
      expect(scenarios.networkError).toBeDefined();
      expect(scenarios.serverError).toBeDefined();

      expect(scenarios.validationError.code).toBe('VALIDATION_ERROR');
      expect(scenarios.authError.code).toBe('UNAUTHORIZED');
      expect(scenarios.permissionError.code).toBe('FORBIDDEN');
      expect(scenarios.featureAccessError.code).toBe('FEATURE_NOT_AVAILABLE');
    });
  });

  describe('Data Consistency', () => {
    it('should generate consistent IDs', () => {
      const user1 = createMockUser();
      const user2 = createMockUser();

      expect(user1.id).not.toBe(user2.id);
      expect(user1.id).toBeDefined();
      expect(user2.id).toBeDefined();
    });

    it('should generate valid timestamps', () => {
      const item = createMockMenuItem();

      expect(new Date(item.createdAt).getTime()).not.toBeNaN();
      expect(new Date(item.updatedAt).getTime()).not.toBeNaN();
      expect(new Date(item.createdAt).getTime()).toBeLessThanOrEqual(new Date(item.updatedAt).getTime());
    });

    it('should generate valid email addresses', () => {
      const user = createMockUser();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      expect(emailRegex.test(user.email)).toBe(true);
    });

    it('should generate positive prices', () => {
      const item = createMockMenuItem();

      expect(item.price).toBeGreaterThan(0);
      expect(typeof item.price).toBe('number');
      expect(isFinite(item.price)).toBe(true);
    });
  });

  describe('Bulk Operation Consistency', () => {
    it('should maintain bulk operation math consistency', () => {
      const items = Array.from({ length: 20 }, (_, i) => ({ id: String(i + 1) }));
      const result = createMockPartialBulkFailure(items, 0.4);

      expect(result.totalProcessed).toBe(result.successCount + result.errorCount);
      expect(result.totalProcessed).toBe(items.length);
      expect(result.successful.length).toBe(result.successCount);
      expect(result.failed.length).toBe(result.errorCount);
    });

    it('should create valid bulk request and response', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const request = createMockBulkRequest(items, 'update', { field: 'value' });
      const response = createMockBulkResponse(items, [], 0.2);

      expect(request.items).toEqual(items);
      expect(request.operation).toBe('update');
      expect(request.options).toEqual({ field: 'value' });

      expect(response.successful.length).toBeGreaterThan(0);
      expect(response.summary.totalProcessed).toBe(response.successful.length + response.failed.length);
    });
  });
});