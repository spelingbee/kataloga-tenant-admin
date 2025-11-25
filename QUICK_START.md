# Tenant Admin Dashboard - Quick Start Guide

## Getting Started

### 1. Install Dependencies
```bash
cd apps/tenant-admin
pnpm install
```

### 2. Configure Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env and set your backend API URL
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### 3. Run Development Server
```bash
pnpm dev
```

The app will be available at `http://localhost:3003`

## Project Structure

```
apps/tenant-admin/
├── assets/scss/          # SCSS styles (variables, mixins, utilities)
├── components/           # Vue components
├── composables/          # Vue composables
├── middleware/           # Route middleware
├── pages/                # Nuxt pages (auto-routing)
├── plugins/              # Nuxt plugins
├── services/             # API services
├── stores/               # Pinia stores
└── types/                # TypeScript types
```

## Using the API Service

```typescript
// In any component or composable
const api = useApi()

// GET request
const menus = await api.get('/menu')

// POST request
const newItem = await api.post('/menu/items', {
  name: 'Pizza',
  price: 12.99
})

// PATCH request
await api.patch('/menu/items/123', { isActive: false })

// DELETE request
await api.delete('/menu/items/123')
```

## Using Pinia Stores

```typescript
// In a component
const authStore = useAuthStore()
const menuStore = useMenuStore()

// Access state
console.log(authStore.user)
console.log(menuStore.menuItems)

// Call actions
await authStore.login(email, password)
await menuStore.fetchMenus()
```

## SCSS Guidelines

### 1. Use BEM Naming (No Nested Selectors)

❌ **Wrong:**
```scss
.card {
  &__header {
    &__title {
      font-size: 1.5rem;
    }
  }
}
```

✅ **Correct:**
```scss
.card {
  padding: $spacing-md;
}

.card__header {
  border-bottom: 1px solid $border-color;
}

.card__header-title {
  font-size: 1.5rem;
}
```

### 2. Always Use Variables

❌ **Wrong:**
```scss
.button {
  padding: 8px 16px;
  color: #0ea5e9;
}
```

✅ **Correct:**
```scss
.button {
  padding: $spacing-sm $spacing-md;
  color: $primary-color;
}
```

### 3. Component Styles

For simple components (<100 lines):
```vue
<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.my-component {
  padding: $spacing-md;
}
</style>
```

For complex components (>100 lines):
```
components/
└── MyComponent/
    ├── MyComponent.vue
    └── _my-component.scss
```

```vue
<style scoped lang="scss">
@use './my-component';
</style>
```

## Creating New Pages

Pages are auto-routed by Nuxt:

```
pages/
├── index.vue           → /
├── login.vue           → /login
├── dashboard.vue       → /dashboard
└── menu/
    ├── index.vue       → /menu
    └── [id].vue        → /menu/:id
```

## Creating New Components

```vue
<template>
  <div class="my-component">
    <h3 class="my-component__title">{{ title }}</h3>
    <p class="my-component__content">{{ content }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  content: string
}

const props = defineProps<Props>()
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.my-component {
  padding: $spacing-md;
  background: $bg-primary;
  border-radius: $radius-md;
}

.my-component__title {
  font-size: $font-size-xl;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.my-component__content {
  color: $text-secondary;
}
</style>
```

## Creating New Stores

```typescript
import { defineStore } from 'pinia'

interface MyState {
  items: any[]
  loading: boolean
}

export const useMyStore = defineStore('my-store', {
  state: (): MyState => ({
    items: [],
    loading: false,
  }),

  getters: {
    itemCount: (state) => state.items.length,
  },

  actions: {
    async fetchItems() {
      this.loading = true
      try {
        const api = useApi()
        this.items = await api.get('/items')
      } finally {
        this.loading = false
      }
    },
  },
})
```

## Available SCSS Variables

### Colors
- `$primary-color`, `$primary-dark`, `$primary-light`
- `$secondary-color`, `$secondary-dark`, `$secondary-light`
- `$success-color`, `$warning-color`, `$error-color`, `$info-color`

### Spacing
- `$spacing-xs` (4px)
- `$spacing-sm` (8px)
- `$spacing-md` (16px)
- `$spacing-lg` (24px)
- `$spacing-xl` (32px)
- `$spacing-2xl` (48px)
- `$spacing-3xl` (64px)

### Border Radius
- `$radius-sm` (4px)
- `$radius-md` (8px)
- `$radius-lg` (12px)
- `$radius-xl` (16px)
- `$radius-full` (9999px)

### Shadows
- `$shadow-sm`, `$shadow-md`, `$shadow-lg`, `$shadow-xl`

### Transitions
- `$transition-fast` (150ms)
- `$transition-base` (200ms)
- `$transition-slow` (300ms)

## Available Mixins

```scss
@use '@/assets/scss/abstracts/mixins' as *;

// Responsive breakpoints
@include respond-to('md') {
  // Styles for medium screens and up
}

// Flexbox utilities
@include flex-center;
@include flex-between;
@include flex-column;

// Text utilities
@include truncate;
@include line-clamp(2);

// Card style
@include card;

// Button reset
@include button-reset;

// Focus ring
@include focus-ring;

// Hover lift effect
@include hover-lift;

// Custom scrollbar
@include custom-scrollbar;

// Absolute center
@include absolute-center;

// Visually hidden (accessible)
@include visually-hidden;
```

## Common Tasks

### Add Authentication to a Page
```typescript
// pages/dashboard.vue
definePageMeta({
  middleware: 'auth'
})
```

### Check Feature Access
```typescript
const authStore = useAuthStore()
const subscription = authStore.user?.tenant?.subscription

if (subscription?.plan?.features?.includes('sales_analytics')) {
  // Show analytics
}
```

### Handle API Errors
```typescript
try {
  await api.post('/menu/items', data)
} catch (error) {
  if (error.response?.status === 403) {
    // Feature not available - show upgrade prompt
  } else {
    // Handle other errors
  }
}
```

## Development Tips

1. **Hot Module Replacement**: Changes to components, pages, and stores are hot-reloaded
2. **TypeScript**: Use types from `~/types` for type safety
3. **Auto-imports**: Composables and components are auto-imported
4. **SCSS Variables**: Always use variables, never hardcode values
5. **BEM Naming**: Keep class names flat, no nested selectors

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Types
pnpm postinstall      # Generate TypeScript types

# Linting (to be added)
pnpm lint             # Run linter
pnpm lint:fix         # Fix linting issues
```

## Next Steps

1. Implement authentication (Task 13)
2. Create dashboard page (Task 14)
3. Build menu management (Tasks 15-18)
4. Add category management (Task 19)
5. Implement advanced features (Tasks 20+)

## Resources

- [Nuxt 3 Documentation](https://nuxt.com/docs)
- [Vue 3 Documentation](https://vuejs.org/guide/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [SCSS Documentation](https://sass-lang.com/documentation/)

## Need Help?

- Check `README.md` for detailed documentation
- Review `PROJECT_SETUP.md` for setup details
- See `SCSS_RULES.md` in project root for SCSS guidelines
- Look at existing components for examples
