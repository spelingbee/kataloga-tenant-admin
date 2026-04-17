import { defineStore } from 'pinia'
import type { User } from '~/types'
import { mapUser } from '~/utils/api-helpers'


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
    isSuperAdmin: (state) => state.user?.role === 'SUPER_ADMIN',
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
      const { requireTenantSlug } = useTenant()

      try {
        // Extract tenant slug from subdomain
        const tenantSlug = requireTenantSlug()
        
        const response = await api.post<LoginResponse>('/auth/login', {
          email,
          password,
          tenantSlug,
        }, { skipAuthRefresh: true })


        // Store tokens
        api.setToken(response.accessToken)
        if (import.meta.client) {
          localStorage.setItem('tenant_refresh_token', response.refreshToken)
        }

        // Fetch full user profile with firstName and lastName
        await this.fetchUser()

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
      if (this.loading) return // Prevent spamming
      
      const api = useApi()
      
      try {
        this.loading = true
        
        // Get refresh token for revocation BEFORE clearing
        const refreshToken = import.meta.client 
          ? localStorage.getItem('tenant_refresh_token') 
          : null

        // OPTIMISTIC: Clear local state immediately for instant feedback
        this.user = null
        this.isAuthenticated = false
        api.clearToken()
        
        // Notify the server in the background (non-blocking if slow)
        if (refreshToken) {
          // We don't 'await' this so the UI can redirect immediately
          api.post('/auth/logout', { refreshToken }).catch(err => {
            console.warn('Background logout revocation failed:', err)
          })
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.loading = false
        // Final fallback to ensure state is clear
        api.clearToken()
        this.user = null
        this.isAuthenticated = false
      }
    },

    /**
     * Fetch current user profile
     */
    async fetchUser(): Promise<User | null> {
      this.loading = true
      const api = useApi()

      try {
        const user = await api.get<User>('/auth/profile', { skipAuthRefresh: true })

        this.user = this.mapUser(user)
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
    setUser(user: any): void {
      this.user = this.mapUser(user)
      this.isAuthenticated = true
    },

    /**
     * Clear user state
     */
    clearUser(): void {
      this.user = null
      this.isAuthenticated = false
    },

    /**
     * Map user data from API response (handles snake_case fallback)
     */
    mapUser(user: any): User {
      return mapUser(user);
    }


  },
})
