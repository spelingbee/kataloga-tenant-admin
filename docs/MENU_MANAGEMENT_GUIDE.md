# Menu Management Guide

Complete guide to managing your restaurant menu in the Tenant Admin Dashboard.

## Quick Start

1. Navigate to **Menu** in sidebar
2. View all menu items in list format
3. Use search and filters to find items
4. Click **+ Add Menu Item** to create new items
5. Toggle availability with quick switches

---

## Creating Menu Items

### Step-by-Step Process

**1. Click "Add Menu Item" Button**
```
┌─────────────────────────────────────┐
│  Menu Items                          │
│  [+ Add Menu Item]  [Bulk Actions]  │
└─────────────────────────────────────┘
```

**2. Fill Required Fields**

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Name | ✓ | Item name | "Margherita Pizza" |
| Price | ✓ | Item price | 12.99 |
| Category | ✓ | Menu category | "Main Courses" |
| Description | ✗ | Item details | "Classic Italian pizza..." |
| Image | ✗ | Item photo | Upload JPG/PNG |
| Allergens | ✗ | Allergen info | "Gluten, Dairy" |

**3. Set Location Availability** (PRO/BUSINESS)
```
Location Availability:
☑ Downtown Branch
☑ Uptown Location
☐ Airport Kiosk
```

**4. Click "Save"**

### Form Validation

The system validates:
- ✓ Name is not empty
- ✓ Price is positive number
- ✓ Category is selected
- ✓ Image size < 5MB (if uploaded)
- ✓ Image format is JPEG/PNG/WebP

**Error Examples:**
```
❌ Price must be greater than 0
❌ Please select a category
❌ Image size exceeds 5MB limit
```

---

## Editing Menu Items

### Quick Edit
1. Find item in list
2. Click **Edit** button (pencil icon)
3. Modify fields
4. Click **Save Changes**

### Bulk Edit
1. Select multiple items (checkboxes)
2. Click **Bulk Actions** dropdown
3. Choose action:
   - Update Price
   - Change Category
   - Activate/Deactivate
4. Enter new values
5. Confirm changes

---

## Image Management

### Uploading Images

**Supported Formats:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**Requirements:**
- Maximum size: 5MB
- Recommended dimensions: 800x800px (square)
- Minimum dimensions: 400x400px

**Upload Process:**
```
1. Click "Upload Image" in form
2. Select file from computer
3. Preview appears
4. Image auto-optimized
5. Save menu item
```

### Image Best Practices

**✓ DO:**
- Use high-resolution photos
- Ensure good lighting
- Show dish clearly
- Use square aspect ratio
- Keep background simple
- Show actual portion size

**✗ DON'T:**
- Use blurry photos
- Include watermarks
- Use stock photos (if possible)
- Show multiple dishes
- Use dark/unclear images

### Image Optimization

System automatically:
- Resizes to optimal dimensions
- Compresses file size
- Converts to WebP format
- Generates thumbnails
- Caches for fast loading

---

## Dish Availability Control

### Quick Toggle

**In List View:**
```
Item Name          Price    Status
Margherita Pizza   $12.99   [●] Active
Caesar Salad       $8.99    [○] Inactive
Tiramisu          $6.99    [●] Active
```

Click toggle to change status instantly.

### Global vs. Location-Specific

**Global Availability:**
- Controls if item exists in menu
- OFF = Hidden everywhere
- ON = Available (subject to location settings)

**Location Availability** (PRO/BUSINESS):
- Controls availability per location
- Independent of global status
- Both must be ON for item to show

**Example:**
```
Item: Margherita Pizza
Global Status: Active ✓

Location Availability:
  Downtown: Active ✓    → Shows to customers
  Uptown: Active ✓      → Shows to customers
  Airport: Inactive ✗   → Hidden from customers
```

### Bulk Availability Changes

**Activate Multiple Items:**
1. Select items (checkboxes)
2. Bulk Actions → "Activate Selected"
3. Confirm
4. All selected items become active

**Deactivate Multiple Items:**
1. Select items
2. Bulk Actions → "Deactivate Selected"
3. Confirm
4. All selected items become inactive

**Location-Specific Bulk:**
1. Go to **Location Availability Matrix**
2. Select items and locations
3. Toggle availability
4. Changes save automatically

---

## Search and Filtering

### Search by Name

**Search Bar:**
```
┌─────────────────────────────────────┐
│  🔍 Search menu items...             │
└─────────────────────────────────────┘
```

- Type any part of item name
- Results update in real-time
- Case-insensitive
- Searches name and description

**Examples:**
- "pizza" → finds all pizza items
- "gluten" → finds items with gluten in description
- "12" → finds items with $12 in price

### Filter Options

**By Category:**
```
Category: [All Categories ▼]
          - All Categories
          - Appetizers
          - Main Courses
          - Desserts
          - Beverages
```

**By Price Range:**
```
Price Range:
Min: [$___] Max: [$___]
```

**By Status:**
```
Status: [All ▼]
        - All
        - Active Only
        - Inactive Only
```

**By Location** (PRO/BUSINESS):
```
Location: [All Locations ▼]
          - All Locations
          - Downtown Branch
          - Uptown Location
          - Airport Kiosk
```

### Combining Filters

Apply multiple filters simultaneously:
```
Category: Main Courses
Price: $10 - $20
Status: Active
Location: Downtown

Results: 12 items found
```

### Clearing Filters

Click **"Clear Filters"** button to reset all filters.

---

## Bulk Operations

### Selecting Items

**Select Individual Items:**
- Click checkbox next to each item

**Select All on Page:**
- Click checkbox in header row

**Select All Matching Filter:**
- Apply filters
- Click "Select All"
- Confirms selection of all matching items

### Available Bulk Actions

#### 1. Bulk Activation
```
Selected: 15 items
Action: Activate Selected
Confirm: "Activate 15 menu items?"
Result: All items become active
```

#### 2. Bulk Deactivation
```
Selected: 8 items
Action: Deactivate Selected
Confirm: "Deactivate 8 menu items?"
Result: All items become inactive
```

#### 3. Bulk Price Update

**Fixed Price:**
```
Selected: 5 items
Action: Update Price
New Price: $15.99
Confirm: "Set price to $15.99 for 5 items?"
```

**Percentage Change:**
```
Selected: 10 items
Action: Update Price
Change: +10%
Confirm: "Increase prices by 10% for 10 items?"
```

#### 4. Bulk Category Change
```
Selected: 12 items
Action: Change Category
New Category: Specials
Confirm: "Move 12 items to Specials?"
```

#### 5. Bulk Location Update (PRO/BUSINESS)
```
Selected: 20 items
Action: Update Location Availability
Locations: ☑ Downtown ☑ Uptown ☐ Airport
Confirm: "Update availability for 20 items?"
```

### Confirmation Dialogs

All bulk operations show confirmation:
```
┌─────────────────────────────────────┐
│  Confirm Bulk Action                 │
├─────────────────────────────────────┤
│  You are about to activate 15 items. │
│                                      │
│  This action cannot be undone.       │
│                                      │
│  [Cancel]  [Confirm]                 │
└─────────────────────────────────────┘
```

---

## Menu Organization

### Sorting

Click column headers to sort:
- **Name**: Alphabetical (A-Z, Z-A)
- **Price**: Ascending/Descending
- **Category**: Alphabetical
- **Status**: Active first/Inactive first

**Sort Indicator:**
```
Name ▲    Price    Category    Status
```

### Pagination

Navigate large menus:
```
Showing 1-50 of 234 items

[◀ Previous]  1  2  3  4  5  [Next ▶]
```

**Items Per Page:**
- Default: 50 items
- Options: 25, 50, 100, 200

### List vs. Grid View

**List View** (default):
- Compact rows
- More items visible
- Quick scanning

**Grid View**:
- Large images
- Visual browsing
- Better for image-heavy menus

---

## Menu Item Details

### Viewing Details

Click item name to see full details:

```
┌─────────────────────────────────────┐
│  Margherita Pizza                    │
├─────────────────────────────────────┤
│  [Image]                             │
│                                      │
│  Price: $12.99                       │
│  Category: Main Courses              │
│  Status: Active                      │
│                                      │
│  Description:                        │
│  Classic Italian pizza with fresh    │
│  mozzarella, tomatoes, and basil.    │
│                                      │
│  Allergens: Gluten, Dairy            │
│                                      │
│  Location Availability:              │
│  ✓ Downtown Branch                   │
│  ✓ Uptown Location                   │
│  ✗ Airport Kiosk                     │
│                                      │
│  Sales History (PRO/BUSINESS):       │
│  Total Sold: 1,234 units             │
│  Revenue: $16,037.66                 │
│  [View Detailed History]             │
│                                      │
│  Change History (PRO/BUSINESS):      │
│  [View Audit Trail]                  │
│                                      │
│  [Edit]  [Delete]                    │
└─────────────────────────────────────┘
```

---

## Deleting Menu Items

### Single Item Deletion

1. Find item in list or open details
2. Click **Delete** button
3. Confirm deletion
4. Item is permanently removed

**Confirmation:**
```
┌─────────────────────────────────────┐
│  Delete Menu Item?                   │
├─────────────────────────────────────┤
│  Are you sure you want to delete     │
│  "Margherita Pizza"?                 │
│                                      │
│  This action cannot be undone.       │
│                                      │
│  [Cancel]  [Delete]                  │
└─────────────────────────────────────┘
```

### Bulk Deletion

1. Select multiple items
2. Bulk Actions → "Delete Selected"
3. Confirm deletion
4. All selected items removed

**Warning**: Deleted items cannot be recovered!

---

## Plan Limits

### FREE Plan
- Maximum: 50 menu items
- Warning at: 40 items (80%)
- Alert at: 45 items (90%)

### PRO Plan
- Maximum: 500 menu items
- Warning at: 400 items (80%)
- Alert at: 450 items (90%)

### BUSINESS Plan
- Unlimited menu items
- No warnings

### Approaching Limits

**At 80% (Warning):**
```
⚠️ You're using 40 of 50 menu items (80%)
   Consider upgrading to PRO plan.
```

**At 90% (Alert):**
```
🚨 You're using 45 of 50 menu items (90%)
   Upgrade now or delete unused items.
```

**At 100% (Blocked):**
```
❌ Menu item limit reached (50/50)
   Cannot add more items.
   [Upgrade Plan] or [Delete Items]
```

---

## Tips & Best Practices

### Naming Conventions
- Use clear, descriptive names
- Include key ingredients
- Avoid abbreviations
- Be consistent with capitalization

**Good Examples:**
- "Grilled Salmon with Lemon Butter"
- "Classic Caesar Salad"
- "New York Style Cheesecake"

**Bad Examples:**
- "Salmon" (too vague)
- "CAESAR SALAD" (all caps)
- "NYS Cheesecake" (abbreviation)

### Descriptions
- Keep under 200 characters
- Highlight key ingredients
- Mention preparation method
- Include unique selling points
- Note dietary information

**Example:**
```
"Wood-fired Margherita pizza with San Marzano 
tomatoes, fresh buffalo mozzarella, and basil. 
Vegetarian. Contains gluten and dairy."
```

### Pricing
- Use consistent decimal places ($12.99, not $12.9)
- Review prices quarterly
- Consider seasonal adjustments
- Use bulk price updates for efficiency

### Categories
- Assign every item to a category
- Use standard category names
- Don't create too many categories
- Review category distribution regularly

### Images
- Upload images for all items
- Update photos annually
- Use consistent style/lighting
- Show actual portion sizes

### Availability
- Review inactive items monthly
- Use location-specific availability
- Communicate changes to staff
- Update based on inventory

---

## Troubleshooting

### Cannot Add Item
**Problem**: "Limit reached" error
**Solution**: Upgrade plan or delete unused items

### Image Won't Upload
**Problem**: Upload fails
**Solutions**:
- Check file size (< 5MB)
- Use JPEG/PNG/WebP format
- Check internet connection
- Try different browser

### Item Not Showing to Customers
**Problem**: Item is active but not visible
**Check**:
- Global status is Active
- Location availability is enabled
- Category is not hidden
- Menu is published

### Bulk Operation Failed
**Problem**: Bulk action didn't complete
**Solutions**:
- Reduce number of selected items
- Check internet connection
- Try operation again
- Contact support if persists

---

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: New menu item
- `Ctrl/Cmd + F`: Focus search
- `Ctrl/Cmd + S`: Save form
- `Esc`: Close modal
- `Space`: Toggle checkbox
- `Enter`: Submit form

---

## Related Guides

- [Category Management Guide](./CATEGORY_MANAGEMENT_GUIDE.md)
- [Location Management Guide](./LOCATION_MANAGEMENT_GUIDE.md)
- [Sales Analytics Guide](./ANALYTICS_GUIDE.md)
- [Bulk Operations Guide](./BULK_OPERATIONS_GUIDE.md)

---

**Last Updated**: November 2025
