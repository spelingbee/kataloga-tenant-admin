/**
 * API Plugin
 * 
 * Initializes the API Client with store-based token management
 * Provides $api instance to the entire application (Universal - Server & Client)
 * 
 * Features:
 * - ofetch-based (no axios dependency)
 * - Request queue for token refresh
 * - Store-based token management
 * - Exponential backoff retry
 * - File/blob operations support
 */

import { createApiClient } from '~/utils/api'

export default defineNuxtPlugin({
  name: 'api',
  // REMOVED dependsOn: ['auth'] to break circular dependency.
  // The authStore can be accessed directly as long as Pinia is initialized.
  setup() {
    const config = useRuntimeConfig()
    
    // Create API client instance
    const apiClient = createApiClient({
      baseURL: config.public.apiUrl as string,
      timeout: 30000,
      retries: 1,
      retryDelay: 1000,
    })

    // Set auth store for token management
    const authStore = useAuthStore()
    apiClient.setAuthStore(authStore)

    return {
      provide: {
        api: apiClient
      }
    }
  }
})
