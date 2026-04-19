import { isSystemRoute } from '~/constants/routes'

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
  const getTenantSlug = (explicitPath?: string): string | null => {
    const pathToParse = explicitPath ?? route.path
    const pathSegments = pathToParse.split('/').filter(Boolean)
    if (pathSegments.length === 0) {
      return null
    }
    
    // Check if path follows the /t/[slug] pattern
    if (pathSegments[0].toLowerCase() === 't' && pathSegments.length >= 2) {
      return pathSegments[1].toLowerCase().trim()
    }

    const firstSegment = pathSegments[0].toLowerCase().trim()
    
    // Exclude system routes using centralized constants
    if (isSystemRoute(firstSegment)) {
      return null
    }
    
    return firstSegment
  }
  
  /**
   * Get current tenant slug or throw error
   */
  const requireTenantSlug = (explicitPath?: string): string => {
    const slug = getTenantSlug(explicitPath)
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
