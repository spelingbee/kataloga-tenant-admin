/**
 * Auth Plugin
 * Initializes authentication state on app load
 * (Universal registration, but client-only initialization)
 */
export default defineNuxtPlugin({
  name: 'auth',
  dependsOn: ['api'], // Match the name in plugins/api.ts
  async setup() {
    // Only initialize auth state from stored token on the client side
    // (localStorage is not available on the server)
    if (import.meta.client) {
      try {
        const { initAuth } = useAuth()
        await initAuth()
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Continue app load even if auth init fails
      }
    }
  }
})
