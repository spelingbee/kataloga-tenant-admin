/**
 * Enhanced API Plugin
 * 
 * Initializes the Enhanced API Service with all dependencies
 * Provides $api instance to the entire application
 * 
 * Features:
 * - Proper dependency injection (Toast, Router, Nuxt App)
 * - Request queue for silent token refresh
 * - Automatic response unwrapping
 * - Blob/File operation support
 * - Enhanced error handling with tracing
 */

import axios from 'axios';
import { EnhancedApiService } from '~/services/enhanced-api.service';

export default defineNuxtPlugin({
  name: 'enhanced-api',
  dependsOn: ['toast'], // Ensure toast plugin loads first
  setup(nuxtApp) {
    const config = useRuntimeConfig();
    const router = useRouter();
    
    // Create axios instance with base configuration
    const axiosInstance = axios.create({
      baseURL: config.public.apiBaseUrl as string,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true
    });

    // Add auth token interceptor
    axiosInstance.interceptors.request.use((config) => {
      if (import.meta.client) {
        const token = localStorage.getItem('tenant_access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Get toast instance with proper fallback
    const getToastInstance = () => {
      // Try to get toast from nuxtApp first
      if (nuxtApp.$toast) {
        return nuxtApp.$toast;
      }
      
      // Try to get toast from useToast composable
      try {
        const { success, error, info } = useToast();
        return {
          success: (msg: string) => success(msg),
          error: (msg: string) => error(msg),
          info: (msg: string, options?: any) => info(msg),
          dismiss: (id: string) => {
            // Toast composable doesn't have dismiss, so we'll ignore it
            console.log('[Toast Dismiss]', id);
          }
        };
      } catch (e) {
        // Fallback to console logging if toast is not available
        return {
          success: (msg: string) => console.log('[Toast Success]', msg),
          error: (msg: string) => console.error('[Toast Error]', msg),
          info: (msg: string) => console.info('[Toast Info]', msg),
          dismiss: (id: string) => console.log('[Toast Dismiss]', id)
        };
      }
    };

    const toast = getToastInstance();

    // Create Enhanced API Service instance
    const apiService = new EnhancedApiService(
      axiosInstance,
      toast,
      router,
      nuxtApp
    );

    // Add global error handler for unhandled API errors
    nuxtApp.hook('app:error', (error) => {
      // Log API errors with enhanced context
      if (error && typeof error === 'object' && 'requestId' in error) {
        console.error('[Enhanced API] Unhandled error:', error);
      }
    });

    return {
      provide: {
        api: apiService
      }
    };
  }
});
