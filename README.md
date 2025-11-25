# Tenant Admin Dashboard

A comprehensive management interface for restaurant/cafe owners built with Nuxt 3, Vue 3, TypeScript, and SCSS.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Documentation](#documentation)
- [Development](#development)
- [Contributing](#contributing)

## ✨ Features

### Core Features (All Plans)
- **Menu Management**: Create, edit, and manage menu items with images
- **Category Management**: Organize menu items into categories with drag-and-drop reordering
- **Dish Availability**: Control which dishes are visible to customers
- **Image Upload**: Upload and manage menu item images

### PRO Plan Features
- **Sales Analytics**: View sales data and performance metrics
- **Multi-Location Support**: Manage up to 3 restaurant locations
- **Audit Trail**: Track all changes to menu and settings
- **Multi-User Access**: Invite up to 5 team members
- **Basic Data Export**: Export data to CSV

### BUSINESS Plan Features
- **Advanced Reporting**: Comprehensive business intelligence reports
- **API Access**: Integrate with third-party services
- **Custom Branding**: White-label the customer-facing menu
- **Unlimited Locations**: Manage unlimited restaurant locations
- **Unlimited Users**: Invite unlimited team members
- **Priority Support**: Get priority customer support

## 🛠 Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com/) - Vue.js framework with SSR/SSG
- **UI Library**: [Vue 3](https://vuejs.org/) with Composition API
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Vue store library
- **Styling**: SCSS with BEM methodology
- **HTTP Client**: [Axios](https://axios-http.com/) - Promise-based HTTP client
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- **Build Tool**: [Vite](https://vitejs.dev/) - Fast build tool

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher ([Download](https://nodejs.org/))
- **pnpm**: Recommended package manager ([Install](https://pnpm.io/installation))
- **Backend API**: Running NestJS backend (see backend documentation)

### Installation

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

Edit `.env` and set your backend API URL:
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

4. **Start development server**:
```bash
pnpm dev
```

The application will be available at `http://localhost:3003`

### First Time Setup

1. **Ensure backend is running**: The backend API must be running on the configured URL
2. **Create a tenant account**: Register through the tenant registration flow
3. **Login**: Use your credentials to access the dashboard
4. **Explore features**: Start by creating categories and menu items

## 📁 Project Structure

```
apps/tenant-admin/
├── assets/
│   └── scss/                      # SCSS styles
│       ├── main.scss              # Main entry point
│       ├── _variables.scss        # Design tokens (colors, spacing, etc.)
│       ├── _utilities.scss        # Global utility classes
│       ├── abstracts/             # Mixins and functions
│       │   ├── _mixins.scss
│       │   └── _functions.scss
│       └── base/                  # Base styles
│           ├── _reset.scss
│           └── _typography.scss
├── components/                    # Vue components
│   ├── ui/                        # Reusable UI components
│   │   ├── DataTable/             # Complex components in folders
│   │   ├── Modal/
│   │   ├── FeatureGuard.vue       # Feature access control
│   │   └── LoadingSpinner.vue
│   ├── menu/                      # Menu-related components
│   ├── category/                  # Category components
│   ├── location/                  # Location components (PRO/BUSINESS)
│   ├── dashboard/                 # Dashboard components
│   └── team/                      # Team management (PRO/BUSINESS)
├── composables/                   # Vue composables (reusable logic)
│   ├── useApi.ts                  # API client
│   ├── useAuth.ts                 # Authentication
│   ├── useFeatureAccess.ts        # Feature access control
│   └── useToast.ts                # Toast notifications
├── docs/                          # Documentation
│   ├── DEVELOPER_GUIDE.md         # Comprehensive developer guide
│   ├── API_INTEGRATION.md         # API integration guide
│   ├── SCSS_STYLE_GUIDE.md        # SCSS guidelines
│   ├── FEATURE_ACCESS_CONTROL.md  # Feature access documentation
│   └── USER_GUIDE.md              # User documentation
├── middleware/                    # Route middleware
│   └── auth.ts                    # Authentication guard
├── pages/                         # Nuxt pages (auto-routing)
│   ├── index.vue                  # Dashboard
│   ├── login.vue                  # Login page
│   ├── menu/                      # Menu management
│   ├── categories/                # Category management
│   ├── locations/                 # Location management (PRO/BUSINESS)
│   ├── analytics/                 # Analytics (PRO/BUSINESS)
│   ├── team/                      # Team management (PRO/BUSINESS)
│   └── subscription/              # Subscription info
├── plugins/                       # Nuxt plugins
│   ├── api.client.ts              # API plugin
│   ├── auth.client.ts             # Auth plugin
│   ├── feature-access.client.ts   # Feature access plugin
│   └── toast.client.ts            # Toast plugin
├── services/                      # API services
│   └── api.service.ts             # HTTP client singleton
├── stores/                        # Pinia stores (state management)
│   ├── auth.ts                    # Authentication state
│   ├── menu.ts                    # Menu state
│   ├── category.ts                # Category state
│   ├── location.ts                # Location state
│   ├── analytics.ts               # Analytics state
│   ├── subscription.ts            # Subscription state
│   └── team.ts                    # Team state
├── types/                         # TypeScript type definitions
│   └── index.ts
├── app.vue                        # Root component
├── nuxt.config.ts                 # Nuxt configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
├── .env                           # Environment variables
└── README.md                      # This file
```

## 📚 Documentation

### For Developers

- **[Developer Guide](./docs/DEVELOPER_GUIDE.md)**: Comprehensive guide covering architecture, patterns, and best practices
- **[API Integration](./docs/API_INTEGRATION.md)**: How to integrate with the backend API
- **[SCSS Style Guide](./docs/SCSS_STYLE_GUIDE.md)**: SCSS guidelines and component styling patterns
- **[Feature Access Control](./docs/FEATURE_ACCESS_CONTROL.md)**: Plan-based feature access implementation

### For Users

- **[User Guide](./docs/USER_GUIDE.md)**: Complete user documentation
- **[Menu Management Guide](./docs/MENU_MANAGEMENT_GUIDE.md)**: How to manage menus and items
- **[Category Management Guide](./docs/CATEGORY_MANAGEMENT_GUIDE.md)**: How to organize categories
- **[Location Management Guide](./docs/LOCATION_MANAGEMENT_GUIDE.md)**: Multi-location setup (PRO/BUSINESS)
- **[Analytics Guide](./docs/ANALYTICS_GUIDE.md)**: Understanding sales analytics (PRO/BUSINESS)
- **[Team Management Guide](./docs/TEAM_MANAGEMENT_GUIDE.md)**: Managing team members (PRO/BUSINESS)
- **[Plan Features & Limits](./docs/PLAN_FEATURES_LIMITS.md)**: Feature comparison and limits

## 💻 Development

### Available Scripts

```bash
# Start development server (http://localhost:3003)
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

### Development Workflow

1. **Create a feature branch**:
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**: Follow the coding guidelines below

3. **Test your changes**: Ensure everything works on multiple screen sizes

4. **Commit your changes**:
```bash
git add .
git commit -m "feat: add your feature description"
```

5. **Push and create PR**:
```bash
git push origin feature/your-feature-name
```

### Coding Guidelines

#### SCSS Guidelines

This project follows **strict SCSS guidelines**:

1. ✅ **BEM Methodology**: Use BEM naming without nested selectors
2. ✅ **Variables Required**: No hardcoded values (colors, spacing, etc.)
3. ✅ **Component Co-location**: Styles live next to components
4. ✅ **DART SASS**: Use `@use` instead of `@import`
5. ✅ **Max Nesting**: 2-3 levels with context only

**Example**:
```scss
// ✅ Correct
.menu-item-card {
  padding: $spacing-md;
}

.menu-item-card__title {
  font-size: 1.25rem;
}

// ❌ Wrong
.menu-item-card {
  &__title {  // ❌ Nested BEM
    font-size: 1.25rem;
  }
}
```

See [SCSS Style Guide](./docs/SCSS_STYLE_GUIDE.md) for complete guidelines.

#### TypeScript Guidelines

- Use TypeScript for all new code
- Define interfaces for all data structures
- Use type-safe API calls
- Avoid `any` type

#### Component Guidelines

- Use Composition API with `<script setup>`
- Extract reusable logic into composables
- Keep components focused and single-purpose
- Use props and emits with TypeScript types

#### State Management

- Use Pinia stores for global state
- Keep component state local when possible
- Use composables for shared logic
- Follow the store pattern (state, getters, actions)

### API Integration

The app uses a centralized API service:

```typescript
const api = useApi()

// GET request
const items = await api.get<ApiResponse<MenuItem[]>>('/menu/items')

// POST request
const newItem = await api.post<ApiResponse<MenuItem>>('/menu/items', {
  name: 'Pizza',
  price: 12.99
})

// PATCH request
await api.patch<ApiResponse<MenuItem>>('/menu/items/123', {
  isActive: false
})

// DELETE request
await api.delete('/menu/items/123')
```

See [API Integration Guide](./docs/API_INTEGRATION.md) for details.

### Feature Access Control

Check feature availability based on subscription plan:

```typescript
const { hasFeature } = useFeatureAccess()

if (hasFeature(FeatureKey.SALES_ANALYTICS)) {
  // Show analytics
}
```

Use the `FeatureGuard` component:

```vue
<FeatureGuard :feature="FeatureKey.SALES_ANALYTICS" :show-upgrade="true">
  <SalesAnalyticsDashboard />
</FeatureGuard>
```

See [Feature Access Control](./docs/FEATURE_ACCESS_CONTROL.md) for details.

## 🤝 Contributing

### Before Contributing

1. Read the [Developer Guide](./docs/DEVELOPER_GUIDE.md)
2. Review the [SCSS Style Guide](./docs/SCSS_STYLE_GUIDE.md)
3. Understand the [API Integration](./docs/API_INTEGRATION.md)

### Contribution Checklist

- [ ] Code follows SCSS guidelines (no nested BEM, variables used)
- [ ] TypeScript types defined for all data structures
- [ ] Components use Composition API with `<script setup>`
- [ ] Responsive design tested on multiple screen sizes
- [ ] Feature access control implemented where needed
- [ ] Error handling implemented
- [ ] Code is documented with comments where necessary
- [ ] Commit messages follow conventional commits format

### Commit Message Format

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NUXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3000` | Yes |
| `NODE_ENV` | Environment | `development` | No |

## 🏗 Build and Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Deployment Checklist

- [ ] Update `NUXT_PUBLIC_API_BASE_URL` to production API URL
- [ ] Set `NODE_ENV=production`
- [ ] Run production build and test locally
- [ ] Verify all API endpoints work
- [ ] Test authentication flow
- [ ] Verify feature access control
- [ ] Test on multiple browsers
- [ ] Check responsive design
- [ ] Deploy to hosting platform

## 🐛 Troubleshooting

### Common Issues

**Issue**: Development server won't start
- **Solution**: Ensure Node.js 18+ is installed and dependencies are installed with `pnpm install`

**Issue**: API requests fail
- **Solution**: Check that backend API is running and `NUXT_PUBLIC_API_BASE_URL` is correct

**Issue**: Authentication not working
- **Solution**: Clear localStorage and try logging in again

**Issue**: Features not showing
- **Solution**: Check subscription plan and feature access permissions

## 📄 License

Private - All rights reserved

## 🆘 Support

For questions or issues:
1. Check the [documentation](./docs/)
2. Review existing issues
3. Contact the development team

---

**Built with ❤️ using Nuxt 3, Vue 3, and TypeScript**
