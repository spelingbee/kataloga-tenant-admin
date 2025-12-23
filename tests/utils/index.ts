/**
 * Test Utilities Index
 * 
 * Central export for all testing utilities
 * Requirements 8.1, 8.2, 8.3, 8.4, 8.5: Comprehensive testing utilities
 */

// Test Factories
export * from '../../utils/test-factories';

// API Mock Utilities
export * from './api-mock-utilities';

// Test Scenario Builders
export * from './test-scenario-builders';

// Property-Based Testing Utilities
export * from './property-test-utilities';

// Re-export commonly used testing functions
export {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
  vi,
  type MockedFunction
} from 'vitest';

// Re-export Pinia testing utilities
export {
  setActivePinia,
  createPinia
} from 'pinia';

// Re-export fast-check for property testing
export { default as fc } from 'fast-check';

// ============================================================================
// Convenience Re-exports
// ============================================================================

// Most commonly used factories
export {
  createMockApiResponse,
  createMockErrorResponse,
  createMockUser,
  createMockMenuItem,
  createMockMenu,
  createMockPaginatedResult,
  createMockBulkResult,
  createMockValidationError
} from '../../utils/test-factories';

// Most commonly used mock utilities
export {
  createMockApiService,
  mockSuccessResponse,
  mockErrorResponse,
  mockPaginatedResponse,
  mockBulkOperationResponse,
  resetApiMocks
} from './api-mock-utilities';

// Most commonly used scenarios
export {
  createMenuStoreTestScenario,
  createDashboardStoreTestScenario,
  createValidationErrorScenario,
  createSuccessfulBulkOperationScenario
} from './test-scenario-builders';

// Most commonly used property test utilities
export {
  arbitraryApiResponse,
  arbitraryMenuItem,
  arbitraryUser,
  testApiResponseUnwrapping,
  testValidationErrorMapping,
  defaultPropertyTestConfig
} from './property-test-utilities';