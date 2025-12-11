# Testing Tenant URL System

## Manual Testing Checklist

### ✅ Frontend Tests

#### 1. Valid Tenant Access
- [ ] Open `http://demo-restaurant.localhost:3003`
- [ ] Should load login page
- [ ] No errors in console
- [ ] URL stays the same (no redirect)

#### 2. No Tenant Access
- [ ] Open `http://localhost:3003`
- [ ] Should redirect to `/error/no-tenant`
- [ ] Error page displays correctly
- [ ] Shows helpful instructions

#### 3. Login Flow
- [ ] Open `http://demo-restaurant.localhost:3003/login`
- [ ] Enter credentials: `admin@demo.com` / `password123`
- [ ] Click "Sign In"
- [ ] Should redirect to dashboard
- [ ] User should be authenticated

#### 4. API Requests
- [ ] Open browser DevTools → Network tab
- [ ] Login with valid credentials
- [ ] Check login request headers
- [ ] Should contain: `X-Tenant-Slug: demo-restaurant`
- [ ] Response should be successful (200)

#### 5. Multiple Tenants
- [ ] Open `http://demo-restaurant.localhost:3003`
- [ ] Login successfully
- [ ] Open new tab: `http://test-cafe.localhost:3003`
- [ ] Should show login page (different tenant)
- [ ] Each tenant should be isolated

#### 6. Navigation
- [ ] Login to `http://demo-restaurant.localhost:3003`
- [ ] Navigate to different pages (menu, categories, etc.)
- [ ] All API requests should include `X-Tenant-Slug` header
- [ ] Data should be filtered by tenant

### ✅ Backend Tests

#### 1. Login with Header
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```
Expected: Success response with tokens

#### 2. Login with Body (Backward Compatibility)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123",
    "tenantSlug": "demo-restaurant"
  }'
```
Expected: Success response with tokens

#### 3. Login with Both (Header Priority)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123",
    "tenantSlug": "wrong-tenant"
  }'
```
Expected: Should use header value (demo-restaurant)

#### 4. Invalid Tenant
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: non-existent-tenant" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```
Expected: 401 Unauthorized

#### 5. No Tenant
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "password123"
  }'
```
Expected: 401 Unauthorized (no tenant provided)

### ✅ CORS Tests

#### 1. Valid Origin
```bash
curl -X OPTIONS http://localhost:3001/api/auth/login \
  -H "Origin: http://demo-restaurant.localhost:3003" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,X-Tenant-Slug" \
  -v
```
Expected: CORS headers present, request allowed

#### 2. Different Subdomain
```bash
curl -X OPTIONS http://localhost:3001/api/auth/login \
  -H "Origin: http://test-cafe.localhost:3003" \
  -H "Access-Control-Request-Method: POST" \
  -v
```
Expected: CORS headers present, request allowed

### ✅ Edge Cases

#### 1. Subdomain with Dots
- [ ] Test: `http://my.restaurant.localhost:3003`
- [ ] Should extract: `my` as tenant slug

#### 2. Port in URL
- [ ] Test: `http://demo-restaurant.localhost:3003`
- [ ] Should extract: `demo-restaurant` (ignore port)

#### 3. Uppercase Subdomain
- [ ] Test: `http://DEMO-RESTAURANT.localhost:3003`
- [ ] Should handle case-insensitively

#### 4. Special Characters
- [ ] Test: `http://demo_restaurant.localhost:3003`
- [ ] Should handle or reject appropriately

### ✅ Security Tests

#### 1. Tenant Isolation
```bash
# Login as tenant A
TOKEN_A=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant" \
  -d '{"email":"admin@demo.com","password":"password123"}' \
  | jq -r '.accessToken')

# Try to access tenant B data with tenant A token
curl http://localhost:3001/api/menu/items \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "X-Tenant-Slug: test-cafe"
```
Expected: Should not return tenant B data (403 or empty)

#### 2. Header Injection
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant'; DROP TABLE users; --" \
  -d '{"email":"admin@demo.com","password":"password123"}'
```
Expected: Should sanitize/reject malicious input

#### 3. Missing Header After Login
```bash
# Login
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant" \
  -d '{"email":"admin@demo.com","password":"password123"}' \
  | jq -r '.accessToken')

# Try to access without tenant header
curl http://localhost:3001/api/menu/items \
  -H "Authorization: Bearer $TOKEN"
```
Expected: Should reject or use tenant from JWT

## Automated Test Script

```bash
#!/bin/bash

echo "🧪 Testing Tenant URL System"
echo "=============================="

API_URL="http://localhost:3001/api"
TENANT="demo-restaurant"
EMAIL="admin@demo.com"
PASSWORD="password123"

# Test 1: Login with header
echo "Test 1: Login with X-Tenant-Slug header"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: $TENANT" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$RESPONSE" | grep -q "accessToken"; then
  echo "✅ PASS: Login with header successful"
else
  echo "❌ FAIL: Login with header failed"
  echo "$RESPONSE"
fi

# Test 2: Login with body
echo ""
echo "Test 2: Login with tenantSlug in body"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"tenantSlug\":\"$TENANT\"}")

if echo "$RESPONSE" | grep -q "accessToken"; then
  echo "✅ PASS: Login with body successful"
else
  echo "❌ FAIL: Login with body failed"
  echo "$RESPONSE"
fi

# Test 3: Invalid tenant
echo ""
echo "Test 3: Login with invalid tenant"
RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: invalid-tenant-xyz" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$RESPONSE" | grep -q "401"; then
  echo "✅ PASS: Invalid tenant rejected"
else
  echo "❌ FAIL: Invalid tenant not rejected"
  echo "$RESPONSE"
fi

echo ""
echo "=============================="
echo "Testing complete!"
```

Save as `test-tenant-url.sh` and run:
```bash
chmod +x test-tenant-url.sh
./test-tenant-url.sh
```

## Browser Testing

### Chrome DevTools

1. Open `http://demo-restaurant.localhost:3003`
2. Open DevTools (F12)
3. Go to Network tab
4. Login
5. Check request headers:
   - Should see `X-Tenant-Slug: demo-restaurant`
6. Check response:
   - Should be 200 OK
   - Should contain user data

### Testing Multiple Tenants

1. Open Chrome
2. Open `http://demo-restaurant.localhost:3003`
3. Login
4. Open Incognito window
5. Open `http://test-cafe.localhost:3003`
6. Login with different credentials
7. Both should work independently

## Common Issues

### Issue: "Tenant Required" error
**Solution:** Use subdomain URL: `http://tenant.localhost:3003`

### Issue: DNS not resolving
**Solution:** 
- Use Chrome/Firefox (support `*.localhost`)
- Or add to hosts file: `127.0.0.1 demo-restaurant.localhost`

### Issue: CORS error
**Solution:** Check backend CORS config includes `X-Tenant-Slug` header

### Issue: 401 Unauthorized
**Solution:** 
- Check tenant exists in database
- Check credentials are correct
- Check tenant slug matches database

## Success Criteria

All tests should pass:
- ✅ Valid tenant access works
- ✅ No tenant shows error page
- ✅ Login flow completes successfully
- ✅ API requests include tenant header
- ✅ Multiple tenants are isolated
- ✅ Backend accepts both header and body
- ✅ CORS allows tenant subdomains
- ✅ Security: tenant isolation enforced
