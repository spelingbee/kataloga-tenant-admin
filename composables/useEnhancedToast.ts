/**
 * Enhanced Toast Composable
 * 
 * Provides easy access to the enhanced toast system with RequestId support
 * Requirement 9.1: RequestId display in toast notifications
 */

import { enhancedToast, type ToastOptions } from '~/services/enhanced-toast.service';
import type { ApiError, ApiMeta } from '~/types/enhanced-api';

export function useEnhancedToast() {
  /**
   * Show success message
   */
  const success = (message: string, options?: ToastOptions): string => {
    return enhancedToast.success(message, options);
  };

  /**
   * Show error message with optional RequestId
   * Requirement 9.1: RequestId correlation in error notifications
   */
  const error = (
    message: string, 
    requestId?: string, 
    options?: ToastOptions
  ): string => {
    return enhancedToast.error(message, requestId, options);
  };

  /**
   * Show API error with full context and RequestId
   * Requirement 9.1: RequestId display for API errors
   */
  const apiError = (
    error: ApiError,
    meta: ApiMeta,
    options?: ToastOptions
  ): string => {
    return enhancedToast.apiError(error, meta, options);
  };

  /**
   * Show warning message
   */
  const warning = (
    message: string, 
    requestId?: string, 
    options?: ToastOptions
  ): string => {
    return enhancedToast.warning(message, requestId, options);
  };

  /**
   * Show info message
   */
  const info = (message: string, options?: ToastOptions): string => {
    return enhancedToast.info(message, options);
  };

  /**
   * Dismiss toast by ID
   */
  const dismiss = (id: string): void => {
    enhancedToast.dismiss(id);
  };

  /**
   * Dismiss all toasts
   */
  const dismissAll = (): void => {
    enhancedToast.dismissAll();
  };

  /**
   * Get all active toasts
   */
  const getActiveToasts = () => {
    return enhancedToast.getActiveToasts();
  };

  /**
   * Show error with automatic RequestId extraction from Error object
   */
  const errorFromException = (
    error: Error | ApiError,
    fallbackMessage?: string,
    options?: ToastOptions
  ): string => {
    const apiError = error as ApiError;
    
    if (apiError.requestId) {
      return enhancedToast.error(
        error.message || fallbackMessage || 'Произошла ошибка',
        apiError.requestId,
        options
      );
    }
    
    return enhancedToast.error(
      error.message || fallbackMessage || 'Произошла ошибка',
      undefined,
      options
    );
  };

  /**
   * Show loading toast that can be updated
   */
  const loading = (message: string, options?: ToastOptions): {
    id: string;
    updateToSuccess: (successMessage: string) => void;
    updateToError: (errorMessage: string, requestId?: string) => void;
    dismiss: () => void;
  } => {
    const id = enhancedToast.info(message, {
      duration: 0, // Persistent
      ...options
    });

    return {
      id,
      updateToSuccess: (successMessage: string) => {
        enhancedToast.dismiss(id);
        enhancedToast.success(successMessage);
      },
      updateToError: (errorMessage: string, requestId?: string) => {
        enhancedToast.dismiss(id);
        enhancedToast.error(errorMessage, requestId);
      },
      dismiss: () => {
        enhancedToast.dismiss(id);
      }
    };
  };

  return {
    // Core toast methods
    success,
    error,
    apiError,
    warning,
    info,
    
    // Management methods
    dismiss,
    dismissAll,
    getActiveToasts,
    
    // Utility methods
    errorFromException,
    loading,
    
    // Direct access to toast service
    toast: enhancedToast
  };
}