# Category Management Guide

Complete guide to organizing your menu with categories in the Tenant Admin Dashboard.

## Overview

Categories help organize your menu items into logical groups, making it easier for customers to browse and for you to manage your offerings.

---

## Quick Start

1. Navigate to **Categories** in sidebar
2. View all categories with item counts
3. Click **+ Add Category** to create new categories
4. Drag and drop to reorder
5. Edit or delete as needed

---

## Viewing Categories

### Category List

```
┌─────────────────────────────────────────────────┐
│  Categories                    [+ Add Category]  │
├─────────────────────────────────────────────────┤
│  ⋮⋮ Appetizers              (12 items)  [Edit] [Delete] │
│  ⋮⋮ Main Courses            (25 items)  [Edit] [Delete] │
│  ⋮⋮ Desserts                (8 items)   [Edit] [Delete] │
│  ⋮⋮ Beverages               (15 items)  [Edit] [Delete] │
│  ⋮⋮ Specials                (5 items)   [Edit] [Delete] │
└─────────────────────────────────────────────────┘
```

### Category Information

Each category displays:
- **Drag Handle** (⋮⋮): For reordering
- **Name**: Category name
- **Item Count**: Number of items in category
- **Actions**: Edit and Delete buttons

---

## Creating Categories

### Step-by-Step Process

**1. Click "+ Add Category" Button**

**2. Fill in Category Form**

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Name | ✓ | Category name | "Appetizers" |
| Description | ✗ | Category details | "Start your meal right" |
| Display Order | Auto | Position in menu | Auto-assigned |

**3. Click "Save"**

### Form Validation

The system validates:
- ✓ Name is not empty
- ✓ Name is unique
- ✓ Name length < 100 characters

**Error Examples:**
```
❌ Category name is required
❌ Category "Appetizers" already exists
❌ Name is too long (max 100 characters)
```

### Category Naming Best Practices

**✓ Good Names:**
- Appetizers
- Main Courses
- Desserts
- Beverages
- Specials
- Kids Menu
- Vegetarian Options
- Gluten-Free

**✗ Avoid:**
- "Food" (too vague)
- "Misc" (not descriptive)
- "Category 1" (not meaningful)
- "APPETIZERS" (all caps)

---

## Editing Categories

### Renaming a Category

1. Click **Edit** button next to category
2. Modify name or description
3. Click **Save Changes**

**Example:**
```
Before: "Starters"
After:  "Appetizers"
```

### Updating Description

1. Click **Edit** button
2. Update description field
3. Click **Save Changes**

**Example:**
```
Description: "Light bites to start your meal. 
Perfect for sharing or enjoying solo."
```

---

## Reordering Categories

Categories appear in your menu in the order you set. Customers see categories in this order.

### Drag and Drop Method

**1. Click and Hold Drag Handle (⋮⋮)**
```
⋮⋮ Appetizers
```

**2. Drag to New Position**
```
⋮⋮ Appetizers  ← Dragging
   Main Courses
   Desserts
   ↓ Drop here
   Beverages
```

**3. Release to Drop**
```
Main Courses
Desserts
Appetizers  ← New position
Beverages
```

**4. Order Saves Automatically**

### Recommended Order

**Traditional Restaurant Flow:**
1. Specials (if any)
2. Appetizers
3. Soups & Salads
4. Main Courses
5. Sides
6. Desserts
7. Beverages

**Cafe Flow:**
1. Coffee & Tea
2. Breakfast
3. Lunch
4. Pastries
5. Desserts

**Bar/Pub Flow:**
1. Specials
2. Appetizers
3. Burgers & Sandwiches
4. Main Courses
5. Sides
6. Desserts
7. Beverages
8. Cocktails

---

## Deleting Categories

### Prerequisites

**Cannot delete category if:**
- Category has menu items
- Category is the last remaining category

**Must do first:**
1. Move items to another category, OR
2. Delete all items in category

### Deletion Process

**1. Ensure Category is Empty**
```
Category: "Old Specials" (0 items) ✓
```

**2. Click Delete Button**

**3. Confirm Deletion**
```
┌─────────────────────────────────────┐
│  Delete Category?                    │
├─────────────────────────────────────┤
│  Are you sure you want to delete     │
│  "Old Specials"?                     │
│                                      │
│  This action cannot be undone.       │
│                                      │
│  [Cancel]  [Delete]                  │
└─────────────────────────────────────┘
```

**4. Category Removed**

### Moving Items Before Deletion

**Option 1: Move Items Individually**
1. Go to Menu
2. Edit each item in category
3. Change category
4. Save
5. Return to Categories
6. Delete empty category

**Option 2: Bulk Move**
1. Go to Menu
2. Filter by category to delete
3. Select all items
4. Bulk Actions → "Change Category"
5. Select new category
6. Confirm
7. Return to Categories
8. Delete empty category

---

## Category Statistics

### Viewing Category Performance

Click on a category to see detailed statistics:

```
┌─────────────────────────────────────┐
│  Main Courses                        │
├─────────────────────────────────────┤
│  Total Items: 25                     │
│  Active Items: 23                    │
│  Inactive Items: 2                   │
│                                      │
│  Average Price: $15.99               │
│  Price Range: $8.99 - $28.99         │
│                                      │
│  Sales (PRO/BUSINESS):               │
│  Total Revenue: $12,456.78           │
│  Units Sold: 1,234                   │
│  Top Item: Grilled Salmon            │
│                                      │
│  [View Items] [Edit] [Delete]        │
└─────────────────────────────────────┘
```

### Category Analytics (PRO/BUSINESS)

Access detailed analytics:
1. Go to Analytics
2. View "Category Performance"
3. See breakdown by category:
   - Revenue per category
   - Items sold per category
   - Average order value
   - Growth trends

**Example Chart:**
```
Category Performance (Last 30 Days)

Main Courses    ████████████████ $12,456
Appetizers      ██████████ $6,789
Desserts        ████████ $4,321
Beverages       ██████ $3,210
```

---

## Plan Limits

### FREE Plan
- Maximum: 10 categories
- Warning at: 8 categories (80%)
- Alert at: 9 categories (90%)

### PRO Plan
- Maximum: 50 categories
- Warning at: 40 categories (80%)
- Alert at: 45 categories (90%)

### BUSINESS Plan
- Unlimited categories
- No warnings

### Approaching Limits

**At 80% (Warning):**
```
⚠️ You're using 8 of 10 categories (80%)
   Consider upgrading to PRO plan.
```

**At 90% (Alert):**
```
🚨 You're using 9 of 10 categories (90%)
   Upgrade now or consolidate categories.
```

**At 100% (Blocked):**
```
❌ Category limit reached (10/10)
   Cannot add more categories.
   [Upgrade Plan] or [Delete Categories]
```

---

## Best Practices

### Category Structure

**Keep It Simple:**
- 6-12 categories is ideal
- Too few = hard to navigate
- Too many = overwhelming

**Logical Grouping:**
- Group similar items
- Match customer expectations
- Consider meal flow

**Clear Names:**
- Use familiar terms
- Avoid jargon
- Be specific but concise

### Category Organization

**By Meal Type:**
- Breakfast
- Lunch
- Dinner
- Brunch

**By Course:**
- Appetizers
- Soups & Salads
- Main Courses
- Desserts

**By Cuisine:**
- Italian
- Mexican
- Asian
- American

**By Dietary:**
- Vegetarian
- Vegan
- Gluten-Free
- Low-Carb

### Maintenance

**Regular Review:**
- Monthly: Check item distribution
- Quarterly: Review category names
- Annually: Restructure if needed

**Balance Items:**
- Aim for 5-15 items per category
- Split large categories
- Merge small categories

**Update Descriptions:**
- Keep descriptions current
- Highlight seasonal items
- Promote specials

---

## Common Scenarios

### Scenario 1: Seasonal Menu

**Problem**: Need to add seasonal items

**Solution**:
1. Create "Seasonal Specials" category
2. Add seasonal items
3. Place at top of menu (reorder)
4. Remove category when season ends

### Scenario 2: Too Many Items in One Category

**Problem**: "Main Courses" has 50 items

**Solution**:
1. Split into subcategories:
   - Pasta Dishes
   - Grilled Meats
   - Seafood
   - Vegetarian Mains
2. Move items to new categories
3. Delete old category

### Scenario 3: Merging Categories

**Problem**: "Starters" and "Appetizers" both exist

**Solution**:
1. Choose one name (e.g., "Appetizers")
2. Move all items from "Starters" to "Appetizers"
3. Delete empty "Starters" category

### Scenario 4: Rebranding Menu

**Problem**: Want to change category names

**Solution**:
1. Edit each category
2. Update names to match new brand
3. Update descriptions
4. Reorder if needed

**Example:**
```
Before:          After:
Starters    →    Small Plates
Mains       →    Entrees
Sweets      →    Desserts
Drinks      →    Beverages
```

---

## Category Display

### Customer-Facing Menu

Categories appear in customer menu:

```
┌─────────────────────────────────────┐
│  Restaurant Menu                     │
├─────────────────────────────────────┤
│  📋 Appetizers                       │
│     • Bruschetta         $8.99       │
│     • Calamari          $12.99       │
│     • Wings             $10.99       │
│                                      │
│  🍝 Main Courses                     │
│     • Spaghetti         $14.99       │
│     • Grilled Salmon    $22.99       │
│     • Ribeye Steak      $28.99       │
│                                      │
│  🍰 Desserts                         │
│     • Tiramisu           $6.99       │
│     • Cheesecake         $7.99       │
│     • Gelato             $5.99       │
└─────────────────────────────────────┘
```

### Category Icons (Optional)

Add emoji or icons to categories:
- 🥗 Salads
- 🍕 Pizza
- 🍔 Burgers
- 🍰 Desserts
- ☕ Coffee
- 🍺 Beverages

---

## Troubleshooting

### Cannot Delete Category

**Problem**: "Category has items" error

**Solution**:
1. Go to Menu
2. Filter by this category
3. Move or delete all items
4. Return to Categories
5. Delete category

### Category Not Showing in Menu

**Problem**: Created category but not visible

**Check**:
- Category has at least one active item
- Menu is published
- Category is not hidden
- Refresh page

### Drag and Drop Not Working

**Problem**: Cannot reorder categories

**Solutions**:
- Use mouse (not touch)
- Try different browser
- Check for JavaScript errors
- Refresh page

### Lost Category Order

**Problem**: Categories reset to wrong order

**Solution**:
- Reorder categories again
- Order saves automatically
- Contact support if persists

---

## Advanced Tips

### Category Descriptions for SEO

Use descriptions to improve search:
```
Name: Italian Pasta
Description: "Authentic Italian pasta dishes 
made fresh daily with imported ingredients. 
Includes spaghetti, fettuccine, penne, and 
specialty pasta options."
```

### Seasonal Category Management

**Spring/Summer:**
- Add "Summer Specials"
- Highlight light dishes
- Feature salads

**Fall/Winter:**
- Add "Comfort Food"
- Highlight hearty dishes
- Feature soups

### Multi-Location Categories

**Different menus per location:**
1. Create location-specific categories
2. Use naming convention:
   - "Downtown - Breakfast"
   - "Airport - Quick Bites"
3. Set location availability per item

---

## Related Guides

- [Menu Management Guide](./MENU_MANAGEMENT_GUIDE.md)
- [Bulk Operations Guide](./BULK_OPERATIONS_GUIDE.md)
- [Sales Analytics Guide](./ANALYTICS_GUIDE.md)

---

**Last Updated**: November 2025
