/**
 * Enhanced Auth Store with Silent Refresh
 * 
 * Features:
 * - Silent token refresh with request queue integration
 * - ApiResponse<T> format handling
 * - Automatic user data extraction
 * - Token validation and persistence
 * - Graceful error handling and fallbacks
 */

import { defineStore } from 'pinia';
import type { 
  User, 
  LoginCredentials, 
  LoginResponse, 
  RefreshResponse,
  ApiResponse 
} from '~/types/enhanced-api';

interface EnhancedAuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const useEnhancedAuthStore = defineStore('enhanced-auth', {
  state: (): EnhancedAuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null
  }),

  getters: {
    /**
     * Get current access token
     */
    getToken: (state) => state.token,
    
    /**
     * Get current user
     */
    currentUser: (state) => state.user,
    
    /**
     * Check if user is tenant admin
     */
    isTenantAdmin: (state) => state.user?.role === 'TENANT_ADMIN',
    
    /**
     * Check if user is tenant staff
     */
    isTenantStaff: (state) => state.user?.role === 'TENANT_STAFF',
    
    /**
     * Check if user has admin privileges
     */
    hasAdminAccess: (state) => {
      return state.user?.role === 'TENANT_ADMIN' || state.user?.role === 'TENANT_STAFF';
    }
  },

  actions: {
    /**
     * Login with credentials and extract user data from ApiResponse
     * Requirement 4.3: Extract user data and permissions from ApiResponse<LoginResponse>
     */
    async login(credentials: LoginCredentials): Promise<void> {
      this.isLoading = true;
      
      try {
        const { $api } = useNuxtApp();
        
        // Get tenant slug from subdomain
        const { requireTenantSlug } = useTenant();
        const tenantSlug = requireTenantSlug();
        
        // API service automatically extracts data from ApiResponse<LoginResponse>
        const loginData = await $api.post<LoginResponse>('/auth/login', {
          ...credentials,
          tenantSlug
        }, {
          successMessage: 'Добро пожаловать!'
        });
        
        // Set tokens
        this.setToken(loginData.accessToken);
        if (import.meta.client) {
          localStorage.setItem('tenant_refresh_token', loginData.refreshToken);
        }
        
        // Set user state from extracted data
        this.user = loginData.user;
        this.isAuthenticated = true;
        
      } catch (error) {
        // Clear state on login failure
        this.user = null;
        this.isAuthenticated = false;
        this.token = null;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Silent refresh token without interrupting user workflow
     * Requirement 4.1: Silent refresh when 401 error occurs
     * Requirement 4.4: Continue work without losing form data
     */
    async silentRefresh(): Promise<boolean> {
      if (!import.meta.client) return false;
      
      const refreshToken = localStorage.getItem('tenant_refresh_token');
      if (!refreshToken) return false;
      
      try {
        const { $api } = useNuxtApp();
        
        // Call refresh endpoint with special options to prevent recursion
        const refreshData = await $api.post<RefreshResponse>('/auth/refresh', {
          refreshToken
        }, {
          skipErrorHandling: true, // Don't show errors to user during silent refresh
          skipAuthRefresh: true     // Prevent recursive refresh calls
        });
        
        // Update tokens
        this.setToken(refreshData.accessToken);
        if (refreshData.refreshToken) {
          localStorage.setItem('tenant_refresh_token', refreshData.refreshToken);
        }
        
        return true;
        
      } catch (error) {
        // Refresh failed - clear tokens
        console.warn('Silent refresh failed:', error);
        this.clearTokens();
        return false;
      }
    },

    /**
     * Validate token and load user profile
     * Requirement 4.5: Check token validity through ApiResponse<User>
     */
    async validateToken(): Promise<boolean> {
      // Load token from localStorage if not in state
      if (!this.token && import.meta.client) {
        const storedToken = localStorage.getItem('tenant_access_token');
        if (storedToken) {
          this.token = storedToken;
        } else {
          return false;
        }
      }
      
      if (!this.token) {
        return false;
      }
      
      try {
        const { $api } = useNuxtApp();
        
        // Validate token by fetching user profile
        const user = await $api.get<User>('/auth/profile');
        this.user = user;
        this.isAuthenticated = true;
        return true;
        
      } catch (error) {
        // Token invalid - try silent refresh
        console.warn('Token validation failed, attempting silent refresh');
        return await this.silentRefresh();
      }
    },

    /**
     * Logout user and revoke tokens
     * Requirement 4.2: Force redirect on refresh failure
     */
    async logout(): Promise<void> {
      try {
        const { $api } = useNuxtApp();
        
        // Get refresh token for revocation
        const refreshToken = import.meta.client 
          ? localStorage.getItem('tenant_refresh_token') 
          : null;

        if (refreshToken) {
          // Call logout endpoint to revoke refresh token
          await $api.post('/auth/logout', { refreshToken }, {
            skipErrorHandling: true // Ignore logout errors
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
        // Continue with local cleanup even if API call fails
      } finally {
        // Always clear local state
        this.clearTokens();
      }
    },

    /**
     * Set access token and update axios headers
     */
    setToken(token: string): void {
      this.token = token;
      
      // Persist to localStorage
      if (import.meta.client) {
        localStorage.setItem('tenant_access_token', token);
      }
      
      // Update API service headers
      const { $api } = useNuxtApp();
      if ($api && $api.setToken) {
        $api.setToken(token);
      }
    },

    /**
     * Clear all tokens and user state
     */
    clearTokens(): void {
      this.user = null;
      this.isAuthenticated = false;
      this.token = null;
      
      // Clear from localStorage
      if (import.meta.client) {
        localStorage.removeItem('tenant_access_token');
        localStorage.removeItem('tenant_refresh_token');
      }
      
      // Clear from API service
      const { $api } = useNuxtApp();
      if ($api && $api.clearToken) {
        $api.clearToken();
      }
    },

    /**
     * Initialize auth state on app startup
     */
    async initialize(): Promise<void> {
      if (!import.meta.client) return;
      
      // Try to validate existing token
      const hasValidToken = await this.validateToken();
      
      if (!hasValidToken) {
        // No valid token, clear any stale data
        this.clearTokens();
      }
    },

    /**
     * Set user directly (for registration or other flows)
     */
    setUser(user: User): void {
      this.user = user;
      this.isAuthenticated = true;
    },

    /**
     * Update user profile data
     */
    updateUser(updates: Partial<User>): void {
      if (this.user) {
        this.user = { ...this.user, ...updates };
      }
    },

    /**
     * Check if user has specific permission
     */
    hasPermission(permission: string): boolean {
      if (!this.user) return false;
      
      // Tenant admins have all permissions
      if (this.user.role === 'TENANT_ADMIN') return true;
      
      // Add specific permission logic here based on business requirements
      // For now, tenant staff has limited permissions
      const staffPermissions = [
        'menu.read',
        'orders.read',
        'analytics.read'
      ];
      
      return this.user.role === 'TENANT_STAFF' && staffPermissions.includes(permission);
    }
  }
});