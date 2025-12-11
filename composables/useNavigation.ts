/**
 * Composable for tenant-aware navigation
 * Automatically prepends tenant slug to all routes
 */
export const useNavigation = () => {
  const { getTenantSlug } = useTenant()
  
  /**
   * Generate tenant-aware path
   * @param path - Path without tenant slug (e.g., '/menu', '/categories')
   * @returns Full path with tenant slug (e.g., '/pizza-palace/menu')
   */
  const tenantPath = (path: string): string => {
    const tenantSlug = getTenantSlug()
    if (!tenantSlug) {
      console.warn('No tenant slug found, returning path as-is')
      return path
    }
    
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path
    
    return `/${tenantSlug}/${cleanPath}`
  }
  
  /**
   * Navigate to tenant-aware route
   * @param path - Path without tenant slug
   */
  const navigateToTenant = (path: string) => {
    return navigateTo(tenantPath(path))
  }
  
  return {
    tenantPath,
    navigateToTenant,
  }
}
