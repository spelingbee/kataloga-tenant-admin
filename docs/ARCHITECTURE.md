# Tenant Admin Dashboard - Architecture

This document provides a comprehensive overview of the Tenant Admin Dashboard architecture.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Layers](#architecture-layers)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [API Communication](#api-communication)
6. [Authentication Flow](#authentication-flow)
7. [Feature Access Control](#feature-access-control)
8. [Data Flow](#data-flow)
9. [Security Architecture](#security-architecture)
10. [Performance Considerations](#performance-considerations)

## System Overview

The Tenant Admin Dashboard is a single-page application (SPA) built with Nuxt 3 that provides restaurant/cafe owners with a comprehensive management interface. It communicates with a shared NestJS backend API and implements plan-based feature access control.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (Client)                          │
├─────────────────────────────────────────────────────────────────┤
│                   Tenant Admin Dashboard                         │
│                  (Nuxt 3 SPA - Port 3003)                       │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│  │   Pages     │  │  Components  │  │  Composables   │         │
│  │  (Routes)   │  │   (UI/BL)    │  │   (Logic)      │         │
│  └──────┬──────┘  └──────┬───────┘  └────────┬───────┘         │
│         │                │                     │                 │
│         └────────────────┴─────────────────────┘                 │
│                          │                                       │
│                  ┌───────▼────────┐                             │
│                  │  Pinia Stores  │                             │
│                  │  (State Mgmt)  │                             │
│                  └───────┬────────┘                             │
│                          │                                       │
│                  ┌───────▼────────┐                             │
│                  │  API Service   │                             │
│                  │   (Axios)      │                             │
│                  └───────┬────────┘                             │
└──────────────────────────┼──────────────────────────────────────┘
                           │ HTTP/REST
                           │ JWT Auth
┌──────────────────────────▼──────────────────────────────────────┐
│                    Backend API Server                            │
│                  (NestJS - Port 3000)                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Controllers  │  │   Services   │  │   Guards     │         │
│  │  (Routes)    │  │  (Business)  │  │   (Auth)     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
│         └──────────────────┴──────────────────┘                 │
│                          │                                       │
│                  ┌───────▼────────┐                             │
│                  │  Prisma ORM    │                             │
│                  └───────┬────────┘                             │
└──────────────────────────┼──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    PostgreSQL Database                           │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Tenant  │  │   User   │  │   Menu   │  │  Sales   │       │
│  │  Tables  │  │  Tables  │  │  Tables  │  │  Tables  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### Key Characteristics

- **Single Page Application**: Client-side routing with Nuxt 3
- **RESTful API**: HTTP-based communication with backend
- **JWT Authentication**: Token-based authentication
- **Plan-Based Access**: Features controlled by subscription plan
- **Tenant Isolation**: All data scoped to authenticated tenant
- **Responsive Design**: Works on desktop, tablet, and mobile

## Architecture Layers

### 1. Presentation Layer (UI)

**Responsibility**: Display data and handle user interactions

**Components**:
- Vue 3 components with Composition API
- SCSS styling with BEM methodology
- Responsive layouts
- Form validation
- Loading states
- Error displays

**Technologies**:
- Vue 3 (Composition API)
- Nuxt 3 (Framework)
- SCSS (Styling)
- TypeScript (Type safety)

### 2. Application Layer (Business Logic)

**Responsibility**: Implement business rules and coordinate between UI and data

**Components**:
- Composables (reusable logic)
- Pinia stores (state management)
- Route middleware (guards)
- Plugins (global functionality)

**Key Composables**:
- `useApi()`: API client
- `useAuth()`: Authentication logic
- `useFeatureAccess()`: Feature access control
- `useToast()`: Notifications

### 3. Data Layer (State & API)

**Responsibility**: Manage application state and communicate with backend

**Components**:
- Pinia stores (global state)
- API service (HTTP client)
- Local storage (token persistence)
- Cache management

**Key Stores**:
- `authStore`: User authentication
- `menuStore`: Menu items
- `categoryStore`: Categories
- `subscriptionStore`: Subscription info

### 4. Infrastructure Layer

**Responsibility**: Provide cross-cutting concerns

**Components**:
- Error handling
- Logging
- Performance monitoring
- Security (CSRF, XSS protection)

## Component Architecture

### Component Hierarchy

```
App.vue (Root)
│
├── Layouts
│   ├── default.vue (Main layout with sidebar)
│   └── auth.vue (Login/Register layout)
│
├── Pages (Auto-routed)
│   ├── index.vue (Dashboard)
│   ├── login.vue
│   ├── menu/
│   │   └── index.vue (Menu list)
│   ├── categories/
│   │   └── index.vue (Category management)
│   ├── locations/ (PRO/BUSINESS)
│   │   └── index.vue
│   ├── analytics/ (PRO/BUSINESS)
│   │   └── index.vue
│   └── team/ (PRO/BUSINESS)
│       └── index.vue
│
└── Components
    ├── ui/ (Reusable UI components)
    │   ├── DataTable/
    │   ├── Modal/
    │   ├── FeatureGuard.vue
    │   └── LoadingSpinner.vue
    ├── menu/ (Domain-specific)
    │   ├── MenuItemList.vue
    │   ├── MenuItemForm.vue
    │   └── BulkMenuOperations.vue
    ├── category/
    │   ├── CategoryList.vue
    │   └── CategoryForm.vue
    └── dashboard/
        ├── DashboardOverview.vue
        └── SalesAnalyticsDashboard.vue
```

### Component Communication

```
Parent Component
      │
      ├─ Props ──────────────────────> Child Component
      │                                       │
      │                                       │
      │ <────────────────────── Emits ───────┘
      │
      └─ Provide ──────────────────────> Descendant
                                               │
                                               │
                                        Inject ─┘
```

**Communication Patterns**:
1. **Props Down**: Parent passes data to child via props
2. **Events Up**: Child emits events to parent
3. **Provide/Inject**: Share data with descendants
4. **Store**: Global state accessible anywhere

## State Management

### Pinia Store Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Pinia Stores                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  authStore   │  │  menuStore   │  │ categoryStore│      │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤      │
│  │ State:       │  │ State:       │  │ State:       │      │
│  │ - user       │  │ - items      │  │ - categories │      │
│  │ - token      │  │ - loading    │  │ - loading    │      │
│  │ - isAuth     │  │ - error      │  │ - error      │      │
│  │              │  │              │  │              │      │
│  │ Getters:     │  │ Getters:     │  │ Getters:     │      │
│  │ - userName   │  │ - activeItems│  │ - sortedCats │      │
│  │ - userRole   │  │ - itemCount  │  │ - catCount   │      │
│  │              │  │              │  │              │      │
│  │ Actions:     │  │ Actions:     │  │ Actions:     │      │
│  │ - login()    │  │ - fetchItems │  │ - fetchCats  │      │
│  │ - logout()   │  │ - createItem │  │ - createCat  │      │
│  │ - refresh()  │  │ - updateItem │  │ - updateCat  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │locationStore │  │analyticsStore│  │subscription  │      │
│  │(PRO/BUSINESS)│  │(PRO/BUSINESS)│  │    Store     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Store Pattern

```typescript
// Setup store pattern
export const useMenuStore = defineStore('menu', () => {
  // State (reactive)
  const items = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters (computed)
  const activeItems = computed(() => 
    items.value.filter(item => item.isActive)
  )
  
  // Actions (functions)
  const fetchItems = async () => {
    loading.value = true
    try {
      const api = useApi()
      const response = await api.get('/menu/items')
      items.value = response.data
    } finally {
      loading.value = false
    }
  }
  
  return {
    // Expose as readonly
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    activeItems,
    fetchItems
  }
})
```

## API Communication

### API Service Architecture

```
Component/Composable
        │
        ├─ useApi() ──────────> ApiService (Singleton)
        │                             │
        │                             ├─ Request Interceptor
        │                             │  (Add JWT token)
        │                             │
        │                             ├─ Axios Instance
        │                             │  (HTTP client)
        │                             │
        │                             └─ Response Interceptor
        │                                (Handle errors, refresh token)
        │
        └─────────────────────────────────────────────────────────>
                                                                    │
                                                              Backend API
```

### Request Flow

```
1. Component calls API method
   ↓
2. useApi() returns ApiService instance
   ↓
3. Request interceptor adds JWT token
   ↓
4. Axios sends HTTP request
   ↓
5. Backend processes request
   ↓
6. Response interceptor handles response
   ↓
7. Success: Return data to component
   OR
   Error: Handle error (401 → refresh token, 403 → upgrade prompt)
```

### Error Handling Strategy

```
API Error
    │
    ├─ 400 Bad Request ──────> Show validation errors
    │
    ├─ 401 Unauthorized ─────> Refresh token → Retry
    │                           If fails → Redirect to login
    │
    ├─ 403 Forbidden ────────> Check if feature access error
    │                           → Show upgrade prompt
    │
    ├─ 404 Not Found ────────> Show not found message
    │
    ├─ 500 Server Error ─────> Show generic error
    │                           → Log to error tracking
    │
    └─ Network Error ────────> Show connection error
                                → Retry with backoff
```

## Authentication Flow

### Login Flow

```
1. User enters credentials
   ↓
2. Component calls useAuth().login()
   ↓
3. API POST /auth/login
   ↓
4. Backend validates credentials
   ↓
5. Backend returns JWT token + user data
   ↓
6. Frontend stores token in localStorage
   ↓
7. Frontend updates authStore
   ↓
8. Redirect to dashboard
```

### Token Refresh Flow

```
1. API request returns 401
   ↓
2. Response interceptor catches error
   ↓
3. Call refreshToken()
   ↓
4. API POST /auth/refresh
   ↓
5. Backend validates refresh token
   ↓
6. Backend returns new JWT token
   ↓
7. Store new token
   ↓
8. Retry original request with new token
   ↓
9. If refresh fails → Redirect to login
```

### Authentication Guard

```
Route Navigation
      │
      ├─ Check if route requires auth
      │
      ├─ Yes ──> Check if user is authenticated
      │          │
      │          ├─ Yes ──> Allow navigation
      │          │
      │          └─ No ──> Redirect to /login
      │
      └─ No ──> Allow navigation
```

## Feature Access Control

### Feature Access Architecture

```
Component
    │
    ├─ useFeatureAccess()
    │       │
    │       ├─ hasFeature(key) ──────> subscriptionStore
    │       │                                │
    │       │                                ├─ Get subscription
    │       │                                │
    │       │                                ├─ Get plan
    │       │                                │
    │       │                                └─ Check features
    │       │
    │       └─ Return true/false
    │
    └─ Render based on access
```

### Feature Check Flow

```
1. Component needs to check feature
   ↓
2. Call hasFeature(FeatureKey.SALES_ANALYTICS)
   ↓
3. Get current subscription from store
   ↓
4. Get plan from subscription
   ↓
5. Check if plan.features includes feature
   ↓
6. Return true/false
   ↓
7. Component shows/hides feature
   OR
   Shows upgrade prompt
```

### Backend Validation

```
API Request
    │
    ├─ JwtAuthGuard (Verify token)
    │       │
    │       └─ Extract user + tenant
    │
    ├─ FeatureAccessGuard (Check feature)
    │       │
    │       ├─ Get required feature from decorator
    │       │
    │       ├─ Get tenant subscription
    │       │
    │       ├─ Check if plan has feature
    │       │
    │       └─ Allow/Deny (403 if denied)
    │
    └─ Controller method executes
```

## Data Flow

### Read Operation (GET)

```
Component
    │
    ├─ onMounted() or user action
    │
    ├─ Call store.fetchItems()
    │       │
    │       ├─ Set loading = true
    │       │
    │       ├─ API GET /menu/items
    │       │       │
    │       │       └─ Backend queries database
    │       │
    │       ├─ Receive response
    │       │
    │       ├─ Update store.items
    │       │
    │       └─ Set loading = false
    │
    └─ Component reactively updates UI
```

### Write Operation (POST/PATCH)

```
Component
    │
    ├─ User submits form
    │
    ├─ Validate form data
    │
    ├─ Call store.createItem(data)
    │       │
    │       ├─ API POST /menu/items
    │       │       │
    │       │       └─ Backend validates + saves to DB
    │       │
    │       ├─ Receive new item
    │       │
    │       ├─ Add to store.items
    │       │
    │       └─ Show success toast
    │
    └─ Component reactively updates UI
```

### Optimistic Update Pattern

```
Component
    │
    ├─ User toggles item active status
    │
    ├─ Immediately update UI (optimistic)
    │
    ├─ Call store.updateItem(id, { isActive: false })
    │       │
    │       ├─ API PATCH /menu/items/:id
    │       │       │
    │       │       ├─ Success ──> Keep optimistic update
    │       │       │
    │       │       └─ Error ──> Revert optimistic update
    │       │                    Show error toast
    │       │
    │       └─ Update store
    │
    └─ UI reflects final state
```

## Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Security                         │
├─────────────────────────────────────────────────────────────┤
│  1. Input Validation                                         │
│     - Form validation                                        │
│     - Type checking (TypeScript)                            │
│     - Sanitize user input                                   │
│                                                               │
│  2. Authentication                                           │
│     - JWT token storage (localStorage)                      │
│     - Token expiration handling                             │
│     - Automatic token refresh                               │
│                                                               │
│  3. Authorization                                            │
│     - Route guards (middleware)                             │
│     - Feature access control                                │
│     - Plan-based restrictions                               │
│                                                               │
│  4. XSS Protection                                           │
│     - Vue's automatic escaping                              │
│     - v-html avoided                                        │
│     - Content Security Policy                               │
│                                                               │
│  5. CSRF Protection                                          │
│     - SameSite cookies                                      │
│     - CSRF tokens for state-changing operations             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Backend Security                          │
├─────────────────────────────────────────────────────────────┤
│  1. Authentication                                           │
│     - JWT verification                                      │
│     - Password hashing (bcrypt)                             │
│     - Token expiration                                      │
│                                                               │
│  2. Authorization                                            │
│     - Role-based access control                             │
│     - Tenant isolation                                      │
│     - Feature access validation                             │
│                                                               │
│  3. Input Validation                                         │
│     - DTO validation (class-validator)                      │
│     - SQL injection prevention (Prisma)                     │
│     - Rate limiting                                         │
│                                                               │
│  4. Data Protection                                          │
│     - Encryption at rest                                    │
│     - HTTPS in transit                                      │
│     - Sensitive data masking                                │
└─────────────────────────────────────────────────────────────┘
```

### Tenant Isolation

```
Every API Request
    │
    ├─ Extract JWT token
    │
    ├─ Verify token
    │
    ├─ Extract user from token
    │
    ├─ Get user's tenantId
    │
    ├─ Inject tenantId into request context
    │
    ├─ All database queries filtered by tenantId
    │
    └─ Response only includes tenant's data
```

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: Automatic with Nuxt 3
2. **Lazy Loading**: Components loaded on demand
3. **Caching**: API responses cached when appropriate
4. **Debouncing**: Search inputs debounced
5. **Virtual Scrolling**: Large lists use virtual scrolling
6. **Image Optimization**: Images lazy-loaded and optimized

### Backend Optimization

1. **Database Indexing**: Indexes on frequently queried fields
2. **Query Optimization**: Select only needed fields
3. **Caching**: Redis for frequently accessed data
4. **Pagination**: Large datasets paginated
5. **Connection Pooling**: Database connection pooling

### Bundle Size Optimization

```
- Tree shaking (automatic with Vite)
- Dynamic imports for large components
- Minimize dependencies
- Use production builds
- Compress assets (gzip/brotli)
```

## Summary

The Tenant Admin Dashboard architecture provides:

- **Separation of Concerns**: Clear layer boundaries
- **Scalability**: Modular design for easy extension
- **Security**: Multiple security layers
- **Performance**: Optimized for speed
- **Maintainability**: Clean code structure
- **Type Safety**: Full TypeScript coverage

For more details, see:
- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Integration](./API_INTEGRATION.md)
- [Feature Access Control](./FEATURE_ACCESS_CONTROL.md)
