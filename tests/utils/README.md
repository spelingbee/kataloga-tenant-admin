# Testing Utilities Documentation

This directory contains comprehensive testing utilities for the Tenant Admin API standardization project. These utilities support unit tests, integration tests, and property-based tests.

## Overview

The testing utilities are organized into several modules:

- **Test Factories** (`test-factories.ts`) - Generate mock data for testing
- **API Mock Utilities** (`api-mock-utilities.ts`) - Mock API services and responses
- **Test Scenario Builders** (`test-scenario-builders.ts`) - Pre-built test scenarios
- **Property Test Utilities** (`property-test-utilities.ts`) - Property-based testing support

## Requirements Coverage

These utilities fulfill the following requirements from the specification:

- **Requirement 8.1**: Mock data generation for comprehensive testing
- **Requirement 8.2**: Component testing utilities
- **Requirement 8.3**: Error handling test scenarios
- **Requirement 8.4**: Store testing with clean state validation
- **Requirement 8.5**: Integration testing with real API compatibility

## Test Factories (`test-factories.ts`)

### Basic API Response Factories

```typescript
import { 
  createMockApiResponse,
  createMockErrorResponse,
  createMockValidationError 
} from '~/utils/test-factories';

// Create successful API response
const response = createMockApiResponse({ id: '1', name: 'Test' });

// Create error response
const errorResponse = createMockErrorResponse({
  code: 'VALIDATION_ERROR',
  message: 'Invalid input'
}, 400);

// Create validation error with nested fields
const validationError = createMockValidationError({
  'name': 'Name is required',
  'items.0.price': 'Price must be positive'
});
```

### Business Entity Factories

```typescript
import {
  createMockUser,
  createMockMenuItem,
  createMockMenu,
  createMockDashboardMetrics
} from '~/utils/test-factories';

// Create mock user
const user = createMockUser({ 
  role: UserRole.TENANT_ADMIN,
  email: 'admin@example.com'
});

// Create mock menu item
const item = createMockMenuItem({
  name: 'Pizza',
  price: 15.99,
  isActive: true
});

// Create mock dashboard metrics
const metrics = createMockDashboardMetrics();
```

### Bulk Operation Factories

```typescript
import {
  createMockBulkResult,
  createMockPartialBulkFailure,
  createMockBulkRequest
} from '~/utils/test-factories';

// Create successful bulk operation
const items = [{ id: '1' }, { id: '2' }];
const bulkResult = createMockBulkResult(items, []);

// Create partial failure scenario
const partialFailure = createMockPartialBulkFailure(items, 0.3); // 30% failure rate

// Create bulk request
const request = createMockBulkRequest(items, 'update', { isActive: false });
```

### Error Scenario Factories

```typescript
import {
  createMockAuthError,
  createMockPermissionError,
  createMockFeatureAccessError,
  createMockNetworkError
} from '~/utils/test-factories';

// Create different error types
const authError = createMockAuthError();
const permissionError = createMockPermissionError();
const featureError = createMockFeatureAccessError();
const networkError = createMockNetworkError();
```

### Property-Based Testing Generators

```typescript
import {
  generateRandomApiResponse,
  generateRandomMenuItem,
  generateRandomValidationError
} from '~/utils/test-factories';

// Generate random data for property tests
const randomResponse = generateRandomApiResponse(() => ({ id: '1' }));
const randomItem = generateRandomMenuItem();
const randomError = generateRandomValidationError();
```

## API Mock Utilities (`api-mock-utilities.ts`)

### Creating Mock API Services

```typescript
import {
  createMockApiService,
  mockSuccessResponse,
  mockErrorResponse,
  mockPaginatedResponse
} from '~/tests/utils/api-mock-utilities';

// Create mock API service
const apiMock = createMockApiService();

// Mock successful response
mockSuccessResponse(apiMock.get, { id: '1', name: 'Test' });

// Mock error response
mockErrorResponse(apiMock.post, {
  code: 'VALIDATION_ERROR',
  message: 'Invalid data'
}, 400);

// Mock paginated response
const items = [{ id: '1' }, { id: '2' }];
mockPaginatedResponse(apiMock.getPaginated, items);
```

### Error Scenario Mocks

```typescript
import {
  mock401Error,
  mock403Error,
  mock404Error,
  mock500Error,
  mockNetworkError,
  mockTimeoutError
} from '~/tests/utils/api-mock-utilities';

// Mock different HTTP errors
mock401Error(apiMock.get);
mock403Error(apiMock.delete);
mock404Error(apiMock.get);
mock500Error(apiMock.post);

// Mock network issues
mockNetworkError(apiMock.get);
mockTimeoutError(apiMock.post);
```

### Sequential and Intermittent Failures

```typescript
import {
  mockSequentialResponses,
  mockIntermittentFailures
} from '~/tests/utils/api-mock-utilities';

// Mock sequence of responses (useful for retry testing)
mockSequentialResponses(apiMock.get, [
  { type: 'error', error: { code: 'NETWORK_ERROR' } },
  { type: 'error', error: { code: 'TIMEOUT' } },
  { type: 'success', data: { id: '1' } }
]);

// Mock intermittent failures (useful for resilience testing)
mockIntermittentFailures(apiMock.get, { id: '1' }, 0.2, 10); // 20% failure rate, 10 calls
```

## Test Scenario Builders (`test-scenario-builders.ts`)

### Store Testing Scenarios

```typescript
import {
  createMenuStoreTestScenario,
  createDashboardStoreTestScenario,
  createAuthStoreTestScenario
} from '~/tests/utils/test-scenario-builders';

// Create complete menu store test scenario
const menuScenario = createMenuStoreTestScenario();
const { data, mocks, expectations } = menuScenario;

// Use in tests
const store = useEnhancedMenuStore();
// ... test with scenario data and mocks
```

### Error Handling Scenarios

```typescript
import {
  createValidationErrorScenario,
  createPermissionErrorScenario,
  createNetworkErrorScenario,
  createFeatureAccessErrorScenario
} from '~/tests/utils/test-scenario-builders';

// Test validation error handling
const validationScenario = createValidationErrorScenario();
// ... test form validation with scenario

// Test permission errors
const permissionScenario = createPermissionErrorScenario();
// ... test access control with scenario
```

### Bulk Operation Scenarios

```typescript
import {
  createSuccessfulBulkOperationScenario,
  createPartialBulkFailureScenario,
  createCompleteBulkFailureScenario
} from '~/tests/utils/test-scenario-builders';

// Test successful bulk operations
const successScenario = createSuccessfulBulkOperationScenario();

// Test partial failures
const partialFailureScenario = createPartialBulkFailureScenario();

// Test complete failures
const completeFailureScenario = createCompleteBulkFailureScenario();
```

### Form Testing Scenarios

```typescript
import {
  createFormValidationScenario,
  createNestedFormValidationScenario
} from '~/tests/utils/test-scenario-builders';

// Test simple form validation
const formScenario = createFormValidationScenario();

// Test nested form validation (dot-notation fields)
const nestedFormScenario = createNestedFormValidationScenario();
```

## Property-Based Testing (`property-test-utilities.ts`)

### Basic Arbitraries

```typescript
import fc from 'fast-check';
import {
  arbitraryString,
  arbitraryEmail,
  arbitraryPositiveNumber,
  arbitraryISODate,
  arbitraryId
} from '~/tests/utils/property-test-utilities';

// Use in property tests
fc.assert(fc.property(
  arbitraryEmail(),
  arbitraryPositiveNumber(),
  (email, price) => {
    // Test property with random email and price
    return email.includes('@') && price > 0;
  }
));
```

### API Response Arbitraries

```typescript
import {
  arbitraryApiResponse,
  arbitrarySuccessApiResponse,
  arbitraryErrorApiResponse,
  arbitraryValidationError
} from '~/tests/utils/property-test-utilities';

// Test API response handling
fc.assert(fc.property(
  arbitraryApiResponse(fc.string()),
  (response) => {
    // Test that response handling works for any valid response
    const processed = processApiResponse(response);
    return processed !== null;
  }
));
```

### Business Entity Arbitraries

```typescript
import {
  arbitraryUser,
  arbitraryMenuItem,
  arbitraryMenu,
  arbitraryDashboardMetrics
} from '~/tests/utils/property-test-utilities';

// Test business logic with random entities
fc.assert(fc.property(
  arbitraryMenuItem(),
  (item) => {
    // Test that menu item validation works for any valid item
    const isValid = validateMenuItem(item);
    return isValid === (item.price > 0 && item.name.length > 0);
  }
));
```

### Property Test Helpers

```typescript
import {
  testApiResponseUnwrapping,
  testValidationErrorMapping,
  testBulkOperationConsistency,
  testSerializationRoundTrip
} from '~/tests/utils/property-test-utilities';

// Test API response unwrapping
fc.assert(testApiResponseUnwrapping(
  fc.string(),
  (response) => response.success ? response.data : null
));

// Test validation error mapping
fc.assert(testValidationErrorMapping(
  (error) => mapValidationErrors(error)
));

// Test serialization round trip
fc.assert(testSerializationRoundTrip(
  arbitraryMenuItem(),
  JSON.stringify,
  JSON.parse
));
```

## Usage Examples

### Unit Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
  createMockApiService,
  mockSuccessResponse,
  createMockMenuItem,
  createMockMenuItems
} from '~/tests/utils';

describe('Menu Store', () => {
  let store: any;
  let apiMock: any;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useEnhancedMenuStore();
    apiMock = createMockApiService();
    
    // Mock global API service
    vi.mocked(useNuxtApp).mockReturnValue({ $api: apiMock });
  });

  it('should fetch menu items successfully', async () => {
    const mockItems = createMockMenuItems(5);
    mockSuccessResponse(apiMock.get, mockItems);

    await store.fetchMenuItems('menu-1');

    expect(store.menuItems).toEqual(mockItems);
    expect(store.isFetching).toBe(false);
    expect(store.errors.items).toBeNull();
  });
});
```

### Integration Test Example

```typescript
import {
  createMenuManagementIntegrationScenario,
  resetScenarioMocks
} from '~/tests/utils';

describe('Menu Management Integration', () => {
  let scenario: any;

  beforeEach(() => {
    scenario = createMenuManagementIntegrationScenario();
  });

  afterEach(() => {
    resetScenarioMocks(scenario);
  });

  it('should handle complete menu management workflow', async () => {
    const { menu, validation, bulk } = scenario;
    
    // Test menu loading
    // Test validation errors
    // Test bulk operations
    // Verify integration between components
  });
});
```

### Property-Based Test Example

```typescript
import fc from 'fast-check';
import {
  arbitraryMenuItem,
  arbitraryValidationError,
  defaultPropertyTestConfig
} from '~/tests/utils';

describe('Menu Item Properties', () => {
  it('should maintain price consistency', () => {
    fc.assert(fc.property(
      arbitraryMenuItem(),
      (item) => {
        const processed = processMenuItem(item);
        return processed.price === item.price;
      }
    ), defaultPropertyTestConfig);
  });

  it('should handle all validation errors', () => {
    fc.assert(fc.property(
      arbitraryValidationError(),
      (error) => {
        const mapped = mapValidationErrors(error);
        return Object.keys(mapped).length > 0;
      }
    ), defaultPropertyTestConfig);
  });
});
```

## Best Practices

### 1. Use Appropriate Factories

- Use basic factories for simple unit tests
- Use scenario builders for integration tests
- Use property-based generators for comprehensive testing

### 2. Mock Management

- Always reset mocks between tests
- Use scenario-specific mocks for complex tests
- Verify mock calls when testing interactions

### 3. Error Testing

- Test both success and error scenarios
- Use error scenario builders for consistent error testing
- Test error isolation in stores and components

### 4. Property-Based Testing

- Use property tests for universal properties
- Configure appropriate number of test runs
- Focus on invariants and round-trip properties

### 5. Data Consistency

- Ensure generated data follows business rules
- Use realistic data ranges and formats
- Maintain referential integrity in related entities

## Configuration

### Property Test Configuration

```typescript
// Fast configuration for CI
export const fastPropertyTestConfig = {
  numRuns: 50,
  timeout: 2000,
  seed: 42,
  endOnFailure: true
};

// Thorough configuration for comprehensive testing
export const thoroughPropertyTestConfig = {
  numRuns: 1000,
  timeout: 30000,
  seed: Math.random(),
  endOnFailure: false
};
```

### Test Environment Setup

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts']
  }
});
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all type imports use `type` keyword for types and regular imports for enums
2. **Mock Reset**: Always reset mocks between tests to avoid interference
3. **Async Testing**: Use proper async/await patterns with mock promises
4. **Type Errors**: Ensure mock data matches expected interfaces

### Debugging Tips

1. Use `getMockCallStats()` to inspect mock call history
2. Use `verifyMockCall()` to check specific mock invocations
3. Enable verbose logging in development for better debugging
4. Use property test shrinking to find minimal failing cases

## Contributing

When adding new testing utilities:

1. Follow the existing patterns and naming conventions
2. Add comprehensive JSDoc documentation
3. Include unit tests for the utilities themselves
4. Update this README with usage examples
5. Ensure TypeScript types are properly defined