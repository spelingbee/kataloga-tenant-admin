import { useAuthStore } from '~/stores/auth'
import type { User } from '~/types'

/**
 * Authentication composable
 * Provides authentication methods and state
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const api = useApi()

  /**
   * Login user with email and password
   */
  const login = async (email: string, password: string): Promise<void> => {
    await authStore.login(email, password)
  }

  /**
   * Logout current user
   */
  const logout = async (): Promise<void> => {
    await authStore.logout()
  }

  /**
   * Fetch current user profile
   */
  const fetchUser = async (): Promise<User | null> => {
    return await authStore.fetchUser()
  }

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = computed(() => authStore.isAuthenticated)

  /**
   * Get current user
   */
  const currentUser = computed(() => authStore.user)

  /**
   * Check if user is tenant admin
   */
  const isTenantAdmin = computed(() => authStore.isTenantAdmin)

  /**
   * Check if user is tenant staff
   */
  const isTenantStaff = computed(() => authStore.isTenantStaff)

  /**
   * Check if loading
   */
  const loading = computed(() => authStore.loading)

  /**
   * Initialize auth state from stored token
   */
  const initAuth = async (): Promise<void> => {
    try {
      const token = api.getToken()
      if (token) {
        try {
          await fetchUser()
        } catch (error) {
          // Token invalid, clear it
          api.clearToken()
          authStore.user = null
          authStore.isAuthenticated = false
        }
      }
    } catch (error) {
      console.error('Auth initialization error - API not available:', error)
      // API service not ready yet, skip initialization
    }
  }

  return {
    login,
    logout,
    fetchUser,
    initAuth,
    isAuthenticated,
    currentUser,
    isTenantAdmin,
    isTenantStaff,
    loading,
  }
}
