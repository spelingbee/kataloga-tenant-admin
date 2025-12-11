/**
 * Composable for extracting tenant slug from URL path
 * 
 * Tenant-admin uses path-based routing:
 * - app.kataloga.kg/pizza-palace → pizza-palace
 * - localhost:3003/demo-restaurant → demo-restaurant
 */
export const useTenant = () => {
  const route = useRoute()
  
  /**
   * Extract tenant slug from URL path (first segment after /)
   */
  const getTenantSlug = (): string | null => {
    const pathSegments = route.path.split('/').filter(Boolean)
    if (pathSegments.length === 0) {
      return null
    }
    
    const firstSegment = pathSegments[0]
    
    // Exclude system routes
    const systemRoutes = ['error', 'api', 'admin', 'health']
    if (systemRoutes.includes(firstSegment)) {
      return null
    }
    
    return firstSegment
  }
  
  /**
   * Get current tenant slug or throw error
   */
  const requireTenantSlug = (): string => {
    const slug = getTenantSlug()
    if (!slug) {
      throw new Error('Tenant slug is required. Please access via /{tenant-slug}')
    }
    return slug
  }
  
  /**
   * Check if current URL has tenant
   */
  const hasTenant = (): boolean => {
    return getTenantSlug() !== null
  }
  
  return {
    getTenantSlug,
    requireTenantSlug,
    hasTenant
  }
}
