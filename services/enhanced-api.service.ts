/**
 * Enhanced API Service for Tenant Admin
 * 
 * Features:
 * - Request Queue for silent token refresh
 * - Automatic response unwrapping
 * - Blob/File operation support
 * - Bulk operations handling
 * - Legacy format compatibility
 * - Enhanced error handling with tracing
 */

import type { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Extended Axios config with progress support
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  onProgress?: (progress: number) => void;
}
import type {
  ApiResponse,
  ApiError,
  ApiMeta,
  EnhancedRequestOptions,
  PaginatedResult,
  BulkOperationResult,
  BulkOperationResponse,
  QueuedRequest,
  FileDownloadOptions,
  ReportRequest
} from '~/types/enhanced-api';
import { 
  isApiResponse, 
  analyzeResponseType
} from '~/utils/type-guards';
import { 
  normalizeResponse
} from '~/utils/response-normalizer';
import { 
  processLegacyResponse,
  LegacyCompatibilityManager
} from '~/utils/legacy-compatibility';

export class EnhancedApiService {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueuedRequest[] = [];
  private toast: any;
  private router: any;
  private nuxtApp: any;

  constructor(
    axiosInstance: AxiosInstance,
    toast: any,
    router: any,
    nuxtApp: any
  ) {
    this.axiosInstance = axiosInstance;
    this.toast = toast;
    this.router = router;
    this.nuxtApp = nuxtApp;
    
    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors with queue support
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and tenant context
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add tenant slug from subdomain to headers
        if (import.meta.client) {
          const { getTenantSlug } = useTenant();
          const tenantSlug = getTenantSlug();
          if (tenantSlug) {
            config.headers['X-Tenant-Slug'] = tenantSlug;
          }
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor with queue handling
    this.axiosInstance.interceptors.response.use(
      (response) => this.processSuccessResponse(response),
      async (error: AxiosError) => this.processErrorResponse(error)
    );
  }

  /**
   * Track request performance
   * Requirement 9.5: Performance logging
   */
  private trackRequestPerformance(
    operation: string,
    startTime: number,
    endpoint: string,
    error?: Error
  ): void {
    const duration = performance.now() - startTime;
    
    // Use enhanced logger asynchronously without blocking
    import('~/composables/useEnhancedLogger').then(({ useEnhancedLogger }) => {
      const { trackPerformance } = useEnhancedLogger();
      
      trackPerformance(operation, duration, {
        url: endpoint,
        requestId: `perf-${Date.now()}`,
        payload: error ? { error: error.message } : undefined
      });
    }).catch(() => {
      // Fallback to console logging if enhanced logger is not available
      if (duration > 5000) { // Log slow operations
        console.warn(`Slow API operation: ${operation} took ${duration.toFixed(2)}ms`);
      }
    });
  }

  /**
   * Process successful responses with unwrapping and normalization
   */
  private processSuccessResponse(response: AxiosResponse): AxiosResponse {
    // Skip processing for blob responses
    if (response.config.responseType === 'blob') {
      return response;
    }

    // Analyze response type
    const analysis = analyzeResponseType(response.data);
    
    if (!analysis.isApiResponse) {
      // Use legacy compatibility manager for comprehensive processing
      const legacyManager = LegacyCompatibilityManager.getInstance();
      response.data = legacyManager.processResponse(
        response.data,
        response.config.url,
        {
          enableLogging: import.meta.dev,
          enableStats: true,
          strictValidation: false
        }
      );
      
      // Log legacy detection using enhanced logger
      this.logLegacyDetection(
        response.config.url || 'unknown',
        analysis.format || 'unknown',
        response.data
      );
    }

    return response;
  }

  /**
   * Log legacy format detection
   * Requirement 9.4: Legacy format detection logging
   */
  private logLegacyDetection(
    url: string,
    format: string,
    responseData?: any
  ): void {
    // Use enhanced logger asynchronously without blocking
    import('~/composables/useEnhancedLogger').then(({ useEnhancedLogger }) => {
      const { logLegacyDetection } = useEnhancedLogger();
      
      logLegacyDetection(
        url,
        format,
        `legacy-${Date.now()}`,
        import.meta.dev ? responseData : undefined
      );
    }).catch(() => {
      // Fallback to console logging if enhanced logger is not available
      if (import.meta.dev) {
        console.warn(`[Legacy Detection] ${format} format detected for: ${url}`);
      }
    });
  }

  /**
   * Process error responses with queue handling
   */
  private async processErrorResponse(error: AxiosError): Promise<any> {
    const originalRequest = error.config as AxiosRequestConfig & { 
      _retry?: boolean;
      skipAuthRefresh?: boolean;
    };

    // Handle 401 with request queue
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.skipAuthRefresh) {
      
      // If already refreshing, add to queue
      if (this.isRefreshing) {
        return new Promise((resolve, reject) => {
          this.failedQueue.push({ resolve, reject });
        }).then(token => {
          if (originalRequest.headers && token) {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
          }
          return this.axiosInstance(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        // Get auth store and attempt silent refresh
        try {
          // Try to get token from localStorage directly as fallback
          const token = this.getToken();
          if (token) {
            // Try to refresh using current auth store
            const { fetchUser } = useAuth();
            await fetchUser();
            
            if (originalRequest.headers && token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            this.processQueue(null, token);
            return this.axiosInstance(originalRequest);
          } else {
            throw new Error('No token available for refresh');
          }
        } catch (refreshError) {
          console.warn('Token refresh failed, redirecting to login');
          throw new Error('Token refresh failed');
        }
        
      } catch (refreshError) {
        this.processQueue(refreshError, null);
        await this.router.push('/login');
        return Promise.reject(refreshError);
      } finally {
        this.isRefreshing = false;
      }
    }

    // Handle blob errors (JSON inside Blob)
    if (originalRequest.responseType === 'blob' && error.response?.data instanceof Blob) {
      try {
        const text = await error.response.data.text();
        const errorData = JSON.parse(text);
        if (isApiResponse(errorData) && !errorData.success) {
          throw this.createApiError(errorData.error!, errorData.meta);
        }
      } catch (parseError) {
        // If parsing fails, continue with original error
      }
    }

    return Promise.reject(error);
  }

  /**
   * Process request queue after token refresh
   */
  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  /**
   * Main request method with enhanced options and progress support
   * Requirement 10.3: Progress indication for large operations
   * Requirement 9.5: Performance logging
   */
  private async makeRequest<T>(
    endpoint: string,
    config: EnhancedRequestOptions = {}
  ): Promise<T> {
    const { 
      unwrap = true, 
      skipErrorHandling = false, 
      isBlob = false,
      successMessage,
      showProgress = false,
      onProgress,
      ...requestConfig 
    } = config;
    
    // Start performance tracking
    const startTime = performance.now();
    const operation = `${requestConfig.method || 'GET'} ${endpoint}`;
    
    // Handle blob requests
    if (isBlob || requestConfig.responseType === 'blob') {
      const result = await this.handleBlobRequest<T>(endpoint, {
        ...requestConfig,
        onProgress
      }, successMessage);
      
      // Track performance
      this.trackRequestPerformance(operation, startTime, endpoint);
      
      return result;
    }
    
    // Show progress indicator for large operations
    let progressToastId: string | undefined;
    if (showProgress && this.toast) {
      progressToastId = 'api-progress-' + Date.now();
      this.toast.info('Загрузка...', { duration: 0, id: progressToastId });
    }
    
    try {
      // Execute HTTP request with progress tracking
      const response = await this.axiosInstance.request({
        ...requestConfig,
        url: endpoint,
        // Add progress tracking for uploads
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
        // Add progress tracking for downloads
        onDownloadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        }
      });
      
      // Hide progress indicator
      if (progressToastId && this.toast) {
        this.toast.dismiss(progressToastId);
      }
      
      // Track successful request performance
      this.trackRequestPerformance(operation, startTime, endpoint);
      
      const result = await this.processResponse<T>(response.data, { unwrap, skipErrorHandling, successMessage });
      return result as T;
      
    } catch (error) {
      // Hide progress indicator on error
      if (progressToastId && this.toast) {
        this.toast.dismiss(progressToastId);
      }
      
      // Track failed request performance
      this.trackRequestPerformance(operation, startTime, endpoint, error as Error);
      
      throw error;
    }
  }

  /**
   * Handle blob requests for file operations with enhanced error handling
   * Requirement 10.1: Automatic binary data detection
   * Requirement 10.3: Progress indication for large files
   * Requirement 10.4: Enhanced error handling for reports
   */
  private async handleBlobRequest<T>(
    endpoint: string, 
    config: ExtendedAxiosRequestConfig,
    successMessage?: string
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.request({
        ...config,
        url: endpoint,
        responseType: 'blob',
        // Add progress tracking for large files
        onDownloadProgress: (progressEvent) => {
          if (config.onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            config.onProgress(progress);
          }
        }
      });
      
      // Requirement 10.1: Verify we actually got binary data
      const contentType = response.headers['content-type'] || '';
      if (!this.isBinaryContent(contentType)) {
        // This might be an error response disguised as a blob
        try {
          const text = await response.data.text();
          const errorData = JSON.parse(text);
          
          if (isApiResponse(errorData) && !errorData.success) {
            // This is actually an error response, not a file
            throw this.createApiError(errorData.error!, errorData.meta);
          }
        } catch (parseError) {
          // If we can't parse it, assume it's actually binary data
          console.warn(`[File Operations] Unexpected content-type for blob: ${contentType}`);
        }
      }
      
      // Handle file download
      this.handleFileDownload(response, successMessage);
      
      return response.data as T;
      
    } catch (error: any) {
      // Enhanced error handling for file operations
      if (error.code) {
        // This is already an API error, re-throw it
        throw error;
      }
      
      // Handle network and other errors
      if (error.response?.status === 413) {
        throw this.createApiError({
          code: 'FILE_TOO_LARGE',
          message: 'Файл слишком большой для обработки'
        }, {
          requestId: `file-error-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.response?.status === 503) {
        throw this.createApiError({
          code: 'FILE_GENERATION_ERROR',
          message: 'Сервис генерации файлов временно недоступен'
        }, {
          requestId: `file-error-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Generic file operation error
      throw this.createApiError({
        code: 'FILE_OPERATION_ERROR',
        message: error.message || 'Ошибка при работе с файлом'
      }, {
        requestId: `file-error-${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Handle file download with enhanced filename extraction and binary detection
   * Requirement 10.1: Automatic binary data detection
   * Requirement 10.2: Enhanced Content-Disposition header handling
   * Requirement 10.5: Success download notifications
   */
  private handleFileDownload(response: AxiosResponse, successMessage?: string): void {
    // Enhanced filename extraction with multiple format support
    const filename = this.extractFilenameFromHeaders(response.headers as Record<string, string>);
    
    // Requirement 10.1: Verify this is actually binary data
    const contentType = response.headers['content-type'] || '';
    if (!this.isBinaryContent(contentType) && response.data instanceof Blob) {
      console.warn(`[File Operations] Expected binary data but got content-type: ${contentType}`);
    }
    
    // Create download link (client-side only)
    if (import.meta.client) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      
      // Add additional attributes for better download handling
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      // Enhanced success message with file info
      const fileSize = response.data.size ? this.formatFileSize(response.data.size) : '';
      const message = successMessage || `Файл "${filename}" успешно скачан${fileSize ? ` (${fileSize})` : ''}`;
      
      if (this.toast) {
        this.toast.success(message);
      }
    }
  }

  /**
   * Enhanced filename extraction from Content-Disposition header
   * Requirement 10.2: Proper Content-Disposition header handling
   */
  private extractFilenameFromHeaders(headers: Record<string, string>): string {
    const contentDisposition = headers['content-disposition'] || headers['Content-Disposition'];
    
    if (!contentDisposition) {
      // Fallback to content-type based filename
      const contentType = headers['content-type'] || '';
      return this.generateFilenameFromContentType(contentType);
    }

    // Handle different Content-Disposition formats according to RFC 6266
    const patterns = [
      // RFC 5987 format: filename*=UTF-8''example.pdf
      /filename\*=UTF-8''([^;]+)/i,
      // RFC 2231 format: filename*=utf-8'en'example.pdf  
      /filename\*=utf-8'[^']*'([^;]+)/i,
      // Standard quoted format: filename="example.pdf"
      /filename="([^"]+)"/i,
      // Unquoted format: filename=example.pdf
      /filename=([^;,\n\r]+)/i
    ];

    for (const pattern of patterns) {
      const match = contentDisposition.match(pattern);
      if (match && match[1]) {
        try {
          // Decode URI component for RFC 5987/2231 formats
          const filename = decodeURIComponent(match[1].trim());
          return filename || 'download';
        } catch (error) {
          // If decoding fails, use raw value
          return match[1].trim() || 'download';
        }
      }
    }

    return 'download';
  }

  /**
   * Check if content type indicates binary data
   * Requirement 10.1: Automatic binary data detection
   */
  private isBinaryContent(contentType: string): boolean {
    const binaryTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
      'application/x-zip-compressed',
      'application/octet-stream',
      'image/',
      'video/',
      'audio/'
    ];

    return binaryTypes.some(type => contentType.toLowerCase().includes(type.toLowerCase()));
  }

  /**
   * Generate filename based on content type
   */
  private generateFilenameFromContentType(contentType: string): string {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    
    if (contentType.includes('pdf')) return `report_${timestamp}.pdf`;
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return `report_${timestamp}.xlsx`;
    if (contentType.includes('csv')) return `report_${timestamp}.csv`;
    if (contentType.includes('zip')) return `archive_${timestamp}.zip`;
    
    return `download_${timestamp}`;
  }

  /**
   * Format file size for display
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  /**
   * Process response with success feedback and error handling
   */
  private async processResponse<T>(
    response: ApiResponse<T> | null, 
    options: { unwrap: boolean; skipErrorHandling: boolean; successMessage?: string }
  ): Promise<T | ApiResponse<T>> {
    // Handle null responses (e.g., 204 No Content)
    if (response === null) {
      return null as T;
    }

    if (!response.success) {
      if (!options.skipErrorHandling) {
        await this.handleApiError(response.error!, response.meta);
      }
      throw this.createApiError(response.error!, response.meta);
    }
    
    // Show success message if provided
    if (options.successMessage && this.toast) {
      this.toast.success(options.successMessage);
    }
    
    return options.unwrap ? response.data! : response;
  }

  /**
   * Create enhanced API error with tracing
   */
  private createApiError(error: ApiError | null, meta?: ApiMeta): Error {
    const errorMessage = error?.message || 'Unknown API error';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    const apiError = new Error(errorMessage) as Error & ApiError;
    apiError.code = errorCode;
    apiError.message = errorMessage;
    apiError.details = error?.details;
    apiError.requestId = meta?.requestId || 'unknown';
    return apiError;
  }

  /**
   * Handle API errors with enhanced logging and toast notifications
   * Requirement 9.1: RequestId display in toast notifications
   * Requirement 9.3: Full error context logging
   */
  private async handleApiError(error: ApiError, meta?: ApiMeta): Promise<void> {
    // Use enhanced logger for structured logging
    try {
      const { useEnhancedLogger } = await import('~/composables/useEnhancedLogger');
      const { logApiError } = useEnhancedLogger();
      
      logApiError(error, {
        requestId: meta?.requestId || 'unknown',
        url: this.axiosInstance.defaults.baseURL,
        tenantId: meta?.tenantId,
        timestamp: meta?.timestamp || new Date().toISOString()
      });
    } catch (importError) {
      // Fallback to console logging if enhanced logger is not available
      console.error(`API Error [${meta?.requestId || 'unknown'}]:`, error);
    }
    
    // Always try fallback toast first in test environment, then enhanced toast
    let toastShown = false;
    
    // Fallback to basic toast (always available)
    if (this.toast && error) {
      const message = `${error.message || 'Unknown error'} (ID: ${meta?.requestId || 'unknown'})`;
      this.toast.error(message);
      toastShown = true;
    }
    
    // Try enhanced toast as well (if available)
    if (!toastShown) {
      try {
        const { useEnhancedToast } = await import('~/composables/useEnhancedToast');
        const { apiError: showApiError } = useEnhancedToast();
        
        if (meta) {
          showApiError(error, meta);
        }
      } catch (importError) {
        // Enhanced toast not available, fallback already handled above
      }
    }
  }

  // ============================================================================
  // Public API Methods
  // ============================================================================

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: EnhancedRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options?: EnhancedRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'POST', data });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options?: EnhancedRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PUT', data });
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: any, options?: EnhancedRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: EnhancedRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get paginated data
   */
  async getPaginated<T>(
    endpoint: string, 
    params?: any, 
    options?: EnhancedRequestOptions
  ): Promise<PaginatedResult<T>> {
    const response = await this.get<ApiResponse<T[]>>(endpoint, { 
      ...options, 
      unwrap: false,
      params 
    });
    
    return {
      items: response.data || [],
      pagination: response.meta.pagination!
    };
  }

  /**
   * Bulk operations with partial failure handling
   */
  async bulkOperation<T>(
    endpoint: string,
    items: any[],
    options?: EnhancedRequestOptions
  ): Promise<BulkOperationResult<T>> {
    const response = await this.post<ApiResponse<BulkOperationResponse<T>>>(endpoint, { items }, {
      ...options,
      unwrap: false
    });
    
    const data = response.data!;
    
    return {
      successful: data.successful || [],
      failed: data.failed || [],
      totalProcessed: items.length,
      successCount: data.successful?.length || 0,
      errorCount: data.failed?.length || 0
    };
  }

  /**
   * Download file (returns void, triggers browser download)
   */
  async downloadFile(
    endpoint: string, 
    params?: any,
    options?: FileDownloadOptions
  ): Promise<void> {
    await this.get(endpoint, {
      isBlob: true,
      params,
      successMessage: options?.filename ? `Файл ${options.filename} скачан` : undefined,
      showProgress: options?.showProgress
    });
  }

  /**
   * Get blob data (returns Blob object)
   */
  async getBlob(
    endpoint: string,
    params?: any,
    options?: EnhancedRequestOptions
  ): Promise<Blob> {
    const response = await this.axiosInstance.request({
      url: endpoint,
      method: 'GET',
      params,
      responseType: 'blob',
      ...options
    });
    
    return response.data;
  }

  /**
   * Generate and download report with enhanced error handling
   * Requirement 10.3: Progress indication for large reports
   * Requirement 10.4: Enhanced error handling for reports
   * Requirement 10.5: Success notifications
   */
  async downloadReport(
    reportRequest: ReportRequest,
    options?: FileDownloadOptions
  ): Promise<void> {
    const filename = `${reportRequest.type}-report-${new Date().toISOString().slice(0, 10)}.${reportRequest.format}`;
    
    try {
      await this.post('/reports/generate', reportRequest, {
        isBlob: true,
        successMessage: options?.successMessage || `Отчет "${reportRequest.type}" готов`,
        showProgress: options?.showProgress ?? true,
        timeout: 60000, // 60 seconds for report generation
        onProgress: (progress: number) => {
          // Report generation progress callback
          if (options?.onProgress) {
            options.onProgress(progress);
          }
        }
      });
    } catch (error: any) {
      // Enhanced error handling for report generation
      if (error.response?.status === 422) {
        throw this.createApiError({
          code: 'REPORT_VALIDATION_ERROR',
          message: 'Неверные параметры отчета',
          details: error.response.data?.error?.details
        }, {
          requestId: error.response.data?.meta?.requestId || `report-error-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.response?.status === 413) {
        throw this.createApiError({
          code: 'REPORT_DATA_TOO_LARGE',
          message: 'Слишком много данных для отчета. Попробуйте уменьшить период или применить фильтры.'
        }, {
          requestId: `report-error-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw this.createApiError({
          code: 'REPORT_GENERATION_TIMEOUT',
          message: 'Генерация отчета заняла слишком много времени. Попробуйте уменьшить объем данных.'
        }, {
          requestId: `report-timeout-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      if (error.response?.status === 403) {
        throw this.createApiError({
          code: 'FEATURE_NOT_AVAILABLE',
          message: 'Генерация отчетов недоступна в вашем тарифном плане'
        }, {
          requestId: error.response.data?.meta?.requestId || `report-error-${Date.now()}`,
          timestamp: new Date().toISOString()
        });
      }
      
      // Re-throw if it's already an enhanced error
      if (error.code) {
        throw error;
      }
      
      // Generic report error
      throw this.createApiError({
        code: 'REPORT_GENERATION_ERROR',
        message: error.message || 'Ошибка при генерации отчета'
      }, {
        requestId: `report-error-${Date.now()}`,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Upload file with progress
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    options?: EnhancedRequestOptions & { onProgress?: (progress: number) => void }
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<T>(endpoint, formData, {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...options?.headers
      },
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          options.onProgress(progress);
        }
      }
    });
  }

  // ============================================================================
  // Token Management (for backward compatibility)
  // ============================================================================

  /**
   * Set access token for authenticated requests
   */
  setToken(token: string): void {
    if (import.meta.client) {
      localStorage.setItem('tenant_access_token', token);
    }
    // Update axios default headers
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    if (import.meta.client) {
      return localStorage.getItem('tenant_access_token');
    }
    return null;
  }

  /**
   * Clear access token
   */
  clearToken(): void {
    if (import.meta.client) {
      localStorage.removeItem('tenant_access_token');
      localStorage.removeItem('tenant_refresh_token');
    }
    // Remove from axios headers
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // ============================================================================
  // Legacy Compatibility Methods
  // ============================================================================

  /**
   * Get legacy compatibility statistics
   * Requirement 7.3: Development monitoring
   */
  getLegacyStats(): Record<string, number> {
    const manager = LegacyCompatibilityManager.getInstance();
    return manager.getConversionStats();
  }

  /**
   * Generate legacy compatibility report
   * Requirement 7.3: Development reporting
   */
  generateLegacyReport() {
    const manager = LegacyCompatibilityManager.getInstance();
    return manager.generateCompatibilityReport();
  }

  /**
   * Clear legacy compatibility logs
   * Requirement 7.5: Production cleanup
   */
  clearLegacyLogs(): void {
    const manager = LegacyCompatibilityManager.getInstance();
    manager.clearLogs();
  }

  /**
   * Check if legacy cleanup is needed
   * Requirement 7.5: Production maintenance
   */
  needsLegacyCleanup(): boolean {
    const manager = LegacyCompatibilityManager.getInstance();
    return manager.needsCleanup();
  }
}