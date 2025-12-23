/**
 * Response Normalizer for Legacy Compatibility
 * 
 * Converts legacy response formats to standardized ApiResponse<T>
 * Provides backwards compatibility during migration
 */

import type { ApiResponse, ApiMeta, PaginatedResult } from '~/types/enhanced-api';
import { isApiResponse, isLegacyResponse } from './type-guards';

/**
 * Normalize any response format to ApiResponse<T>
 * Handles legacy formats and ensures consistent structure
 */
export function normalizeResponse<T>(response: any, requestUrl?: string): ApiResponse<T> {
  try {
    // Already in correct format
    if (isApiResponse<T>(response)) {
      return response;
    }

    // Handle legacy formats
    if (isLegacyResponse<T>(response)) {
      // Log warning in development mode (Requirement 7.3)
      if (import.meta.dev && requestUrl) {
        console.warn(`[Legacy Response] Detected legacy format for: ${requestUrl}`);
        console.warn('Please update backend endpoint to return ApiResponse<T>');
        console.warn('Legacy response structure:', response);
      }

      return normalizeLegacyResponse<T>(response, requestUrl);
    }

    // Unknown format - wrap as-is with error handling (Requirement 7.4)
    console.error('[Response Normalizer] Unknown response format:', response);
    console.error('Request URL:', requestUrl);
    
    return createErrorResponse<T>(
      'INVALID_RESPONSE_FORMAT',
      'Received unexpected response format from server',
      { originalResponse: response, requestUrl }
    );
  } catch (error) {
    // Handle conversion errors (Requirement 7.4)
    console.error('[Response Normalizer] Error during normalization:', error);
    console.error('Original response:', response);
    console.error('Request URL:', requestUrl);
    
    return createErrorResponse<T>(
      'NORMALIZATION_ERROR',
      'Failed to normalize response format',
      { 
        originalError: error instanceof Error ? error.message : String(error),
        originalResponse: response,
        requestUrl 
      }
    );
  }
}

/**
 * Convert legacy response to ApiResponse<T>
 */
function normalizeLegacyResponse<T>(legacyResponse: any, requestUrl?: string): ApiResponse<T> {
  let data: T | null = null;

  try {
    // Extract data from various legacy formats
    if (typeof legacyResponse === 'object' && legacyResponse !== null) {
      if (Object.prototype.hasOwnProperty.call(legacyResponse, 'data')) {
        data = (legacyResponse as { data: T }).data;
      } else if (Object.prototype.hasOwnProperty.call(legacyResponse, 'result')) {
        data = (legacyResponse as { result: T }).result;
      } else if (Object.prototype.hasOwnProperty.call(legacyResponse, 'items')) {
        // Handle legacy pagination format
        data = legacyResponse as T;
      } else {
        // Direct data object
        data = legacyResponse as T;
      }
    } else {
      // Primitive data
      data = legacyResponse as T;
    }

    return {
      success: true,
      statusCode: 200,
      data,
      error: null,
      meta: createLegacyMeta(requestUrl)
    };
  } catch (error) {
    // Handle errors during legacy conversion (Requirement 7.4)
    console.error('[Legacy Normalizer] Error converting legacy response:', error);
    console.error('Legacy response:', legacyResponse);
    console.error('Request URL:', requestUrl);
    
    return createErrorResponse<T>(
      'LEGACY_CONVERSION_ERROR',
      'Failed to convert legacy response format',
      { 
        originalError: error instanceof Error ? error.message : String(error),
        legacyResponse,
        requestUrl 
      }
    );
  }
}

/**
 * Create metadata for legacy responses
 */
function createLegacyMeta(requestUrl?: string): ApiMeta {
  return {
    requestId: `legacy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    // Add context about legacy conversion for debugging
    ...(requestUrl && { legacyUrl: requestUrl })
  };
}

/**
 * Create error response
 */
export function createErrorResponse<T>(
  code: string,
  message: string,
  details?: any
): ApiResponse<T> {
  return {
    success: false,
    statusCode: 500,
    data: null,
    error: {
      code,
      message,
      details,
      requestId: `error-${Date.now()}`
    },
    meta: {
      requestId: `error-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
  };
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200,
  meta?: Partial<ApiMeta>
): ApiResponse<T> {
  return {
    success: true,
    statusCode,
    data,
    error: null,
    meta: {
      requestId: meta?.requestId || `success-${Date.now()}`,
      timestamp: meta?.timestamp || new Date().toISOString(),
      ...meta
    }
  };
}

/**
 * Unwrap ApiResponse to get data
 * Throws error if response is not successful
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success || response.data === null) {
    const error = response.error || {
      code: 'UNKNOWN_ERROR',
      message: 'Request failed without error details'
    };
    throw new Error(`[${error.code}] ${error.message}`);
  }

  return response.data;
}

/**
 * Safely unwrap response with fallback
 */
export function unwrapResponseSafe<T>(
  response: ApiResponse<T>,
  fallback: T
): T {
  try {
    return unwrapResponse(response);
  } catch {
    return fallback;
  }
}

/**
 * Check if response indicates success
 */
export function isSuccessResponse<T>(response: ApiResponse<T>): boolean {
  return response.success && response.data !== null;
}

/**
 * Check if response indicates error
 */
export function isErrorResponse<T>(response: ApiResponse<T>): boolean {
  return !response.success || response.error !== null;
}

/**
 * Extract error message from response
 */
export function getErrorMessage(response: ApiResponse<any>): string {
  if (response.error) {
    return response.error.message;
  }
  return 'An unknown error occurred';
}

/**
 * Extract request ID from response for debugging
 */
export function getRequestId(response: ApiResponse<any>): string {
  return response.meta.requestId;
}
/**
 * Detect specific legacy format patterns
 * Requirement 7.1: Adaptive parsing based on response structure
 */
export function detectLegacyFormat(response: any): string | null {
  if (!response || typeof response !== 'object') {
    return 'primitive';
  }

  // Check for specific legacy patterns
  if (Object.prototype.hasOwnProperty.call(response, 'data') && 
      !Object.prototype.hasOwnProperty.call(response, 'success')) {
    return 'wrapped_data';
  }

  if (Object.prototype.hasOwnProperty.call(response, 'result')) {
    return 'wrapped_result';
  }

  if (Object.prototype.hasOwnProperty.call(response, 'items') && 
      Object.prototype.hasOwnProperty.call(response, 'total')) {
    return 'legacy_pagination';
  }

  if (Array.isArray(response)) {
    return 'direct_array';
  }

  // Check if it looks like direct data (no API wrapper fields)
  const hasApiFields = ['success', 'statusCode', 'meta', 'error'].some(
    field => Object.prototype.hasOwnProperty.call(response, field)
  );

  if (!hasApiFields) {
    return 'direct_object';
  }

  return null;
}

/**
 * Log legacy format detection with detailed information
 * Requirement 7.3: Development warnings with context
 */
export function logLegacyDetection(
  response: any, 
  requestUrl?: string, 
  format?: string
): void {
  if (!import.meta.dev) return;

  const detectedFormat = format || detectLegacyFormat(response);
  
  console.group(`🔄 Legacy Response Detected`);
  console.warn(`URL: ${requestUrl || 'Unknown'}`);
  console.warn(`Format: ${detectedFormat || 'Unknown'}`);
  console.warn('Response structure:', response);
  console.warn('⚠️  Please update backend to return ApiResponse<T>');
  console.groupEnd();
}

/**
 * Validate normalized response structure
 * Requirement 7.4: Error handling for conversion failures
 */
export function validateNormalizedResponse<T>(response: ApiResponse<T>): boolean {
  try {
    // Check required fields
    if (typeof response.success !== 'boolean') {
      throw new Error('Invalid success field');
    }

    if (typeof response.statusCode !== 'number') {
      throw new Error('Invalid statusCode field');
    }

    if (!response.meta || typeof response.meta.requestId !== 'string') {
      throw new Error('Invalid meta field');
    }

    if (!response.success && !response.error) {
      throw new Error('Error response missing error field');
    }

    return true;
  } catch (error) {
    console.error('[Response Validator] Invalid normalized response:', error);
    console.error('Response:', response);
    return false;
  }
}

/**
 * Create normalized response with validation
 * Combines normalization with validation for safety
 */
export function safeNormalizeResponse<T>(
  response: any, 
  requestUrl?: string
): ApiResponse<T> {
  try {
    const normalized = normalizeResponse<T>(response, requestUrl);
    
    if (!validateNormalizedResponse(normalized)) {
      return createErrorResponse<T>(
        'VALIDATION_FAILED',
        'Normalized response failed validation',
        { originalResponse: response, requestUrl }
      );
    }

    return normalized;
  } catch (error) {
    console.error('[Safe Normalizer] Normalization failed:', error);
    return createErrorResponse<T>(
      'SAFE_NORMALIZATION_ERROR',
      'Safe normalization failed',
      { 
        error: error instanceof Error ? error.message : String(error),
        originalResponse: response,
        requestUrl 
      }
    );
  }
}

/**
 * Convert legacy pagination format to PaginatedResult
 * Handles various legacy pagination patterns
 */
export function normalizeLegacyPagination<T>(
  legacyResponse: any
): PaginatedResult<T> | null {
  try {
    // Pattern 1: { items: T[], total: number, page?: number, limit?: number }
    if (legacyResponse.items && Array.isArray(legacyResponse.items)) {
      return {
        items: legacyResponse.items,
        pagination: {
          page: legacyResponse.page || 1,
          limit: legacyResponse.limit || legacyResponse.items.length,
          totalItems: legacyResponse.total || legacyResponse.items.length,
          totalPages: Math.ceil(
            (legacyResponse.total || legacyResponse.items.length) / 
            (legacyResponse.limit || legacyResponse.items.length)
          )
        }
      };
    }

    // Pattern 2: { data: T[], count: number }
    if (legacyResponse.data && Array.isArray(legacyResponse.data)) {
      return {
        items: legacyResponse.data,
        pagination: {
          page: 1,
          limit: legacyResponse.data.length,
          totalItems: legacyResponse.count || legacyResponse.data.length,
          totalPages: 1
        }
      };
    }

    // Pattern 3: Direct array
    if (Array.isArray(legacyResponse)) {
      return {
        items: legacyResponse,
        pagination: {
          page: 1,
          limit: legacyResponse.length,
          totalItems: legacyResponse.length,
          totalPages: 1
        }
      };
    }

    return null;
  } catch (error) {
    console.error('[Legacy Pagination] Normalization failed:', error);
    return null;
  }
}