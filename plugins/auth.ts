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
        const route = useRoute()
        const { isPublicRoute } = await import('~/constants/routes')
        
        // Use a more robust check for the current path (Nuxt route vs window location)
        const currentPath = route.path || (import.meta.client ? window.location.pathname : '/')
        
        // Skip profile fetch on public pages where it's not needed (like /register or /login)
        if (isPublicRoute(currentPath)) {
          console.log(`[Auth Plugin] Skipping profile fetch for public route: ${currentPath}`)
          return
        }

        const { initAuth } = useAuth()
        await initAuth()
      } catch (error) {
        console.error('Auth initialization error:', error)
        // Continue app load even if auth init fails
      }
    }
  }
})
