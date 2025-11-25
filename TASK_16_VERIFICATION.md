# Task 16 Verification Guide

## Quick Verification Steps

### 1. Start the Applications

**Backend:**
```bash
cd apps/backend
npm run start:dev
```
Backend should be running on `http://localhost:3001`

**Tenant Admin:**
```bash
cd apps/tenant-admin
npm run dev
```
Tenant Admin should be running on `http://localhost:3002`

### 2. Login to Tenant Admin
1. Navigate to `http://localhost:3002/login`
2. Login with tenant admin credentials
3. You should be redirected to the dashboard

### 3. Navigate to Menu Management
1. Click on "Menu" in the sidebar or navigate to `/menu`
2. You should see the menu list page with existing items (if any)

### 4. Test Create Menu Item

**Navigate to Create Page:**
1. Click the "Add Menu Item" button in the top right
2. You should be redirected to `/menu/items/new`
3. Verify the page shows:
   - Back button
   - "Add New Menu Item" title
   - Empty form with all fields

**Test Form Validation:**

1. **Name Field (Required)**
   - Leave empty and click submit → Should show "Name is required"
   - Enter 101 characters → Should show "Name must be 100 characters or less"
   - Enter valid name → Error should clear

2. **Price Field (Required)**
   - Leave empty and click submit → Should show "Price is required"
   - Enter 0 → Should show "Price must be at least $0.01"
   - Enter 1000000 → Should show "Price cannot exceed $999,999.99"
   - Enter "abc" → Should show validation error
   - Enter 12.99 → Should accept

3. **Description Field (Optional)**
   - Enter 501 characters → Should show "Description must be 500 characters or less"
   - Character counter should update as you type
   - Enter 250 characters → Should accept

4. **Image URL Field (Optional)**
   - Enter "not-a-url" → Should show "Please enter a valid URL"
   - Enter "https://example.com/image.pdf" → Should show "Image must be JPG, JPEG, PNG, GIF, or WebP"
   - Enter valid image URL → Should show preview below
   - Enter broken image URL → Should show error when image fails to load

5. **Category Field (Optional)**
   - Dropdown should show all available categories
   - Should be able to select a category
   - Should be able to leave empty

6. **Allergens Field (Optional)**
   - Should accept any text
   - No validation required

7. **Active Checkbox**
   - Should be checked by default
   - Should be able to toggle

**Test Form Submission:**

1. Fill in valid data:
   ```
   Name: Cappuccino
   Description: Rich espresso with steamed milk and foam
   Price: 4.50
   Category: (select one)
   Image URL: https://images.unsplash.com/photo-1572442388796-11668a67e53d
   Allergens: Dairy
   Active: Checked
   ```

2. Click "Create Menu Item"
3. Should show loading spinner on button
4. Should redirect to `/menu` on success
5. New item should appear in the menu list

**Test Cancel Button:**
1. Fill in some data
2. Click "Cancel"
3. Should redirect to `/menu` without saving

**Test Back Button:**
1. Click "Back to Menu"
2. Should redirect to `/menu` without saving

### 5. Test Edit Menu Item

**Navigate to Edit Page:**
1. From menu list, click edit icon on any item
2. Should be redirected to `/menu/items/:id`
3. Verify the page shows:
   - Back button
   - "Edit Menu Item" title
   - Form pre-filled with existing data

**Test Form Pre-population:**
1. All fields should show current values
2. Image preview should show if item has image
3. Category should be pre-selected
4. Active checkbox should match current state

**Test Form Updates:**
1. Change the name to "Updated Cappuccino"
2. Change the price to 5.00
3. Update description
4. Change category
5. Toggle active status
6. Click "Update Menu Item"
7. Should show loading spinner
8. Should redirect to `/menu` on success
9. Changes should be reflected in menu list

**Test Validation on Edit:**
1. Clear the name field → Should show error
2. Enter invalid price → Should show error
3. Enter invalid image URL → Should show error
4. Form should not submit with errors

**Test Cancel on Edit:**
1. Make some changes
2. Click "Cancel"
3. Should redirect to `/menu` without saving changes

### 6. Test MenuItemCard Component

**Visual Verification:**
1. Navigate to `/menu`
2. Each menu item should display:
   - Image or placeholder
   - Name
   - Price (formatted with $)
   - Description (truncated if long)
   - Category badge
   - Allergens warning (if present)
   - Inactive badge (if not active)
   - Three action buttons

**Test Card Actions:**
1. **Toggle Availability**
   - Click eye icon on active item → Should deactivate
   - Click eye-off icon on inactive item → Should activate
   - Status should update immediately

2. **Edit Button**
   - Click edit icon → Should navigate to edit page

3. **Delete Button**
   - Click delete icon → Should show confirmation
   - Confirm → Item should be removed from list

**Test Card Hover Effects:**
1. Hover over card → Should lift slightly with shadow
2. Hover over action buttons → Should change color

### 7. Test Error Handling

**Network Errors:**
1. Stop the backend server
2. Try to create a menu item
3. Should show error message
4. Start backend and try again → Should work

**Invalid Item ID:**
1. Navigate to `/menu/items/invalid-id`
2. Should show "Menu Item Not Found" message
3. Should show "Return to Menu" button

**No Menu Available:**
1. If no menu exists, create page should show error
2. Error should say "No menu found. Please create a menu first."

### 8. Test Responsive Design

**Desktop (1920x1080):**
1. Form should be centered with max-width
2. All fields should be easily readable
3. Buttons should be appropriately sized

**Tablet (768x1024):**
1. Form should adapt to smaller width
2. Two-column layout should stack on mobile
3. All elements should remain accessible

**Mobile (375x667):**
1. Form should be single column
2. Buttons should be full width or stacked
3. Text should be readable without zooming

### 9. Test Integration with Menu Store

**Verify Store Updates:**
1. Open browser dev tools
2. Check Vue DevTools (if installed)
3. Create a menu item → Store should update
4. Edit a menu item → Store should update
5. Delete a menu item → Store should update
6. Toggle availability → Store should update

**Verify Pagination:**
1. If more than 20 items exist
2. Create new item → Should appear on page 1
3. Navigate to page 2 → New item should not appear
4. Return to page 1 → New item should be there

### 10. Test Category Integration

**With Categories:**
1. Ensure categories exist in database
2. Create menu item → Category dropdown should populate
3. Select category → Should save correctly
4. Edit menu item → Category should be pre-selected

**Without Categories:**
1. If no categories exist
2. Dropdown should show "Select a category" only
3. Should still be able to create item without category

## Expected Results Summary

✅ **Create Page:**
- Form renders correctly
- All validation works
- Image preview works
- Successful creation redirects to menu list
- Cancel/back buttons work

✅ **Edit Page:**
- Form pre-fills with existing data
- All validation works
- Image preview works
- Successful update redirects to menu list
- Cancel/back buttons work
- "Not Found" state works

✅ **MenuItemCard:**
- Displays all item information
- Action buttons work
- Hover effects work
- Responsive design works

✅ **Form Validation:**
- Required fields validated
- Optional fields validated
- Error messages clear and helpful
- Submit disabled when invalid

✅ **Error Handling:**
- Network errors handled
- Invalid data handled
- Missing items handled
- User-friendly error messages

✅ **Integration:**
- Store updates correctly
- Navigation works
- Categories load
- Images display

## Common Issues and Solutions

### Issue: "No menu found" error
**Solution:** Create a menu first using the backend API or super admin panel

### Issue: Categories not loading
**Solution:** Ensure categories exist in database and category store is working

### Issue: Image preview not showing
**Solution:** 
- Check image URL is valid and publicly accessible
- Check CORS settings if loading from external domain
- Verify image URL ends with valid extension

### Issue: Form not submitting
**Solution:**
- Check all required fields are filled
- Check validation errors are cleared
- Check browser console for errors
- Verify backend is running

### Issue: Changes not reflecting in menu list
**Solution:**
- Check store is updating correctly
- Refresh the page
- Check backend database for changes

## Files to Review

1. **Components:**
   - `components/menu/MenuItemForm.vue`
   - `components/menu/MenuItemCard.vue`

2. **Pages:**
   - `pages/menu/items/new.vue`
   - `pages/menu/items/[id].vue`

3. **Store:**
   - `stores/menu.ts`

4. **Types:**
   - `types/index.ts`

5. **Documentation:**
   - `TASK_16_IMPLEMENTATION.md`

## Next Steps

After verification is complete:
- [ ] Move to Task 17: Implement dish availability control
- [ ] Move to Task 18: Implement bulk menu operations
- [ ] Consider adding toast notifications for success/error messages
- [ ] Consider adding image upload functionality (future enhancement)
