# Tenant Admin Dashboard - User Guide

Welcome to the Tenant Admin Dashboard! This comprehensive guide will help you manage your restaurant's menu, track sales, and optimize your operations.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Menu Management](#menu-management)
3. [Category Management](#category-management)
4. [Location Management](#location-management-probusiness)
5. [Sales Analytics](#sales-analytics-probusiness)
6. [Team Management](#team-management-probusiness)
7. [Subscription & Plans](#subscription--plans)
8. [Audit Trail](#audit-trail-probusiness)
9. [Plan Features & Limits](#plan-features--limits)

---

## Getting Started

### Logging In

1. Navigate to your tenant admin dashboard URL
2. Enter your email address and password
3. Click "Sign In"
4. You'll be redirected to your dashboard

### Dashboard Overview

Your dashboard displays:
- **Key Metrics**: Total menu items, active items, categories
- **Sales Stats** (PRO/BUSINESS): Today's revenue and sales
- **Recent Activity**: Latest changes to your menu
- **Quick Actions**: Shortcuts to common tasks
- **Plan Status**: Current usage vs. limits

**Example Dashboard:**
```
┌─────────────────────────────────────────────────┐
│  Dashboard                                       │
├─────────────────────────────────────────────────┤
│  Total Items: 45/50    Active: 42    Categories: 8/10  │
│                                                  │
│  Today's Sales (PRO): $1,234.56                 │
│                                                  │
│  Quick Actions:                                  │
│  [+ Add Menu Item]  [Manage Categories]         │
└─────────────────────────────────────────────────┘
```

---

## Menu Management

### Viewing Your Menu

1. Click **"Menu"** in the sidebar
2. Your menu items are displayed in a list with:
   - Item name and description
   - Price
   - Category
   - Availability status
   - Location availability (PRO/BUSINESS)

### Searching and Filtering

**Search by Name:**
- Use the search bar at the top
- Type any part of the item name
- Results update in real-time

**Filter Options:**
- **By Category**: Select from dropdown
- **By Price Range**: Set min/max price
- **By Status**: Active, Inactive, or All
- **By Location** (PRO/BUSINESS): Filter by specific location

### Creating a Menu Item

1. Click **"+ Add Menu Item"** button
2. Fill in the required fields:
   - **Name** (required): Item name
   - **Price** (required): Item price
   - **Category** (required): Select category
3. Optional fields:
   - **Description**: Detailed description
   - **Image**: Upload item photo
   - **Allergens**: List allergen information
   - **Location Availability** (PRO/BUSINESS): Select locations
4. Click **"Save"**

**Example:**
```
Name: Margherita Pizza
Price: $12.99
Category: Main Courses
Description: Classic pizza with tomato, mozzarella, and basil
Allergens: Gluten, Dairy
```

### Editing a Menu Item

1. Find the item in your menu list
2. Click the **"Edit"** button (pencil icon)
3. Modify any fields
4. Click **"Save Changes"**

### Uploading Images

1. In the menu item form, click **"Upload Image"**
2. Select an image file (JPEG, PNG, WebP)
3. Maximum file size: 5MB
4. Image will be automatically resized and optimized
5. Preview appears before saving

**Image Tips:**
- Use high-quality photos
- Ensure good lighting
- Show the dish clearly
- Square images work best (1:1 ratio)

### Controlling Dish Availability

**Quick Toggle:**
1. Find the item in your menu list
2. Click the toggle switch next to the item
3. Green = Active (visible to customers)
4. Gray = Inactive (hidden from customers)

**Location-Specific Availability** (PRO/BUSINESS):
1. Edit the menu item
2. Scroll to "Location Availability"
3. Check/uncheck locations where item is available
4. Save changes

### Bulk Operations

Select multiple items to perform bulk actions:

**Bulk Activation/Deactivation:**
1. Check boxes next to items
2. Click **"Bulk Actions"** dropdown
3. Select "Activate Selected" or "Deactivate Selected"
4. Confirm the action

**Bulk Price Update:**
1. Select items
2. Choose "Update Price"
3. Enter new price or percentage change
4. Confirm

**Bulk Category Change:**
1. Select items
2. Choose "Change Category"
3. Select new category
4. Confirm

---

## Category Management

### Viewing Categories

1. Click **"Categories"** in the sidebar
2. See all categories with:
   - Category name
   - Number of items
   - Display order

### Creating a Category

1. Click **"+ Add Category"**
2. Enter category name (required)
3. Add optional description
4. Click **"Save"**

**Example Categories:**
- Appetizers
- Main Courses
- Desserts
- Beverages
- Specials

### Editing a Category

1. Click the **"Edit"** button next to category
2. Modify name or description
3. Click **"Save Changes"**

### Reordering Categories

Categories appear in your menu in display order:

1. Click and hold the **drag handle** (⋮⋮) next to category
2. Drag to new position
3. Release to drop
4. Order saves automatically

**Visual Example:**
```
⋮⋮ Appetizers (12 items)
⋮⋮ Main Courses (25 items)
⋮⋮ Desserts (8 items)
⋮⋮ Beverages (15 items)
```

### Deleting a Category

1. Click **"Delete"** button next to category
2. **Note**: You cannot delete categories with items
3. Move or delete items first, then delete category
4. Confirm deletion

---

## Location Management (PRO/BUSINESS)

> **Note**: Multi-location support is available on PRO and BUSINESS plans only.

### Viewing Locations

1. Click **"Locations"** in the sidebar
2. See all your restaurant locations with:
   - Location name
   - Address
   - Status (Active/Inactive)
   - Number of available items

### Adding a Location

1. Click **"+ Add Location"**
2. Fill in details:
   - **Name** (required): Location name
   - **Address** (required): Full address
   - **City** (required)
   - **Phone**: Contact number
   - **Email**: Location email
3. Click **"Save"**

**Example:**
```
Name: Downtown Branch
Address: 123 Main Street
City: New York
Phone: (555) 123-4567
Email: downtown@restaurant.com
```

### Editing a Location

1. Click **"Edit"** next to location
2. Modify any fields
3. Click **"Save Changes"**

### Managing Location Availability

**Per-Item Method:**
1. Edit a menu item
2. Check/uncheck locations in "Location Availability"
3. Save

**Bulk Matrix Method:**
1. Go to Menu → **"Location Availability Matrix"**
2. See grid of items vs. locations
3. Toggle availability for multiple items/locations
4. Changes save automatically

**Matrix Example:**
```
                Downtown  Uptown  Airport
Margherita Pizza    ✓        ✓       ✗
Caesar Salad        ✓        ✓       ✓
Tiramisu            ✓        ✗       ✗
```

### Deactivating a Location

1. Click **"Deactivate"** next to location
2. Location becomes inactive but data is preserved
3. Items at this location become unavailable to customers
4. Reactivate anytime

---

## Sales Analytics (PRO/BUSINESS)

> **Note**: Sales analytics are available on PRO and BUSINESS plans only.

### Accessing Analytics

1. Click **"Analytics"** in the sidebar
2. View comprehensive sales dashboard

### Dashboard Metrics

**Total Revenue:**
- Shows revenue for selected period
- Default: Last 30 days
- Change date range using date picker

**Top-Selling Items:**
- Chart showing best-performing items
- Displays quantity sold and revenue
- Click item to see detailed history

**Category Performance:**
- Breakdown of sales by category
- Pie chart or bar chart view
- Identify strongest categories

**Sales Trends:**
- Line chart showing sales over time
- Toggle between daily, weekly, monthly views
- Spot patterns and trends

### Viewing Item Sales History

1. Go to Menu
2. Click on a menu item
3. Scroll to **"Sales History"** section
4. See:
   - Total quantity sold
   - Total revenue
   - Sales trend chart
   - Date-by-date breakdown

### Filtering Analytics

**By Date Range:**
1. Click date range selector
2. Choose preset (Last 7 days, Last 30 days, etc.)
3. Or select custom start/end dates
4. Click **"Apply"**

**By Location** (if multi-location):
1. Select location from dropdown
2. Analytics update for that location only
3. Select "All Locations" to see combined data

### Exporting Data (BUSINESS Only)

1. Click **"Export"** button
2. Choose format:
   - CSV (spreadsheet)
   - Excel (.xlsx)
   - PDF (report)
3. Select date range
4. Click **"Download"**
5. File downloads to your computer

**Export Contents:**
- All sales transactions
- Item details
- Revenue calculations
- Date/time stamps

---

## Team Management (PRO/BUSINESS)

> **Note**: Multi-user access is available on PRO and BUSINESS plans only.
> FREE plan allows only the owner account.

### Viewing Team Members

1. Click **"Team"** in the sidebar
2. See all users with access to your dashboard:
   - Name and email
   - Role
   - Last login
   - Status

### User Roles

**TENANT_ADMIN:**
- Full access to all features
- Can manage team members
- Can modify all settings
- Can view billing

**TENANT_STAFF:**
- Can manage menu items
- Can view analytics (if plan allows)
- Cannot manage team
- Cannot access billing

### Inviting Team Members

1. Click **"+ Invite User"**
2. Enter email address
3. Select role (Admin or Staff)
4. Click **"Send Invitation"**
5. User receives email with registration link
6. They create password and gain access

**Plan Limits:**
- PRO: Up to 5 users
- BUSINESS: Unlimited users

### Changing User Roles

1. Find user in team list
2. Click **"Change Role"** dropdown
3. Select new role
4. Confirm change
5. User's permissions update immediately

### Removing Team Members

1. Click **"Remove"** button next to user
2. Confirm removal
3. User loses access immediately
4. User receives notification email

---

## Subscription & Plans

### Viewing Your Subscription

1. Click **"Subscription"** in the sidebar
2. See your current plan details:
   - Plan name (FREE, PRO, BUSINESS)
   - Features included
   - Usage vs. limits
   - Billing information

### Understanding Plan Limits

**Usage Indicators:**
```
Menu Items: ████████░░ 45/50 (90%)
Categories: ████░░░░░░ 8/10 (80%)
Locations:  ██░░░░░░░░ 2/3 (67%)
Users:      ███░░░░░░░ 3/5 (60%)
```

**Color Coding:**
- Green: Under 70% usage
- Yellow: 70-90% usage
- Red: Over 90% usage

### Comparing Plans

Click **"Compare Plans"** to see feature matrix:

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Menu Items | 50 | 500 | Unlimited |
| Categories | 10 | 50 | Unlimited |
| Locations | 1 | 3 | Unlimited |
| Users | 1 | 5 | Unlimited |
| Sales Analytics | ✗ | ✓ | ✓ |
| Audit Trail | ✗ | ✓ | ✓ |
| Data Export | ✗ | Basic | Advanced |
| API Access | ✗ | ✗ | ✓ |
| Priority Support | ✗ | ✗ | ✓ |

### Upgrading Your Plan

1. Click **"Upgrade"** button
2. Select desired plan
3. Review features and pricing
4. Enter payment information
5. Confirm upgrade
6. New features activate immediately

### Billing Information

View billing details:
- Next billing date
- Amount due
- Payment method
- Billing history
- Download invoices

---

## Audit Trail (PRO/BUSINESS)

> **Note**: Audit trail is available on PRO and BUSINESS plans only.

### Viewing Change History

1. Click **"Audit"** in the sidebar
2. See complete history of changes:
   - What changed
   - Who made the change
   - When it happened
   - Before/after values

### Filtering Audit Logs

**By Date Range:**
1. Select start and end dates
2. Click **"Apply"**

**By Entity Type:**
- Menu Items
- Categories
- Locations
- Users
- All

**By User:**
- Select team member from dropdown
- See only their changes

### Understanding Audit Entries

**Example Entry:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Action: UPDATE
Entity: Menu Item - "Margherita Pizza"
User: john@restaurant.com
Date: 2025-11-26 14:30:22

Changes:
  Price: $11.99 → $12.99
  Description: Updated with new ingredients
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Item-Specific History

View history for specific items:
1. Go to menu item details
2. Scroll to **"Change History"** section
3. See all modifications to that item

---

## Plan Features & Limits

### FREE Plan

**Included:**
- ✓ Basic menu management
- ✓ Up to 50 menu items
- ✓ Up to 10 categories
- ✓ Single location
- ✓ Image uploads
- ✓ Dish availability control
- ✓ Basic bulk operations
- ✓ Single user (owner only)

**Not Included:**
- ✗ Sales analytics
- ✗ Multi-location support
- ✗ Team management
- ✗ Audit trail
- ✗ Data export
- ✗ API access

**Best For:**
- Small cafes
- Food trucks
- Single-location restaurants
- Getting started

### PRO Plan

**Everything in FREE, plus:**
- ✓ Up to 500 menu items
- ✓ Up to 50 categories
- ✓ Up to 3 locations
- ✓ Up to 5 team members
- ✓ Sales analytics dashboard
- ✓ Sales history tracking
- ✓ Audit trail
- ✓ Basic CSV export
- ✓ Advanced reporting

**Best For:**
- Growing restaurants
- Multi-location businesses
- Teams needing collaboration
- Data-driven operations

### BUSINESS Plan

**Everything in PRO, plus:**
- ✓ Unlimited menu items
- ✓ Unlimited categories
- ✓ Unlimited locations
- ✓ Unlimited team members
- ✓ Advanced data export (PDF, Excel, CSV)
- ✓ API access
- ✓ Custom branding
- ✓ White-label options
- ✓ Priority support
- ✓ Custom integrations

**Best For:**
- Large restaurant chains
- Franchises
- Enterprise operations
- Custom integrations needed

### Approaching Limits

**What Happens:**
1. Warning at 80% usage
2. Alert at 90% usage
3. Cannot add more at 100%

**Solutions:**
- Upgrade to higher plan
- Delete unused items
- Archive old data
- Contact support for options

---

## Tips & Best Practices

### Menu Management
- Use clear, descriptive item names
- Include allergen information
- Keep descriptions concise but informative
- Use high-quality images
- Update prices regularly
- Review inactive items monthly

### Category Organization
- Use logical groupings
- Order by customer flow (appetizers → mains → desserts)
- Keep category names simple
- Don't create too many categories (8-12 is ideal)

### Location Management
- Keep location information up-to-date
- Review availability regularly
- Use bulk matrix for efficiency
- Deactivate rather than delete locations

### Analytics Usage
- Check analytics weekly
- Identify top performers
- Spot declining items
- Adjust menu based on data
- Export reports for meetings

### Team Collaboration
- Assign appropriate roles
- Use audit trail to track changes
- Communicate menu updates
- Regular team training

---

## Troubleshooting

### Cannot Add Menu Item
**Problem**: "Limit reached" error
**Solution**: You've reached your plan limit. Upgrade or delete unused items.

### Image Upload Fails
**Problem**: Image won't upload
**Solutions**:
- Check file size (max 5MB)
- Use supported formats (JPEG, PNG, WebP)
- Check internet connection
- Try different browser

### Cannot Delete Category
**Problem**: "Category has items" error
**Solution**: Move or delete all items in category first, then delete category.

### Analytics Not Showing
**Problem**: Analytics page is empty
**Solutions**:
- Verify you have PRO or BUSINESS plan
- Check date range selection
- Ensure sales data exists for period
- Refresh the page

### Team Member Cannot Access
**Problem**: Invited user cannot log in
**Solutions**:
- Verify invitation was sent
- Check spam folder for email
- Resend invitation
- Verify plan allows multiple users

---

## Getting Help

### Support Channels

**Documentation:**
- User Guide (this document)
- Video tutorials
- FAQ section

**Contact Support:**
- Email: support@platform.com
- Live chat (BUSINESS plan)
- Phone support (BUSINESS plan)
- Response time: 24-48 hours (FREE/PRO), 4 hours (BUSINESS)

### Feedback

We value your feedback!
- Feature requests: features@platform.com
- Bug reports: bugs@platform.com
- General feedback: feedback@platform.com

---

## Keyboard Shortcuts

Speed up your workflow with keyboard shortcuts:

- `Ctrl/Cmd + K`: Global search
- `Ctrl/Cmd + N`: New menu item
- `Ctrl/Cmd + S`: Save current form
- `Esc`: Close modal/dialog
- `Ctrl/Cmd + /`: Show shortcuts help

---

## Updates & Changelog

Stay informed about new features:
- Check "What's New" in dashboard
- Subscribe to update emails
- Follow release notes
- Join user community

---

**Last Updated**: November 2025
**Version**: 1.0

For the latest version of this guide, visit: [Documentation Portal]
