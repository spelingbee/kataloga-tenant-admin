# Tenant Login - Quick Start

## Что изменилось?

Теперь tenant определяется через **subdomain в URL**, а не через параметр в теле запроса.

## Быстрый старт

### 1. Запустите приложение

```bash
cd apps/tenant-admin
pnpm dev
```

### 2. Откройте в браузере с subdomain

**❌ Старый способ:**
```
http://localhost:3003/login
```

**✅ Новый способ:**
```
http://demo-restaurant.localhost:3003/login
http://test-cafe.localhost:3003/login
http://bella-italia.localhost:3003/login
```

### 3. Войдите в систему

Используйте credentials из seed:
- Email: `admin@demo.com`
- Password: `password123`

## Как это работает?

### Frontend
1. Пользователь открывает `http://demo-restaurant.localhost:3003`
2. `useTenant()` извлекает `demo-restaurant` из subdomain
3. При логине автоматически добавляется header `X-Tenant-Slug: demo-restaurant`
4. Backend получает tenant из header и аутентифицирует пользователя

### Backend
- Принимает tenant slug из header `X-Tenant-Slug` (приоритет)
- Или из body `tenantSlug` (fallback для совместимости)

## Примеры использования

### В компонентах

```typescript
// Получить текущий tenant slug
const { getTenantSlug, requireTenantSlug } = useTenant()

const slug = getTenantSlug() // 'demo-restaurant' или null
const slug = requireTenantSlug() // 'demo-restaurant' или throw error
```

### В stores

```typescript
// auth.ts - автоматически использует subdomain
async login(email: string, password: string) {
  const { requireTenantSlug } = useTenant()
  const tenantSlug = requireTenantSlug() // Извлекается из URL
  
  // API автоматически добавит X-Tenant-Slug header
  await api.post('/auth/login', { email, password })
}
```

### API запросы

```typescript
// Все запросы автоматически включают tenant header
await api.get('/menu/items')
// Header: X-Tenant-Slug: demo-restaurant

await api.post('/categories', { name: 'Desserts' })
// Header: X-Tenant-Slug: demo-restaurant
```

## Тестирование

### Разные tenants

```bash
# Tenant 1
http://demo-restaurant.localhost:3003

# Tenant 2
http://test-cafe.localhost:3003

# Tenant 3
http://bella-italia.localhost:3003
```

### Без tenant (ошибка)

```bash
http://localhost:3003
# Redirect to: /error/no-tenant
```

## Troubleshooting

### "Tenant Required" ошибка

**Проблема:** Открыли `http://localhost:3003` без subdomain

**Решение:** Используйте URL с tenant subdomain:
```
http://demo-restaurant.localhost:3003
```

### DNS не работает

**Проблема:** Браузер не разрешает `*.localhost`

**Решение:** 
1. Используйте Chrome или Firefox (поддерживают `*.localhost`)
2. Или добавьте в hosts file:
```
127.0.0.1 demo-restaurant.localhost
```

### CORS ошибка

**Проблема:** Backend блокирует запросы

**Решение:** Убедитесь что backend запущен и CORS настроен правильно в `apps/backend/src/main.ts`

## Миграция кода

### Было (старый способ)

```typescript
// ❌ Передавали tenant вручную
await login(email, password, 'demo-restaurant')

// ❌ Tenant в конфиге
const config = useRuntimeConfig()
const slug = config.public.tenantSlug
```

### Стало (новый способ)

```typescript
// ✅ Tenant из subdomain автоматически
await login(email, password)

// ✅ Tenant из URL
const { getTenantSlug } = useTenant()
const slug = getTenantSlug()
```

## Production

### Environment Variables

```env
# .env.production
NUXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NUXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

### DNS Setup

Настройте wildcard DNS:
```
*.yourdomain.com → Your Server IP
```

### URLs

```
https://demo-restaurant.yourdomain.com
https://bella-italia.yourdomain.com
https://coffee-corner.yourdomain.com
```

## Дополнительная информация

Полная документация: [TENANT_URL_SETUP.md](./TENANT_URL_SETUP.md)
