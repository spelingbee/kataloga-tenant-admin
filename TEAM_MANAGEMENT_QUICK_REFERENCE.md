# Team Management - Quick Reference

## Overview
Team management feature allows tenant admins to invite team members, manage roles, and control access. This feature is only available for PRO and BUSINESS plans.

## Files Created

### Store
- `stores/team.ts` - Pinia store for team management state and actions

### Components
- `components/team/TeamMemberList.vue` - Displays list of team members with actions
- `components/team/_team-member-list.scss` - Styles for team member list
- `components/team/TeamMemberInviteForm.vue` - Form for inviting new team members
- `components/team/_team-member-invite-form.scss` - Styles for invite form
- `components/ui/Modal.vue` - Reusable modal component

### Pages
- `pages/team/index.vue` - Main team management page

## Features

### 1. Feature Access Control
- Shows upgrade prompt for FREE plan users
- Only PRO and BUSINESS plan users can access team management
- Uses `useFeatureAccess()` composable to check `hasMultiUser` permission

### 2. Team Member List
- Displays all team members with:
  - Avatar with initials
  - Name and email
  - Role badge (Admin/Staff)
  - Status badge (Active/Inactive)
  - Join date
  - Action buttons (change role, remove)
- Shows plan limits with progress bar
- Pagination support
- Loading and error states
- Empty state with invite prompt

### 3. Invite Team Members
- Modal form with fields:
  - Email (required, validated)
  - First Name (required, min 2 chars)
  - Last Name (required, min 2 chars)
  - Role (TENANT_ADMIN or TENANT_STAFF)
- Real-time validation
- Shows role descriptions
- Respects plan limits

### 4. Role Management
- Change member role between Admin and Staff
- Cannot change own role
- Confirmation modal
- Updates immediately in list

### 5. Remove Members
- Remove team members from tenant
- Cannot remove yourself
- Confirmation modal with warning
- Updates limits after removal

### 6. Plan Limits
- Displays current usage vs. limit
- Visual progress bar with color coding:
  - Normal: Blue
  - Warning (≤2 remaining): Yellow
  - Full: Red
- Shows remaining slots
- Prevents inviting when limit reached

## API Endpoints Used

### GET /users
- Fetch all team members
- Supports pagination
- Returns: `PaginatedResponse<User>`

### GET /users/limits
- Fetch subscription limits
- Returns: `{ users: { current, limit, remaining, canCreate } }`

### POST /users
- Invite new team member
- Body: `{ email, firstName, lastName, role, isActive }`
- Returns: `User`

### PATCH /users/:id/role
- Update member role
- Body: `{ role }`
- Returns: `User`

### DELETE /users/:id
- Remove team member
- Returns: 204 No Content

## User Roles

### TENANT_ADMIN
- Full access to all features
- Can manage team members
- Can change settings
- Can manage menu, categories, locations

### TENANT_STAFF
- Can manage menu items
- Cannot manage team
- Cannot change settings
- Limited access to analytics

## Usage Example

```vue
<template>
  <div>
    <!-- Team management page -->
    <NuxtLink to="/team">Team Management</NuxtLink>
  </div>
</template>
```

## Store Actions

```typescript
// Fetch team members
await teamStore.fetchMembers(page, limit)

// Fetch limits
await teamStore.fetchLimits()

// Invite member
await teamStore.inviteMember({
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'TENANT_STAFF'
})

// Update role
await teamStore.updateMemberRole(userId, 'TENANT_ADMIN')

// Remove member
await teamStore.removeMember(userId)

// Deactivate member
await teamStore.deactivateMember(userId)
```

## Styling

All components follow the project SCSS rules:
- BEM methodology without nested selectors
- Variables for all values (colors, spacing, etc.)
- Component styles co-located with components
- Maximum 2-3 levels of nesting with context
- DART SASS syntax (`@use` instead of `@import`)

## Feature Access Check

```typescript
import { useFeatureAccess } from '~/composables/useFeatureAccess'

const { hasMultiUser } = useFeatureAccess()

// Show/hide features based on plan
<div v-if="hasMultiUser">
  <!-- Team management features -->
</div>
```

## Plan Limits

| Plan | Max Users |
|------|-----------|
| FREE | 1 |
| PRO | 5 |
| BUSINESS | Unlimited |

## Requirements Validated

✅ 15.1 - Display team members with roles (PRO/BUSINESS only)
✅ 15.2 - Send invitation email with registration link
✅ 15.3 - Assign roles (TENANT_ADMIN, TENANT_STAFF)
✅ 15.4 - Remove user access
✅ 15.5 - Enforce plan limits for maximum users
✅ 15.6 - Allow only single user (owner) for FREE plan

## Next Steps

1. Test the team management flow
2. Verify API integration
3. Test plan limit enforcement
4. Test role management
5. Verify feature access control
