# Next Steps - After Task 11

## Current Status ✅

Task 11 (Create tenant-admin project structure) is **COMPLETED**.

The project foundation is ready with:
- ✅ Nuxt 3 + TypeScript + SCSS
- ✅ Complete SCSS design system
- ✅ API service with interceptors
- ✅ Pinia stores (placeholders)
- ✅ Type definitions
- ✅ Project structure

## Immediate Next Tasks

### Task 12: Create SCSS foundation ✅
**Status:** Already completed as part of Task 11

The SCSS foundation is complete with:
- Variables (_variables.scss)
- Mixins (_mixins.scss)
- Functions (_functions.scss)
- Base styles (reset, typography)
- Utilities

**No additional work needed for Task 12.**

### Task 13: Implement Authentication (NEXT)

**What needs to be done:**
1. Create login page with form
2. Create register page
3. Implement auth store actions (login, logout, fetchUser)
4. Create useAuth composable
5. Implement JWT token storage and refresh
6. Add authentication middleware

**Files to modify:**
- `pages/login.vue` - Complete the login form
- `pages/register.vue` - Create registration form
- `stores/auth.ts` - Implement login/logout/fetchUser actions
- `composables/useAuth.ts` - Create auth composable
- `middleware/auth.ts` - Complete auth middleware

**API endpoints to integrate:**
- POST `/auth/login` - Login
- POST `/auth/register` - Register
- POST `/auth/logout` - Logout
- GET `/auth/me` - Get current user
- POST `/auth/refresh` - Refresh token

**Example implementation:**
```typescript
// stores/auth.ts
async login(email: string, password: string) {
  this.loading = true
  try {
    const api = useApi()
    const response = await api.post('/auth/login', { email, password })
    
    const { accessToken, refreshToken, user } = response
    
    api.setToken(accessToken)
    localStorage.setItem('tenant_refresh_token', refreshToken)
    
    this.setUser(user)
    
    return true
  } catch (error) {
    console.error('Login failed:', error)
    return false
  } finally {
    this.loading = false
  }
}
```

### Task 14: Create Dashboard Overview

**What needs to be done:**
1. Create dashboard page
2. Display key metrics
3. Show sales stats (if PRO/BUSINESS)
4. Display recent activity
5. Add quick action buttons
6. Create PlanLimitIndicator component

**Files to create:**
- `pages/dashboard.vue`
- `components/dashboard/DashboardOverview.vue`
- `components/dashboard/PlanLimitIndicator.vue`
- `components/dashboard/QuickActions.vue`

### Task 15-18: Menu Management

**What needs to be done:**
1. Create menu list page
2. Implement menu store actions
3. Create menu item form
4. Add image upload
5. Implement availability control
6. Add bulk operations

**Files to create:**
- `pages/menu/index.vue`
- `pages/menu/items/new.vue`
- `pages/menu/items/[id].vue`
- `components/menu/MenuItemList.vue`
- `components/menu/MenuItemForm.vue`
- `components/menu/MenuItemCard.vue`
- `components/menu/BulkMenuOperations.vue`

## Development Workflow

### 1. Start Development Server
```bash
cd apps/tenant-admin
pnpm dev
```

### 2. Make Changes
- Edit files in `pages/`, `components/`, `stores/`, etc.
- Follow SCSS guidelines strictly
- Use TypeScript types from `types/index.ts`
- Use API service via `useApi()`

### 3. Test Changes
- Check browser at `http://localhost:3003`
- Verify no TypeScript errors
- Test API integration
- Check responsive design

### 4. Commit Changes
```bash
git add .
git commit -m "feat: implement [feature name]"
```

## Key Resources

### Documentation
- `README.md` - Project overview
- `PROJECT_SETUP.md` - Setup details
- `QUICK_START.md` - Quick reference
- `TASK_11_COMPLETION.md` - Task 11 details
- `IMPLEMENTATION_SUMMARY.md` - Summary

### SCSS Guidelines
- See `SCSS_RULES.md` in project root
- Use BEM naming (no nested selectors)
- Always use variables
- Co-locate component styles

### API Integration
```typescript
// Use the API service
const api = useApi()

// Make requests
const data = await api.get('/endpoint')
await api.post('/endpoint', data)
await api.patch('/endpoint/:id', updates)
await api.delete('/endpoint/:id')
```

### State Management
```typescript
// Use Pinia stores
const authStore = useAuthStore()
const menuStore = useMenuStore()

// Access state
authStore.user
menuStore.menuItems

// Call actions
await authStore.login(email, password)
await menuStore.fetchMenus()
```

## Common Patterns

### Creating a New Page
```vue
<template>
  <div class="my-page">
    <h1>My Page</h1>
  </div>
</template>

<script setup lang="ts">
// Add authentication
definePageMeta({
  middleware: 'auth'
})

// Use stores
const authStore = useAuthStore()
const api = useApi()

// Fetch data
onMounted(async () => {
  // Load data
})
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.my-page {
  padding: $spacing-xl;
}
</style>
```

### Creating a New Component
```vue
<template>
  <div class="my-component">
    <h3 class="my-component__title">{{ title }}</h3>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
}

const props = defineProps<Props>()
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.my-component {
  padding: $spacing-md;
}

.my-component__title {
  font-size: $font-size-xl;
}
</style>
```

### Making API Calls
```typescript
const api = useApi()

try {
  const result = await api.post('/menu/items', {
    name: 'Pizza',
    price: 12.99,
    categoryId: '123'
  })
  
  console.log('Created:', result)
} catch (error) {
  if (error.response?.status === 403) {
    // Feature not available
    console.error('Upgrade required')
  } else {
    console.error('Error:', error)
  }
}
```

## Tips for Success

1. **Follow SCSS Guidelines**: Strictly adhere to BEM and variable usage
2. **Use TypeScript**: Leverage types for safety
3. **Test Responsively**: Check mobile, tablet, desktop
4. **Handle Errors**: Always catch and handle API errors
5. **Check Feature Access**: Verify plan-based features
6. **Document Changes**: Add comments and update docs
7. **Keep It Simple**: Start with minimal implementation

## Questions?

- Review the documentation files
- Check existing components for examples
- Look at the super-admin app for patterns
- Refer to the design document for requirements

## Ready to Start!

The foundation is solid. You can now:
1. Start implementing authentication (Task 13)
2. Build the dashboard (Task 14)
3. Create menu management (Tasks 15-18)
4. Add advanced features (Tasks 19+)

Good luck! 🚀
