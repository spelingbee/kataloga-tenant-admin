/**
 * Auth Middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (process.server) return

  const authStore = useAuthStore()
  const api = useApi()

  // Check if user is authenticated
  const token = api.getToken()
  
  // If no token and trying to access protected route
  if (!token && to.path !== '/login') {
    return navigateTo('/login')
  }

  // If has token but user not loaded, fetch user
  if (token && !authStore.user && to.path !== '/login') {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // Token invalid, clear and redirect to login
      api.clearToken()
      authStore.clearUser()
      return navigateTo('/login')
    }
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (token && authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }

  // Verify user has correct role (TENANT_ADMIN or TENANT_STAFF)
  if (token && authStore.user && to.path !== '/login') {
    const validRoles = ['TENANT_ADMIN', 'TENANT_STAFF']
    if (!validRoles.includes(authStore.user.role)) {
      // User doesn't have tenant admin/staff role
      api.clearToken()
      authStore.clearUser()
      return navigateTo('/login')
    }
  }
})
