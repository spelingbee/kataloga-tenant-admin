/**
 * File Operations Composable
 * 
 * Provides enhanced file download, upload, and report generation functionality
 * with progress tracking, error handling, and user feedback
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */

import type { 
  FileDownloadOptions, 
  ReportRequest, 
  ReportType, 
  ReportFormat 
} from '~/types/enhanced-api';

export interface FileOperationProgress {
  loaded: number;
  total: number;
  percentage: number;
  isComplete: boolean;
}

export interface FileOperationState {
  isDownloading: boolean;
  isUploading: boolean;
  isGeneratingReport: boolean;
  progress: FileOperationProgress | null;
  error: string | null;
}

export function useFileOperations() {
  const { $api } = useNuxtApp();
  const toast = useToast();

  // Reactive state for file operations
  const state = reactive<FileOperationState>({
    isDownloading: false,
    isUploading: false,
    isGeneratingReport: false,
    progress: null,
    error: null
  });

  /**
   * Reset operation state
   */
  const resetState = () => {
    state.isDownloading = false;
    state.isUploading = false;
    state.isGeneratingReport = false;
    state.progress = null;
    state.error = null;
  };

  /**
   * Update progress information
   */
  const updateProgress = (loaded: number, total: number) => {
    state.progress = {
      loaded,
      total,
      percentage: total > 0 ? Math.round((loaded / total) * 100) : 0,
      isComplete: loaded >= total
    };
  };

  /**
   * Enhanced file download with automatic blob detection and progress
   * Requirement 10.1: Automatic binary data detection
   * Requirement 10.2: Content-Disposition header handling
   * Requirement 10.3: Progress indication for large files
   * Requirement 10.5: Success download notifications
   */
  const downloadFile = async (
    endpoint: string,
    params?: Record<string, any>,
    options?: FileDownloadOptions
  ): Promise<void> => {
    resetState();
    state.isDownloading = true;

    try {
      // Show initial progress for large files
      if (options?.showProgress) {
        updateProgress(0, 100);
        toast.info('Подготовка файла к скачиванию...', { duration: 0, id: 'file-download' });
      }

      await $api.downloadFile(endpoint, params, {
        ...options,
        showProgress: options?.showProgress,
        onProgress: (progress: number) => {
          updateProgress(progress, 100);
        }
      });

      // Success notification is handled by the API service
      if (options?.showProgress) {
        toast.dismiss('file-download');
      }

    } catch (error: any) {
      state.error = error.message || 'Ошибка при скачивании файла';
      
      // Requirement 10.4: Enhanced error handling for reports
      if (error.code === 'FILE_GENERATION_ERROR') {
        toast.error(`Не удалось сгенерировать файл: ${error.message}`);
      } else if (error.code === 'FILE_TOO_LARGE') {
        toast.error('Файл слишком большой для скачивания. Попробуйте уменьшить период отчета.');
      } else {
        toast.error(`Ошибка скачивания: ${error.message}`);
      }

      if (options?.showProgress) {
        toast.dismiss('file-download');
      }

      throw error;
    } finally {
      state.isDownloading = false;
    }
  };

  /**
   * Enhanced report generation with progress tracking
   * Requirement 10.3: Progress indication for large reports
   * Requirement 10.4: Enhanced error handling for reports
   * Requirement 10.5: Success notifications
   */
  const generateReport = async (
    reportRequest: ReportRequest,
    options?: FileDownloadOptions
  ): Promise<void> => {
    resetState();
    state.isGeneratingReport = true;

    try {
      // Show progress for report generation
      updateProgress(0, 100);
      toast.info('Генерация отчета...', { duration: 0, id: 'report-generation' });

      // Simulate progress updates for report generation
      const progressInterval = setInterval(() => {
        if (state.progress && state.progress.percentage < 90) {
          updateProgress(state.progress.percentage + 10, 100);
        }
      }, 500);

      await $api.downloadReport(reportRequest, {
        ...options,
        showProgress: true,
        successMessage: options?.successMessage || `Отчет "${reportRequest.type}" готов к скачиванию`
      });

      clearInterval(progressInterval);
      updateProgress(100, 100);
      toast.dismiss('report-generation');

    } catch (error: any) {
      state.error = error.message || 'Ошибка при генерации отчета';
      
      // Enhanced error handling for different report errors
      if (error.code === 'REPORT_GENERATION_TIMEOUT') {
        toast.error('Генерация отчета заняла слишком много времени. Попробуйте уменьшить период.');
      } else if (error.code === 'REPORT_DATA_TOO_LARGE') {
        toast.error('Слишком много данных для отчета. Попробуйте применить фильтры.');
      } else if (error.code === 'FEATURE_NOT_AVAILABLE') {
        toast.error('Генерация отчетов недоступна в вашем тарифном плане.');
      } else {
        toast.error(`Ошибка генерации отчета: ${error.message}`);
      }

      toast.dismiss('report-generation');
      throw error;
    } finally {
      state.isGeneratingReport = false;
    }
  };

  /**
   * Upload file with progress tracking
   * Requirement 10.3: Progress indication for file uploads
   */
  const uploadFile = async <T>(
    endpoint: string,
    file: File,
    options?: {
      maxSize?: number;
      allowedTypes?: string[];
      successMessage?: string;
    }
  ): Promise<T> => {
    resetState();
    state.isUploading = true;

    try {
      // Validate file size
      if (options?.maxSize && file.size > options.maxSize) {
        throw new Error(`Файл слишком большой. Максимальный размер: ${formatFileSize(options.maxSize)}`);
      }

      // Validate file type
      if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`Неподдерживаемый тип файла. Разрешены: ${options.allowedTypes.join(', ')}`);
      }

      updateProgress(0, 100);
      toast.info(`Загрузка файла "${file.name}"...`, { duration: 0, id: 'file-upload' });

      const result = await $api.uploadFile<T>(endpoint, file, {
        successMessage: options?.successMessage || `Файл "${file.name}" успешно загружен`,
        onProgress: (progress: number) => {
          updateProgress(progress, 100);
        }
      });

      toast.dismiss('file-upload');
      return result;

    } catch (error: any) {
      state.error = error.message || 'Ошибка при загрузке файла';
      toast.error(`Ошибка загрузки: ${error.message}`);
      toast.dismiss('file-upload');
      throw error;
    } finally {
      state.isUploading = false;
    }
  };

  /**
   * Get blob data for custom processing
   * Requirement 10.1: Automatic binary data detection
   */
  const getBlob = async (
    endpoint: string,
    params?: Record<string, any>
  ): Promise<Blob> => {
    resetState();
    
    try {
      return await $api.getBlob(endpoint, params);
    } catch (error: any) {
      state.error = error.message || 'Ошибка при получении файла';
      throw error;
    }
  };

  /**
   * Detect if response contains binary data
   * Requirement 10.1: Automatic binary data detection
   */
  const isBinaryResponse = (contentType: string): boolean => {
    const binaryTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/zip',
      'application/octet-stream',
      'image/',
      'video/',
      'audio/'
    ];

    return binaryTypes.some(type => contentType.includes(type));
  };

  /**
   * Extract filename from Content-Disposition header
   * Requirement 10.2: Content-Disposition header handling
   */
  const extractFilename = (contentDisposition: string): string => {
    if (!contentDisposition) return 'download';

    // Handle different Content-Disposition formats
    const patterns = [
      /filename\*=UTF-8''([^;]+)/i,  // RFC 5987 format
      /filename="([^"]+)"/i,         // Quoted filename
      /filename=([^;]+)/i            // Unquoted filename
    ];

    for (const pattern of patterns) {
      const match = contentDisposition.match(pattern);
      if (match && match[1]) {
        // Decode URI component if needed
        try {
          return decodeURIComponent(match[1].trim());
        } catch {
          return match[1].trim();
        }
      }
    }

    return 'download';
  };

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Create download URL for blob
   */
  const createDownloadUrl = (blob: Blob): string => {
    return URL.createObjectURL(blob);
  };

  /**
   * Revoke download URL to free memory
   */
  const revokeDownloadUrl = (url: string): void => {
    URL.revokeObjectURL(url);
  };

  return {
    // State
    state: readonly(state),
    
    // Actions
    downloadFile,
    generateReport,
    uploadFile,
    getBlob,
    resetState,
    
    // Utilities
    isBinaryResponse,
    extractFilename,
    formatFileSize,
    createDownloadUrl,
    revokeDownloadUrl,
    
    // Computed
    isOperating: computed(() => 
      state.isDownloading || state.isUploading || state.isGeneratingReport
    ),
    progressPercentage: computed(() => 
      state.progress?.percentage || 0
    ),
    hasError: computed(() => 
      !!state.error
    )
  };
}

/**
 * Report generation helper types
 */
import { ReportType, ReportFormat } from '~/types/enhanced-api';

export const REPORT_TYPES: Record<ReportType, string> = {
  [ReportType.SALES]: 'Отчет по продажам',
  [ReportType.INVENTORY]: 'Отчет по складу',
  [ReportType.ANALYTICS]: 'Аналитический отчет',
  [ReportType.AUDIT]: 'Аудиторский отчет'
};

export const REPORT_FORMATS: Record<ReportFormat, string> = {
  [ReportFormat.PDF]: 'PDF',
  [ReportFormat.EXCEL]: 'Excel',
  [ReportFormat.CSV]: 'CSV'
};