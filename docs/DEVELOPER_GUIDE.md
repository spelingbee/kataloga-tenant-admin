# Tenant Admin Dashboard - Developer Guide

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Technology Stack](#technology-stack)
4. [Development Setup](#development-setup)
5. [Core Concepts](#core-concepts)
6. [API Integration](#api-integration)
7. [State Management](#state-management)
8. [Feature Access Control](#feature-access-control)
9. [SCSS Guidelines](#scss-guidelines)
10. [Component Patterns](#component-patterns)
11. [Error Handling](#error-handling)
12. [Testing](#testing)
13. [Build and Deployment](#build-and-deployment)

## Architecture Overview

The Tenant Admin Dashboard is a separate Nuxt 3 application that provides restaurant/cafe owners with a comprehensive management interface. It follows a modular architecture with clear separation of concerns.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Tenant Admin Frontend                       │
│  (Nuxt 3 + Vue 3 + Pinia + SCSS)                            │
├─────────────────────────────────────────────────────────────┤
│  Pages → Components → Composables → Stores → API Service    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Backend NestJS API                        │
│  (Shared with Super Admin)                                   │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Principles

1. **Separation of Concerns**: Clear boundaries between UI, business logic, and data
2. **Component-Based**: Reusable, composable Vue components
3. **Type Safety**: Full TypeScript coverage
4. **Plan-Based Access**: Feature availability based on subscription plans
5. **Tenant Isolation**: All data scoped to authenticated tenant

## Project Structure

```
apps/tenant-admin/
├── assets/
│   └── scss/                      # SCSS styles
│       ├── main.scss              # Main entry point
│       ├── _variables.scss        # Design tokens
│       ├── _utilities.scss        # Utility classes
│       ├── abstracts/             # Mixins and functions
│       │   ├── _mixins.scss
│       │   └── _functions.scss
│       └── base/                  # Base styles
│           ├── _reset.scss
│           └── _typography.scss
├── components/                    # Vue components
│   ├── ui/                        # Reusable UI components
│   │   ├── DataTable/             # Complex component (folder)
│   │   │   ├── DataTable.vue
│   │   │   └── _data-table.scss
│   │   ├── Modal/                 # Complex with sub-components
│   │   │   ├── Modal.vue
│   │   │   ├── _base.scss
│   │   │   ├── _modal.scss
│   │   │   ├── ConfirmDialog.vue
│   │   │   └── _confirm-dialog.scss
│   │   ├── FeatureGuard.vue       # Simple component
│   │   └── LoadingSpinner.vue     # Simple component
│   ├── menu/                      # Menu-related components
│   │   ├── MenuItemList.vue
│   │   ├── _menu-item-list.scss
│   │   ├── MenuItemForm.vue
│   │   └── BulkMenuOperations.vue
│   ├── category/                  # Category components
│   ├── location/                  # Location components
│   ├── dashboard/                 # Dashboard components
│   └── team/                      # Team management components
├── composables/                   # Vue composables
│   ├── useApi.ts                  # API client
│   ├── useAuth.ts                 # Authentication
│   ├── useFeatureAccess.ts        # Feature access control
│   └── useToast.ts                # Toast notifications
├── middleware/                    # Route middleware
│   └── auth.ts                    # Authentication guard
├── pages/                         # Nuxt pages (routes)
│   ├── index.vue                  # Dashboard
│   ├── login.vue                  # Login page
│   ├── menu/
│   │   └── index.vue              # Menu list
│   ├── categories/
│   │   └── index.vue              # Categories
│   ├── locations/                 # PRO/BUSINESS
│   │   └── index.vue
│   ├── analytics/                 # PRO/BUSINESS
│   │   └── index.vue
│   ├── team/                      # PRO/BUSINESS
│   │   └── index.vue
│   └── subscription/
│       └── index.vue
├── plugins/                       # Nuxt plugins
│   ├── api.client.ts              # API plugin
│   ├── auth.client.ts             # Auth plugin
│   ├── feature-access.client.ts   # Feature access plugin
│   └── toast.client.ts            # Toast plugin
├── services/                      # API services
│   └── api.service.ts             # HTTP client
├── stores/                        # Pinia stores
│   ├── auth.ts                    # Authentication state
│   ├── menu.ts                    # Menu state
│   ├── category.ts                # Category state
│   ├── location.ts                # Location state
│   ├── analytics.ts               # Analytics state
│   ├── subscription.ts            # Subscription state
│   └── team.ts                    # Team state
├── types/                         # TypeScript types
│   └── index.ts                   # Type definitions
├── app.vue                        # Root component
├── nuxt.config.ts                 # Nuxt configuration
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
└── .env                           # Environment variables
```

### Directory Organization Rules

1. **Simple Components (<100 lines)**: Styles inside `.vue` file
2. **Medium Components (>100 lines)**: Separate `_component.scss` file next to component
3. **Complex Components**: Folder with multiple files and shared `_base.scss`
4. **Composables**: Reusable logic extracted from components
5. **Stores**: Global state management with Pinia
6. **Services**: External API communication

## Technology Stack

### Core Technologies

- **Nuxt 3**: Vue.js framework with SSR/SSG support
- **Vue 3**: Progressive JavaScript framework with Composition API
- **TypeScript**: Type-safe JavaScript
- **Pinia**: State management library
- **SCSS**: CSS preprocessor with BEM methodology
- **Axios**: HTTP client for API requests

### Development Tools

- **Vite**: Fast build tool and dev server
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript Compiler**: Type checking

### Key Dependencies

```json
{
  "dependencies": {
    "@pinia/nuxt": "^0.5.1",
    "axios": "^1.6.2",
    "nuxt": "^3.13.0",
    "pinia": "^2.1.7",
    "vue": "^3.4.0",
    "vuedraggable": "^4.1.0"
  },
  "devDependencies": {
    "sass": "^1.69.5",
    "typescript": "^5.3.2"
  }
}
```

## Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended) or npm
- Git

### Initial Setup

1. **Clone the repository**:
```bash
git clone <repository-url>
cd apps/tenant-admin
```

2. **Install dependencies**:
```bash
pnpm install
```

3. **Configure environment**:
```bash
cp .env.example .env
```

Edit `.env`:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

4. **Start development server**:
```bash
pnpm dev
```

The app will be available at `http://localhost:3003`

### Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Generate static site
pnpm generate

# Type check
pnpm postinstall
```

### IDE Setup

**Recommended VS Code Extensions**:
- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- SCSS IntelliSense

**VS Code Settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## Core Concepts

### 1. Composition API

All components use Vue 3 Composition API with `<script setup>`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

### 2. Composables

Reusable logic extracted into composables:

```typescript
// composables/useCounter.ts
export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  
  const increment = () => count.value++
  const decrement = () => count.value--
  
  return {
    count: readonly(count),
    increment,
    decrement
  }
}

// Usage in component
const { count, increment } = useCounter(10)
```

### 3. TypeScript Integration

Full type safety throughout the application:

```typescript
// types/index.ts
export interface MenuItem {
  id: string
  name: string
  price: number
  isActive: boolean
  categoryId?: string
}

// Component usage
const menuItem = ref<MenuItem>({
  id: '1',
  name: 'Pizza',
  price: 12.99,
  isActive: true
})
```

### 4. Reactive State

Use Vue's reactivity system properly:

```typescript
// ✅ Correct
const state = reactive({
  items: [],
  loading: false
})

// ✅ Correct
const items = ref<MenuItem[]>([])

// ❌ Wrong - loses reactivity
let items = []
```

## API Integration

### API Service Architecture

The application uses a centralized API service (`services/api.service.ts`) that provides:

1. **Singleton Pattern**: Single instance across the app
2. **Token Management**: Automatic JWT handling
3. **Token Refresh**: Auto-refresh on 401 errors
4. **Interceptors**: Request/response processing
5. **Error Handling**: Centralized error management

### API Service Implementation

```typescript
// services/api.service.ts
class ApiService {
  private axiosInstance: AxiosInstance
  private static instance: ApiService
  
  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: config.public.apiBaseUrl,
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    this.setupInterceptors()
  }
  
  private setupInterceptors() {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      }
    )
    
    // Response interceptor - handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.refreshToken()
        }
        return Promise.reject(error)
      }
    )
  }
}
```

### Using the API Service

```typescript
// In a component or composable
const api = useApi()

// GET request
const fetchMenuItems = async () => {
  try {
    const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items')
    return response.data
  } catch (error) {
    console.error('Failed to fetch menu items:', error)
    throw error
  }
}

// POST request
const createMenuItem = async (data: CreateMenuItemDto) => {
  const response = await api.post<ApiResponse<MenuItem>>('/menu/items', data)
  return response.data
}

// PATCH request
const updateMenuItem = async (id: string, data: Partial<MenuItem>) => {
  const response = await api.patch<ApiResponse<MenuItem>>(`/menu/items/${id}`, data)
  return response.data
}

// DELETE request
const deleteMenuItem = async (id: string) => {
  await api.delete(`/menu/items/${id}`)
}
```

### API Response Format

All API responses follow a consistent format:

```typescript
// Success response
interface ApiResponse<T> {
  success: true
  data: T
  message?: string
}

// Error response
interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: any
  }
}

// Paginated response
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
```

### Error Handling

```typescript
try {
  const data = await api.get('/menu/items')
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 403) {
      // Feature not available
      showUpgradePrompt()
    } else if (error.response?.status === 404) {
      // Not found
      showNotFoundMessage()
    } else {
      // Generic error
      showErrorMessage(error.response?.data?.error?.message)
    }
  }
}
```

## State Management

### Pinia Store Structure

Each store follows a consistent pattern:

```typescript
// stores/menu.ts
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  // State
  const items = ref<MenuItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Getters
  const activeItems = computed(() => 
    items.value.filter(item => item.isActive)
  )
  
  const itemCount = computed(() => items.value.length)
  
  // Actions
  const fetchItems = async () => {
    loading.value = true
    error.value = null
    
    try {
      const api = useApi()
      const response = await api.get<ApiResponse<MenuItem[]>>('/menu/items')
      items.value = response.data
    } catch (err) {
      error.value = 'Failed to fetch menu items'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createItem = async (data: CreateMenuItemDto) => {
    const api = useApi()
    const response = await api.post<ApiResponse<MenuItem>>('/menu/items', data)
    items.value.push(response.data)
    return response.data
  }
  
  const updateItem = async (id: string, data: Partial<MenuItem>) => {
    const api = useApi()
    const response = await api.patch<ApiResponse<MenuItem>>(`/menu/items/${id}`, data)
    
    const index = items.value.findIndex(item => item.id === id)
    if (index !== -1) {
      items.value[index] = response.data
    }
    
    return response.data
  }
  
  const deleteItem = async (id: string) => {
    const api = useApi()
    await api.delete(`/menu/items/${id}`)
    
    items.value = items.value.filter(item => item.id !== id)
  }
  
  return {
    // State
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    
    // Getters
    activeItems,
    itemCount,
    
    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem
  }
})
```

### Using Stores in Components

```vue
<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'

const menuStore = useMenuStore()

// Access state
const items = computed(() => menuStore.items)
const loading = computed(() => menuStore.loading)

// Access getters
const activeItems = computed(() => menuStore.activeItems)

// Call actions
onMounted(async () => {
  await menuStore.fetchItems()
})

const handleCreate = async (data: CreateMenuItemDto) => {
  await menuStore.createItem(data)
}
</script>
```

### Store Best Practices

1. **Use Setup Stores**: Prefer setup syntax over options syntax
2. **Readonly State**: Export state as readonly to prevent direct mutations
3. **Async Actions**: Handle loading and error states in actions
4. **Type Safety**: Use TypeScript for all store definitions
5. **Single Responsibility**: Each store manages one domain

## Feature Access Control

### Feature Keys

```typescript
export enum FeatureKey {
  SALES_ANALYTICS = 'sales_analytics',
  ADVANCED_REPORTING = 'advanced_reporting',
  API_ACCESS = 'api_access',
  CUSTOM_BRANDING = 'custom_branding',
  MULTI_LOCATION = 'multi_location',
  AUDIT_TRAIL = 'audit_trail',
  DATA_EXPORT = 'data_export',
  MULTI_USER = 'multi_user',
  PRIORITY_SUPPORT = 'priority_support'
}
```

### Feature Access Composable

```typescript
// composables/useFeatureAccess.ts
export function useFeatureAccess() {
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()
  
  const hasFeature = (featureKey: FeatureKey): boolean => {
    const subscription = subscriptionStore.subscription
    if (!subscription) return false
    
    return subscription.plan.features.some(
      f => f.featureKey === featureKey && f.isEnabled
    )
  }
  
  const requireFeature = (featureKey: FeatureKey) => {
    if (!hasFeature(featureKey)) {
      throw new Error(`Feature ${featureKey} not available`)
    }
  }
  
  const getUpgradeUrl = (featureKey: FeatureKey): string => {
    return `/subscription?feature=${featureKey}`
  }
  
  return {
    hasFeature,
    requireFeature,
    getUpgradeUrl
  }
}
```

### Using Feature Guards in Components

```vue
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'

const { hasFeature } = useFeatureAccess()

const canViewAnalytics = computed(() => 
  hasFeature(FeatureKey.SALES_ANALYTICS)
)
</script>

<template>
  <div>
    <FeatureGuard :feature="FeatureKey.SALES_ANALYTICS">
      <SalesAnalyticsDashboard />
    </FeatureGuard>
  </div>
</template>
```

### FeatureGuard Component

```vue
<!-- components/ui/FeatureGuard.vue -->
<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess'

const props = defineProps<{
  feature: FeatureKey
}>()

const { hasFeature, getUpgradeUrl } = useFeatureAccess()

const hasAccess = computed(() => hasFeature(props.feature))
const upgradeUrl = computed(() => getUpgradeUrl(props.feature))
</script>

<template>
  <div v-if="hasAccess">
    <slot />
  </div>
  <div v-else class="feature-locked">
    <p>This feature is not available in your current plan.</p>
    <NuxtLink :to="upgradeUrl">Upgrade Now</NuxtLink>
  </div>
</template>
```

## SCSS Guidelines

See [SCSS_STYLE_GUIDE.md](./SCSS_STYLE_GUIDE.md) for complete guidelines.

### Key Rules

1. **BEM Methodology**: Use BEM naming without nested selectors
2. **Variables Required**: No hardcoded values
3. **Component Co-location**: Styles next to components
4. **DART SASS**: Use `@use` instead of `@import`
5. **Max Nesting**: 2-3 levels with context only

### Quick Reference

```scss
// ✅ Correct
.menu-item-card {
  padding: $spacing-md;
}

.menu-item-card__title {
  font-size: 1.25rem;
}

.menu-item-card__title--highlighted {
  color: $primary-color;
}

// ❌ Wrong
.menu-item-card {
  &__title {  // ❌ Nested BEM
    &--highlighted {  // ❌ Nested modifier
    }
  }
}
```

## Component Patterns

### Simple Component Pattern

```vue
<!-- components/ui/LoadingSpinner.vue -->
<script setup lang="ts">
const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})
</script>

<template>
  <div :class="['loading-spinner', `loading-spinner--${size}`]">
    <div class="loading-spinner__circle"></div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.loading-spinner {
  display: inline-block;
}

.loading-spinner--sm {
  width: 1rem;
  height: 1rem;
}

.loading-spinner--md {
  width: 2rem;
  height: 2rem;
}

.loading-spinner--lg {
  width: 3rem;
  height: 3rem;
}

.loading-spinner__circle {
  border: 2px solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
```

### Complex Component Pattern

```vue
<!-- components/menu/MenuItemList.vue -->
<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'

const menuStore = useMenuStore()

const items = computed(() => menuStore.items)
const loading = computed(() => menuStore.loading)

onMounted(async () => {
  await menuStore.fetchItems()
})
</script>

<template>
  <div class="menu-item-list">
    <LoadingSpinner v-if="loading" />
    
    <div v-else class="menu-item-list__grid">
      <MenuItemCard
        v-for="item in items"
        :key="item.id"
        :item="item"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use './menu-item-list';
</style>
```

### Form Component Pattern

```vue
<!-- components/menu/MenuItemForm.vue -->
<script setup lang="ts">
import { useMenuStore } from '~/stores/menu'

const props = defineProps<{
  item?: MenuItem
}>()

const emit = defineEmits<{
  submit: [item: MenuItem]
  cancel: []
}>()

const form = reactive({
  name: props.item?.name || '',
  price: props.item?.price || 0,
  description: props.item?.description || '',
  categoryId: props.item?.categoryId || ''
})

const errors = reactive({
  name: '',
  price: ''
})

const validate = (): boolean => {
  errors.name = form.name ? '' : 'Name is required'
  errors.price = form.price > 0 ? '' : 'Price must be positive'
  
  return !errors.name && !errors.price
}

const handleSubmit = async () => {
  if (!validate()) return
  
  const menuStore = useMenuStore()
  
  if (props.item) {
    await menuStore.updateItem(props.item.id, form)
  } else {
    await menuStore.createItem(form)
  }
  
  emit('submit', form as MenuItem)
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="menu-item-form">
    <div class="menu-item-form__field">
      <label class="menu-item-form__label">Name</label>
      <input
        v-model="form.name"
        type="text"
        class="menu-item-form__input"
      />
      <span v-if="errors.name" class="menu-item-form__error">
        {{ errors.name }}
      </span>
    </div>
    
    <div class="menu-item-form__actions">
      <button type="submit" class="btn btn--primary">
        Save
      </button>
      <button type="button" @click="emit('cancel')" class="btn">
        Cancel
      </button>
    </div>
  </form>
</template>
```

## Error Handling

### Global Error Handler

```typescript
// plugins/error-handler.client.ts
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Global error:', error)
    console.error('Component:', instance)
    console.error('Info:', info)
    
    // Send to error tracking service
    // trackError(error)
  }
})
```

### Component Error Handling

```vue
<script setup lang="ts">
const error = ref<string | null>(null)
const loading = ref(false)

const fetchData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const api = useApi()
    const data = await api.get('/menu/items')
    // Process data
  } catch (err) {
    if (axios.isAxiosError(err)) {
      error.value = err.response?.data?.error?.message || 'An error occurred'
    } else {
      error.value = 'An unexpected error occurred'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
    
    <LoadingSpinner v-if="loading" />
    
    <div v-else>
      <!-- Content -->
    </div>
  </div>
</template>
```

## Testing

### Unit Testing

```typescript
// tests/composables/useCounter.test.ts
import { describe, it, expect } from 'vitest'
import { useCounter } from '~/composables/useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })
  
  it('initializes with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })
  
  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })
})
```

### Component Testing

```typescript
// tests/components/LoadingSpinner.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.classes()).toContain('loading-spinner--md')
  })
  
  it('renders with custom size', () => {
    const wrapper = mount(LoadingSpinner, {
      props: { size: 'lg' }
    })
    expect(wrapper.classes()).toContain('loading-spinner--lg')
  })
})
```

## Build and Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Environment Variables

Production environment variables:

```env
NUXT_PUBLIC_API_BASE_URL=https://api.production.com
NODE_ENV=production
```

### Deployment Checklist

- [ ] Update environment variables
- [ ] Run production build
- [ ] Test production build locally
- [ ] Check bundle size
- [ ] Verify API endpoints
- [ ] Test authentication flow
- [ ] Verify feature access control
- [ ] Check responsive design
- [ ] Test on multiple browsers
- [ ] Deploy to hosting platform

### Performance Optimization

1. **Code Splitting**: Automatic with Nuxt 3
2. **Lazy Loading**: Use `defineAsyncComponent` for large components
3. **Image Optimization**: Use Nuxt Image module
4. **Caching**: Implement proper caching strategies
5. **Bundle Analysis**: Use `nuxt analyze` to check bundle size

## Additional Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [SCSS Documentation](https://sass-lang.com/)

## Support

For questions or issues:
1. Check existing documentation
2. Review code examples
3. Contact the development team
