# Enhanced API Plugin Implementation

## Overview

This document describes the implementation of the Enhanced API Plugin for the Tenant Admin application, which provides standardized API communication with proper dependency injection.

## Implementation Details

### 1. Enhanced API Plugin (`plugins/enhanced-api.client.ts`)

**Features Implemented:**
- ✅ Proper dependency injection (Toast, Router, Nuxt App)
- ✅ Plugin loading order management (depends on toast plugin)
- ✅ Axios instance configuration with base URL and timeout
- ✅ Automatic auth token injection from localStorage
- ✅ Toast fallback mechanism (nuxtApp.$toast → useToast composable → console logging)
- ✅ Global error handler registration
- ✅ Service availability through `$api`

**Key Implementation Points:**
```typescript
export default defineNuxtPlugin({
  name: 'enhanced-api',
  dependsOn: ['toast'], // Ensures proper loading order
  setup(nuxtApp) {
    // Dependency injection with fallbacks
    const toast = getToastInstance(); // Smart toast resolution
    const apiService = new EnhancedApiService(axiosInstance, toast, router, nuxtApp);
    
    return {
      provide: {
        api: apiService // Available as $api throughout the app
      }
    };
  }
});
```

### 2. Toast Plugin (`plugins/toast.client.ts`)

**Features Implemented:**
- ✅ Toast interface standardization
- ✅ Integration with useToast composable
- ✅ Proper plugin naming for dependency management
- ✅ Service availability through `$toast`

**Key Implementation Points:**
```typescript
export default defineNuxtPlugin({
  name: 'toast', // Named plugin for dependency management
  setup(nuxtApp) {
    const toastInterface = {
      success: (msg: string, options?: any) => success(msg),
      error: (msg: string, options?: any) => error(msg),
      // ... other methods
    };

    return {
      provide: {
        toast: toastInterface // Available as $toast throughout the app
      }
    };
  }
});
```

### 3. TypeScript Declarations (`types/nuxt.d.ts`)

**Features Implemented:**
- ✅ Proper typing for `$api` service
- ✅ Proper typing for `$toast` interface
- ✅ Module augmentation for both `#app` and `vue`
- ✅ Type safety for component usage

**Key Implementation Points:**
```typescript
declare module '#app' {
  interface NuxtApp {
    $api: EnhancedApiService;
    $toast: ToastInterface;
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: EnhancedApiService;
    $toast: ToastInterface;
  }
}
```

## Usage Examples

### In Vue Components

```vue
<script setup lang="ts">
// Access API service
const { $api } = useNuxtApp();

// Make API calls with automatic unwrapping
const users = await $api.get<User[]>('/users');

// Make API calls with success messages
await $api.post('/users', userData, {
  successMessage: 'User created successfully!'
});

// Download files
await $api.downloadFile('/reports/export', { format: 'xlsx' });
</script>
```

### In Composables

```typescript
export function useUserManagement() {
  const { $api } = useNuxtApp();
  
  const createUser = async (userData: CreateUserRequest) => {
    return await $api.post<User>('/users', userData, {
      successMessage: 'User created successfully!'
    });
  };
  
  return { createUser };
}
```

### In Pinia Stores

```typescript
export const useUserStore = defineStore('users', {
  actions: {
    async fetchUsers() {
      const { $api } = useNuxtApp();
      
      try {
        this.users = await $api.get<User[]>('/users');
      } catch (error) {
        // Error handling is automatic via interceptors
        this.users = [];
      }
    }
  }
});
```

## Requirements Validation

### Requirement 1.1: Unwrapping
✅ **Implemented**: API service automatically extracts `data` from `ApiResponse<T>` when `unwrap: true` (default)

### Requirement 1.2: Binary Handling  
✅ **Implemented**: Special handling for blob responses via `isBlob: true` option and `responseType: 'blob'`

### Requirement 1.3: Success Feedback
✅ **Implemented**: Automatic toast notifications via `successMessage` parameter

### Requirement 1.4: Normalization
✅ **Implemented**: Legacy response normalization in response interceptor

### Requirement 1.5: Traceability
✅ **Implemented**: Request ID extraction and display in error messages

## Plugin Loading Order

1. **Toast Plugin** (`toast.client.ts`) - Provides toast interface
2. **Enhanced API Plugin** (`enhanced-api.client.ts`) - Depends on toast, provides API service
3. **Other Plugins** - Can safely use both `$api` and `$toast`

## Error Handling

The plugin implements comprehensive error handling:

- **401 Errors**: Automatic token refresh with request queue
- **Blob Errors**: JSON parsing inside blob responses
- **Network Errors**: Proper error propagation with request ID
- **Toast Integration**: Automatic error notifications with tracing

## Testing

The plugin implementation has been validated through:

- ✅ Enhanced API Service unit tests (7 tests passing)
- ✅ Type definitions validation
- ✅ Integration with existing Enhanced API Service
- ✅ Proper dependency injection verification

## Next Steps

With the plugin implementation complete, the following can now be implemented:

1. **Enhanced Form Composable** - Can safely use `$api` service
2. **Enhanced Auth Store** - Can use both `$api` and `$toast`
3. **Enhanced Menu Store** - Full API integration available
4. **Dashboard Store** - Error isolation with toast notifications

## Configuration

The plugin uses the following runtime configuration:

```typescript
runtimeConfig: {
  public: {
    apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  }
}
```

## Security Considerations

- ✅ Automatic token injection from secure localStorage
- ✅ Request timeout configuration (30 seconds)
- ✅ Proper CORS handling with `withCredentials: true`
- ✅ Tenant context injection via headers
- ✅ Error message sanitization for production