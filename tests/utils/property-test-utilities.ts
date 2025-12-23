/**
 * Property-Based Testing Utilities
 * 
 * Utilities for property-based testing with fast-check
 * Requirements 8.1, 8.4: Property-based test utilities for comprehensive testing
 */

import fc from 'fast-check';
import type { 
  ApiResponse, 
  ApiError, 
  ApiMeta,
  PaginationMeta,
  BulkOperationResult,
  User,
  LoginResponse
} from '~/types/enhanced-api';
import type {
  Menu,
  MenuItem,
  Category,
  Location,
  DashboardMetrics
} from '~/types/business';
import { UserRole } from '~/types/enhanced-api';

// ============================================================================
// Basic Arbitraries
// ============================================================================

/**
 * Generate arbitrary string with constraints
 */
export const arbitraryString = (minLength: number = 1, maxLength: number = 50) =>
  fc.string({ minLength, maxLength }).filter(s => s.trim().length > 0);

/**
 * Generate arbitrary email
 */
export const arbitraryEmail = () =>
  fc.tuple(
    arbitraryString(3, 20),
    arbitraryString(3, 15),
    fc.constantFrom('com', 'org', 'net', 'edu')
  ).map(([name, domain, tld]) => `${name}@${domain}.${tld}`);

/**
 * Generate arbitrary positive number
 */
export const arbitraryPositiveNumber = (max: number = 1000000) =>
  fc.float({ min: 0.01, max, noNaN: true });

/**
 * Generate arbitrary positive integer
 */
export const arbitraryPositiveInt = (max: number = 1000000) =>
  fc.integer({ min: 1, max });

/**
 * Generate arbitrary ISO date string
 */
export const arbitraryISODate = () =>
  fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
    .map(date => date.toISOString());

/**
 * Generate arbitrary UUID-like string
 */
export const arbitraryId = () =>
  fc.uuid().map(uuid => uuid.replace(/-/g, ''));

// ============================================================================
// API Response Arbitraries
// ============================================================================

/**
 * Generate arbitrary ApiMeta
 */
export const arbitraryApiMeta = (): fc.Arbitrary<ApiMeta> =>
  fc.record({
    requestId: arbitraryId(),
    timestamp: arbitraryISODate(),
    tenantId: fc.option(arbitraryId(), { nil: undefined }),
    pagination: fc.option(arbitraryPaginationMeta(), { nil: undefined })
  });

/**
 * Generate arbitrary PaginationMeta
 */
export const arbitraryPaginationMeta = (): fc.Arbitrary<PaginationMeta> =>
  fc.record({
    page: arbitraryPositiveInt(100),
    limit: fc.integer({ min: 1, max: 100 }),
    totalItems: arbitraryPositiveInt(10000),
    totalPages: arbitraryPositiveInt(1000)
  }).filter(meta => meta.totalPages >= Math.ceil(meta.totalItems / meta.limit));

/**
 * Generate arbitrary ApiError
 */
export const arbitraryApiError = (): fc.Arbitrary<ApiError> =>
  fc.record({
    code: fc.constantFrom(
      'VALIDATION_ERROR',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'INTERNAL_SERVER_ERROR',
      'NETWORK_ERROR'
    ),
    message: arbitraryString(10, 100),
    details: fc.option(
      fc.oneof(
        fc.array(fc.record({
          field: arbitraryString(1, 30),
          message: arbitraryString(5, 50),
          value: fc.anything()
        })),
        fc.dictionary(arbitraryString(1, 20), fc.anything())
      ),
      { nil: undefined }
    ),
    requestId: fc.option(arbitraryId(), { nil: undefined })
  });

/**
 * Generate arbitrary successful ApiResponse
 */
export const arbitrarySuccessApiResponse = <T>(dataArbitrary: fc.Arbitrary<T>): fc.Arbitrary<ApiResponse<T>> =>
  fc.record({
    success: fc.constant(true),
    statusCode: fc.constantFrom(200, 201, 202),
    data: dataArbitrary,
    error: fc.constant(null),
    meta: arbitraryApiMeta()
  });

/**
 * Generate arbitrary error ApiResponse
 */
export const arbitraryErrorApiResponse = <T>(): fc.Arbitrary<ApiResponse<T>> =>
  fc.record({
    success: fc.constant(false),
    statusCode: fc.constantFrom(400, 401, 403, 404, 422, 500),
    data: fc.constant(null),
    error: arbitraryApiError(),
    meta: arbitraryApiMeta()
  });

/**
 * Generate arbitrary ApiResponse (success or error)
 */
export const arbitraryApiResponse = <T>(dataArbitrary: fc.Arbitrary<T>): fc.Arbitrary<ApiResponse<T>> =>
  fc.oneof(
    arbitrarySuccessApiResponse(dataArbitrary),
    arbitraryErrorApiResponse<T>()
  );

// ============================================================================
// Business Entity Arbitraries
// ============================================================================

/**
 * Generate arbitrary User
 */
export const arbitraryUser = (): fc.Arbitrary<User> =>
  fc.record({
    id: arbitraryId(),
    email: arbitraryEmail(),
    firstName: arbitraryString(2, 30),
    lastName: arbitraryString(2, 30),
    role: fc.constantFrom(UserRole.TENANT_ADMIN, UserRole.TENANT_STAFF),
    tenantId: arbitraryId(),
    createdAt: arbitraryISODate(),
    updatedAt: arbitraryISODate()
  });

/**
 * Generate arbitrary LoginResponse
 */
export const arbitraryLoginResponse = (): fc.Arbitrary<LoginResponse> =>
  fc.record({
    accessToken: arbitraryString(50, 200),
    refreshToken: arbitraryString(50, 200),
    user: arbitraryUser(),
    expiresIn: fc.integer({ min: 300, max: 86400 }) // 5 minutes to 24 hours
  });

/**
 * Generate arbitrary Category
 */
export const arbitraryCategory = (): fc.Arbitrary<Category> =>
  fc.record({
    id: arbitraryId(),
    name: arbitraryString(3, 50),
    description: fc.option(arbitraryString(10, 200), { nil: undefined }),
    displayOrder: arbitraryPositiveInt(100),
    tenantId: arbitraryId(),
    createdAt: arbitraryISODate(),
    updatedAt: arbitraryISODate()
  });

/**
 * Generate arbitrary Location
 */
export const arbitraryLocation = (): fc.Arbitrary<Location> =>
  fc.record({
    id: arbitraryId(),
    name: arbitraryString(3, 50),
    address: arbitraryString(10, 100),
    city: arbitraryString(3, 50),
    phone: fc.option(arbitraryString(10, 20), { nil: undefined }),
    email: fc.option(arbitraryEmail(), { nil: undefined }),
    isActive: fc.boolean(),
    tenantId: arbitraryId(),
    createdAt: arbitraryISODate(),
    updatedAt: arbitraryISODate()
  });

/**
 * Generate arbitrary MenuItem
 */
export const arbitraryMenuItem = (): fc.Arbitrary<MenuItem> =>
  fc.record({
    id: arbitraryId(),
    name: arbitraryString(3, 100),
    description: fc.option(arbitraryString(10, 500), { nil: undefined }),
    price: arbitraryPositiveNumber(1000),
    imageUrl: fc.option(arbitraryString(10, 200), { nil: undefined }),
    allergens: fc.option(arbitraryString(5, 100), { nil: undefined }),
    isActive: fc.boolean(),
    displayOrder: fc.option(arbitraryPositiveInt(1000), { nil: undefined }),
    menuId: arbitraryId(),
    categoryId: fc.option(arbitraryId(), { nil: undefined }),
    createdAt: arbitraryISODate(),
    updatedAt: arbitraryISODate()
  });

/**
 * Generate arbitrary Menu
 */
export const arbitraryMenu = (): fc.Arbitrary<Menu> =>
  fc.record({
    id: arbitraryId(),
    name: arbitraryString(3, 100),
    description: fc.option(arbitraryString(10, 500), { nil: undefined }),
    isActive: fc.boolean(),
    tenantId: arbitraryId(),
    items: fc.option(fc.array(arbitraryMenuItem(), { maxLength: 20 }), { nil: undefined }),
    createdAt: arbitraryISODate(),
    updatedAt: arbitraryISODate()
  });

/**
 * Generate arbitrary DashboardMetrics
 */
export const arbitraryDashboardMetrics = (): fc.Arbitrary<DashboardMetrics> =>
  fc.record({
    totalRevenue: arbitraryPositiveNumber(1000000),
    totalOrders: arbitraryPositiveInt(100000),
    averageOrderValue: arbitraryPositiveNumber(1000),
    activeMenuItems: arbitraryPositiveInt(1000),
    topSellingItems: fc.array(
      fc.record({
        menuItemId: arbitraryId(),
        menuItemName: arbitraryString(3, 50),
        quantity: arbitraryPositiveInt(1000),
        revenue: arbitraryPositiveNumber(100000)
      }),
      { maxLength: 10 }
    ),
    recentOrders: fc.array(
      fc.record({
        id: arbitraryId(),
        customerName: fc.option(arbitraryString(5, 50), { nil: undefined }),
        totalAmount: arbitraryPositiveNumber(1000),
        status: fc.constantFrom('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'),
        createdAt: arbitraryISODate()
      }),
      { maxLength: 20 }
    )
  });

// ============================================================================
// Bulk Operation Arbitraries
// ============================================================================

/**
 * Generate arbitrary BulkOperationResult
 */
export const arbitraryBulkOperationResult = <T>(itemArbitrary: fc.Arbitrary<T>): fc.Arbitrary<BulkOperationResult<T>> =>
  fc.tuple(
    fc.array(itemArbitrary, { maxLength: 50 }),
    fc.array(
      fc.record({
        item: fc.anything(),
        error: arbitraryApiError(),
        index: arbitraryPositiveInt(100)
      }),
      { maxLength: 20 }
    )
  ).map(([successful, failed]) => ({
    successful,
    failed,
    totalProcessed: successful.length + failed.length,
    successCount: successful.length,
    errorCount: failed.length
  }));

// ============================================================================
// Validation Error Arbitraries
// ============================================================================

/**
 * Generate arbitrary validation error with nested fields
 */
export const arbitraryValidationError = (): fc.Arbitrary<ApiError> =>
  fc.record({
    code: fc.constant('VALIDATION_ERROR'),
    message: fc.constant('Validation failed'),
    details: fc.array(
      fc.record({
        field: fc.oneof(
          arbitraryString(3, 20), // Simple field
          fc.tuple(arbitraryString(3, 15), arbitraryPositiveInt(10), arbitraryString(3, 15))
            .map(([prefix, index, suffix]) => `${prefix}.${index}.${suffix}`), // Array field
          fc.tuple(arbitraryString(3, 15), arbitraryString(3, 15))
            .map(([parent, child]) => `${parent}.${child}`) // Nested field
        ),
        message: arbitraryString(10, 100),
        value: fc.anything()
      }),
      { minLength: 1, maxLength: 10 }
    )
  });

// ============================================================================
// Legacy Response Arbitraries
// ============================================================================

/**
 * Generate arbitrary legacy response format
 */
export const arbitraryLegacyResponse = <T>(dataArbitrary: fc.Arbitrary<T>) =>
  fc.oneof(
    dataArbitrary, // Direct data
    fc.record({ data: dataArbitrary }), // Wrapped in data
    fc.record({ result: dataArbitrary }), // Wrapped in result
    fc.record({ 
      items: fc.array(dataArbitrary, { maxLength: 20 }),
      total: arbitraryPositiveInt(1000),
      page: arbitraryPositiveInt(100),
      limit: arbitraryPositiveInt(100)
    }) // Legacy pagination
  );

// ============================================================================
// Property Test Helpers
// ============================================================================

/**
 * Property test for API response unwrapping
 */
export const testApiResponseUnwrapping = <T>(
  dataArbitrary: fc.Arbitrary<T>,
  unwrapFunction: (response: ApiResponse<T>) => T | null
) =>
  fc.property(
    arbitrarySuccessApiResponse(dataArbitrary),
    (response) => {
      const unwrapped = unwrapFunction(response);
      return unwrapped === response.data;
    }
  );

/**
 * Property test for validation error mapping
 */
export const testValidationErrorMapping = (
  mapFunction: (error: ApiError) => Record<string, string>
) =>
  fc.property(
    arbitraryValidationError(),
    (error) => {
      const mapped = mapFunction(error);
      
      // All field errors should be mapped
      if (Array.isArray(error.details)) {
        return error.details.every(detail => 
          Object.prototype.hasOwnProperty.call(mapped, detail.field)
        );
      }
      
      return true;
    }
  );

/**
 * Property test for bulk operation consistency
 */
export const testBulkOperationConsistency = <T>(
  itemArbitrary: fc.Arbitrary<T>
) =>
  fc.property(
    arbitraryBulkOperationResult(itemArbitrary),
    (result) => {
      // Total processed should equal success + error counts
      const calculatedTotal = result.successCount + result.errorCount;
      const actualTotal = result.successful.length + result.failed.length;
      
      return result.totalProcessed === calculatedTotal &&
             result.totalProcessed === actualTotal &&
             result.successCount === result.successful.length &&
             result.errorCount === result.failed.length;
    }
  );

/**
 * Property test for pagination consistency
 */
export const testPaginationConsistency = () =>
  fc.property(
    arbitraryPaginationMeta(),
    (pagination) => {
      // Total pages should be calculated correctly from total items and limit
      const expectedPages = Math.ceil(pagination.totalItems / pagination.limit);
      return pagination.totalPages === expectedPages;
    }
  );

/**
 * Property test for data serialization round trip
 */
export const testSerializationRoundTrip = <T>(
  dataArbitrary: fc.Arbitrary<T>,
  serialize: (data: T) => string,
  deserialize: (json: string) => T
) =>
  fc.property(
    dataArbitrary,
    (originalData) => {
      try {
        const serialized = serialize(originalData);
        const deserialized = deserialize(serialized);
        
        // For objects, compare JSON representations
        if (typeof originalData === 'object' && originalData !== null) {
          return JSON.stringify(originalData) === JSON.stringify(deserialized);
        }
        
        // For primitives, direct comparison
        return originalData === deserialized;
      } catch (error) {
        // Serialization should not throw for valid data
        return false;
      }
    }
  );

// ============================================================================
// Custom Property Generators
// ============================================================================

/**
 * Generate property test for store state consistency
 */
export const testStoreStateConsistency = <T>(
  stateArbitrary: fc.Arbitrary<T>,
  stateValidator: (state: T) => boolean
) =>
  fc.property(
    stateArbitrary,
    (state) => stateValidator(state)
  );

/**
 * Generate property test for form validation
 */
export const testFormValidation = (
  formDataArbitrary: fc.Arbitrary<any>,
  validator: (data: any) => { isValid: boolean; errors: Record<string, string> }
) =>
  fc.property(
    formDataArbitrary,
    (formData) => {
      const result = validator(formData);
      
      // If validation passes, there should be no errors
      if (result.isValid) {
        return Object.keys(result.errors).length === 0;
      }
      
      // If validation fails, there should be at least one error
      return Object.keys(result.errors).length > 0;
    }
  );

/**
 * Generate property test for API error handling
 */
export const testApiErrorHandling = (
  errorHandler: (error: ApiError) => { handled: boolean; message?: string }
) =>
  fc.property(
    arbitraryApiError(),
    (error) => {
      const result = errorHandler(error);
      
      // Error handler should always return a result
      return typeof result.handled === 'boolean' &&
             (result.message === undefined || typeof result.message === 'string');
    }
  );

// ============================================================================
// Test Configuration
// ============================================================================

/**
 * Default property test configuration
 */
export const defaultPropertyTestConfig = {
  numRuns: 100,
  timeout: 5000,
  seed: Math.random(),
  path: '',
  endOnFailure: false
};

/**
 * Fast property test configuration (for CI)
 */
export const fastPropertyTestConfig = {
  numRuns: 50,
  timeout: 2000,
  seed: 42, // Fixed seed for reproducibility
  path: '',
  endOnFailure: true
};

/**
 * Thorough property test configuration (for comprehensive testing)
 */
export const thoroughPropertyTestConfig = {
  numRuns: 1000,
  timeout: 30000,
  seed: Math.random(),
  path: '',
  endOnFailure: false
};