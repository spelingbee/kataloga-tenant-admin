# Location Management Guide (PRO/BUSINESS)

> **Note**: Multi-location support is available on PRO and BUSINESS plans only.

Complete guide to managing multiple restaurant locations in the Tenant Admin Dashboard.

---

## Overview

Multi-location support allows you to:
- Manage multiple restaurant locations
- Control menu availability per location
- Track sales by location
- Manage location-specific inventory

---

## Plan Availability

| Feature | FREE | PRO | BUSINESS |
|---------|------|-----|----------|
| Locations | 1 | Up to 3 | Unlimited |
| Location-specific availability | ✗ | ✓ | ✓ |
| Location analytics | ✗ | ✓ | ✓ |
| Bulk location updates | ✗ | ✓ | ✓ |

---

## Quick Start

1. Navigate to **Locations** in sidebar
2. View all your locations
3. Click **+ Add Location** to create new locations
4. Set menu item availability per location
5. Track performance by location

---

## Viewing Locations

### Location List

```
┌─────────────────────────────────────────────────────────┐
│  Locations                        [+ Add Location]       │
├─────────────────────────────────────────────────────────┤
│  Downtown Branch                                         │
│  123 Main Street, New York                               │
│  Status: Active  •  Items: 45/50  •  [Edit] [Deactivate]│
│                                                          │
│  Uptown Location                                         │
│  456 Park Avenue, New York                               │
│  Status: Active  •  Items: 38/50  •  [Edit] [Deactivate]│
│                                                          │
│  Airport Kiosk                                           │
│  Terminal 3, JFK Airport                                 │
│  Status: Inactive  •  Items: 15/50  •  [Edit] [Activate]│
└─────────────────────────────────────────────────────────┘
```

### Location Information

Each location displays:
- **Name**: Location name
- **Address**: Full address
- **Status**: Active or Inactive
- **Item Count**: Available items / Total items
- **Actions**: Edit, Activate/Deactivate

---

## Creating Locations

### Step-by-Step Process

**1. Click "+ Add Location" Button**

**2. Fill in Location Form**

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Name | ✓ | Location name | "Downtown Branch" |
| Address | ✓ | Street address | "123 Main Street" |
| City | ✓ | City name | "New York" |
| State/Province | ✗ | State/Province | "NY" |
| Postal Code | ✗ | ZIP/Postal code | "10001" |
| Country | ✗ | Country | "USA" |
| Phone | ✗ | Contact phone | "(555) 123-4567" |
| Email | ✗ | Location email | "downtown@restaurant.com" |
| Status | ✓ | Active/Inactive | Active |

**3. Click "Save"**

### Form Validation

The system validates:
- ✓ Name is not empty
- ✓ Address is not empty
- ✓ City is not empty
- ✓ Phone format (if provided)
- ✓ Email format (if provided)

**Error Examples:**
```
❌ Location name is required
❌ Address is required
❌ Invalid phone number format
❌ Invalid email address
```

### Location Naming Best Practices

**✓ Good Names:**
- Downtown Branch
- Uptown Location
- Airport Terminal 3
- Mall Food Court
- Main Street Store

**✗ Avoid:**
- "Location 1" (not descriptive)
- "NYC" (too vague)
- "The Restaurant" (not specific)

---

## Editing Locations

### Updating Location Information

1. Click **Edit** button next to location
2. Modify any fields
3. Click **Save Changes**

**Common Updates:**
- Change phone number
- Update email address
- Modify operating hours
- Update address (if moved)

### Activating/Deactivating Locations

**Deactivate Location:**
1. Click **Deactivate** button
2. Confirm action
3. Location becomes inactive
4. All items at location become unavailable

**Activate Location:**
1. Click **Activate** button
2. Location becomes active
3. Items with location availability enabled become visible

**When to Deactivate:**
- Temporary closure
- Seasonal location
- Renovation period
- Testing new location

---

## Location-Specific Menu Availability

### Understanding Availability Levels

**Two-Level System:**

1. **Global Availability** (Menu Item Level)
   - Controls if item exists in menu
   - OFF = Hidden everywhere
   - ON = Available (subject to location settings)

2. **Location Availability** (Location Level)
   - Controls availability at specific location
   - Independent per location
   - Both levels must be ON for item to show

**Example:**
```
Item: Margherita Pizza
Global Status: Active ✓

Location Availability:
  Downtown: Active ✓    → Shows to customers
  Uptown: Active ✓      → Shows to customers
  Airport: Inactive ✗   → Hidden from customers
```

### Setting Availability Per Item

**Method 1: Edit Menu Item**

1. Go to Menu
2. Edit menu item
3. Scroll to "Location Availability"
4. Check/uncheck locations
5. Save

```
Location Availability:
☑ Downtown Branch
☑ Uptown Location
☐ Airport Kiosk
```

**Method 2: Location Availability Matrix**

1. Go to Menu → **"Location Availability Matrix"**
2. See grid of items vs. locations
3. Toggle availability cells
4. Changes save automatically

**Matrix View:**
```
                    Downtown  Uptown  Airport
Margherita Pizza       ✓        ✓       ✗
Caesar Salad           ✓        ✓       ✓
Grilled Salmon         ✓        ✗       ✗
Tiramisu               ✓        ✓       ✓
Cappuccino             ✓        ✓       ✓
```

### Bulk Location Updates

**Update Multiple Items:**

1. Go to Menu
2. Select items (checkboxes)
3. Bulk Actions → "Update Location Availability"
4. Select locations to enable/disable
5. Confirm changes

**Example:**
```
Selected: 15 items
Action: Update Location Availability

Enable at:
☑ Downtown Branch
☑ Uptown Location

Disable at:
☐ Airport Kiosk

[Cancel] [Apply]
```

---

## Location Analytics (PRO/BUSINESS)

### Viewing Location Performance

1. Go to **Analytics**
2. Select location from dropdown
3. View location-specific metrics

**Metrics by Location:**
- Total revenue
- Items sold
- Average order value
- Top-selling items
- Category performance
- Sales trends

### Comparing Locations

**Side-by-Side Comparison:**
```
┌─────────────────────────────────────────────────┐
│  Location Performance (Last 30 Days)             │
├─────────────────────────────────────────────────┤
│                Downtown  Uptown   Airport        │
│  Revenue       $12,456   $8,234   $3,456        │
│  Orders        456       312      145            │
│  Avg Order     $27.32    $26.39   $23.83        │
│  Top Item      Pizza     Salad    Coffee        │
└─────────────────────────────────────────────────┘
```

### Location Reports

**Generate Reports:**
1. Go to Analytics → Reports
2. Select "Location Performance"
3. Choose date range
4. Select locations to include
5. Export as PDF/Excel/CSV

---

## Common Scenarios

### Scenario 1: New Location Opening

**Steps:**
1. Create new location
2. Set status to Inactive initially
3. Configure menu availability
4. Test with staff
5. Activate when ready to launch

### Scenario 2: Limited Menu at Location

**Problem**: Airport kiosk has smaller menu

**Solution:**
1. Go to Location Availability Matrix
2. Select Airport location
3. Enable only quick-service items
4. Disable complex dishes

**Example:**
```
Airport Kiosk Menu (Quick Service):
✓ Coffee & Beverages
✓ Pastries
✓ Sandwiches
✗ Full Meals
✗ Desserts (except grab-and-go)
```

### Scenario 3: Seasonal Location

**Problem**: Beach location open summer only

**Solution:**
1. Create "Beach Location"
2. Activate in summer months
3. Deactivate in winter
4. Reactivate next summer
5. Data preserved year-round

### Scenario 4: Different Prices by Location

**Current Limitation**: Same price across all locations

**Workaround:**
1. Create location-specific items:
   - "Pizza (Downtown)" - $12.99
   - "Pizza (Airport)" - $14.99
2. Set availability accordingly

**Future Feature**: Per-location pricing coming soon!

---

## Location Statistics

### Location Dashboard

Click on a location to see detailed stats:

```
┌─────────────────────────────────────┐
│  Downtown Branch                     │
├─────────────────────────────────────┤
│  Status: Active                      │
│  Address: 123 Main Street, New York  │
│  Phone: (555) 123-4567               │
│  Email: downtown@restaurant.com      │
│                                      │
│  Menu Availability:                  │
│  Available Items: 45/50 (90%)        │
│  Categories: 8                       │
│                                      │
│  Sales (Last 30 Days):               │
│  Revenue: $12,456.78                 │
│  Orders: 456                         │
│  Avg Order: $27.32                   │
│                                      │
│  Top Items:                          │
│  1. Margherita Pizza (89 sold)       │
│  2. Caesar Salad (67 sold)           │
│  3. Tiramisu (54 sold)               │
│                                      │
│  [Edit] [View Analytics] [Deactivate]│
└─────────────────────────────────────┘
```

---

## Plan Limits

### PRO Plan
- Maximum: 3 locations
- Warning at: 2 locations (67%)
- Alert at: 3 locations (100%)

### BUSINESS Plan
- Unlimited locations
- No warnings

### Approaching Limits (PRO)

**At 67% (Warning):**
```
⚠️ You're using 2 of 3 locations (67%)
   Consider upgrading to BUSINESS plan for unlimited locations.
```

**At 100% (Blocked):**
```
❌ Location limit reached (3/3)
   Cannot add more locations.
   [Upgrade to BUSINESS] or [Deactivate Location]
```

---

## Best Practices

### Location Setup

**Complete Information:**
- Fill all contact fields
- Include accurate address
- Add phone and email
- Keep information current

**Naming Convention:**
- Use descriptive names
- Include area/landmark
- Be consistent
- Avoid abbreviations

### Menu Management

**Strategic Availability:**
- Match location capabilities
- Consider kitchen equipment
- Account for storage space
- Reflect customer preferences

**Regular Review:**
- Monthly: Check availability
- Quarterly: Update menu mix
- Annually: Evaluate performance

### Communication

**Staff Training:**
- Train on location-specific menu
- Update when items change
- Provide printed menus
- Use POS integration

**Customer Communication:**
- Show location-specific menus
- Indicate availability
- Update website/app
- Handle special requests

---

## Troubleshooting

### Item Not Showing at Location

**Problem**: Item is active but not visible at location

**Check**:
1. Global item status is Active
2. Location availability is enabled
3. Location status is Active
4. Category is not hidden
5. Refresh customer-facing menu

### Cannot Add Location

**Problem**: "Limit reached" error

**Solution**:
- PRO plan: Upgrade to BUSINESS
- BUSINESS plan: Contact support

### Location Deactivated by Mistake

**Problem**: Accidentally deactivated location

**Solution**:
1. Click **Activate** button
2. Location reactivates immediately
3. All availability settings preserved
4. No data lost

### Bulk Update Failed

**Problem**: Location availability update didn't apply

**Solutions**:
- Reduce number of items
- Check internet connection
- Try again
- Contact support if persists

---

## Advanced Features

### Location Groups (Coming Soon)

Group locations for easier management:
- Regional groups
- Franchise groups
- Format groups (dine-in, takeout, delivery)

### Location-Specific Pricing (Coming Soon)

Set different prices per location:
- Urban vs. suburban pricing
- Airport premium pricing
- Seasonal pricing

### Location Inventory (Coming Soon)

Track inventory per location:
- Stock levels
- Automatic availability updates
- Low stock alerts
- Reorder notifications

---

## Integration

### POS Systems

Sync with POS systems:
- Automatic menu updates
- Real-time availability
- Sales data sync
- Inventory integration

### Online Ordering

Connect to ordering platforms:
- Location-based menus
- Delivery radius
- Pickup options
- Order routing

### Third-Party Delivery

Integrate with delivery services:
- Location-specific menus
- Availability sync
- Order management
- Performance tracking

---

## Related Guides

- [Menu Management Guide](./MENU_MANAGEMENT_GUIDE.md)
- [Sales Analytics Guide](./ANALYTICS_GUIDE.md)
- [Bulk Operations Guide](./BULK_OPERATIONS_GUIDE.md)

---

**Last Updated**: November 2025
