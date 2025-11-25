# Authentication Quick Reference

## Usage in Components

### Using the Auth Composable

```vue
<script setup lang="ts">
const { 
  login, 
  logout, 
  currentUser, 
  isAuthenticated,
  isTenantAdmin,
  loading 
} = useAuth()

// Login
const handleLogin = async () => {
  try {
    await login('user@example.com', 'password')
    // Success - user is now logged in
  } catch (error) {
    // Handle error
  }
}

// Logout
const handleLogout = async () => {
  await logout()
  // User is now logged out
}

// Check authentication
if (isAuthenticated.value) {
  console.log('User is logged in:', currentUser.value)
}
</script>
```

### Protecting Routes

Add middleware to page meta:

```vue
<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
})
</script>
```

### Accessing User in Store

```typescript
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()

// Get user
const user = authStore.user

// Check role
if (authStore.isTenantAdmin) {
  // Admin-only logic
}
```

## API Calls with Authentication

The API service automatically includes the JWT token in all requests:

```typescript
const api = useApi()

// All requests automatically include Authorization header
const data = await api.get('/menu')
const result = await api.post('/menu', { name: 'New Menu' })
```

## Token Management

### Access Token
- Stored in memory (API service instance)
- Automatically included in request headers
- Refreshed automatically on expiration

### Refresh Token
- Stored in localStorage
- Used to get new access token
- Revoked on logout

### Automatic Refresh
The API service automatically refreshes expired tokens:
1. Request returns 401
2. Refresh token used to get new access token
3. Original request retried with new token
4. If refresh fails, user redirected to login

## Error Handling

### Login Errors

```typescript
try {
  await login(email, password)
} catch (error) {
  if (error.response?.status === 401) {
    // Invalid credentials
  } else if (error.response?.status === 429) {
    // Too many attempts
  } else {
    // Other error
  }
}
```

### API Request Errors

```typescript
try {
  const data = await api.get('/menu')
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - token invalid
  } else if (error.response?.status === 403) {
    // Forbidden - feature not available
  }
}
```

## Common Patterns

### Check if User is Logged In

```vue
<template>
  <div v-if="isAuthenticated">
    Welcome, {{ currentUser?.firstName }}!
  </div>
  <div v-else>
    Please log in
  </div>
</template>

<script setup lang="ts">
const { isAuthenticated, currentUser } = useAuth()
</script>
```

### Role-Based Rendering

```vue
<template>
  <div v-if="isTenantAdmin">
    Admin-only content
  </div>
  <div v-else-if="isTenantStaff">
    Staff content
  </div>
</template>

<script setup lang="ts">
const { isTenantAdmin, isTenantStaff } = useAuth()
</script>
```

### Loading States

```vue
<template>
  <button :disabled="loading" @click="handleLogin">
    {{ loading ? 'Logging in...' : 'Login' }}
  </button>
</template>

<script setup lang="ts">
const { login, loading } = useAuth()

const handleLogin = async () => {
  await login(email.value, password.value)
}
</script>
```

## Environment Configuration

Set the API base URL in `.env`:

```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

## Debugging

### Check Token

```typescript
const api = useApi()
const token = api.getToken()
console.log('Current token:', token)
```

### Check User State

```typescript
const authStore = useAuthStore()
console.log('User:', authStore.user)
console.log('Authenticated:', authStore.isAuthenticated)
```

### Clear Auth State

```typescript
const api = useApi()
api.clearToken()

const authStore = useAuthStore()
authStore.clearUser()
```

## Security Best Practices

1. **Never log tokens** - Tokens are sensitive credentials
2. **Use HTTPS in production** - Protect tokens in transit
3. **Set short token expiration** - Minimize risk if token stolen
4. **Validate on server** - Never trust client-side auth alone
5. **Clear tokens on logout** - Prevent unauthorized access

## Troubleshooting

### "Unauthorized" on every request
- Check if token is being set after login
- Verify API base URL is correct
- Check if backend is running

### Infinite redirect loop
- Check middleware logic
- Verify token is being stored
- Check if user fetch is succeeding

### Token not refreshing
- Verify refresh token is in localStorage
- Check refresh endpoint is working
- Verify refresh token hasn't expired

### User not persisting on refresh
- Check auth plugin is running
- Verify token is in localStorage
- Check if user fetch endpoint works
