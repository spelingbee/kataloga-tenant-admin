import { defineStore } from 'pinia'
import type { User } from '~/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
}

interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
  expiresIn: number
}

/**
 * Auth Store - Manages authentication state
 */
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    loading: false,
  }),

  getters: {
    currentUser: (state) => state.user,
    isTenantAdmin: (state) => state.user?.role === 'TENANT_ADMIN',
    isTenantStaff: (state) => state.user?.role === 'TENANT_STAFF',
  },

  actions: {
    /**
     * Login user with email and password
     */
    async login(email: string, password: string): Promise<void> {
      this.loading = true
      const api = useApi()

      try {
        const response = await api.post<LoginResponse>('/auth/login', {
          email,
          password,
        })

        // Store tokens
        api.setToken(response.accessToken)
        if (process.client) {
          localStorage.setItem('tenant_refresh_token', response.refreshToken)
        }

        // Set user state
        this.user = response.user
        this.isAuthenticated = true
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
      const api = useApi()
      
      try {
        // Get refresh token for revocation
        const refreshToken = process.client 
          ? localStorage.getItem('tenant_refresh_token') 
          : null

        if (refreshToken) {
          // Call logout endpoint to revoke refresh token
          await api.post('/auth/logout', { refreshToken })
        }
      } catch (error) {
        console.error('Logout error:', error)
        // Continue with local logout even if API call fails
      } finally {
        // Clear local state
        this.user = null
        this.isAuthenticated = false
        api.clearToken()
      }
    },

    /**
     * Fetch current user profile
     */
    async fetchUser(): Promise<User | null> {
      this.loading = true
      const api = useApi()

      try {
        const user = await api.get<User>('/auth/profile')
        this.user = user
        this.isAuthenticated = true
        return user
      } catch (error) {
        this.user = null
        this.isAuthenticated = false
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Set user directly (for registration or other flows)
     */
    setUser(user: User): void {
      this.user = user
      this.isAuthenticated = true
    },

    /**
     * Clear user state
     */
    clearUser(): void {
      this.user = null
      this.isAuthenticated = false
    },
  },
})
