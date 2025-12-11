/**
 * Global middleware to ensure tenant slug is present in URL
 * Redirects to error page if tenant is missing
 */
export default defineNuxtRouteMiddleware((to) => {
  // Skip check for error pages and root login
  if (to.path.startsWith('/error') || to.path === '/login') {
    return
  }
  
  // Extract tenant from path (first segment)
  const pathSegments = to.path.split('/').filter(Boolean)
  const tenantSlug = pathSegments[0]
  
  // Check if route starts with tenant slug
  if (!tenantSlug || ['api', 'admin', 'health'].includes(tenantSlug)) {
    return navigateTo('/error/no-tenant')
  }
})
