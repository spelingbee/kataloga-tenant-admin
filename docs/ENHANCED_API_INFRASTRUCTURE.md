# Enhanced API Infrastructure

Данный документ описывает новую инфраструктуру для работы с API в Tenant Admin приложении.

## Обзор

Новая инфраструктура обеспечивает:
- Стандартизированный формат ответов API (`ApiResponse<T>`)
- Автоматическое разворачивание данных (unwrapping)
- Поддержку файловых операций (blob responses)
- Обработку массовых операций (bulk operations)
- Очередь запросов для бесшовного обновления токенов
- Обратную совместимость с legacy форматами
- Расширенную обработку ошибок валидации

## Структура файлов

```
apps/tenant-admin/
├── types/
│   ├── enhanced-api.ts      # Основные API типы
│   ├── business.ts          # Бизнес-сущности
│   └── index.ts             # Экспорт всех типов
├── utils/
│   ├── type-guards.ts       # Type guards для проверки типов
│   ├── response-normalizer.ts # Нормализация legacy ответов
│   ├── api-helpers.ts       # Вспомогательные утилиты
│   └── test-factories.ts    # Фабрики для тестов
├── constants/
│   └── error-codes.ts       # Коды ошибок и сообщения
└── tests/
    └── types/
        └── enhanced-api.test.ts # Тесты типов
```

## Основные типы

### ApiResponse<T>

Стандартизированный формат ответа от бекенда:

```typescript
interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
}
```

### EnhancedRequestOptions

Расширенные опции для HTTP запросов:

```typescript
interface EnhancedRequestOptions {
  unwrap?: boolean;              // Автоматически извлекать data
  skipErrorHandling?: boolean;   // Не показывать Toast ошибки
  isBlob?: boolean;              // Обработка файлов
  successMessage?: string;       // Автоматический Toast успеха
  showProgress?: boolean;        // Индикатор прогресса
}
```

### PaginatedResult<T>

Чистая структура для пагинированных данных:

```typescript
interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}
```

## Использование Type Guards

```typescript
import { isApiResponse, isLegacyResponse, extractResponseData } from '~/utils/type-guards';

// Проверка типа ответа
if (isApiResponse(response)) {
  console.log('Стандартный формат:', response.data);
}

if (isLegacyResponse(response)) {
  console.log('Legacy формат, требует нормализации');
}

// Извлечение данных из любого формата
const data = extractResponseData(response);
```

## Использование Test Factories

```typescript
import { 
  createMockApiResponse, 
  createMockUser, 
  createMockPaginatedResult 
} from '~/utils/test-factories';

// Создание mock данных для тестов
const user = createMockUser({ email: 'test@example.com' });
const response = createMockApiResponse(user);
const paginatedUsers = createMockPaginatedResult([user]);
```

## Обработка ошибок

```typescript
import { ERROR_MESSAGES, getErrorMessage } from '~/constants/error-codes';

// Получение пользовательского сообщения об ошибке
const message = getErrorMessage('VALIDATION_ERROR');
console.log(message); // "Ошибка валидации данных"
```

## Вспомогательные утилиты

```typescript
import { 
  createPaginatedResult, 
  extractValidationErrors,
  getBulkOperationSummary 
} from '~/utils/api-helpers';

// Создание пагинированного результата
const result = createPaginatedResult(items, paginationMeta);

// Извлечение ошибок валидации
const fieldErrors = extractValidationErrors(apiError);

// Получение сводки массовой операции
const summary = getBulkOperationSummary(bulkResult);
```

## Тестирование

Для запуска тестов типов:

```bash
pnpm vitest --run tests/types/enhanced-api.test.ts
```

Для запуска всех тестов:

```bash
pnpm test
```

## Property-Based Testing

Установлена библиотека `fast-check` для property-based тестирования:

```typescript
import fc from 'fast-check';

// Пример property теста
it('should preserve data through normalization', () => {
  fc.assert(fc.property(
    fc.anything(),
    (data) => {
      const response = createMockApiResponse(data);
      const extracted = extractResponseData(response);
      expect(extracted).toEqual(data);
    }
  ));
});
```

## Следующие шаги

1. **Enhanced API Service** - Создание HTTP клиента с поддержкой очереди запросов
2. **Form Composables** - Обработка ошибок валидации с dot-notation
3. **Enhanced Stores** - Pinia stores с чистыми данными
4. **Auth Store** - Silent refresh и управление токенами
5. **File Operations** - Поддержка скачивания отчетов

## Зависимости

- `fast-check` - Property-based тестирование
- `axios` - HTTP клиент
- `pinia` - Управление состоянием
- `vitest` - Тестирование

## Совместимость

Инфраструктура обеспечивает обратную совместимость с существующими legacy форматами API через систему нормализации ответов.