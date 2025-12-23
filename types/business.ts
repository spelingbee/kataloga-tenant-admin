/**
 * Business Domain Types for Tenant Admin
 * 
 * Clean business entities without API wrappers
 * Used by stores, components, and services
 */

import type { UserRole } from './enhanced-api';

// ============================================================================
// Analytics & Reporting
// ============================================================================

export interface SaleRecord {
  id: string;
  quantity: number;
  revenue: number;
  totalAmount: number; // Alias for revenue for backward compatibility
  date: string;
  menuItemId: string;
  orderId: string;
}

export interface MenuItemSalesHistory {
  menuItemId: string;
  menuItemName: string;
  totalQuantity: number;
  totalRevenue: number;
  sales: SaleRecord[];
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  totalRevenue: number;
  totalOrders: number;
  itemCount: number;
  averageItemPrice: number;
}

// ============================================================================
// Tenant & Subscription
// ============================================================================

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  settings: TenantSettings;
  createdAt: string;
  updatedAt: string;
}

export interface TenantSettings {
  businessName: string;
  businessType: string;
  currency: string;
  timezone: string;
  language: string;
  branding?: TenantBranding;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  customCss?: string;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  tenantId: string;
  planId: string;
  plan: Plan;
}

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  CANCELED = 'CANCELED',
  EXPIRED = 'EXPIRED',
}

// ============================================================================
// Plans & Features
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  displayName: string;
  price: number;
  billingCycle: string;
  maxUsers: number;
  maxLocations: number;
  maxMenuItems: number;
  maxCategories: number;
  features: PlanFeature[];
}

export interface PlanFeature {
  id: string;
  planId: string;
  featureKey: FeatureKey;
  isEnabled: boolean;
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

// ============================================================================
// Menu Management
// ============================================================================

export interface Menu {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  tenantId: string;
  items?: MenuItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  allergens?: string;
  isActive: boolean;
  displayOrder?: number;
  menuId: string;
  categoryId?: string;
  category?: Category;
  locations?: LocationAvailability[];
  createdAt: string;
  updatedAt: string;
}

export interface LocationAvailability {
  locationId: string;
  locationName: string;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  displayOrder: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Location Management
// ============================================================================

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Analytics & Reporting
// ============================================================================

export interface DashboardMetrics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  activeMenuItems: number;
  topSellingItems: TopSellingItem[];
  recentOrders: RecentOrder[];
}

export interface SalesAnalytics {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  topItems: TopSellingItem[];
  categoryPerformance: CategoryPerformance[];
  salesTrend: SalesTrendData[];
}

export interface TopSellingItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  revenue: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  revenue: number;
  itemCount: number;
}

export interface SalesTrendData {
  date: string;
  revenue: number;
  orders: number;
}

export interface RecentOrder {
  id: string;
  customerName?: string;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// Team Management
// ============================================================================

export interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
}

// ============================================================================
// Form & UI State Types
// ============================================================================

/**
 * Form parameters for menu item queries
 */
export interface MenuItemParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Dashboard widget error state
 */
export interface WidgetError {
  code: string;
  message: string;
  timestamp: string;
}

/**
 * Bulk selection state
 */
export interface BulkSelectionState {
  selectedItems: Set<string>;
  isAllSelected: boolean;
  isPartiallySelected: boolean;
}

// ============================================================================
// Audit & Logging
// ============================================================================

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  userEmail: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
}

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
}