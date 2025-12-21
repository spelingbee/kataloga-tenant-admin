/**
 * Type definitions for Tenant Admin Dashboard
 * 
 * This file re-exports all types for easy importing
 * Organized by domain and functionality
 */

// ============================================================================
// Enhanced API Types (New Standardized Format)
// ============================================================================
export * from './enhanced-api';

// ============================================================================
// Business Domain Types
// ============================================================================
export * from './business';

// ============================================================================
// Nuxt App Extensions
// ============================================================================

// ============================================================================
// Legacy Types (Deprecated - use enhanced-api.ts instead)
// ============================================================================

/**
 * @deprecated Use ApiResponse from enhanced-api.ts instead
 */
export interface LegacyApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: LegacyApiError
}

/**
 * @deprecated Use ApiError from enhanced-api.ts instead
 */
export interface LegacyApiError {
  code: string
  message: string
  details?: any
}

/**
 * @deprecated Use PaginationMeta from enhanced-api.ts instead
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * @deprecated Use PaginatedResult from enhanced-api.ts instead
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
