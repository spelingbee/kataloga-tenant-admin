/**
 * Enhanced API Types for Tenant Admin
 * 
 * Standardized API response format matching backend ApiResponse<T>
 * Supports admin-specific features: file operations, bulk operations, nested validation
 */

import type { AxiosRequestConfig } from 'axios';

// ============================================================================
// Core API Response Types (Backend Contract)
// ============================================================================

/**
 * Standardized API response wrapper
 * All backend endpoints return data in this format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}

/**
 * Standardized error structure
 */
export interface ApiError {
  code: string;           // Machine-readable code: 'VALIDATION_ERROR', 'USER_NOT_FOUND'
  message: string;        // Human-readable message
  details?: ApiErrorDetail[] | Record<string, any>; // Validation errors or additional context
  requestId?: string;     // For error tracing (added by interceptor)
}

/**
 * Validation error detail for form fields
 * Supports nested fields with dot-notation: "items.0.price"
 */
export interface ApiErrorDetail {
  field: string;
  message: string;
  value?: any; // The value that failed validation
}

/**
 * Response metadata
 */
export interface ApiMeta {
  requestId: string;      // Unique request identifier for tracing
  timestamp: string;      // ISO 8601 timestamp
  tenantId?: string;      // Tenant context
  pagination?: PaginationMeta;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

// ============================================================================
// Application-Level Types (ViewModel)
// ============================================================================

/**
 * Paginated result for list views
 * Clean data structure without API wrapper
 */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Enhanced request options for admin operations
 */
export interface EnhancedRequestOptions extends AxiosRequestConfig {
  unwrap?: boolean;              // true: return data, false: return ApiResponse
  skipErrorHandling?: boolean;   // true: don't show automatic Toast
  isBlob?: boolean;              // true: don't parse JSON (for file downloads)
  successMessage?: string;       // Automatic Toast on success
  showProgress?: boolean;        // Show progress indicator for large operations
  timeout?: number;              // Request timeout in milliseconds
  skipAuthRefresh?: boolean;     // Prevent recursive refresh (internal use)
  onProgress?: (progress: number) => void; // Progress callback for file operations
}

// ============================================================================
// Bulk Operations
// ============================================================================

/**
 * Request for bulk operations
 */
export interface BulkOperationRequest<T> {
  items: T[];
  operation: string;
  options?: Record<string, any>;
}

/**
 * Response from bulk operations
 */
export interface BulkOperationResponse<T> {
  successful: T[];
  failed: BulkOperationError[];
  summary: BulkOperationSummary;
}

/**
 * Error for individual item in bulk operation
 */
export interface BulkOperationError {
  item: any;
  error: ApiError;
  index: number;
}

/**
 * Summary of bulk operation results
 */
export interface BulkOperationSummary {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

/**
 * Simplified bulk result for stores
 */
export interface BulkOperationResult<T> {
  successful: T[];
  failed: BulkOperationError[];
  totalProcessed: number;
  successCount: number;
  errorCount: number;
}

// ============================================================================
// Authentication Types
// ============================================================================

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
  tenantSlug?: string;
}

/**
 * Login response data
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
}

/**
 * Token refresh response
 */
export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

/**
 * User data
 */
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
}

// ============================================================================
// Request Queue (for Silent Refresh)
// ============================================================================

/**
 * Queued request during token refresh
 */
export interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

// ============================================================================
// File Operations
// ============================================================================

/**
 * File download options
 */
export interface FileDownloadOptions {
  filename?: string;
  successMessage?: string;
  showProgress?: boolean;
  onProgress?: (progress: number) => void;
}

/**
 * Report generation request
 */
export interface ReportRequest {
  type: ReportType;
  format: ReportFormat;
  dateFrom?: string;
  dateTo?: string;
  filters?: Record<string, any>;
}

export enum ReportType {
  SALES = 'sales',
  INVENTORY = 'inventory',
  ANALYTICS = 'analytics',
  AUDIT = 'audit',
}

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

// ============================================================================
// Legacy Compatibility
// ============================================================================

/**
 * Legacy response format (for backwards compatibility)
 */
export type LegacyResponse<T> = T | { data: T } | { result: T } | Record<string, any>;

/**
 * Type guard result with detailed format information
 */
export interface ResponseTypeInfo {
  isApiResponse: boolean;
  isLegacy: boolean;
  isBlob: boolean;
  format?: string; // Detailed format description for debugging
}
