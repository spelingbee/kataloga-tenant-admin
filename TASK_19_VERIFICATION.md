# Task 19: Category Management - Verification Guide

## Quick Start

To verify the category management implementation:

1. **Start the backend server** (if not already running):
   ```bash
   cd apps/backend
   npm run start:dev
   ```

2. **Start the tenant-admin frontend**:
   ```bash
   cd apps/tenant-admin
   npm run dev
   ```

3. **Access the application**:
   - Open browser to `http://localhost:3001` (or configured port)
   - Login with tenant admin credentials
   - Navigate to Categories page via:
     - Dashboard → "Manage Categories" button
     - Direct URL: `/categories`

## Verification Checklist

### ✅ Page Load and Display
- [ ] Categories page loads without errors
- [ ] Page header displays "Category Management" title
- [ ] "Add Category" button is visible
- [ ] Statistics cards show correct counts (if categories exist)
- [ ] Empty state displays if no categories exist

### ✅ Create Category (Requirement 4.2)
- [ ] Click "Add Category" button opens modal
- [ ] Form displays with name and description fields
- [ ] Name field is marked as required
- [ ] Description field is optional
- [ ] Validation errors show for:
  - [ ] Empty name field
  - [ ] Name less than 2 characters
  - [ ] Name more than 100 characters
  - [ ] Description more than 500 characters
- [ ] Submit button disabled when form invalid
- [ ] Success toast appears after creation
- [ ] New category appears in list
- [ ] Modal closes after successful creation

### ✅ Display Categories (Requirement 4.1)
- [ ] All categories display in grid layout
- [ ] Each category card shows:
  - [ ] Category name
  - [ ] Description (if provided)
  - [ ] Item count
  - [ ] Display order number
  - [ ] Drag handle icon
  - [ ] Edit button
  - [ ] Delete button
- [ ] Categories are sorted by display order
- [ ] Statistics cards show correct totals

### ✅ Edit Category (Requirement 4.3)
- [ ] Click edit button opens modal
- [ ] Form pre-fills with existing data
- [ ] Modal title shows "Edit Category"
- [ ] Can modify name and description
- [ ] Validation works same as create
- [ ] Success toast appears after update
- [ ] Changes reflect immediately in list
- [ ] Modal closes after successful update

### ✅ Delete Category (Requirement 4.4)
- [ ] Click delete button opens confirmation modal
- [ ] Modal shows category name
- [ ] Delete button disabled if category has items
- [ ] Warning message displays for categories with items
- [ ] Can cancel deletion
- [ ] Success toast appears after deletion
- [ ] Category removed from list
- [ ] Modal closes after successful deletion

### ✅ Reorder Categories (Requirement 4.5)
- [ ] Drag handle cursor changes to grab/grabbing
- [ ] Can drag category cards to reorder
- [ ] Visual feedback during drag
- [ ] Order updates immediately on drop
- [ ] Display order numbers update
- [ ] Order persists after page refresh
- [ ] Reverts to original order on error

### ✅ Error Handling
- [ ] Network errors show error message
- [ ] Retry button works after error
- [ ] Error toast displays for failed operations
- [ ] Form validation errors display inline
- [ ] Loading states show during async operations

### ✅ Responsive Design
- [ ] Page works on desktop (1920px+)
- [ ] Page works on tablet (768px-1024px)
- [ ] Page works on mobile (320px-767px)
- [ ] Grid layout adapts to screen size
- [ ] Modals are mobile-friendly
- [ ] Touch drag-and-drop works on mobile

### ✅ Navigation
- [ ] Can navigate to categories page from dashboard
- [ ] Can navigate back to dashboard
- [ ] Auth middleware protects page
- [ ] Redirects to login if not authenticated

### ✅ Visual Polish
- [ ] Hover effects work on cards and buttons
- [ ] Transitions are smooth
- [ ] Colors match design system
- [ ] Icons display correctly
- [ ] Loading spinners animate
- [ ] Toast notifications auto-dismiss

## API Endpoint Verification

Test the backend endpoints directly:

### List Categories
```bash
curl -X GET http://localhost:3000/tenant-admin/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Category
```bash
curl -X POST http://localhost:3000/tenant-admin/categories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Appetizers","description":"Starter dishes"}'
```

### Update Category
```bash
curl -X PATCH http://localhost:3000/tenant-admin/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name"}'
```

### Delete Category
```bash
curl -X DELETE http://localhost:3000/tenant-admin/categories/CATEGORY_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Reorder Categories
```bash
curl -X POST http://localhost:3000/tenant-admin/categories/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"categories":[{"id":"ID1","displayOrder":0},{"id":"ID2","displayOrder":1}]}'
```

## Browser Console Checks

Open browser DevTools and verify:

1. **No Console Errors**: Check for JavaScript errors
2. **Network Requests**: Verify API calls succeed
3. **Vue DevTools**: Check component state and props
4. **Pinia Store**: Verify category store state updates

## Common Issues and Solutions

### Issue: Categories not loading
- **Check**: Backend server is running
- **Check**: API endpoint is correct in `.env`
- **Check**: JWT token is valid
- **Solution**: Check browser console for errors

### Issue: Drag-and-drop not working
- **Check**: vuedraggable is installed
- **Check**: Browser supports drag events
- **Solution**: Try on different browser

### Issue: Delete button always disabled
- **Check**: Category has no menu items
- **Check**: Item count is correctly fetched
- **Solution**: Verify backend returns itemCount

### Issue: Validation not working
- **Check**: Form validation logic in CategoryForm
- **Check**: Error messages display
- **Solution**: Check browser console for errors

### Issue: Styles not applied
- **Check**: SCSS files are imported correctly
- **Check**: Variables are accessible
- **Solution**: Restart dev server

## Performance Checks

- [ ] Page loads in < 2 seconds
- [ ] Category list renders smoothly with 50+ categories
- [ ] Drag-and-drop is responsive
- [ ] No memory leaks (check DevTools Memory tab)
- [ ] API calls are debounced/throttled appropriately

## Accessibility Checks

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader compatible (test with NVDA/JAWS)
- [ ] Color contrast meets WCAG standards
- [ ] Form labels properly associated

## Security Checks

- [ ] Auth middleware protects routes
- [ ] JWT token required for API calls
- [ ] Tenant isolation enforced
- [ ] XSS protection (no unescaped HTML)
- [ ] CSRF protection (if applicable)

## Success Criteria

All checkboxes above should be checked (✅) for the implementation to be considered complete and verified.

## Next Steps

After verification:
1. Test with real data (create 10+ categories)
2. Test with menu items assigned to categories
3. Test plan limits (if applicable)
4. Perform user acceptance testing
5. Deploy to staging environment

## Notes

- Backend category endpoints were already implemented (task 5)
- Frontend integrates with existing backend API
- No database migrations needed
- Compatible with existing menu management system
