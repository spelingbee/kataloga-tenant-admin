# Tenant URL Migration Summary

## Обзор изменений

Реализована система определения tenant через **subdomain в URL** вместо передачи параметра в теле запроса.

## Что было изменено

### Frontend (Nuxt/Vue)

#### 1. Новый Composable: `useTenant()`
**Файл:** `apps/tenant-admin/composables/useTenant.ts`

Функции:
- `getTenantSlug()` - извлекает tenant slug из subdomain
- `requireTenantSlug()` - требует наличие tenant или выбрасывает ошибку
- `hasTenant()` - проверяет наличие tenant в URL

Примеры:
```typescript
const { getTenantSlug } = useTenant()
const slug = getTenantSlug() // 'demo-restaurant'
```

#### 2. Обновлен Auth Store
**Файл:** `apps/tenant-admin/stores/auth.ts`

Изменения:
- Удален параметр `tenantSlug` из метода `login()`
- Tenant slug теперь извлекается автоматически через `useTenant()`
- Заменен `process.client` на `import.meta.client`

До:
```typescript
async login(email: string, password: string, tenantSlug?: string)
```

После:
```typescript
async login(email: string, password: string)
```

#### 3. Обновлен API Service
**Файл:** `apps/tenant-admin/services/api.service.ts`

Изменения:
- Добавлен автоматический header `X-Tenant-Slug` ко всем запросам
- Tenant извлекается из subdomain через `useTenant()`
- Заменен `process.client` на `import.meta.client`

```typescript
// Request interceptor добавляет header
config.headers['X-Tenant-Slug'] = tenantSlug
```

#### 4. Global Middleware
**Файл:** `apps/tenant-admin/middleware/tenant.global.ts`

Функционал:
- Проверяет наличие tenant на каждом роуте
- Редиректит на `/error/no-tenant` если tenant отсутствует
- Пропускает проверку для error pages

#### 5. Error Page
**Файл:** `apps/tenant-admin/pages/error/no-tenant.vue`

Показывает:
- Информацию о необходимости subdomain
- Примеры правильных URLs
- Инструкции для пользователя

#### 6. Конфигурация
**Файл:** `apps/tenant-admin/nuxt.config.ts`

Изменения:
- Удалена переменная `NUXT_PUBLIC_TENANT_SLUG`
- Добавлена переменная `NUXT_PUBLIC_BASE_DOMAIN`

До:
```typescript
tenantSlug: process.env.NUXT_PUBLIC_TENANT_SLUG || 'demo-restaurant'
```

После:
```typescript
baseDomain: process.env.NUXT_PUBLIC_BASE_DOMAIN || 'localhost:3003'
```

### Backend (NestJS)

#### 1. Auth Controller
**Файл:** `apps/backend/src/auth/auth.controller.ts`

Изменения:
- Добавлена поддержка header `X-Tenant-Slug`
- Приоритет: header > body (для обратной совместимости)

```typescript
const tenantSlug = req.get('X-Tenant-Slug') || loginDto.tenantSlug;
```

#### 2. CORS Configuration
**Файл:** `apps/backend/src/main.ts`

Изменения:
- Добавлен header `X-Tenant-Slug` в `allowedHeaders`
- Разрешены все subdomains для `localhost:3003`

```typescript
allowedHeaders: [..., 'X-Tenant-Slug']

// Allow all subdomains for tenant-admin
if (origin && origin.includes('localhost:3003')) {
  return callback(null, true);
}
```

### Environment Variables

#### Frontend (.env)
До:
```env
NUXT_PUBLIC_TENANT_SLUG=demo-restaurant
```

После:
```env
NUXT_PUBLIC_BASE_DOMAIN=localhost:3003
```

## Архитектура

### Flow диаграмма

```
User opens URL
    ↓
http://demo-restaurant.localhost:3003
    ↓
useTenant() extracts subdomain
    ↓
"demo-restaurant"
    ↓
API Service adds header
    ↓
X-Tenant-Slug: demo-restaurant
    ↓
Backend receives request
    ↓
Validates tenant & authenticates
    ↓
Returns user data with tenant context
```

### Компоненты системы

1. **URL Parser** (`useTenant`)
   - Извлекает subdomain из `window.location.hostname`
   - Обрабатывает различные форматы (localhost, production)

2. **Request Interceptor** (`api.service.ts`)
   - Автоматически добавляет `X-Tenant-Slug` header
   - Работает для всех HTTP запросов

3. **Route Guard** (`tenant.global.ts`)
   - Проверяет наличие tenant на каждом роуте
   - Защищает от доступа без tenant

4. **Backend Resolver** (`auth.controller.ts`)
   - Принимает tenant из header или body
   - Валидирует существование tenant

## Преимущества новой системы

### 1. Безопасность
- Tenant изолирован на уровне URL
- Невозможно случайно отправить запрос к другому tenant
- Явная идентификация tenant в браузере

### 2. UX
- Понятные URLs для пользователей
- Каждый tenant имеет уникальный адрес
- Легко делиться ссылками

### 3. Масштабируемость
- Поддержка wildcard DNS
- Легко добавлять новые tenants
- Готово для production deployment

### 4. Разработка
- Легко тестировать разные tenants локально
- Не нужно менять конфигурацию для переключения tenant
- Автоматическое определение tenant

## Обратная совместимость

Backend поддерживает оба метода:
- ✅ **Header** `X-Tenant-Slug` (новый, приоритетный)
- ✅ **Body** `tenantSlug` (старый, fallback)

Это позволяет:
- Постепенную миграцию клиентов
- Работу старых API клиентов
- Тестирование без breaking changes

## Тестирование

### Unit Tests
```typescript
// useTenant.spec.ts
describe('useTenant', () => {
  it('should extract tenant from subdomain', () => {
    // Mock window.location.hostname = 'demo-restaurant.localhost'
    const { getTenantSlug } = useTenant()
    expect(getTenantSlug()).toBe('demo-restaurant')
  })
})
```

### Integration Tests
```bash
# Test different tenants
curl http://demo-restaurant.localhost:3003
curl http://test-cafe.localhost:3003

# Test API with header
curl -H "X-Tenant-Slug: demo-restaurant" \
  http://localhost:3001/api/auth/login
```

### E2E Tests
```typescript
// login.e2e.spec.ts
test('should login with tenant subdomain', async ({ page }) => {
  await page.goto('http://demo-restaurant.localhost:3003/login')
  await page.fill('[name="email"]', 'admin@demo.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL(/.*dashboard/)
})
```

## Документация

Созданные файлы:
1. **TENANT_URL_SETUP.md** - Полная документация по настройке
2. **TENANT_LOGIN_QUICK_START.md** - Быстрый старт для разработчиков
3. **TENANT_URL_MIGRATION_SUMMARY.md** - Этот файл

## Следующие шаги

### Для разработчиков
1. Прочитать [TENANT_LOGIN_QUICK_START.md](./TENANT_LOGIN_QUICK_START.md)
2. Обновить локальное окружение
3. Тестировать с subdomain URLs

### Для DevOps
1. Прочитать [TENANT_URL_SETUP.md](./TENANT_URL_SETUP.md)
2. Настроить wildcard DNS
3. Обновить Nginx/SSL конфигурацию

### Для QA
1. Тестировать разные tenant subdomains
2. Проверить error handling (no tenant)
3. Валидировать CORS и security

## Rollback Plan

Если нужно откатить изменения:

1. **Frontend:**
```bash
git revert <commit-hash>
```

2. **Backend:**
Backend остается совместимым, откат не требуется

3. **Environment:**
```env
# Вернуть старую переменную
NUXT_PUBLIC_TENANT_SLUG=demo-restaurant
```

## Контакты

Вопросы по миграции:
- Документация: См. файлы в `apps/tenant-admin/`
- Issues: GitHub Issues
- Support: team@example.com
