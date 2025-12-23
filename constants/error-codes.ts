/**
 * Error Codes for Tenant Admin
 * 
 * Standardized error codes matching backend API
 * Used for consistent error handling and user messages
 */

// ============================================================================
// Authentication & Authorization Errors
// ============================================================================

export const AUTH_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  REFRESH_TOKEN_EXPIRED: 'REFRESH_TOKEN_EXPIRED',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
} as const;

export const PERMISSION_ERRORS = {
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  PLAN_LIMITATION: 'PLAN_LIMITATION',
  UPGRADE_REQUIRED: 'UPGRADE_REQUIRED',
} as const;

// ============================================================================
// Validation Errors
// ============================================================================

export const VALIDATION_ERRORS = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PHONE: 'INVALID_PHONE',
  INVALID_URL: 'INVALID_URL',
  INVALID_DATE: 'INVALID_DATE',
  INVALID_NUMBER: 'INVALID_NUMBER',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE',
} as const;

// ============================================================================
// Business Logic Errors
// ============================================================================

export const BUSINESS_ERRORS = {
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE: 'RESOURCE_IN_USE',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  INVALID_STATE: 'INVALID_STATE',
  CONCURRENT_MODIFICATION: 'CONCURRENT_MODIFICATION',
} as const;

// ============================================================================
// System Errors
// ============================================================================

export const SYSTEM_ERRORS = {
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
} as const;

// ============================================================================
// File & Upload Errors
// ============================================================================

export const FILE_ERRORS = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
} as const;

// ============================================================================
// Bulk Operation Errors
// ============================================================================

export const BULK_ERRORS = {
  BULK_OPERATION_FAILED: 'BULK_OPERATION_FAILED',
  PARTIAL_SUCCESS: 'PARTIAL_SUCCESS',
  TOO_MANY_ITEMS: 'TOO_MANY_ITEMS',
  INVALID_BULK_DATA: 'INVALID_BULK_DATA',
} as const;

// ============================================================================
// Tenant-Specific Errors
// ============================================================================

export const TENANT_ERRORS = {
  TENANT_NOT_FOUND: 'TENANT_NOT_FOUND',
  TENANT_SUSPENDED: 'TENANT_SUSPENDED',
  TENANT_LIMIT_EXCEEDED: 'TENANT_LIMIT_EXCEEDED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
} as const;

// ============================================================================
// Menu Management Errors
// ============================================================================

export const MENU_ERRORS = {
  MENU_NOT_FOUND: 'MENU_NOT_FOUND',
  MENU_ITEM_NOT_FOUND: 'MENU_ITEM_NOT_FOUND',
  CATEGORY_NOT_FOUND: 'CATEGORY_NOT_FOUND',
  MENU_ITEM_LIMIT_EXCEEDED: 'MENU_ITEM_LIMIT_EXCEEDED',
  CATEGORY_LIMIT_EXCEEDED: 'CATEGORY_LIMIT_EXCEEDED',
  INVALID_PRICE: 'INVALID_PRICE',
  DUPLICATE_MENU_NAME: 'DUPLICATE_MENU_NAME',
  DUPLICATE_ITEM_NAME: 'DUPLICATE_ITEM_NAME',
} as const;

// ============================================================================
// All Error Codes (Union Type)
// ============================================================================

export const ALL_ERROR_CODES = {
  ...AUTH_ERRORS,
  ...PERMISSION_ERRORS,
  ...VALIDATION_ERRORS,
  ...BUSINESS_ERRORS,
  ...SYSTEM_ERRORS,
  ...FILE_ERRORS,
  ...BULK_ERRORS,
  ...TENANT_ERRORS,
  ...MENU_ERRORS,
} as const;

export type ErrorCode = keyof typeof ALL_ERROR_CODES;

// ============================================================================
// Error Messages (User-Friendly)
// ============================================================================

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Вы не авторизованы для выполнения этого действия',
  TOKEN_EXPIRED: 'Сессия истекла, пожалуйста, войдите снова',
  INVALID_TOKEN: 'Недействительный токен авторизации',
  INVALID_CREDENTIALS: 'Неверный email или пароль',
  ACCOUNT_LOCKED: 'Аккаунт заблокирован',
  ACCOUNT_DISABLED: 'Аккаунт отключен',
  REFRESH_TOKEN_EXPIRED: 'Сессия истекла, требуется повторный вход',
  REFRESH_TOKEN_INVALID: 'Недействительный токен обновления',
  
  // Permissions
  FORBIDDEN: 'Недостаточно прав для выполнения действия',
  INSUFFICIENT_PERMISSIONS: 'У вас нет прав для этого действия',
  FEATURE_NOT_AVAILABLE: 'Функция недоступна в вашем тарифном плане',
  PLAN_LIMITATION: 'Достигнут лимит тарифного плана',
  UPGRADE_REQUIRED: 'Требуется обновление тарифного плана',
  
  // Validation
  VALIDATION_ERROR: 'Ошибка валидации данных',
  REQUIRED_FIELD: 'Обязательное поле',
  INVALID_FORMAT: 'Неверный формат данных',
  INVALID_EMAIL: 'Неверный формат email',
  INVALID_PHONE: 'Неверный формат телефона',
  INVALID_URL: 'Неверный формат URL',
  INVALID_DATE: 'Неверный формат даты',
  INVALID_NUMBER: 'Неверный формат числа',
  VALUE_TOO_LONG: 'Значение слишком длинное',
  VALUE_TOO_SHORT: 'Значение слишком короткое',
  VALUE_OUT_OF_RANGE: 'Значение вне допустимого диапазона',
  DUPLICATE_VALUE: 'Значение уже существует',
  
  // Business Logic
  RESOURCE_NOT_FOUND: 'Ресурс не найден',
  RESOURCE_ALREADY_EXISTS: 'Ресурс уже существует',
  RESOURCE_IN_USE: 'Ресурс используется и не может быть удален',
  OPERATION_NOT_ALLOWED: 'Операция не разрешена',
  INVALID_STATE: 'Недопустимое состояние',
  CONCURRENT_MODIFICATION: 'Ресурс был изменен другим пользователем',
  
  // System
  INTERNAL_SERVER_ERROR: 'Внутренняя ошибка сервера',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',
  TIMEOUT: 'Превышено время ожидания',
  NETWORK_ERROR: 'Ошибка сети',
  DATABASE_ERROR: 'Ошибка базы данных',
  EXTERNAL_SERVICE_ERROR: 'Ошибка внешнего сервиса',
  
  // Files
  FILE_TOO_LARGE: 'Файл слишком большой',
  INVALID_FILE_TYPE: 'Недопустимый тип файла',
  UPLOAD_FAILED: 'Ошибка загрузки файла',
  FILE_NOT_FOUND: 'Файл не найден',
  INVALID_FILE_FORMAT: 'Неверный формат файла',
  VIRUS_DETECTED: 'Обнаружен вирус в файле',
  
  // Bulk Operations
  BULK_OPERATION_FAILED: 'Массовая операция не выполнена',
  PARTIAL_SUCCESS: 'Операция выполнена частично',
  TOO_MANY_ITEMS: 'Слишком много элементов для обработки',
  INVALID_BULK_DATA: 'Неверные данные для массовой операции',
  
  // Tenant
  TENANT_NOT_FOUND: 'Арендатор не найден',
  TENANT_SUSPENDED: 'Аккаунт арендатора приостановлен',
  TENANT_LIMIT_EXCEEDED: 'Превышен лимит арендатора',
  SUBSCRIPTION_EXPIRED: 'Подписка истекла',
  SUBSCRIPTION_CANCELLED: 'Подписка отменена',
  
  // Menu
  MENU_NOT_FOUND: 'Меню не найдено',
  MENU_ITEM_NOT_FOUND: 'Элемент меню не найден',
  CATEGORY_NOT_FOUND: 'Категория не найдена',
  MENU_ITEM_LIMIT_EXCEEDED: 'Превышен лимит элементов меню',
  CATEGORY_LIMIT_EXCEEDED: 'Превышен лимит категорий',
  INVALID_PRICE: 'Неверная цена',
  DUPLICATE_MENU_NAME: 'Меню с таким названием уже существует',
  DUPLICATE_ITEM_NAME: 'Элемент с таким названием уже существует',
};

/**
 * Get user-friendly error message by code
 */
export function getErrorMessage(code: string): string {
  return ERROR_MESSAGES[code as ErrorCode] || 'Произошла неизвестная ошибка';
}

/**
 * Check if error code is authentication related
 */
export function isAuthErrorCode(code: string): boolean {
  return Object.values(AUTH_ERRORS).includes(code as any);
}

/**
 * Check if error code is permission related
 */
export function isPermissionErrorCode(code: string): boolean {
  return Object.values(PERMISSION_ERRORS).includes(code as any);
}

/**
 * Check if error code is validation related
 */
export function isValidationErrorCode(code: string): boolean {
  return Object.values(VALIDATION_ERRORS).includes(code as any);
}