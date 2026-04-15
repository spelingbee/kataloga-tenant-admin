/**
 * Composable for API access
 * Provides access to the API Client instance
 */
import type { ApiClient } from '~/utils/api'

export function useApi(): ApiClient {
  const nuxtApp = useNuxtApp()
  
  if (!nuxtApp.$api) {
    throw new Error('API client not initialized. Make sure the api plugin is loaded.')
  }
  
  return nuxtApp.$api as ApiClient
}
