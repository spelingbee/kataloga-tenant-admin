# Team Management Guide (PRO/BUSINESS)

> **Note**: Multi-user access is available on PRO and BUSINESS plans only.
> FREE plan allows only the owner account.

Complete guide to managing team members and access control in the Tenant Admin Dashboard.

---

## Overview

Team management allows you to:
- Invite team members to your dashboard
- Assign roles and permissions
- Control access to features
- Track team activity
- Manage user accounts

---

## Plan Availability

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Users | 1 (Owner) | Up to 5 | Unlimited |
| User Roles | Owner only | Admin, Staff | Admin, Staff, Custom |
| User Invitations | ✗ | ✓ | ✓ |
| Role Management | ✗ | ✓ | ✓ |
| Activity Tracking | ✗ | ✓ | ✓ |
| Audit Trail | ✗ | ✓ | ✓ |
| Custom Roles | ✗ | ✗ | ✓ |

---

## Quick Start

1. Navigate to **Team** in sidebar
2. View all team members
3. Click **+ Invite User** to add members
4. Assign appropriate roles
5. Manage access and permissions

---

## Viewing Team Members

### Team List

```
┌─────────────────────────────────────────────────────────┐
│  Team Members                      [+ Invite User]       │
├─────────────────────────────────────────────────────────┤
│  John Smith                                              │
│  john@restaurant.com  •  Owner  •  Last login: Today     │
│  [View Activity]                                         │
│                                                          │
│  Sarah Johnson                                           │
│  sarah@restaurant.com  •  Admin  •  Last login: Today    │
│  [Change Role] [Remove]                                  │
│                                                          │
│  Mike Davis                                              │
│  mike@restaurant.com  •  Staff  •  Last login: Yesterday │
│  [Change Role] [Remove]                                  │
│                                                          │
│  Plan Limit: 3/5 users (PRO)                            │
└─────────────────────────────────────────────────────────┘
```

### User Information

Each team member displays:
- **Name**: Full name
- **Email**: Email address
- **Role**: Current role
- **Last Login**: Last access time
- **Status**: Active/Inactive
- **Actions**: Change role, Remove

---

## User Roles

### Role Types

#### Owner
**Permissions:**
- ✓ Full access to all features
- ✓ Manage team members
- ✓ Manage billing and subscription
- ✓ Access all settings
- ✓ View audit trail
- ✓ Delete account

**Restrictions:**
- Cannot be removed
- Cannot change own role
- Only one owner per tenant

#### Tenant Admin
**Permissions:**
- ✓ Manage menu items
- ✓ Manage categories
- ✓ Manage locations
- ✓ View analytics
- ✓ Invite users
- ✓ Manage staff roles
- ✓ View audit trail
- ✓ Export data

**Restrictions:**
- ✗ Cannot manage billing
- ✗ Cannot delete account
- ✗ Cannot remove owner
- ✗ Cannot change owner role

#### Tenant Staff
**Permissions:**
- ✓ View menu items
- ✓ Edit menu items
- ✓ Toggle availability
- ✓ View categories
- ✓ View analytics (if plan allows)
- ✓ View locations

**Restrictions:**
- ✗ Cannot delete items
- ✗ Cannot manage categories
- ✗ Cannot manage locations
- ✗ Cannot invite users
- ✗ Cannot access billing
- ✗ Cannot export data
- ✗ Cannot view audit trail

### Role Comparison

```
┌─────────────────────────────────────────────────┐
│  Feature              Owner  Admin  Staff        │
├─────────────────────────────────────────────────┤
│  View Menu            ✓      ✓      ✓           │
│  Edit Menu            ✓      ✓      ✓           │
│  Delete Items         ✓      ✓      ✗           │
│  Manage Categories    ✓      ✓      ✗           │
│  Manage Locations     ✓      ✓      ✗           │
│  View Analytics       ✓      ✓      ✓*          │
│  Export Data          ✓      ✓      ✗           │
│  Invite Users         ✓      ✓      ✗           │
│  Manage Roles         ✓      ✓      ✗           │
│  View Audit Trail     ✓      ✓      ✗           │
│  Manage Billing       ✓      ✗      ✗           │
│  Delete Account       ✓      ✗      ✗           │
└─────────────────────────────────────────────────┘
* If plan includes analytics
```

---

## Inviting Team Members

### Invitation Process

**1. Click "+ Invite User" Button**

**2. Fill Invitation Form**

```
┌─────────────────────────────────────┐
│  Invite Team Member                  │
├─────────────────────────────────────┤
│  Email Address:                      │
│  [sarah@restaurant.com]              │
│                                      │
│  Role:                               │
│  ○ Tenant Admin                      │
│  ● Tenant Staff                      │
│                                      │
│  Personal Message (optional):        │
│  [Welcome to the team!]              │
│                                      │
│  [Cancel]  [Send Invitation]         │
└─────────────────────────────────────┘
```

**3. Click "Send Invitation"**

**4. User Receives Email**

```
Subject: You've been invited to join [Restaurant Name]

Hi there!

John Smith has invited you to join the team at 
[Restaurant Name] as a Tenant Staff member.

Click the link below to accept the invitation and 
create your account:

[Accept Invitation]

This invitation expires in 7 days.
```

**5. User Accepts and Registers**

User clicks link and:
- Creates password
- Completes profile
- Gains access to dashboard

### Invitation Status

Track invitation status:
```
Pending Invitations:
• sarah@restaurant.com (Admin) - Sent 2 days ago
  [Resend] [Cancel]
  
• mike@restaurant.com (Staff) - Sent 5 days ago
  [Resend] [Cancel]
```

**Status Types:**
- **Pending**: Invitation sent, not accepted
- **Accepted**: User registered and active
- **Expired**: Invitation expired (7 days)
- **Cancelled**: Invitation cancelled

### Resending Invitations

If user didn't receive email:
1. Find pending invitation
2. Click **"Resend"**
3. New email sent
4. Previous link still valid

---

## Managing User Roles

### Changing Roles

**1. Find User in Team List**

**2. Click "Change Role" Dropdown**

```
Current Role: Staff

Change to:
○ Tenant Admin
● Tenant Staff

[Cancel] [Save]
```

**3. Select New Role**

**4. Confirm Change**

```
┌─────────────────────────────────────┐
│  Change User Role?                   │
├─────────────────────────────────────┤
│  Change Sarah Johnson's role from    │
│  Staff to Admin?                     │
│                                      │
│  This will grant additional          │
│  permissions immediately.            │
│                                      │
│  [Cancel]  [Confirm]                 │
└─────────────────────────────────────┘
```

**5. Role Updated**

User's permissions update immediately. They may need to refresh their browser.

### Role Change Notifications

User receives email notification:
```
Subject: Your role has been updated

Hi Sarah,

Your role at [Restaurant Name] has been changed 
from Staff to Admin.

You now have access to:
• Team management
• Location management
• Data export
• Audit trail

Log in to explore your new permissions.
```

---

## Removing Team Members

### Removal Process

**1. Find User in Team List**

**2. Click "Remove" Button**

**3. Confirm Removal**

```
┌─────────────────────────────────────┐
│  Remove Team Member?                 │
├─────────────────────────────────────┤
│  Are you sure you want to remove     │
│  Mike Davis from your team?          │
│                                      │
│  They will immediately lose access   │
│  to the dashboard.                   │
│                                      │
│  This action cannot be undone.       │
│                                      │
│  [Cancel]  [Remove]                  │
└─────────────────────────────────────┘
```

**4. User Removed**

- Access revoked immediately
- User receives notification email
- Audit trail records removal
- Can be re-invited later

### Removal Notifications

User receives email:
```
Subject: Access removed from [Restaurant Name]

Hi Mike,

Your access to [Restaurant Name] dashboard has 
been removed by John Smith.

If you believe this was a mistake, please contact 
your team administrator.
```

---

## Activity Tracking

### Viewing User Activity

**1. Click "View Activity" on User**

**2. See Activity Log**

```
┌─────────────────────────────────────────────────┐
│  Sarah Johnson - Activity Log                    │
│  Last 30 Days                    [Date Range ▼] │
├─────────────────────────────────────────────────┤
│  Nov 26, 2025 - 2:30 PM                         │
│  Updated menu item "Margherita Pizza"            │
│  Changed price from $11.99 to $12.99             │
│                                                  │
│  Nov 26, 2025 - 10:15 AM                        │
│  Created menu item "Caesar Wrap"                 │
│                                                  │
│  Nov 25, 2025 - 4:45 PM                         │
│  Deactivated menu item "Old Special"             │
│                                                  │
│  Nov 25, 2025 - 11:20 AM                        │
│  Updated category "Appetizers"                   │
│                                                  │
│  [Export Activity Log]                           │
└─────────────────────────────────────────────────┘
```

### Activity Types

**Menu Actions:**
- Created menu item
- Updated menu item
- Deleted menu item
- Changed availability

**Category Actions:**
- Created category
- Updated category
- Deleted category
- Reordered categories

**Location Actions:**
- Created location
- Updated location
- Changed location status

**Team Actions:**
- Invited user
- Changed user role
- Removed user

**Settings Actions:**
- Updated settings
- Changed preferences

---

## Plan Limits

### PRO Plan
- Maximum: 5 users
- Warning at: 4 users (80%)
- Alert at: 5 users (100%)

### BUSINESS Plan
- Unlimited users
- No warnings

### Approaching Limits (PRO)

**At 80% (Warning):**
```
⚠️ You're using 4 of 5 user slots (80%)
   Consider upgrading to BUSINESS plan for unlimited users.
```

**At 100% (Blocked):**
```
❌ User limit reached (5/5)
   Cannot invite more users.
   [Upgrade to BUSINESS] or [Remove User]
```

---

## Best Practices

### Role Assignment

**Assign Minimum Necessary Permissions:**
- Start with Staff role
- Upgrade to Admin if needed
- Limit number of Admins
- Review roles quarterly

**Role Guidelines:**
- **Admin**: Managers, supervisors
- **Staff**: Servers, kitchen staff, cashiers

### Security

**Password Requirements:**
- Minimum 8 characters
- Include uppercase and lowercase
- Include numbers
- Include special characters

**Account Security:**
- Enable two-factor authentication
- Regular password changes
- Review active sessions
- Monitor login attempts

### Communication

**Onboarding New Users:**
1. Send invitation with context
2. Provide training materials
3. Schedule walkthrough
4. Assign mentor
5. Follow up after first week

**Role Changes:**
- Communicate before changing
- Explain new responsibilities
- Provide additional training
- Document changes

**Offboarding:**
- Remove access immediately
- Document reason
- Transfer responsibilities
- Archive user data

---

## Common Scenarios

### Scenario 1: New Manager Joining

**Steps:**
1. Invite with Admin role
2. Send welcome email
3. Schedule training session
4. Grant access to all locations
5. Add to team communication channels

### Scenario 2: Seasonal Staff

**Steps:**
1. Invite with Staff role
2. Set limited permissions
3. Provide quick training
4. Monitor activity closely
5. Remove access at season end

### Scenario 3: Role Promotion

**Steps:**
1. Discuss with team member
2. Change role to Admin
3. Provide additional training
4. Update responsibilities
5. Monitor transition

### Scenario 4: Security Concern

**Steps:**
1. Immediately remove user
2. Review audit trail
3. Check for unauthorized changes
4. Reset passwords if needed
5. Document incident

---

## Audit Trail Integration

### Tracking Team Changes

All team actions are logged:

```
┌─────────────────────────────────────────────────┐
│  Audit Trail - Team Management                   │
├─────────────────────────────────────────────────┤
│  Nov 26, 2025 - 3:15 PM                         │
│  John Smith invited sarah@restaurant.com         │
│  Role: Admin                                     │
│                                                  │
│  Nov 25, 2025 - 10:30 AM                        │
│  John Smith changed Mike Davis role              │
│  From: Admin → To: Staff                         │
│                                                  │
│  Nov 24, 2025 - 2:45 PM                         │
│  John Smith removed jane@restaurant.com          │
│  Previous Role: Staff                            │
└─────────────────────────────────────────────────┘
```

### Compliance

**Audit Trail Benefits:**
- Track who made changes
- When changes occurred
- What was changed
- Compliance documentation
- Security investigation

---

## Troubleshooting

### User Cannot Log In

**Problem**: Team member cannot access dashboard

**Check**:
1. Invitation accepted?
2. Password correct?
3. Account active?
4. Email verified?
5. Browser cookies enabled?

**Solutions**:
- Resend invitation
- Reset password
- Check spam folder
- Try different browser
- Contact support

### User Cannot See Feature

**Problem**: Team member cannot access feature

**Check**:
1. Role permissions
2. Plan includes feature
3. Feature enabled
4. Browser cache
5. Page refresh needed

**Solutions**:
- Verify role permissions
- Upgrade plan if needed
- Clear browser cache
- Refresh page
- Contact support

### Invitation Not Received

**Problem**: User didn't receive invitation email

**Solutions**:
1. Check spam/junk folder
2. Verify email address
3. Resend invitation
4. Try different email
5. Contact support

### Cannot Remove User

**Problem**: Remove button not working

**Check**:
1. You have Admin/Owner role
2. Not trying to remove owner
3. Not trying to remove yourself
4. Internet connection
5. Browser issues

---

## Advanced Features (BUSINESS)

### Custom Roles

Create custom roles with specific permissions:

```
┌─────────────────────────────────────┐
│  Create Custom Role                  │
├─────────────────────────────────────┤
│  Role Name:                          │
│  [Kitchen Manager]                   │
│                                      │
│  Permissions:                        │
│  ☑ View Menu                         │
│  ☑ Edit Menu                         │
│  ☐ Delete Menu Items                 │
│  ☑ Manage Categories                 │
│  ☐ Manage Locations                  │
│  ☑ View Analytics                    │
│  ☐ Export Data                       │
│  ☐ Invite Users                      │
│  ☐ Manage Roles                      │
│                                      │
│  [Cancel]  [Create Role]             │
└─────────────────────────────────────┘
```

### Single Sign-On (SSO)

Enterprise authentication:
- SAML 2.0 support
- OAuth integration
- Active Directory sync
- Automatic provisioning

### Advanced Audit

Enhanced tracking:
- Detailed change logs
- IP address tracking
- Device information
- Session management
- Export audit logs

---

## Related Guides

- [Menu Management Guide](./MENU_MANAGEMENT_GUIDE.md)
- [Analytics Guide](./ANALYTICS_GUIDE.md)
- [Audit Trail Guide](./AUDIT_TRAIL_GUIDE.md)
- [Security Best Practices](./SECURITY_GUIDE.md)

---

**Last Updated**: November 2025
