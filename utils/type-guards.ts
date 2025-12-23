/**
 * Type Guards for Enhanced API
 * 
 * Runtime type checking utilities for API responses
 * Handles ApiResponse, Legacy formats, and Blob detection
 */

import type { 
  ApiResponse, 
  ApiError, 
  ApiMeta, 
  LegacyResponse,
  ResponseTypeInfo 
} from '~/types/enhanced-api';

/**
 * Check if object is a valid ApiResponse<T>
 */
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return typeof obj.success === 'boolean' &&
         typeof obj.statusCode === 'number' &&
         obj.hasOwnProperty('data') &&
         obj.hasOwnProperty('error') &&
         obj.hasOwnProperty('meta') &&
         isValidApiMeta(obj.meta);
}

/**
 * Check if object is a valid ApiError
 */
export function isApiError(obj: any): obj is ApiError {
  return obj &&
         typeof obj === 'object' &&
         typeof obj.code === 'string' &&
         typeof obj.message === 'string';
}

/**
 * Check if object is valid ApiMeta
 */
export function isValidApiMeta(obj: any): obj is ApiMeta {
  if (!obj || typeof obj !== 'object') {
    return false;
  }
  
  return typeof obj.requestId === 'string' &&
         typeof obj.timestamp === 'string';
}

/**
 * Check if response is a Blob (binary data)
 */
export function isBlobResponse(obj: any): obj is Blob {
  return obj instanceof Blob;
}

/**
 * Check if response is legacy format
 * Legacy formats: direct data, { data: T }, { result: T }, etc.
 * Requirement 7.1: Adaptive parsing based on response structure
 */
export function isLegacyResponse<T>(obj: any): obj is LegacyResponse<T> {
  // Null and undefined are not legacy responses
  if (obj === null || obj === undefined) {
    return false;
  }

  // Primitive values (except null/undefined) are considered legacy
  if (typeof obj !== 'object') {
    return true;
  }

  // If it's already an ApiResponse, it's not legacy
  if (isApiResponse(obj)) {
    return false;
  }

  // If it's a Blob, it's not legacy
  if (isBlobResponse(obj)) {
    return false;
  }

  // Check for common legacy patterns
  const hasDataProperty = Object.prototype.hasOwnProperty.call(obj, 'data') && 
                         !Object.prototype.hasOwnProperty.call(obj, 'success');
  const hasResultProperty = Object.prototype.hasOwnProperty.call(obj, 'result');
  const hasItemsProperty = Object.prototype.hasOwnProperty.call(obj, 'items') &&
                          !Object.prototype.hasOwnProperty.call(obj, 'meta');
  const isDirectData = !Object.prototype.hasOwnProperty.call(obj, 'success') && 
                      !Object.prototype.hasOwnProperty.call(obj, 'statusCode') && 
                      !Object.prototype.hasOwnProperty.call(obj, 'meta');

  return hasDataProperty || hasResultProperty || hasItemsProperty || isDirectData;
}

/**
 * Analyze response type and return detailed information
 * Requirement 7.1: Detailed format detection for adaptive parsing
 */
export function analyzeResponseType(obj: any): ResponseTypeInfo {
  const isApi = isApiResponse(obj);
  const isLegacy = isLegacyResponse(obj);
  const isBlob = isBlobResponse(obj);
  
  return {
    isApiResponse: isApi,
    isLegacy: isLegacy,
    isBlob: isBlob,
    // Additional format details for debugging
    format: isApi ? 'api_response' : 
            isBlob ? 'blob' : 
            isLegacy ? detectLegacyFormat(obj) : 'unknown'
  };
}

/**
 * Detect specific legacy format for detailed handling
 */
function detectLegacyFormat(obj: any): string {
  if (!obj || typeof obj !== 'object') {
    return 'primitive';
  }

  if (Array.isArray(obj)) {
    return 'direct_array';
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'data')) {
    return 'wrapped_data';
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'result')) {
    return 'wrapped_result';
  }

  if (Object.prototype.hasOwnProperty.call(obj, 'items')) {
    return 'legacy_pagination';
  }

  return 'direct_object';
}

/**
 * Check if error is a validation error with field details
 */
export function isValidationError(error: ApiError): boolean {
  return error.code === 'VALIDATION_ERROR' && 
         Array.isArray(error.details) &&
         error.details.length > 0;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: ApiError): boolean {
  return error.code === 'UNAUTHORIZED' || 
         error.code === 'TOKEN_EXPIRED' ||
         error.code === 'INVALID_TOKEN';
}

/**
 * Check if error is a permission error
 */
export function isPermissionError(error: ApiError): boolean {
  return error.code === 'FORBIDDEN' || 
         error.code === 'INSUFFICIENT_PERMISSIONS';
}

/**
 * Check if error is a feature access error (plan limitation)
 */
export function isFeatureAccessError(error: ApiError): boolean {
  return error.code === 'FEATURE_NOT_AVAILABLE' ||
         error.code === 'PLAN_LIMITATION' ||
         error.code === 'UPGRADE_REQUIRED';
}

/**
 * Extract data from any response format
 * Handles ApiResponse, Legacy, and direct data
 */
export function extractResponseData<T>(response: any): T | null {
  if (isApiResponse<T>(response)) {
    return response.data;
  }

  if (isLegacyResponse<T>(response)) {
    // Handle legacy formats
    if (typeof response === 'object' && response !== null) {
      if (Object.prototype.hasOwnProperty.call(response, 'data')) {
        return (response as { data: T }).data;
      }
      if (Object.prototype.hasOwnProperty.call(response, 'result')) {
        return (response as { result: T }).result;
      }
    }
    // Direct data
    return response as T;
  }

  if (isBlobResponse(response)) {
    return response as unknown as T;
  }

  // For primitive values (strings, numbers, etc.) that are not objects
  if (typeof response !== 'object' || response === null) {
    return response as T;
  }

  return null;
}

/**
 * Type guard for checking if value is defined and not null
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Type guard for checking if array has items
 */
export function hasItems<T>(array: T[] | null | undefined): array is T[] {
  return Array.isArray(array) && array.length > 0;
}

/**
 * Type guard for checking if string is not empty
 */
export function isNonEmptyString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
/**
 * Enhanced legacy format detection with error handling
 * Requirement 7.4: Robust error handling during format detection
 */
export function safeLegacyDetection<T>(obj: any): {
  isLegacy: boolean;
  format: string | null;
  error: string | null;
} {
  try {
    const isLegacy = isLegacyResponse<T>(obj);
    const format = isLegacy ? detectLegacyFormat(obj) : null;
    
    return {
      isLegacy,
      format,
      error: null
    };
  } catch (error) {
    console.error('[Legacy Detection] Error during format detection:', error);
    return {
      isLegacy: false,
      format: null,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Validate legacy response structure before conversion
 * Requirement 7.4: Pre-conversion validation to prevent errors
 */
export function validateLegacyStructure(obj: any): {
  isValid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  try {
    // Check for null/undefined
    if (obj === null || obj === undefined) {
      issues.push('Response is null or undefined');
      return { isValid: false, issues };
    }

    // Check for circular references (common issue with legacy responses)
    try {
      JSON.stringify(obj);
    } catch (circularError) {
      issues.push('Response contains circular references');
    }

    // Check for functions (should not be in API responses)
    if (typeof obj === 'function') {
      issues.push('Response is a function');
    }

    // Check for symbols (not serializable)
    if (typeof obj === 'symbol') {
      issues.push('Response is a symbol');
    }

    // For objects, check for problematic properties
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (typeof obj[key] === 'function') {
          issues.push(`Property '${key}' is a function`);
        }
        if (typeof obj[key] === 'symbol') {
          issues.push(`Property '${key}' is a symbol`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  } catch (error) {
    issues.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    return { isValid: false, issues };
  }
}

/**
 * Extract data safely from any response format with error handling
 * Enhanced version with better error reporting
 */
export function safeExtractResponseData<T>(response: any): {
  data: T | null;
  success: boolean;
  error: string | null;
} {
  try {
    if (isApiResponse<T>(response)) {
      return {
        data: response.data,
        success: true,
        error: null
      };
    }

    if (isLegacyResponse<T>(response)) {
      const validation = validateLegacyStructure(response);
      if (!validation.isValid) {
        return {
          data: null,
          success: false,
          error: `Invalid legacy structure: ${validation.issues.join(', ')}`
        };
      }

      // Handle legacy formats safely
      if (typeof response === 'object' && response !== null) {
        if (Object.prototype.hasOwnProperty.call(response, 'data')) {
          return {
            data: (response as { data: T }).data,
            success: true,
            error: null
          };
        }
        if (Object.prototype.hasOwnProperty.call(response, 'result')) {
          return {
            data: (response as { result: T }).result,
            success: true,
            error: null
          };
        }
      }
      
      // Direct data
      return {
        data: response as T,
        success: true,
        error: null
      };
    }

    if (isBlobResponse(response)) {
      return {
        data: response as unknown as T,
        success: true,
        error: null
      };
    }

    // For primitive values
    if (typeof response !== 'object' || response === null) {
      return {
        data: response as T,
        success: true,
        error: null
      };
    }

    return {
      data: null,
      success: false,
      error: 'Unknown response format'
    };
  } catch (error) {
    return {
      data: null,
      success: false,
      error: `Data extraction failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Check if response needs legacy conversion
 * Requirement 7.1: Determine if conversion is needed
 */
export function needsLegacyConversion(obj: any): boolean {
  if (!obj) return false;
  
  // Already in correct format
  if (isApiResponse(obj)) return false;
  
  // Blob responses don't need conversion
  if (isBlobResponse(obj)) return false;
  
  // Everything else needs conversion
  return true;
}

/**
 * Get conversion strategy for legacy response
 * Requirement 7.2: Determine appropriate conversion method
 */
export function getLegacyConversionStrategy(obj: any): {
  strategy: string;
  confidence: number;
  description: string;
} {
  if (!needsLegacyConversion(obj)) {
    return {
      strategy: 'none',
      confidence: 1.0,
      description: 'No conversion needed'
    };
  }

  const format = detectLegacyFormat(obj);
  
  switch (format) {
    case 'wrapped_data':
      return {
        strategy: 'extract_data_field',
        confidence: 0.9,
        description: 'Extract from .data property'
      };
    case 'wrapped_result':
      return {
        strategy: 'extract_result_field',
        confidence: 0.9,
        description: 'Extract from .result property'
      };
    case 'legacy_pagination':
      return {
        strategy: 'normalize_pagination',
        confidence: 0.8,
        description: 'Convert legacy pagination format'
      };
    case 'direct_array':
      return {
        strategy: 'wrap_array',
        confidence: 0.7,
        description: 'Wrap direct array in ApiResponse'
      };
    case 'direct_object':
      return {
        strategy: 'wrap_object',
        confidence: 0.6,
        description: 'Wrap direct object in ApiResponse'
      };
    case 'primitive':
      return {
        strategy: 'wrap_primitive',
        confidence: 0.5,
        description: 'Wrap primitive value in ApiResponse'
      };
    default:
      return {
        strategy: 'fallback_wrap',
        confidence: 0.3,
        description: 'Fallback wrapping strategy'
      };
  }
}