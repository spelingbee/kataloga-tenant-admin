/**
 * API Helper Utilities
 * 
 * Common utilities for API operations in tenant admin
 * Includes pagination, error handling, and data transformation helpers
 */

import type { 
  PaginatedResult, 
  PaginationMeta, 
  ApiError,
  BulkOperationResult,
  BulkOperationError 
} from '~/types/enhanced-api';

// ============================================================================
// Pagination Helpers
// ============================================================================

/**
 * Create empty paginated result
 */
export function createEmptyPaginatedResult<T>(): PaginatedResult<T> {
  return {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 0
    }
  };
}

/**
 * Create paginated result from data and meta
 */
export function createPaginatedResult<T>(
  items: T[],
  pagination: PaginationMeta
): PaginatedResult<T> {
  return {
    items,
    pagination
  };
}

/**
 * Calculate pagination info
 */
export function calculatePagination(
  totalItems: number,
  page: number = 1,
  limit: number = 10
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);
  
  return {
    page: Math.max(1, page),
    limit: Math.max(1, limit),
    totalItems: Math.max(0, totalItems),
    totalPages: Math.max(0, totalPages)
  };
}

/**
 * Get pagination query parameters
 */
export function getPaginationParams(
  page: number = 1,
  limit: number = 10,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc'
): Record<string, any> {
  const params: Record<string, any> = {
    page,
    limit
  };

  if (sortBy) {
    params.sortBy = sortBy;
    params.sortOrder = sortOrder || 'asc';
  }

  return params;
}

// ============================================================================
// Error Handling Helpers
// ============================================================================

/**
 * Create API error object
 */
export function createApiError(
  code: string,
  message: string,
  details?: any,
  requestId?: string
): ApiError {
  return {
    code,
    message,
    details,
    requestId
  };
}

/**
 * Extract validation errors from API error
 */
export function extractValidationErrors(error: ApiError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.code === 'VALIDATION_ERROR' && Array.isArray(error.details)) {
    error.details.forEach((detail: any) => {
      if (detail.field && detail.message) {
        fieldErrors[detail.field] = detail.message;
      }
    });
  }

  return fieldErrors;
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: ApiError): boolean {
  const retryableCodes = [
    'TIMEOUT',
    'NETWORK_ERROR',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR'
  ];

  return retryableCodes.includes(error.code);
}

// ============================================================================
// Bulk Operation Helpers
// ============================================================================

/**
 * Create empty bulk operation result
 */
export function createEmptyBulkResult<T>(): BulkOperationResult<T> {
  return {
    successful: [],
    failed: [],
    totalProcessed: 0,
    successCount: 0,
    errorCount: 0
  };
}

/**
 * Create bulk operation result from response data
 */
export function createBulkResult<T>(
  successful: T[],
  failed: BulkOperationError[],
  totalProcessed: number
): BulkOperationResult<T> {
  return {
    successful,
    failed,
    totalProcessed,
    successCount: successful.length,
    errorCount: failed.length
  };
}

/**
 * Check if bulk operation was completely successful
 */
export function isBulkOperationSuccess<T>(result: BulkOperationResult<T>): boolean {
  return result.errorCount === 0 && result.successCount > 0;
}

/**
 * Check if bulk operation had partial success
 */
export function isBulkOperationPartial<T>(result: BulkOperationResult<T>): boolean {
  return result.successCount > 0 && result.errorCount > 0;
}

/**
 * Get bulk operation summary message
 */
export function getBulkOperationSummary<T>(result: BulkOperationResult<T>): string {
  if (isBulkOperationSuccess(result)) {
    return `Успешно обработано ${result.successCount} элементов`;
  }

  if (isBulkOperationPartial(result)) {
    return `Обработано ${result.successCount} из ${result.totalProcessed} элементов. ${result.errorCount} ошибок`;
  }

  return `Не удалось обработать ${result.errorCount} элементов`;
}

// ============================================================================
// Data Transformation Helpers
// ============================================================================

/**
 * Transform array to lookup map by key
 */
export function arrayToMap<T>(
  array: T[],
  keyField: keyof T
): Map<string, T> {
  const map = new Map<string, T>();
  
  array.forEach(item => {
    const key = String(item[keyField]);
    map.set(key, item);
  });

  return map;
}

/**
 * Transform array to lookup object by key
 */
export function arrayToLookup<T>(
  array: T[],
  keyField: keyof T
): Record<string, T> {
  const lookup: Record<string, T> = {};
  
  array.forEach(item => {
    const key = String(item[keyField]);
    lookup[key] = item;
  });

  return lookup;
}

/**
 * Group array items by field value
 */
export function groupBy<T>(
  array: T[],
  keyField: keyof T
): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  
  array.forEach(item => {
    const key = String(item[keyField]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  });

  return groups;
}

/**
 * Sort array by field with direction
 */
export function sortBy<T>(
  array: T[],
  field: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// ============================================================================
// URL & Query Helpers
// ============================================================================

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Parse query string to object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export function isEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Check if email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if phone format is valid (basic check)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Check if URL format is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Date & Time Helpers
// ============================================================================

/**
 * Format date to local string
 */
export function formatDate(date: string | Date, locale: string = 'ru-RU'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale);
}

/**
 * Format datetime to local string
 */
export function formatDateTime(date: string | Date, locale: string = 'ru-RU'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleString(locale);
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date, locale: string = 'ru-RU'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return rtf.format(-diffDays, 'day');
  if (diffHours > 0) return rtf.format(-diffHours, 'hour');
  if (diffMinutes > 0) return rtf.format(-diffMinutes, 'minute');
  return rtf.format(-diffSeconds, 'second');
}