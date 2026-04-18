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
      // With httpOnly cookies, we might not have a token in localStorage
      // but still be authenticated. Always try to fetch user if we suspect a session.
      await fetchUser()
    } catch (error) {
      // No active session or token invalid
      console.log('No active session found during initialization')
      api.clearToken()
      authStore.user = null
      authStore.isAuthenticated = false
    }
  }

  /**
   * Request password reset link
   */
  const forgotPassword = async (email: string): Promise<void> => {
    await authStore.forgotPassword(email)
  }

  /**
   * Reset password with token
   */
  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    await authStore.resetPassword(token, newPassword)
  }

  return {
    login,
    logout,
    fetchUser,
    initAuth,
    forgotPassword,
    resetPassword,
    isAuthenticated,
    currentUser,
    isTenantAdmin,
    isTenantStaff,
    loading,
  }
}
