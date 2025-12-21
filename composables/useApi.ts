/**
 * Composable for Enhanced API access
 * Provides access to the Enhanced API Service instance
 */
import type { EnhancedApiService } from '~/services/enhanced-api.service';

export function useEnhancedApi(): EnhancedApiService {
  const { $api } = useNuxtApp();
  return $api as EnhancedApiService;
}

// Backward compatibility alias
export const useApi = useEnhancedApi;
