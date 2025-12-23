/**
 * Test Factories for Enhanced API
 * 
 * Factory functions for generating test data
 * Used in unit tests and property-based tests
 * 
 * Requirements 8.1, 8.2, 8.3, 8.4, 8.5: Mock data generation for comprehensive testing
 */

import { UserRole } from '~/types/enhanced-api';
import type { 
  ApiResponse, 
  ApiError, 
  ApiMeta, 
  PaginationMeta,
  PaginatedResult,
  BulkOperationResult,
  BulkOperationError,
  User,
  LoginResponse,
  EnhancedRequestOptions,
  BulkOperationRequest,
  BulkOperationResponse,
  FileDownloadOptions,
  ReportRequest
} from '~/types/enhanced-api';

import {
  UserRole,
  ReportType,
  ReportFormat
} from '~/types/enhanced-api';

import type {
  Menu,
  MenuItem,
  Category,
  Location,
  DashboardMetrics,
  SalesAnalytics,
  TopSellingItem,
  CategoryPerformance,
  SalesTrendData,
  RecentOrder,
  TeamMember,
  TeamInvitation,
  Tenant,
  TenantSettings,
  Subscription,
  Plan,
  PlanFeature,
  AuditLog,
  SaleRecord,
  MenuItemSalesHistory
} from '~/types/business';

import {
  OrderStatus,
  InvitationStatus,
  SubscriptionStatus,
  FeatureKey,
  AuditAction
} from '~/types/business';

// ============================================================================
// API Response Factories
// ============================================================================

/**
 * Create mock ApiResponse<T>
 */
export function createMockApiResponse<T>(
  data: T,
  options: Partial<{
    success: boolean;
    statusCode: number;
    error: ApiError | null;
    meta: Partial<ApiMeta>;
  }> = {}
): ApiResponse<T> {
  return {
    success: options.success ?? true,
    statusCode: options.statusCode ?? 200,
    data: options.success === false ? null : data,
    error: options.error ?? null,
    meta: createMockApiMeta(options.meta)
  };
}

/**
 * Create mock error ApiResponse
 */
export function createMockErrorResponse<T>(
  error: Partial<ApiError>,
  statusCode: number = 400
): ApiResponse<T> {
  return {
    success: false,
    statusCode,
    data: null,
    error: createMockApiError(error),
    meta: createMockApiMeta()
  };
}

/**
 * Create mock ApiMeta
 */
export function createMockApiMeta(overrides: Partial<ApiMeta> = {}): ApiMeta {
  return {
    requestId: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    tenantId: 'test-tenant-id',
    ...overrides
  };
}

/**
 * Create mock ApiError
 */
export function createMockApiError(overrides: Partial<ApiError> = {}): ApiError {
  return {
    code: 'TEST_ERROR',
    message: 'Test error message',
    ...overrides
  };
}

/**
 * Create mock validation error
 */
export function createMockValidationError(
  fieldErrors: Record<string, string>
): ApiError {
  const details = Object.entries(fieldErrors).map(([field, message]) => ({
    field,
    message,
    value: null
  }));

  return {
    code: 'VALIDATION_ERROR',
    message: 'Validation failed',
    details
  };
}

// ============================================================================
// Pagination Factories
// ============================================================================

/**
 * Create mock PaginationMeta
 */
export function createMockPaginationMeta(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    page: 1,
    limit: 10,
    totalItems: 100,
    totalPages: 10,
    ...overrides
  };
}

/**
 * Create mock PaginatedResult<T>
 */
export function createMockPaginatedResult<T>(
  items: T[],
  paginationOverrides: Partial<PaginationMeta> = {}
): PaginatedResult<T> {
  const pagination = createMockPaginationMeta({
    totalItems: items.length,
    totalPages: Math.ceil(items.length / (paginationOverrides.limit || 10)),
    ...paginationOverrides
  });

  return {
    items,
    pagination
  };
}

// ============================================================================
// Bulk Operation Factories
// ============================================================================

/**
 * Create mock BulkOperationResult<T>
 */
export function createMockBulkResult<T>(
  successful: T[],
  failed: BulkOperationError[] = []
): BulkOperationResult<T> {
  return {
    successful,
    failed,
    totalProcessed: successful.length + failed.length,
    successCount: successful.length,
    errorCount: failed.length
  };
}

/**
 * Create mock BulkOperationError
 */
export function createMockBulkError(
  item: any,
  error: Partial<ApiError> = {},
  index: number = 0
): BulkOperationError {
  return {
    item,
    error: createMockApiError(error),
    index
  };
}

// ============================================================================
// Business Entity Factories
// ============================================================================

/**
 * Create mock User
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: `user-${Math.random().toString(36).substr(2, 9)}`,
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: UserRole.TENANT_ADMIN,
    tenantId: 'test-tenant-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create mock LoginResponse
 */
export function createMockLoginResponse(overrides: Partial<LoginResponse> = {}): LoginResponse {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: createMockUser(),
    expiresIn: 3600,
    ...overrides
  };
}

/**
 * Create mock Menu
 */
export function createMockMenu(overrides: Partial<Menu> = {}): Menu {
  return {
    id: `menu-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Menu',
    description: 'Test menu description',
    isActive: true,
    tenantId: 'test-tenant-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create mock MenuItem
 */
export function createMockMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: `item-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Item',
    description: 'Test item description',
    price: 10.99,
    imageUrl: 'https://example.com/image.jpg',
    allergens: 'None',
    isActive: true,
    menuId: 'test-menu-id',
    categoryId: 'test-category-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create mock Category
 */
export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: `category-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Category',
    description: 'Test category description',
    displayOrder: 1,
    tenantId: 'test-tenant-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Create mock Location
 */
export function createMockLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: `location-${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Location',
    address: '123 Test Street',
    city: 'Test City',
    phone: '+1234567890',
    email: 'location@example.com',
    isActive: true,
    tenantId: 'test-tenant-id',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

// ============================================================================
// Array Factories
// ============================================================================

/**
 * Create array of mock items using factory function
 */
export function createMockArray<T>(
  factory: (index: number) => T,
  count: number = 5
): T[] {
  return Array.from({ length: count }, (_, index) => factory(index));
}

/**
 * Create mock menu items array
 */
export function createMockMenuItems(count: number = 5): MenuItem[] {
  return createMockArray((index) => createMockMenuItem({
    name: `Test Item ${index + 1}`,
    price: 10 + index,
    displayOrder: index + 1
  }), count);
}

/**
 * Create mock categories array
 */
export function createMockCategories(count: number = 3): Category[] {
  return createMockArray((index) => createMockCategory({
    name: `Category ${index + 1}`,
    displayOrder: index + 1
  }), count);
}

/**
 * Create mock locations array
 */
export function createMockLocations(count: number = 2): Location[] {
  return createMockArray((index) => createMockLocation({
    name: `Location ${index + 1}`,
    address: `${123 + index} Test Street`
  }), count);
}

// ============================================================================
// Random Data Generators (for Property-Based Testing)
// ============================================================================

/**
 * Generate random string
 */
export function randomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Generate random email
 */
export function randomEmail(): string {
  return `${randomString(8)}@${randomString(5)}.com`;
}

/**
 * Create mock bulk operation result
 */
export function createMockBulkOperationResult<T>(
  successful: T[] = [],
  failed: any[] = []
): BulkOperationResult<T> {
  return {
    successful,
    failed,
    totalProcessed: successful.length + failed.length,
    successCount: successful.length,
    errorCount: failed.length,
  };
}

/**
 * Generate random price
 */
export function randomPrice(min: number = 1, max: number = 100): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Generate random boolean
 */
export function randomBoolean(): boolean {
  return Math.random() > 0.5;
}

/**
 * Generate random integer
 */
export function randomInt(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random item from array
 */
export function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random date within range
 */
export function randomDate(
  start: Date = new Date(2020, 0, 1),
  end: Date = new Date()
): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// ============================================================================
// Enhanced Mock Factories for Admin Operations
// ============================================================================

/**
 * Create mock DashboardMetrics with realistic data
 */
export function createMockDashboardMetrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return {
    totalRevenue: randomPrice(1000, 50000),
    totalOrders: randomInt(50, 500),
    averageOrderValue: randomPrice(15, 75),
    activeMenuItems: randomInt(20, 100),
    topSellingItems: createMockArray(() => createMockTopSellingItem(), 5),
    recentOrders: createMockArray(() => createMockRecentOrder(), 10),
    ...overrides
  };
}

/**
 * Create mock SalesAnalytics
 */
export function createMockSalesAnalytics(overrides: Partial<SalesAnalytics> = {}): SalesAnalytics {
  return {
    totalRevenue: randomPrice(5000, 100000),
    totalOrders: randomInt(100, 1000),
    averageOrderValue: randomPrice(20, 80),
    topItems: createMockArray(() => createMockTopSellingItem(), 10),
    categoryPerformance: createMockArray(() => createMockCategoryPerformance(), 5),
    salesTrend: createMockArray((index) => createMockSalesTrendData(index), 30),
    ...overrides
  };
}

/**
 * Create mock TopSellingItem
 */
export function createMockTopSellingItem(overrides: Partial<TopSellingItem> = {}): TopSellingItem {
  return {
    menuItemId: `item-${randomString(8)}`,
    menuItemName: `Popular Item ${randomInt(1, 100)}`,
    quantity: randomInt(10, 200),
    revenue: randomPrice(100, 5000),
    ...overrides
  };
}

/**
 * Create mock CategoryPerformance
 */
export function createMockCategoryPerformance(overrides: Partial<CategoryPerformance> = {}): CategoryPerformance {
  return {
    categoryId: `category-${randomString(8)}`,
    categoryName: `Category ${randomInt(1, 20)}`,
    totalRevenue: randomPrice(500, 10000),
    totalOrders: randomInt(20, 300),
    itemCount: randomInt(5, 25),
    averageItemPrice: randomPrice(10, 50),
    ...overrides
  };
}

/**
 * Create mock SalesTrendData
 */
export function createMockSalesTrendData(dayOffset: number = 0): SalesTrendData {
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  
  return {
    date: date.toISOString().split('T')[0],
    revenue: randomPrice(100, 2000),
    orders: randomInt(5, 50),
    averageOrderValue: randomPrice(15, 75)
  };
}

/**
 * Create mock RecentOrder
 */
export function createMockRecentOrder(overrides: Partial<RecentOrder> = {}): RecentOrder {
  const statuses = Object.values(OrderStatus);
  return {
    id: `order-${randomString(8)}`,
    customerName: `Customer ${randomInt(1, 1000)}`,
    totalAmount: randomPrice(10, 150),
    status: randomPick(statuses),
    createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).toISOString(),
    ...overrides
  };
}

/**
 * Create mock TeamMember
 */
export function createMockTeamMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: `member-${randomString(8)}`,
    email: randomEmail(),
    firstName: `First${randomInt(1, 100)}`,
    lastName: `Last${randomInt(1, 100)}`,
    role: randomPick([UserRole.TENANT_ADMIN, UserRole.TENANT_STAFF]),
    isActive: randomBoolean(),
    lastLoginAt: randomBoolean() ? randomDate().toISOString() : undefined,
    createdAt: randomDate().toISOString(),
    updatedAt: randomDate().toISOString(),
    ...overrides
  };
}

/**
 * Create mock TeamInvitation
 */
export function createMockTeamInvitation(overrides: Partial<TeamInvitation> = {}): TeamInvitation {
  const statuses = Object.values(InvitationStatus);
  return {
    id: `invitation-${randomString(8)}`,
    email: randomEmail(),
    role: randomPick([UserRole.TENANT_ADMIN, UserRole.TENANT_STAFF]),
    status: randomPick(statuses),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: randomDate().toISOString(),
    ...overrides
  };
}

/**
 * Create mock Tenant
 */
export function createMockTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: `tenant-${randomString(8)}`,
    name: `Test Tenant ${randomInt(1, 100)}`,
    slug: `tenant-${randomString(6)}`,
    settings: createMockTenantSettings(),
    createdAt: randomDate().toISOString(),
    updatedAt: randomDate().toISOString(),
    ...overrides
  };
}

/**
 * Create mock TenantSettings
 */
export function createMockTenantSettings(overrides: Partial<TenantSettings> = {}): TenantSettings {
  return {
    businessName: `Business ${randomInt(1, 100)}`,
    businessType: randomPick(['restaurant', 'cafe', 'bakery', 'food_truck']),
    currency: randomPick(['USD', 'EUR', 'GBP']),
    timezone: randomPick(['UTC', 'America/New_York', 'Europe/London']),
    language: randomPick(['en', 'es', 'fr']),
    ...overrides
  };
}

/**
 * Create mock Subscription
 */
export function createMockSubscription(overrides: Partial<Subscription> = {}): Subscription {
  const statuses = Object.values(SubscriptionStatus);
  return {
    id: `subscription-${randomString(8)}`,
    status: randomPick(statuses),
    startDate: randomDate().toISOString(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    tenantId: `tenant-${randomString(8)}`,
    planId: `plan-${randomString(8)}`,
    plan: createMockPlan(),
    ...overrides
  };
}

/**
 * Create mock Plan
 */
export function createMockPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: `plan-${randomString(8)}`,
    name: `plan_${randomString(6)}`,
    displayName: `Plan ${randomInt(1, 10)}`,
    price: randomPrice(10, 200),
    billingCycle: randomPick(['monthly', 'yearly']),
    maxUsers: randomInt(1, 50),
    maxLocations: randomInt(1, 10),
    maxMenuItems: randomInt(50, 1000),
    maxCategories: randomInt(5, 50),
    features: createMockArray(() => createMockPlanFeature(), randomInt(3, 8)),
    ...overrides
  };
}

/**
 * Create mock PlanFeature
 */
export function createMockPlanFeature(overrides: Partial<PlanFeature> = {}): PlanFeature {
  const features = Object.values(FeatureKey);
  return {
    id: `feature-${randomString(8)}`,
    planId: `plan-${randomString(8)}`,
    featureKey: randomPick(features),
    isEnabled: randomBoolean(),
    ...overrides
  };
}

/**
 * Create mock AuditLog
 */
export function createMockAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  const actions = Object.values(AuditAction);
  return {
    id: `audit-${randomString(8)}`,
    action: randomPick(actions),
    entityType: randomPick(['menu', 'menu_item', 'category', 'user']),
    entityId: `entity-${randomString(8)}`,
    userId: `user-${randomString(8)}`,
    userEmail: randomEmail(),
    changes: randomBoolean() ? { field: 'old_value', newField: 'new_value' } : undefined,
    metadata: randomBoolean() ? { ip: '192.168.1.1', userAgent: 'Test Agent' } : undefined,
    createdAt: randomDate().toISOString(),
    ...overrides
  };
}

/**
 * Create mock SaleRecord
 */
export function createMockSaleRecord(overrides: Partial<SaleRecord> = {}): SaleRecord {
  const quantity = randomInt(1, 10);
  const price = randomPrice(5, 50);
  return {
    id: `sale-${randomString(8)}`,
    quantity,
    revenue: quantity * price,
    totalAmount: quantity * price, // Alias for backward compatibility
    date: randomDate().toISOString(),
    menuItemId: `item-${randomString(8)}`,
    orderId: `order-${randomString(8)}`,
    ...overrides
  };
}

/**
 * Create mock MenuItemSalesHistory
 */
export function createMockMenuItemSalesHistory(overrides: Partial<MenuItemSalesHistory> = {}): MenuItemSalesHistory {
  const sales = createMockArray(() => createMockSaleRecord(), randomInt(5, 20));
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.revenue, 0);
  
  return {
    menuItemId: `item-${randomString(8)}`,
    menuItemName: `Item ${randomInt(1, 100)}`,
    totalQuantity,
    totalRevenue,
    sales,
    ...overrides
  };
}

// ============================================================================
// Error Scenario Factories
// ============================================================================

/**
 * Create mock validation error for complex forms
 */
export function createMockComplexValidationError(): ApiError {
  return createMockValidationError({
    'name': 'Name is required',
    'items.0.price': 'Price must be greater than 0',
    'items.1.name': 'Item name is required',
    'locations.primary.address': 'Address is required',
    'settings.currency': 'Invalid currency code'
  });
}

/**
 * Create mock authentication error
 */
export function createMockAuthError(): ApiError {
  return createMockApiError({
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  });
}

/**
 * Create mock permission error
 */
export function createMockPermissionError(): ApiError {
  return createMockApiError({
    code: 'FORBIDDEN',
    message: 'Insufficient permissions'
  });
}

/**
 * Create mock feature access error (plan limitation)
 */
export function createMockFeatureAccessError(): ApiError {
  return createMockApiError({
    code: 'FEATURE_NOT_AVAILABLE',
    message: 'This feature is not available in your current plan'
  });
}

/**
 * Create mock network error
 */
export function createMockNetworkError(): ApiError {
  return createMockApiError({
    code: 'NETWORK_ERROR',
    message: 'Network connection failed'
  });
}

/**
 * Create mock server error
 */
export function createMockServerError(): ApiError {
  return createMockApiError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error occurred'
  });
}

// ============================================================================
// Bulk Operation Test Utilities
// ============================================================================

/**
 * Create mock bulk operation request
 */
export function createMockBulkRequest<T>(
  items: T[],
  operation: string = 'update',
  options: Record<string, any> = {}
): BulkOperationRequest<T> {
  return {
    items,
    operation,
    options
  };
}

/**
 * Create mock bulk operation response with mixed results
 */
export function createMockBulkResponse<T>(
  successful: T[],
  failed: any[] = [],
  errorRate: number = 0.1
): BulkOperationResponse<T> {
  const totalItems = successful.length + failed.length;
  const actualFailed = failed.length > 0 ? failed : 
    successful.slice(0, Math.floor(successful.length * errorRate))
      .map((item, index) => createMockBulkError(item, {}, index));
  
  const actualSuccessful = failed.length > 0 ? successful : 
    successful.slice(Math.floor(successful.length * errorRate));

  return {
    successful: actualSuccessful,
    failed: actualFailed,
    summary: {
      totalProcessed: totalItems,
      successCount: actualSuccessful.length,
      errorCount: actualFailed.length
    }
  };
}

/**
 * Create mock partial bulk failure scenario
 */
export function createMockPartialBulkFailure<T>(
  items: T[],
  failureRate: number = 0.3
): BulkOperationResult<T> {
  const failureCount = Math.floor(items.length * failureRate);
  const successful = items.slice(0, items.length - failureCount);
  const failed = items.slice(-failureCount).map((item, index) => 
    createMockBulkError(item, {
      code: 'UPDATE_FAILED',
      message: `Failed to update item ${index + 1}`
    }, index)
  );

  return createMockBulkResult(successful, failed);
}

// ============================================================================
// File Operation Test Utilities
// ============================================================================

/**
 * Create mock file download options
 */
export function createMockFileDownloadOptions(overrides: Partial<FileDownloadOptions> = {}): FileDownloadOptions {
  return {
    filename: `report_${Date.now()}.pdf`,
    successMessage: 'File downloaded successfully',
    showProgress: true,
    onProgress: (progress: number) => console.log(`Download progress: ${progress}%`),
    ...overrides
  };
}

/**
 * Create mock report request
 */
export function createMockReportRequest(overrides: Partial<ReportRequest> = {}): ReportRequest {
  const types = Object.values(ReportType);
  const formats = Object.values(ReportFormat);
  
  return {
    type: randomPick(types),
    format: randomPick(formats),
    dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dateTo: new Date().toISOString(),
    filters: {
      locationId: `location-${randomString(8)}`,
      categoryId: `category-${randomString(8)}`
    },
    ...overrides
  };
}

/**
 * Create mock blob response for file downloads
 */
export function createMockBlobResponse(
  content: string = 'Mock file content',
  type: string = 'application/pdf'
): Blob {
  return new Blob([content], { type });
}

// ============================================================================
// Request Options Test Utilities
// ============================================================================

/**
 * Create mock enhanced request options
 */
export function createMockRequestOptions(overrides: Partial<EnhancedRequestOptions> = {}): EnhancedRequestOptions {
  return {
    unwrap: true,
    skipErrorHandling: false,
    isBlob: false,
    successMessage: undefined,
    showProgress: false,
    timeout: 30000,
    skipAuthRefresh: false,
    ...overrides
  };
}

/**
 * Create mock request options for file operations
 */
export function createMockFileRequestOptions(): EnhancedRequestOptions {
  return createMockRequestOptions({
    isBlob: true,
    showProgress: true,
    timeout: 60000,
    successMessage: 'File operation completed'
  });
}

/**
 * Create mock request options for bulk operations
 */
export function createMockBulkRequestOptions(): EnhancedRequestOptions {
  return createMockRequestOptions({
    showProgress: true,
    timeout: 120000,
    successMessage: 'Bulk operation completed'
  });
}

// ============================================================================
// Legacy Response Test Utilities
// ============================================================================

/**
 * Create mock legacy response (wrapped in data property)
 */
export function createMockLegacyDataResponse<T>(data: T): { data: T } {
  return { data };
}

/**
 * Create mock legacy response (wrapped in result property)
 */
export function createMockLegacyResultResponse<T>(result: T): { result: T } {
  return { result };
}

/**
 * Create mock legacy pagination response
 */
export function createMockLegacyPaginationResponse<T>(
  items: T[],
  total: number = items.length
): { items: T[]; total: number; page: number; limit: number } {
  return {
    items,
    total,
    page: 1,
    limit: items.length
  };
}

/**
 * Create mock direct array response (legacy)
 */
export function createMockDirectArrayResponse<T>(items: T[]): T[] {
  return items;
}

// ============================================================================
// Property-Based Testing Generators
// ============================================================================

/**
 * Generate random API response for property testing
 */
export function generateRandomApiResponse<T>(dataGenerator: () => T): ApiResponse<T> {
  const isSuccess = randomBoolean();
  return createMockApiResponse(
    isSuccess ? dataGenerator() : null,
    {
      success: isSuccess,
      statusCode: isSuccess ? randomPick([200, 201]) : randomPick([400, 404, 500]),
      error: isSuccess ? null : createMockApiError()
    }
  );
}

/**
 * Generate random menu item for property testing
 */
export function generateRandomMenuItem(): MenuItem {
  return createMockMenuItem({
    name: randomString(randomInt(5, 50)),
    price: randomPrice(1, 1000),
    isActive: randomBoolean(),
    displayOrder: randomInt(1, 100)
  });
}

/**
 * Generate random validation error for property testing
 */
export function generateRandomValidationError(): ApiError {
  const fieldCount = randomInt(1, 10);
  const fields: Record<string, string> = {};
  
  for (let i = 0; i < fieldCount; i++) {
    const fieldName = randomBoolean() 
      ? randomString(randomInt(3, 15))
      : `items.${randomInt(0, 5)}.${randomString(randomInt(3, 10))}`;
    fields[fieldName] = `Error for ${fieldName}`;
  }
  
  return createMockValidationError(fields);
}

/**
 * Generate random bulk operation result for property testing
 */
export function generateRandomBulkResult<T>(itemGenerator: () => T): BulkOperationResult<T> {
  const totalItems = randomInt(1, 100);
  const errorRate = Math.random() * 0.5; // 0-50% error rate
  const errorCount = Math.floor(totalItems * errorRate);
  const successCount = totalItems - errorCount;
  
  const successful = createMockArray(itemGenerator, successCount);
  const failed = createMockArray((index) => createMockBulkError(
    itemGenerator(),
    { code: 'RANDOM_ERROR', message: `Error ${index}` },
    index
  ), errorCount);
  
  return createMockBulkResult(successful, failed);
}

// ============================================================================
// Test Scenario Builders
// ============================================================================

/**
 * Create a complete test scenario for menu management
 */
export function createMenuManagementScenario() {
  const categories = createMockCategories(3);
  const locations = createMockLocations(2);
  const menus = createMockArray((index) => createMockMenu({
    name: `Menu ${index + 1}`,
    items: createMockMenuItems(randomInt(5, 15))
  }), 2);
  
  return {
    categories,
    locations,
    menus,
    currentMenu: menus[0],
    selectedItems: new Set([menus[0].items![0].id, menus[0].items![1].id])
  };
}

/**
 * Create a complete test scenario for dashboard analytics
 */
export function createDashboardAnalyticsScenario() {
  return {
    metrics: createMockDashboardMetrics(),
    salesAnalytics: createMockSalesAnalytics(),
    salesHistory: createMockArray(() => createMockMenuItemSalesHistory(), 5),
    auditLogs: createMockArray(() => createMockAuditLog(), 10)
  };
}

/**
 * Create a complete test scenario for team management
 */
export function createTeamManagementScenario() {
  return {
    members: createMockArray(() => createMockTeamMember(), randomInt(3, 10)),
    invitations: createMockArray(() => createMockTeamInvitation(), randomInt(1, 5)),
    currentUser: createMockUser({ role: UserRole.TENANT_ADMIN })
  };
}

/**
 * Create error scenarios for testing error handling
 */
export function createErrorScenarios() {
  return {
    validationError: createMockComplexValidationError(),
    authError: createMockAuthError(),
    permissionError: createMockPermissionError(),
    featureAccessError: createMockFeatureAccessError(),
    networkError: createMockNetworkError(),
    serverError: createMockServerError()
  };
}