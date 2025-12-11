# Tenant URL Setup Guide

## Overview

Tenant Admin приложение теперь использует **subdomain-based tenant resolution**. Каждый tenant получает доступ к приложению через уникальный subdomain.

## URL Structure

### Production
```
https://[tenant-slug].yourdomain.com
```

Примеры:
- `https://demo-restaurant.yourdomain.com`
- `https://bella-italia.yourdomain.com`
- `https://coffee-corner.yourdomain.com`

### Development (localhost)
```
http://[tenant-slug].localhost:3003
```

Примеры:
- `http://demo-restaurant.localhost:3003`
- `http://test-cafe.localhost:3003`

## How It Works

### 1. Frontend (Nuxt)

#### Tenant Extraction
Composable `useTenant()` автоматически извлекает tenant slug из subdomain:

```typescript
const { getTenantSlug, requireTenantSlug, hasTenant } = useTenant()

// Get tenant slug (returns null if not found)
const slug = getTenantSlug() // 'demo-restaurant'

// Require tenant slug (throws error if not found)
const slug = requireTenantSlug() // 'demo-restaurant' or throws

// Check if tenant exists
if (hasTenant()) {
  // Tenant is present
}
```

#### Automatic Tenant Header
API service автоматически добавляет `X-Tenant-Slug` header ко всем запросам:

```typescript
// In api.service.ts
config.headers['X-Tenant-Slug'] = tenantSlug
```

#### Global Middleware
Middleware `tenant.global.ts` проверяет наличие tenant на каждом роуте:

```typescript
// Redirects to /error/no-tenant if tenant is missing
export default defineNuxtRouteMiddleware((to) => {
  if (!hasTenant()) {
    return navigateTo('/error/no-tenant')
  }
})
```

### 2. Backend (NestJS)

#### Tenant Resolution
Auth controller принимает tenant slug из двух источников (с приоритетом):

1. **Header** `X-Tenant-Slug` (приоритет)
2. **Body** `tenantSlug` (fallback для обратной совместимости)

```typescript
// In auth.controller.ts
const tenantSlug = req.get('X-Tenant-Slug') || loginDto.tenantSlug;
```

#### CORS Configuration
Backend разрешает все subdomains для tenant-admin:

```typescript
// Allow all subdomains for tenant-admin
if (origin && origin.includes('localhost:3003')) {
  return callback(null, true);
}
```

## Configuration

### Environment Variables

#### Frontend (.env)
```env
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000
NUXT_PUBLIC_BASE_DOMAIN=localhost:3003
```

For production:
```env
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NUXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

#### Backend (.env)
```env
TENANT_ADMIN_URL=http://localhost:3003
```

For production:
```env
TENANT_ADMIN_URL=https://yourdomain.com
```

## Development Setup

### 1. Local DNS Configuration

#### Option A: Browser (Recommended for Development)
Современные браузеры автоматически разрешают `*.localhost` на `127.0.0.1`.

Просто откройте:
```
http://demo-restaurant.localhost:3003
```

#### Option B: Hosts File (Alternative)
Добавьте в `/etc/hosts` (Linux/Mac) или `C:\Windows\System32\drivers\etc\hosts` (Windows):

```
127.0.0.1 demo-restaurant.localhost
127.0.0.1 test-cafe.localhost
127.0.0.1 bella-italia.localhost
```

### 2. Start Development Server

```bash
cd apps/tenant-admin
pnpm dev
```

Server запустится на `http://localhost:3003`

### 3. Access Application

Откройте браузер и перейдите на:
```
http://demo-restaurant.localhost:3003
```

## Production Deployment

### 1. DNS Configuration

Настройте wildcard DNS record:

```
Type: A
Name: *
Value: [Your Server IP]
TTL: 3600
```

Или для каждого tenant отдельно:

```
Type: A
Name: demo-restaurant
Value: [Your Server IP]
TTL: 3600
```

### 2. Nginx Configuration

```nginx
server {
    listen 80;
    server_name *.yourdomain.com;

    location / {
        proxy_pass http://localhost:3003;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. SSL Certificate (Let's Encrypt)

Для wildcard SSL:

```bash
certbot certonly --manual --preferred-challenges=dns \
  -d yourdomain.com -d *.yourdomain.com
```

## Testing

### Test Tenant Access

1. **Valid Tenant URL**
```bash
curl http://demo-restaurant.localhost:3003
# Should load the application
```

2. **No Tenant URL**
```bash
curl http://localhost:3003
# Should redirect to /error/no-tenant
```

3. **API Request with Tenant Header**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Slug: demo-restaurant" \
  -d '{"email":"admin@demo.com","password":"password123"}'
```

## Migration from Old System

### Old System (Body Parameter)
```typescript
// Frontend
await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password',
  tenantSlug: 'demo-restaurant' // ❌ Old way
})
```

### New System (Subdomain + Header)
```typescript
// Frontend - automatic via subdomain
// Access: http://demo-restaurant.localhost:3003
await api.post('/auth/login', {
  email: 'user@example.com',
  password: 'password'
  // tenantSlug automatically added via X-Tenant-Slug header ✅
})
```

### Backward Compatibility

Backend поддерживает оба метода:
- ✅ Header `X-Tenant-Slug` (новый способ)
- ✅ Body `tenantSlug` (старый способ для совместимости)

## Troubleshooting

### Issue: "Tenant Required" Error

**Причина**: Приложение открыто без subdomain

**Решение**: Используйте URL с tenant subdomain:
```
http://demo-restaurant.localhost:3003
```

### Issue: DNS не разрешается

**Причина**: Браузер не поддерживает `*.localhost` или hosts file не настроен

**Решение**: 
1. Используйте Chrome/Firefox (поддерживают `*.localhost`)
2. Или добавьте запись в hosts file

### Issue: CORS Error

**Причина**: Backend не разрешает subdomain origin

**Решение**: Проверьте CORS конфигурацию в `main.ts`:
```typescript
if (origin && origin.includes('localhost:3003')) {
  return callback(null, true);
}
```

## Security Considerations

### 1. Tenant Isolation
- Каждый tenant изолирован через subdomain
- Backend проверяет tenant slug в каждом запросе
- JWT токены содержат tenant context

### 2. CORS Protection
- Только разрешенные origins могут делать запросы
- Wildcard CORS только для development

### 3. Header Validation
- Backend валидирует `X-Tenant-Slug` header
- Проверка существования tenant в базе данных
- Защита от tenant enumeration

## Best Practices

1. **Always use subdomain** - не передавайте tenant slug вручную
2. **Use composable** - используйте `useTenant()` для получения slug
3. **Handle errors** - обрабатывайте случаи отсутствия tenant
4. **Test locally** - тестируйте с разными tenant subdomains
5. **Monitor logs** - следите за ошибками tenant resolution

## Examples

### Login Flow
```typescript
// 1. User opens: http://demo-restaurant.localhost:3003/login
// 2. useTenant() extracts: 'demo-restaurant'
// 3. User submits login form
// 4. API service adds header: X-Tenant-Slug: demo-restaurant
// 5. Backend validates tenant and authenticates user
// 6. User redirected to dashboard with tenant context
```

### API Request Flow
```typescript
// 1. User on: http://bella-italia.localhost:3003
// 2. Component calls: await api.get('/menu/items')
// 3. Interceptor adds: X-Tenant-Slug: bella-italia
// 4. Backend filters menu items by tenant
// 5. Response contains only bella-italia's items
```
