/**
 * Enhanced Toast Service
 * 
 * Integrates with the enhanced logger to show RequestId in error notifications
 * Requirement 9.1: RequestId display in toast notifications
 */

import type { ApiError, ApiMeta } from '~/types/enhanced-api';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  showRequestId?: boolean;
  allowCopy?: boolean;
  persistent?: boolean;
}

export interface EnhancedToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  requestId?: string;
  timestamp: Date;
  options: ToastOptions;
}

export class EnhancedToastService {
  private static instance: EnhancedToastService;
  private toastMessages: EnhancedToastMessage[] = [];
  private toastContainer: HTMLElement | null = null;

  private constructor() {
    if (import.meta.client) {
      this.initializeToastContainer();
    }
  }

  public static getInstance(): EnhancedToastService {
    if (!EnhancedToastService.instance) {
      EnhancedToastService.instance = new EnhancedToastService();
    }
    return EnhancedToastService.instance;
  }

  /**
   * Show success message
   */
  public success(message: string, options: ToastOptions = {}): string {
    return this.showToast('success', 'Успех', message, undefined, options);
  }

  /**
   * Show error message with optional RequestId
   * Requirement 9.1: RequestId correlation in error notifications
   */
  public error(
    message: string, 
    requestId?: string, 
    options: ToastOptions = {}
  ): string {
    const enhancedMessage = requestId 
      ? `${message} (ID: ${requestId})`
      : message;
    
    return this.showToast('error', 'Ошибка', enhancedMessage, requestId, {
      duration: 0, // Persistent by default for errors
      showRequestId: !!requestId,
      allowCopy: !!requestId,
      ...options
    });
  }

  /**
   * Show API error with full context
   * Requirement 9.1: RequestId display for API errors
   */
  public apiError(
    error: ApiError,
    meta: ApiMeta,
    options: ToastOptions = {}
  ): string {
    const message = `${error.message} (ID: ${meta.requestId})`;
    
    return this.showToast('error', 'Ошибка API', message, meta.requestId, {
      duration: 0, // Persistent for API errors
      showRequestId: true,
      allowCopy: true,
      ...options
    });
  }

  /**
   * Show warning message
   */
  public warning(message: string, requestId?: string, options: ToastOptions = {}): string {
    const enhancedMessage = requestId 
      ? `${message} (ID: ${requestId})`
      : message;
    
    return this.showToast('warning', 'Предупреждение', enhancedMessage, requestId, options);
  }

  /**
   * Show info message
   */
  public info(message: string, options: ToastOptions = {}): string {
    return this.showToast('info', 'Информация', message, undefined, options);
  }

  /**
   * Dismiss toast by ID
   */
  public dismiss(id: string): void {
    const index = this.toastMessages.findIndex(toast => toast.id === id);
    if (index !== -1) {
      this.toastMessages.splice(index, 1);
      this.updateToastContainer();
    }
  }

  /**
   * Dismiss all toasts
   */
  public dismissAll(): void {
    this.toastMessages = [];
    this.updateToastContainer();
  }

  /**
   * Get all active toasts
   */
  public getActiveToasts(): EnhancedToastMessage[] {
    return [...this.toastMessages];
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private showToast(
    type: EnhancedToastMessage['type'],
    title: string,
    message: string,
    requestId?: string,
    options: ToastOptions = {}
  ): string {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const toast: EnhancedToastMessage = {
      id,
      type,
      title,
      message,
      requestId,
      timestamp: new Date(),
      options: {
        duration: 5000,
        position: 'top-right',
        showRequestId: false,
        allowCopy: false,
        persistent: false,
        ...options
      }
    };

    this.toastMessages.push(toast);
    this.updateToastContainer();

    // Auto-dismiss if duration is set
    if (toast.options.duration && toast.options.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, toast.options.duration);
    }

    return id;
  }

  private initializeToastContainer(): void {
    if (!import.meta.client) return;

    // Create toast container if it doesn't exist
    let container = document.getElementById('enhanced-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'enhanced-toast-container';
      container.className = 'enhanced-toast-container';
      document.body.appendChild(container);
    }
    
    this.toastContainer = container;
    this.addToastStyles();
  }

  private updateToastContainer(): void {
    if (!this.toastContainer || !import.meta.client) return;

    // Clear container
    this.toastContainer.innerHTML = '';

    // Add toasts
    this.toastMessages.forEach(toast => {
      const toastElement = this.createToastElement(toast);
      this.toastContainer!.appendChild(toastElement);
    });
  }

  private createToastElement(toast: EnhancedToastMessage): HTMLElement {
    const element = document.createElement('div');
    element.className = `enhanced-toast enhanced-toast--${toast.type}`;
    element.setAttribute('data-toast-id', toast.id);

    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const copyButton = toast.options.allowCopy && toast.requestId
      ? `<button class="enhanced-toast__copy" onclick="navigator.clipboard.writeText('${toast.requestId}'); this.textContent='Скопировано!';" title="Скопировать ID запроса">📋</button>`
      : '';

    const dismissButton = `<button class="enhanced-toast__dismiss" onclick="document.getElementById('enhanced-toast-container').querySelector('[data-toast-id=&quot;${toast.id}&quot;]').remove();" title="Закрыть">×</button>`;

    element.innerHTML = `
      <div class="enhanced-toast__content">
        <div class="enhanced-toast__header">
          <span class="enhanced-toast__icon">${iconMap[toast.type]}</span>
          <span class="enhanced-toast__title">${toast.title}</span>
          <div class="enhanced-toast__actions">
            ${copyButton}
            ${dismissButton}
          </div>
        </div>
        <div class="enhanced-toast__message">${toast.message}</div>
        ${toast.requestId && toast.options.showRequestId 
          ? `<div class="enhanced-toast__request-id">ID: ${toast.requestId}</div>` 
          : ''
        }
      </div>
    `;

    // Add click handler for dismiss
    element.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('enhanced-toast__dismiss')) {
        this.dismiss(toast.id);
      }
    });

    return element;
  }

  private addToastStyles(): void {
    if (!import.meta.client) return;

    const styleId = 'enhanced-toast-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .enhanced-toast-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        pointer-events: none;
      }

      .enhanced-toast {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 12px;
        min-width: 320px;
        max-width: 480px;
        pointer-events: auto;
        transform: translateX(100%);
        animation: slideIn 0.3s ease-out forwards;
        border-left: 4px solid;
      }

      .enhanced-toast--success {
        border-left-color: #10b981;
      }

      .enhanced-toast--error {
        border-left-color: #ef4444;
      }

      .enhanced-toast--warning {
        border-left-color: #f59e0b;
      }

      .enhanced-toast--info {
        border-left-color: #3b82f6;
      }

      .enhanced-toast__content {
        padding: 16px;
      }

      .enhanced-toast__header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .enhanced-toast__icon {
        font-size: 16px;
      }

      .enhanced-toast__title {
        font-weight: 600;
        color: #1f2937;
        flex: 1;
      }

      .enhanced-toast__actions {
        display: flex;
        gap: 4px;
      }

      .enhanced-toast__copy,
      .enhanced-toast__dismiss {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        font-size: 14px;
        color: #6b7280;
        transition: background-color 0.2s;
      }

      .enhanced-toast__copy:hover,
      .enhanced-toast__dismiss:hover {
        background-color: #f3f4f6;
      }

      .enhanced-toast__message {
        color: #4b5563;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .enhanced-toast__request-id {
        font-family: monospace;
        font-size: 12px;
        color: #6b7280;
        background-color: #f9fafb;
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .enhanced-toast--removing {
        animation: slideOut 0.3s ease-in forwards;
      }
    `;

    document.head.appendChild(style);
  }
}

// Export singleton instance
export const enhancedToast = EnhancedToastService.getInstance();