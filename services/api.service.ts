import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'

/**
 * API Service for Tenant Admin Dashboard
 * Handles all HTTP requests to the backend API with authentication and error handling
 */
class ApiService {
  private axiosInstance: AxiosInstance
  private accessToken: string | null = null

  constructor() {
    const config = useRuntimeConfig()
    
    this.axiosInstance = axios.create({
      baseURL: config.public.apiBaseUrl as string,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token and tenant header
    this.axiosInstance.interceptors.request.use(
      (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`
        }
        
        // Add tenant slug from subdomain to headers
        if (import.meta.client) {
          const { getTenantSlug } = useTenant()
          const tenantSlug = getTenantSlug()
          if (tenantSlug) {
            config.headers['X-Tenant-Slug'] = tenantSlug
          }
        }
        
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

        // Handle 401 Unauthorized - token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            // Try to refresh token
            await this.refreshToken()
            
            // Retry original request with new token
            if (originalRequest.headers && this.accessToken) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`
            }
            return this.axiosInstance(originalRequest)
          } catch (refreshError) {
            // Refresh failed - redirect to login
            this.clearToken()
            if (import.meta.client) {
              navigateTo('/login')
            }
            return Promise.reject(refreshError)
          }
        }

        // Handle 403 Forbidden - feature not available
        if (error.response?.status === 403) {
          const errorData = error.response.data as any
          if (errorData?.error?.code === 'FEATURE_NOT_AVAILABLE') {
            // Feature access error - show upgrade prompt
            console.warn('Feature not available:', errorData.error.message)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  /**
   * Set access token for authenticated requests
   */
  setToken(token: string): void {
    this.accessToken = token
    if (import.meta.client) {
      localStorage.setItem('tenant_access_token', token)
    }
  }

  /**
   * Get current access token
   */
  getToken(): string | null {
    if (!this.accessToken && import.meta.client) {
      this.accessToken = localStorage.getItem('tenant_access_token')
    }
    return this.accessToken
  }

  /**
   * Clear access token
   */
  clearToken(): void {
    this.accessToken = null
    if (import.meta.client) {
      localStorage.removeItem('tenant_access_token')
      localStorage.removeItem('tenant_refresh_token')
    }
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<void> {
    if (!import.meta.client) return

    const refreshToken = localStorage.getItem('tenant_refresh_token')
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await this.axiosInstance.post('/auth/refresh', {
        refreshToken,
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data
      this.setToken(accessToken)
      localStorage.setItem('tenant_refresh_token', newRefreshToken)
    } catch (error) {
      // Refresh failed, clear tokens
      this.clearToken()
      throw error
    }
  }

  /**
   * Generic GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config)
    return response.data
  }

  /**
   * Generic POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config)
    return response.data
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config)
    return response.data
  }

  /**
   * Generic PATCH request
   */
  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config)
    return response.data
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config)
    return response.data
  }
}

// Create singleton instance
let apiServiceInstance: ApiService | null = null

export const useApi = (): ApiService => {
  if (!apiServiceInstance) {
    apiServiceInstance = new ApiService()
  }
  return apiServiceInstance
}

export default useApi
