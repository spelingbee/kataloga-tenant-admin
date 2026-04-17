import type { ApiResponse, ApiError, ApiMeta, EnhancedRequestOptions } from '~/types/enhanced-api'

export interface ApiClientConfig {
  baseURL: string
  tenantSlug?: string
  timeout?: number
  retries?: number
  retryDelay?: number
}

// Request options for API calls
export interface RequestOptions {
  unwrap?: boolean
  skipErrorHandling?: boolean
  skipAuthRefresh?: boolean
  timeout?: number
  headers?: Record<string, string>
  params?: Record<string, any>
  bypassTenant?: boolean
  targetTenant?: string
  retries?: number
  successMessage?: string
}

// Enhanced request configuration with unwrapping support
export interface EnhancedRequestConfig extends RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: any
  onProgress?: (progress: number) => void
}

// Request queue for token refresh
interface QueuedRequest {
  resolve: (value: any) => void
  reject: (error: any) => void
}

/**
 * Enhanced API Client for Tenant Admin Application
 * 
 * Based on frontend architecture with ofetch, but includes:
 * - Request queue during token refresh (from tenant-admin)
 * - File/blob operations support (from tenant-admin)
 * - Bulk operations (from tenant-admin)
 * - Store-based token management (from frontend)
 * - Exponential backoff retry (from frontend)
 * 
 * @example
 * ```typescript
 * const client = createApiClient({ baseURL: 'https://api.example.com' });
 * const users = await client.get<User[]>('/users');
 * ```
 */
export class ApiClient {
  private config: Required<ApiClientConfig>
  private authStore: any
  private isRefreshing = false
  private failedQueue: QueuedRequest[] = []
  private token: string | null = null
  private isHandlingAuthFailure = false

  constructor(config: ApiClientConfig) {
    this.config = {
      timeout: 10000,
      retries: 1,
      retryDelay: 1000,
      tenantSlug: '',
      ...config,
    }
  }

  /**
   * Set the auth store for token management
   */
  setAuthStore(authStore: any) {
    this.authStore = authStore
  }

  /**
   * Set tenant slug for API requests
   */
  setTenant(tenantSlug: string): void {
    this.config.tenantSlug = tenantSlug
  }

  /**
   * Get current tenant slug
   */
  getCurrentTenant(): string {
    // Try to get from URL path
    if (import.meta.client) {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      if (pathSegments.length > 0) {
        const tenantSlug = pathSegments[0]
        const systemRoutes = ['error', 'api', 'admin', 'health', 'super-admin']
        if (tenantSlug && !systemRoutes.includes(tenantSlug)) {
          return tenantSlug
        }
      }
    }
    return this.config.tenantSlug
  }

  /**
   * Get token from auth store
   */
  getToken(): string | null {
    if (this.authStore && 'user' in this.authStore) {
      if (import.meta.client) {
        return localStorage.getItem('tenant_access_token')
      }
    }
    // Fallback if not in store or client context
    return this.token || null
  }

  /**
   * Set token in localStorage
   */
  setToken(token: string): void {
    this.token = token
    if (import.meta.client) {
      localStorage.setItem('tenant_access_token', token)
    }
  }

  /**
   * Clear token from localStorage
   */
  clearToken(): void {
    if (import.meta.client) {
      localStorage.removeItem('tenant_access_token')
      localStorage.removeItem('tenant_refresh_token')
    }
  }

  /**
   * Unwraps data from ApiResponse
   */
  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (!response.success) {
      throw this.createTypedApiError(response.error!, response.meta)
    }
    return response.data as T
  }

  /**
   * Creates a typed API error with metadata
   */
  private createTypedApiError(error: ApiError, meta: ApiMeta): ApiError & Error {
    const typedError = new Error(error.message) as ApiError & Error
    typedError.name = 'ApiError'
    typedError.code = error.code
    typedError.message = error.message
    typedError.details = error.details
    
    if (meta) {
      (typedError as any).requestId = meta.requestId;
      (typedError as any).tenantId = meta.tenantId;
      (typedError as any).timestamp = meta.timestamp;
    }
    
    return typedError
  }

  /**
   * Process queued requests after token refresh
   */
  private processQueue(error: Error | null, token: string | null = null): void {
    this.failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error)
      } else {
        prom.resolve(token)
      }
    })
    this.failedQueue = []
  }

  /**
   * Handle token refresh with request queue
   */
  private async handleTokenRefresh(): Promise<boolean> {
    if (!this.authStore) {
      return false
    }

    const refreshToken = import.meta.client 
      ? localStorage.getItem('tenant_refresh_token')
      : null

    if (!refreshToken) {
      console.warn('🔑 No refresh token found, skipping refresh attempt')
      this.handleAuthFailure()
      return false
    }

    try {
      console.log('🔐 Refreshing token...')
      // Call refresh endpoint
      const response = await $fetch<ApiResponse<{ accessToken: string; refreshToken: string }>>(
        `${this.config.baseURL}/auth/refresh`,
        {
          method: 'POST',
          body: { refreshToken },
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      )

      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        
        console.log('✅ Token refresh successful')
        // Update tokens
        this.setToken(accessToken)
        if (import.meta.client && newRefreshToken) {
          localStorage.setItem('tenant_refresh_token', newRefreshToken)
        }

        // Process queued requests
        this.processQueue(null, accessToken)
        
        return true
      } else {
        console.error('❌ Token refresh failed (API Error):', response.error?.message)
        throw new Error(response.error?.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('❌ Token refresh process failed:', error)
      this.handleAuthFailure()
      this.processQueue(error as Error, null)
    }

    return false
  }

  /**
   * Handle terminal auth failure (clear state and redirect)
   */
  private handleAuthFailure(): void {
    if (this.isHandlingAuthFailure) return
    this.isHandlingAuthFailure = true

    this.clearToken()
    
    // Notify auth store if available
    if (this.authStore && this.authStore.clearUser) {
      this.authStore.clearUser()
    }

    // Redirect to login on client side
    if (import.meta.client) {
      const tenantSlug = this.getCurrentTenant()
      const loginPath = tenantSlug ? `/${tenantSlug}/login` : '/login'
      
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        console.log(`🚀 Redirecting to login: ${loginPath}`)
        window.location.href = loginPath
      }
    }
  }

  /**
   * Implements retry logic with exponential backoff
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: {
      maxRetries: number
      retryDelay: number
      shouldRetry: (error: any, attempt: number) => boolean
    }
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === config.maxRetries) {
          break
        }

        if (!config.shouldRetry(error, attempt)) {
          throw error
        }

        // Exponential backoff with jitter
        const delay = config.retryDelay * Math.pow(2, attempt) + Math.random() * 1000
        console.log(`🔄 Retrying in ${delay.toFixed(0)}ms (attempt ${attempt + 1}/${config.maxRetries + 1})`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError || new Error('Operation failed after all retries')
  }

  /**
   * Determines if an error should be retried
   */
  private shouldRetryError(error: any, attempt: number): boolean {
    if (attempt >= this.config.retries) {
      return false
    }

    // Network errors (FetchError from ofetch)
    if (error.name === 'FetchError' || error.message?.includes('fetch')) {
      return true
    }

    // Timeout errors
    if (error.name === 'AbortError' || error.message?.includes('timeout')) {
      return true
    }

    // Extract status code from ofetch error
    const status = error.response?.status || error.status || error.statusCode
    
    if (status) {
      // ❌ NEVER retry 400 Bad Request (client errors are usually permanent)
      if (status === 400) return false

      // ✅ Retry 5xx server errors (temporary issues)
      if (status >= 500) return true
      
      // ✅ Retry specific 4xx errors (rate limit or timeout)
      if (status === 408 || status === 429) return true
      
      // 401 Unauthorized is handled separately in makeRequest through token refresh
      if (status === 401) return false
    }

    return false
  }

  /**
   * Get authenticated headers
   */
  private async getAuthHeaders(config: EnhancedRequestConfig = {}): Promise<Record<string, string>> {
    const headers: Record<string, string> = {}

    // Only set JSON content type if not sending FormData
    if (!(config.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    // Add tenant slug header
    const tenantSlug = this.getCurrentTenant()
    if (tenantSlug) {
      headers['X-Tenant-Slug'] = tenantSlug
    }

    // Add authorization header
    const token = this.getToken()
    if (token && token !== 'undefined' && token !== 'null') {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Validates and processes API response
   */
  private async processResponse<T>(
    response: any, 
    statusCode: number, 
    requestUrl: string
  ): Promise<ApiResponse<T>> {
    // Check if response is already in standard format
    if (response && typeof response === 'object' && 'success' in response && 'data' in response) {
      return response as ApiResponse<T>
    }

    // Create error response for invalid format
    const error: ApiError = {
      code: 'INVALID_RESPONSE_FORMAT',
      message: `Invalid response format from ${requestUrl}`,
      details: { response }
    }

    return {
      success: false,
      statusCode: 500,
      data: null as any,
      error,
      meta: {
        requestId: `err-${Date.now()}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Enhanced HTTP request method with queue support
   */
  private async makeRequest<T>(
    endpoint: string,
    config: EnhancedRequestConfig = {},
    useAuth: boolean = true
  ): Promise<T | ApiResponse<T>> {
    const { unwrap = true, skipErrorHandling = false, params, ...requestConfig } = config
    
    // Build URL with query parameters
    let url = `${this.config.baseURL}${endpoint}`
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString())
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    // Execute request with retry logic
    return this.executeWithRetry(
      async () => {
        // Proactive auth check: if we need auth but have no tokens, skip and fail fast
        if (useAuth && !config.skipAuthRefresh && import.meta.client) {
          const hasAccessToken = !!this.getToken()
          const hasRefreshToken = !!localStorage.getItem('tenant_refresh_token')
          
          if (!hasAccessToken && !hasRefreshToken) {
            console.warn('🔑 No tokens detected, skipping request and redirecting...')
            this.handleAuthFailure()
            throw new Error('AUTHENTICATION_REQUIRED')
          }
        }

        const headers = useAuth ? await this.getAuthHeaders(config) : { 'Content-Type': 'application/json' }

        console.log(`🌐 API ${requestConfig.method || 'GET'} ${endpoint}`)

        try {
          const response = await $fetch<ApiResponse<T>>(url, {
            method: requestConfig.method || 'GET',
            headers: { ...headers, ...requestConfig.headers },
            body: requestConfig.body && requestConfig.method !== 'GET' ? requestConfig.body : undefined,
            timeout: requestConfig.timeout || this.config.timeout,
            credentials: 'include',
            // @ts-ignore - onRequest is supported by ofetch
            onRequest: requestConfig.onProgress ? ({ options }) => {
              // Progress tracking will be handled separately
            } : undefined,
          })

          console.log(`✅ ${endpoint} OK`)
          
          Object.assign(response, { statusCode: response.statusCode || 200 })

          // Handle automatic success message (Requirement 10.5)
          if (import.meta.client && unwrap && config.successMessage) {
              try {
                  const nuxtApp = useNuxtApp()
                  if (nuxtApp.$toast) {
                      nuxtApp.$toast.success(config.successMessage)
                  }
              } catch (e) {
                  console.warn('Could not show success toast:', e)
              }
          }

          // Return unwrapped data or full response
          return unwrap ? this.unwrapResponse<T>(response) : response
        } catch (fetchError: any) {
          // Handle 401 with request queue
          if (fetchError.status === 401 && useAuth && !config.skipAuthRefresh) {
            console.log('🔐 401 received, attempting token refresh')
            
            // If already refreshing, add to queue
            if (this.isRefreshing) {
              return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject })
              }).then(async (token) => {
                // Retry with new token
                const newHeaders = await this.getAuthHeaders(config)
                const retryResponse = await $fetch<ApiResponse<T>>(url, {
                  method: requestConfig.method || 'GET',
                  headers: { ...newHeaders, ...requestConfig.headers },
                  body: requestConfig.body && requestConfig.method !== 'GET' ? requestConfig.body : undefined,
                  credentials: 'include',
                })
                return unwrap ? this.unwrapResponse<T>(retryResponse) : retryResponse
              })
            }

            this.isRefreshing = true

            try {
              const refreshed = await this.handleTokenRefresh()
              if (refreshed) {
                console.log('✅ Token refreshed, retrying request')
                
                // Retry with new token
                const newHeaders = await this.getAuthHeaders(config)
                const retryResponse = await $fetch<ApiResponse<T>>(url, {
                  method: requestConfig.method || 'GET',
                  headers: { ...newHeaders, ...requestConfig.headers },
                  body: requestConfig.body && requestConfig.method !== 'GET' ? requestConfig.body : undefined,
                  credentials: 'include',
                })
                
                this.isRefreshing = false
                return unwrap ? this.unwrapResponse<T>(retryResponse) : retryResponse
              } else {
                this.isRefreshing = false
                throw new Error('Token refresh failed')
              }
            } catch (refreshError) {
              this.isRefreshing = false
              throw refreshError
            }
          }

          // Handle other errors
          console.error('❌ API Error:', fetchError)
          throw fetchError
        }
      },
      {
        maxRetries: requestConfig.retries ?? this.config.retries,
        retryDelay: this.config.retryDelay,
        shouldRetry: this.shouldRetryError.bind(this)
      }
    )
  }

  // =============================================================================
  // PUBLIC HTTP METHODS
  // =============================================================================

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'GET',
      unwrap: options?.unwrap !== false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<T>
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'POST', 
      body,
      unwrap: options?.unwrap !== false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<T>
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'PUT', 
      body,
      unwrap: options?.unwrap !== false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<T>
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'PATCH', 
      body,
      unwrap: options?.unwrap !== false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<T>
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'DELETE',
      unwrap: options?.unwrap !== false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<T>
  }

  // =============================================================================
  // RAW RESPONSE METHODS (return full ApiResponse)
  // =============================================================================

  async getRaw<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'GET',
      unwrap: false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<ApiResponse<T>>
  }

  async postRaw<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const config: EnhancedRequestConfig = { 
      ...options, 
      method: 'POST', 
      body,
      unwrap: false
    }
    return this.makeRequest<T>(endpoint, config) as Promise<ApiResponse<T>>
  }

  /**
   * Get paginated data
   */
  async getPaginated<T>(
    endpoint: string,
    params?: any,
    options?: RequestOptions
  ): Promise<any> {
    const response = await this.getRaw<T[]>(endpoint, {
      ...options,
      params
    });

    if (!response.success) {
      throw this.createTypedApiError(response.error!, response.meta);
    }

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
    options?: RequestOptions
  ): Promise<any> {
    const response = await this.postRaw<any>(endpoint, { items }, {
      ...options
    });

    if (!response.success) {
      throw this.createTypedApiError(response.error!, response.meta);
    }

    const data = response.data!;

    return {
      successful: data.successful || [],
      failed: data.failed || [],
      totalProcessed: items.length,
      successCount: data.successful?.length || 0,
      errorCount: data.failed?.length || 0
    };
  }
}

/**
 * Create API client instance
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return new ApiClient(config)
}
