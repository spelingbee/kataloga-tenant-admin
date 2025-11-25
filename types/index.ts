/**
 * Type definitions for Tenant Admin Dashboard
 */

// User types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  tenantId: string
  createdAt: string
  updatedAt: string
}

export enum UserRole {
  TENANT_ADMIN = 'TENANT_ADMIN',
  TENANT_STAFF = 'TENANT_STAFF',
}

// Tenant types
export interface Tenant {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt: string
}

// Subscription types
export interface Subscription {
  id: string
  status: SubscriptionStatus
  startDate: string
  endDate: string
  tenantId: string
  planId: string
  plan: Plan
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

// Plan types
export interface Plan {
  id: string
  name: string
  displayName: string
  price: number
  billingCycle: string
  maxUsers: number
  maxLocations: number
  maxMenuItems: number
  maxCategories: number
  features: PlanFeature[]
}

export interface PlanFeature {
  id: string
  planId: string
  featureKey: FeatureKey
  isEnabled: boolean
}

export enum FeatureKey {
  SALES_ANALYTICS = 'sales_analytics',
  ADVANCED_REPORTING = 'advanced_reporting',
  API_ACCESS = 'api_access',
  CUSTOM_BRANDING = 'custom_branding',
  MULTI_LOCATION = 'multi_location',
  AUDIT_TRAIL = 'audit_trail',
  DATA_EXPORT = 'data_export',
  MULTI_USER = 'multi_user',
  PRIORITY_SUPPORT = 'priority_support',
}

// Menu types
export interface Menu {
  id: string
  name: string
  description?: string
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

export interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  imageUrl?: string
  allergens?: string
  isActive: boolean
  menuId: string
  categoryId?: string
  category?: Category
  locations?: LocationAvailability[]
  createdAt: string
  updatedAt: string
}

export interface LocationAvailability {
  locationId: string
  locationName: string
  isAvailable: boolean
}

// Category types
export interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  tenantId: string
  createdAt: string
  updatedAt: string
}

// Location types
export interface Location {
  id: string
  name: string
  address: string
  city: string
  phone?: string
  email?: string
  isActive: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
}

// Analytics types
export interface SalesAnalytics {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topItems: TopSellingItem[]
  categoryPerformance: CategoryPerformance[]
  salesTrend: SalesTrendData[]
}

export interface TopSellingItem {
  menuItemId: string
  menuItemName: string
  quantity: number
  revenue: number
}

export interface CategoryPerformance {
  categoryId: string
  categoryName: string
  revenue: number
  itemCount: number
}

export interface SalesTrendData {
  date: string
  revenue: number
  orders: number
}

export interface MenuItemSalesHistory {
  menuItemId: string
  menuItemName: string
  totalQuantity: number
  totalRevenue: number
  sales: SaleRecord[]
}

export interface SaleRecord {
  id: string
  date: string
  quantity: number
  totalAmount: number
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
