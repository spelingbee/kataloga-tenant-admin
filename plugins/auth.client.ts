/**
 * Auth Plugin
 * Initializes authentication state on app load
 */
export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['enhanced-api'], // Wait for API to be ready
  async setup() {
    // Initialize auth state from stored token
    try {
      const { initAuth } = useAuth()
      await initAuth()
    } catch (error) {
      console.error('Auth initialization error:', error)
      // Continue app load even if auth init fails
    }
  }
})
