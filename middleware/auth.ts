/**
 * Auth Middleware
 * Protects routes that require authentication
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side
  if (import.meta.server) return

  const authStore = useAuthStore()
  const api = useApi()
  const { getTenantSlug } = useTenant()

  // Get tenant slug from path
  const tenantSlug = getTenantSlug()
  if (!tenantSlug) return

  // Check if user is authenticated
  const token = api.getToken()
  
  // Check if current route is login
  const isLoginRoute = to.path.endsWith('/login')
  
  // If no token and trying to access protected route
  if (!token && !isLoginRoute) {
    return navigateTo(`/${tenantSlug}/login`)
  }

  // If has token but user not loaded, fetch user
  if (token && !authStore.user && !isLoginRoute) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      // Token invalid, clear and redirect to login
      api.clearToken()
      authStore.clearUser()
      return navigateTo(`/${tenantSlug}/login`)
    }
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (token && authStore.isAuthenticated && isLoginRoute) {
    return navigateTo(`/${tenantSlug}`)
  }

  // Verify user has correct role (TENANT_ADMIN or TENANT_STAFF)
  if (token && authStore.user && !isLoginRoute) {
    const validRoles = ['TENANT_ADMIN', 'TENANT_STAFF']
    if (!validRoles.includes(authStore.user.role)) {
      // User doesn't have tenant admin/staff role
      api.clearToken()
      authStore.clearUser()
      return navigateTo(`/${tenantSlug}/login`)
    }
  }
})
