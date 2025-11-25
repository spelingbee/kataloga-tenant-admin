# API Integration Guide

This document describes how to integrate with the backend API in the Tenant Admin Dashboard.

## Table of Contents

1. [Overview](#overview)
2. [API Service](#api-service)
3. [Authentication](#authentication)
4. [Making Requests](#making-requests)
5. [Error Handling](#error-handling)
6. [Response Format](#response-format)
7. [API Endpoints](#api-endpoints)
8. [Feature Access](#feature-access)
9. [Best Practices](#best-practices)

## Overview

The Tenant Admin Dashboard communicates with a NestJS backend API. All API communication is handled through a centralized API service that provides:

- Automatic JWT token management
- Request/response interceptors
- Error handling
- Token refresh on expiration
- Feature access error handling

## API Service

### Architecture

```
Component/Composable
        ↓
   useApi() composable
        ↓
   ApiService (singleton)
        ↓
   Axios Instance
        ↓
   Backend API
```

### API Service Implementation

The API service is implemented as a singleton class in `services/api.service.ts`:

```typescript
class ApiService {
  private axiosInstance: AxiosInstance
  private static instance: ApiService
  
  private constructor() {
    const config = useRuntimeConfig()
    
    this.axiosInstance = axios.create({
      baseURL: config.public.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }
  
  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService()
    }
    return ApiService.instance
  }
  
  // HTTP methods
  public get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
  public patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
  public delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>
}
```

### Using the API Service

```typescript
// In a component or composable
const api = useApi()

// GET request
const response = await api.get('/menu/items')

// POST request
const response = await api.post('/menu/items', {
  name: 'Pizza',
  price: 12.99
})

// PATCH request
const response = await api.patch('/menu/items/123', {
  isActive: false
})

// DELETE request
await api.delete('/menu/items/123')
```

## Authentication

### Token Storage

JWT tokens are stored in localStorage:

```typescript
// Store token
localStorage.setItem('token', token)

// Retrieve token
const token = localStorage.getItem('token')

// Remove token
localStorage.removeItem('token')
```

### Request Interceptor

The API service automatically adds the JWT token to all requests:

```typescript
this.axiosInstance.interceptors.request.use(
  (config) => {
    const token = this.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)
```

### Token Refresh

When a 401 error occurs, the API service automatically attempts to refresh the token:

```typescript
this.axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        const newToken = await this.refreshToken()
        this.setToken(newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return this.axiosInstance(originalRequest)
      } catch (refreshError) {
        // Redirect to login
        this.clearToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)
```

### Login Flow

```typescript
// composables/useAuth.ts
export function useAuth() {
  const api = useApi()
  const authStore = useAuthStore()
  
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', {
        email,
        password
      })
      
      const { token, user } = response.data
      
      // Store token
      localStorage.setItem('token', token)
      
      // Update store
      authStore.setUser(user)
      authStore.setAuthenticated(true)
      
      return user
    } catch (error) {
      throw error
    }
  }
  
  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      authStore.setUser(null)
      authStore.setAuthenticated(false)
      navigateTo('/login')
    }
  }
  
  return {
    login,
    logout
  }
}
```

## Making Requests

### GET Requests

```typescript
// Simple GET
const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items')
const items = response.data

// GET with query parameters
const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items', {
  params: {
    categoryId: '123',
    isActive: true,
    page: 1,
    limit: 20
  }
})

// GET with custom headers
const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items', {
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

### POST Requests

```typescript
// Create menu item
const response = await api.post<ApiResponse<MenuItem>>('/menu/items', {
  name: 'Pizza Margherita',
  description: 'Classic Italian pizza',
  price: 12.99,
  categoryId: '123',
  isActive: true
})

const newItem = response.data

// Upload with FormData
const formData = new FormData()
formData.append('file', file)
formData.append('name', 'Pizza')

const response = await api.post<ApiResponse<UploadResponse>>('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})
```

### PATCH Requests

```typescript
// Update menu item
const response = await api.patch<ApiResponse<MenuItem>>('/menu/items/123', {
  name: 'Updated Pizza Name',
  price: 14.99
})

const updatedItem = response.data

// Partial update
const response = await api.patch<ApiResponse<MenuItem>>('/menu/items/123', {
  isActive: false
})
```

### DELETE Requests

```typescript
// Delete menu item
await api.delete('/menu/items/123')

// Delete with confirmation
const confirmed = await confirm('Are you sure?')
if (confirmed) {
  await api.delete('/menu/items/123')
}
```

### Bulk Operations

```typescript
// Bulk update
const response = await api.post<ApiResponse<BulkUpdateResult>>('/menu/items/bulk-update', {
  ids: ['123', '456', '789'],
  updates: {
    isActive: false
  }
})

const { updated, failed } = response.data
```

## Error Handling

### Error Types

```typescript
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}
```

### Handling Errors in Components

```typescript
const fetchMenuItems = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items')
    items.value = response.data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status
      const errorData = err.response?.data as ApiError
      
      switch (status) {
        case 400:
          error.value = 'Invalid request'
          break
        case 401:
          error.value = 'Unauthorized'
          navigateTo('/login')
          break
        case 403:
          error.value = 'Feature not available in your plan'
          showUpgradePrompt()
          break
        case 404:
          error.value = 'Resource not found'
          break
        case 500:
          error.value = 'Server error'
          break
        default:
          error.value = errorData?.error?.message || 'An error occurred'
      }
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    loading.value = false
  }
}
```

### Global Error Handler

```typescript
// plugins/error-handler.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error('Global error:', error)
    
    // Send to error tracking service
    // trackError(error)
  })
})
```

### Toast Notifications for Errors

```typescript
const { showToast } = useToast()

try {
  await api.post('/menu/items', data)
  showToast('Menu item created successfully', 'success')
} catch (error) {
  showToast('Failed to create menu item', 'error')
}
```

## Response Format

### Success Response

```typescript
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
}

// Example
{
  "success": true,
  "data": {
    "id": "123",
    "name": "Pizza",
    "price": 12.99
  },
  "message": "Menu item created successfully"
}
```

### Error Response

```typescript
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// Example
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "name": "Name is required",
      "price": "Price must be positive"
    }
  }
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Example
{
  "success": true,
  "data": [
    { "id": "1", "name": "Pizza" },
    { "id": "2", "name": "Pasta" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## API Endpoints

### Authentication

```typescript
// Login
POST /auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }

// Logout
POST /auth/logout
Response: { success: true }

// Get current user
GET /auth/me
Response: User

// Refresh token
POST /auth/refresh
Body: { refreshToken: string }
Response: { token: string }
```

### Menu Items

```typescript
// List menu items
GET /menu/items
Query: { page?, limit?, categoryId?, isActive?, search? }
Response: PaginatedResponse<MenuItem>

// Get menu item
GET /menu/items/:id
Response: MenuItem

// Create menu item
POST /menu/items
Body: CreateMenuItemDto
Response: MenuItem

// Update menu item
PATCH /menu/items/:id
Body: Partial<MenuItem>
Response: MenuItem

// Delete menu item
DELETE /menu/items/:id
Response: { success: true }

// Bulk update
POST /menu/items/bulk-update
Body: { ids: string[], updates: Partial<MenuItem> }
Response: { updated: number, failed: number }
```

### Categories

```typescript
// List categories
GET /categories
Response: Category[]

// Get category
GET /categories/:id
Response: Category

// Create category
POST /categories
Body: CreateCategoryDto
Response: Category

// Update category
PATCH /categories/:id
Body: Partial<Category>
Response: Category

// Delete category
DELETE /categories/:id
Response: { success: true }

// Reorder categories
PATCH /categories/reorder
Body: { categoryIds: string[] }
Response: { success: true }
```

### Locations (PRO/BUSINESS)

```typescript
// List locations
GET /locations
Response: Location[]

// Get location
GET /locations/:id
Response: Location

// Create location
POST /locations
Body: CreateLocationDto
Response: Location

// Update location
PATCH /locations/:id
Body: Partial<Location>
Response: Location

// Delete location
DELETE /locations/:id
Response: { success: true }
```

### Analytics (PRO/BUSINESS)

```typescript
// Get overview
GET /analytics/overview
Query: { startDate?, endDate? }
Response: AnalyticsOverview

// Get sales data
GET /analytics/sales
Query: { startDate, endDate, groupBy? }
Response: SalesData[]

// Get top items
GET /analytics/top-items
Query: { startDate, endDate, limit? }
Response: TopItem[]

// Get category performance
GET /analytics/category-performance
Query: { startDate, endDate }
Response: CategoryPerformance[]

// Get item sales history
GET /analytics/items/:id/history
Query: { startDate, endDate }
Response: SalesHistory[]

// Export data (BUSINESS)
GET /analytics/export
Query: { startDate, endDate, format }
Response: File download
```

### Team (PRO/BUSINESS)

```typescript
// List team members
GET /users
Response: User[]

// Invite user
POST /users/invite
Body: { email: string, role: UserRole }
Response: { success: true }

// Update user role
PATCH /users/:id/role
Body: { role: UserRole }
Response: User

// Remove user
DELETE /users/:id
Response: { success: true }
```

### Subscription

```typescript
// Get subscription
GET /subscription
Response: Subscription

// Get available plans
GET /subscription/plans
Response: Plan[]

// Get plan features
GET /subscription/features
Response: PlanFeature[]
```

## Feature Access

### Feature Access Errors

When a user tries to access a feature not available in their plan, the API returns a 403 error:

```typescript
{
  "success": false,
  "error": {
    "code": "FEATURE_NOT_AVAILABLE",
    "message": "This feature is not available in your current plan",
    "details": {
      "feature": "sales_analytics",
      "currentPlan": "FREE",
      "requiredPlan": "PRO",
      "upgradeUrl": "/subscription/upgrade"
    }
  }
}
```

### Handling Feature Access Errors

```typescript
try {
  const response = await api.get('/analytics/overview')
} catch (error) {
  if (axios.isAxiosError(error) && error.response?.status === 403) {
    const errorData = error.response.data as ApiError
    
    if (errorData.error.code === 'FEATURE_NOT_AVAILABLE') {
      const { feature, requiredPlan, upgradeUrl } = errorData.error.details
      
      // Show upgrade prompt
      showFeatureLockedModal({
        feature,
        requiredPlan,
        upgradeUrl
      })
    }
  }
}
```

## Best Practices

### 1. Use TypeScript Types

```typescript
// Define types for requests and responses
interface CreateMenuItemDto {
  name: string
  description?: string
  price: number
  categoryId?: string
  isActive?: boolean
}

// Use types in API calls
const createMenuItem = async (data: CreateMenuItemDto) => {
  const response = await api.post<ApiResponse<MenuItem>>('/menu/items', data)
  return response.data
}
```

### 2. Handle Loading States

```typescript
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  try {
    const response = await api.get('/menu/items')
    items.value = response.data
  } finally {
    loading.value = false
  }
}
```

### 3. Use Composables for API Logic

```typescript
// composables/useMenuItems.ts
export function useMenuItems() {
  const api = useApi()
  const items = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const fetchItems = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items')
      items.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch menu items'
    } finally {
      loading.value = false
    }
  }
  
  return {
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    fetchItems
  }
}
```

### 4. Implement Retry Logic

```typescript
const fetchWithRetry = async (url: string, maxRetries = 3) => {
  let lastError
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await api.get(url)
    } catch (error) {
      lastError = error
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
      }
    }
  }
  
  throw lastError
}
```

### 5. Cache Responses

```typescript
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

const fetchWithCache = async (url: string) => {
  const cached = cache.get(url)
  
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  
  const response = await api.get(url)
  cache.set(url, { data: response.data, timestamp: Date.now() })
  
  return response.data
}
```

### 6. Debounce Search Requests

```typescript
import { debounce } from 'lodash-es'

const searchItems = debounce(async (query: string) => {
  const response = await api.get('/menu/items', {
    params: { search: query }
  })
  items.value = response.data
}, 300)
```

### 7. Cancel Pending Requests

```typescript
const abortController = ref<AbortController | null>(null)

const fetchItems = async () => {
  // Cancel previous request
  if (abortController.value) {
    abortController.value.abort()
  }
  
  abortController.value = new AbortController()
  
  try {
    const response = await api.get('/menu/items', {
      signal: abortController.value.signal
    })
    items.value = response.data
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('Request cancelled')
    } else {
      throw error
    }
  }
}
```

## Summary

The API integration in the Tenant Admin Dashboard provides:

- Centralized API service with singleton pattern
- Automatic JWT token management
- Token refresh on expiration
- Comprehensive error handling
- Feature access control
- Type-safe requests and responses
- Best practices for common scenarios

For more information, see:
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [Feature Access Control](./FEATURE_ACCESS_CONTROL.md)
- [Error Handling](./ERROR_HANDLING.md)
