/**
 * Enhanced API Form Composable
 * 
 * Provides advanced form error handling with:
 * - Nested field validation (dot-notation support: items.0.price)
 * - DOM-aware validation (checks field visibility)
 * - Auto-scroll to first error
 * - Auto-focus on error field
 * - Generic fallback for unmapped errors
 * - Dirty check (clear errors on field change)
 * - SSR-safe (no DOM operations on server)
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { ref, computed, readonly, nextTick } from 'vue';
import type { Ref, ComputedRef } from 'vue';
import type { ApiError, ApiErrorDetail } from '~/types/enhanced-api';

export interface EnhancedFormState {
  fieldErrors: Readonly<Ref<Record<string, string>>>;
  globalErrors: Readonly<Ref<string[]>>;
  isSubmitting: Readonly<Ref<boolean>>;
  hasErrors: ComputedRef<boolean>;
}

export interface EnhancedFormActions {
  handleValidationError: (error: ApiError) => void;
  clearFieldError: (fieldPath: string) => void;
  getFieldError: (fieldPath: string) => string | undefined;
  clearAllErrors: () => void;
  setSubmitting: (value: boolean) => void;
  scrollToFirstError: () => void;
}

export type UseEnhancedApiForm = EnhancedFormState & EnhancedFormActions;

/**
 * Enhanced API Form Composable
 * 
 * @example
 * ```typescript
 * const form = useEnhancedApiForm();
 * 
 * // Handle form submission
 * async function handleSubmit() {
 *   form.setSubmitting(true);
 *   form.clearAllErrors();
 *   
 *   try {
 *     await $api.post('/menu/items', formData);
 *   } catch (error) {
 *     if (error.code === 'VALIDATION_ERROR') {
 *       form.handleValidationError(error);
 *     }
 *   } finally {
 *     form.setSubmitting(false);
 *   }
 * }
 * 
 * // Clear error on field change
 * function onFieldChange(fieldPath: string) {
 *   form.clearFieldError(fieldPath);
 * }
 * ```
 */
export function useEnhancedApiForm(): UseEnhancedApiForm {
  const fieldErrors = ref<Record<string, string>>({});
  const globalErrors = ref<string[]>([]);
  const isSubmitting = ref(false);
  
  /**
   * Check if field is visible in DOM (client-side only)
   * Requirement 2.3: Generic Fallback for invisible fields
   * 
   * @param fieldPath - Field path in dot-notation (e.g., "items.0.price")
   * @returns true if field is visible, false otherwise
   */
  const isFieldVisible = (fieldPath: string): boolean => {
    // SSR safety: always return false on server
    if (!import.meta.client) return false;
    
    // Try multiple selector strategies to find the field
    const selectors = [
      `[name="${fieldPath}"]`,           // Standard name attribute
      `[data-field="${fieldPath}"]`,     // Custom data attribute
      `#${fieldPath.replace(/\./g, '-')}`, // ID with dots replaced by dashes
    ];
    
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector);
        
        if (!element) continue;
        
        // Check if element is visible
        const rect = element.getBoundingClientRect();
        const hasSize = rect.width > 0 && rect.height > 0;
        
        if (!hasSize) continue;
        
        // Additional check: element is not hidden via CSS
        const style = window.getComputedStyle(element);
        const isDisplayed = style.display !== 'none' && style.visibility !== 'hidden';
        
        if (hasSize && isDisplayed) {
          return true;
        }
      } catch (e) {
        // Invalid selector, continue to next
        continue;
      }
    }
    
    return false;
  };
  
  /**
   * Scroll to first error field and focus it
   * Requirements 2.2, 2.5: Auto-Scroll and Field Focus
   */
  const scrollToFirstError = (): void => {
    // SSR safety: no DOM operations on server
    if (!import.meta.client) return;
    
    const firstErrorField = Object.keys(fieldErrors.value)[0];
    if (!firstErrorField) return;
    
    // Try multiple selector strategies
    const selectors = [
      `[name="${firstErrorField}"]`,
      `[data-field="${firstErrorField}"]`,
      `#${firstErrorField.replace(/\./g, '-')}`,
    ];
    
    for (const selector of selectors) {
      try {
        const element = document.querySelector(selector) as HTMLElement;
        
        if (element) {
          // Scroll to element with smooth behavior
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Focus the element after a short delay to ensure scroll completes
          setTimeout(() => {
            if (element.focus) {
              element.focus();
            }
            
            // For input elements, also select the text
            if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
              element.select();
            }
          }, 300);
          
          return;
        }
      } catch (e) {
        // Invalid selector, continue to next
        continue;
      }
    }
  };
  
  /**
   * Handle validation error from API
   * Requirement 2.1: Nested Mapping with dot-notation support
   * Requirement 2.3: Generic Fallback for unmapped errors
   * 
   * @param error - API error with validation details
   */
  const handleValidationError = (error: ApiError): void => {
    if (error.code !== 'VALIDATION_ERROR' || !error.details) {
      return;
    }
    
    // Clear previous errors
    fieldErrors.value = {};
    globalErrors.value = [];
    
    // Handle array of error details
    if (Array.isArray(error.details)) {
      error.details.forEach((detail: ApiErrorDetail) => {
        const fieldPath = detail.field;
        
        // Check if field is visible in DOM
        if (isFieldVisible(fieldPath)) {
          // Map error to specific field
          fieldErrors.value[fieldPath] = detail.message;
        } else {
          // Fallback: add to global errors if field is not visible
          const errorMessage = `${detail.field}: ${detail.message}`;
          globalErrors.value.push(errorMessage);
        }
      });
    } 
    // Handle object-based error details (alternative format)
    else if (typeof error.details === 'object') {
      Object.entries(error.details).forEach(([field, message]) => {
        const errorMessage = typeof message === 'string' ? message : String(message);
        
        if (isFieldVisible(field)) {
          fieldErrors.value[field] = errorMessage;
        } else {
          globalErrors.value.push(`${field}: ${errorMessage}`);
        }
      });
    }
    
    // Auto-scroll to first error after DOM updates
    nextTick(() => {
      scrollToFirstError();
    });
  };
  
  /**
   * Clear error for specific field
   * Requirement 2.4: Dirty Check - clear errors on field change
   * 
   * @param fieldPath - Field path in dot-notation
   */
  const clearFieldError = (fieldPath: string): void => {
    if (fieldErrors.value[fieldPath]) {
      const newErrors = { ...fieldErrors.value };
      delete newErrors[fieldPath];
      fieldErrors.value = newErrors;
    }
  };
  
  /**
   * Get error message for specific field
   * 
   * @param fieldPath - Field path in dot-notation
   * @returns Error message or undefined
   */
  const getFieldError = (fieldPath: string): string | undefined => {
    return fieldErrors.value[fieldPath];
  };
  
  /**
   * Clear all errors (field and global)
   */
  const clearAllErrors = (): void => {
    fieldErrors.value = {};
    globalErrors.value = [];
  };
  
  /**
   * Set form submitting state
   * 
   * @param value - Submitting state
   */
  const setSubmitting = (value: boolean): void => {
    isSubmitting.value = value;
  };
  
  /**
   * Check if form has any errors
   */
  const hasErrors = computed(() => {
    return Object.keys(fieldErrors.value).length > 0 || globalErrors.value.length > 0;
  });
  
  return {
    // State (readonly for external access)
    fieldErrors: readonly(fieldErrors) as Readonly<Ref<Record<string, string>>>,
    globalErrors: readonly(globalErrors) as Readonly<Ref<string[]>>,
    isSubmitting: readonly(isSubmitting),
    hasErrors,
    
    // Actions
    handleValidationError,
    clearFieldError,
    getFieldError,
    clearAllErrors,
    setSubmitting,
    scrollToFirstError,
  };
}
