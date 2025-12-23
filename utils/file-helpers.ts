/**
 * File Operation Helper Utilities
 * 
 * Provides utility functions for file operations:
 * - Binary data detection
 * - Filename extraction
 * - File size formatting
 * - MIME type validation
 * 
 * Requirements: 10.1, 10.2
 */

/**
 * Check if content type indicates binary data
 * Requirement 10.1: Automatic binary data detection
 */
export function isBinaryContentType(contentType: string): boolean {
  const binaryTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    'application/octet-stream',
    'image/',
    'video/',
    'audio/'
  ];

  const normalizedType = contentType.toLowerCase();
  return binaryTypes.some(type => normalizedType.includes(type.toLowerCase()));
}

/**
 * Extract filename from Content-Disposition header
 * Requirement 10.2: Enhanced Content-Disposition header handling
 * 
 * Supports multiple formats according to RFC 6266:
 * - RFC 5987: filename*=UTF-8''example.pdf
 * - RFC 2231: filename*=utf-8'en'example.pdf
 * - Standard: filename="example.pdf"
 * - Simple: filename=example.pdf
 */
export function extractFilenameFromContentDisposition(contentDisposition: string): string | null {
  if (!contentDisposition) {
    return null;
  }

  // Handle different Content-Disposition formats
  const patterns = [
    // RFC 5987 format: filename*=UTF-8''example.pdf
    /filename\*=UTF-8''([^;]+)/i,
    // RFC 2231 format: filename*=utf-8'en'example.pdf  
    /filename\*=utf-8'[^']*'([^;]+)/i,
    // Standard quoted format: filename="example.pdf"
    /filename="([^"]+)"/i,
    // Unquoted format: filename=example.pdf
    /filename=([^;,\n\r]+)/i
  ];

  for (const pattern of patterns) {
    const match = contentDisposition.match(pattern);
    if (match && match[1]) {
      try {
        // Decode URI component for RFC 5987/2231 formats
        const filename = decodeURIComponent(match[1].trim());
        return filename || null;
      } catch (error) {
        // If decoding fails, use raw value
        return match[1].trim() || null;
      }
    }
  }

  return null;
}

/**
 * Generate filename based on content type
 */
export function generateFilenameFromContentType(contentType: string, prefix: string = 'download'): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  
  const typeMap: Record<string, string> = {
    'application/pdf': 'pdf',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'text/csv': 'csv',
    'application/zip': 'zip',
    'application/json': 'json',
    'text/plain': 'txt',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/svg+xml': 'svg'
  };

  const normalizedType = contentType.toLowerCase().split(';')[0].trim();
  const extension = typeMap[normalizedType];
  
  if (extension) {
    return `${prefix}_${timestamp}.${extension}`;
  }
  
  // Fallback for unknown types
  return `${prefix}_${timestamp}`;
}

/**
 * Format file size for human-readable display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Invalid size';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i >= sizes.length) {
    return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(1)} ${sizes[sizes.length - 1]}`;
  }
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Validate file type against allowed types
 */
export function isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
  if (!allowedTypes || allowedTypes.length === 0) {
    return true;
  }

  return allowedTypes.some(type => {
    // Handle wildcard types like "image/*"
    if (type.endsWith('/*')) {
      const category = type.slice(0, -2);
      return file.type.startsWith(category + '/');
    }
    
    // Handle file extensions like ".pdf"
    if (type.startsWith('.')) {
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    }
    
    // Handle exact MIME types
    return file.type === type;
  });
}

/**
 * Validate file size against maximum allowed size
 */
export function isFileSizeValid(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === filename.length - 1) {
    return '';
  }
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'csv': 'text/csv',
    'txt': 'text/plain',
    'json': 'application/json',
    'xml': 'application/xml',
    'zip': 'application/zip',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'svg': 'image/svg+xml',
    'mp3': 'audio/mpeg',
    'mp4': 'video/mp4',
    'avi': 'video/x-msvideo'
  };

  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/**
 * Create a download link and trigger download
 * Requirement 10.2: Proper file download handling
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  if (!import.meta.client) {
    console.warn('triggerFileDownload can only be called in browser environment');
    return;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as array buffer
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = (e) => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Validate file before upload
 */
export interface FileValidationOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
}

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateFile(file: File, options: FileValidationOptions): FileValidationResult {
  const errors: string[] = [];

  // Validate file size
  if (options.maxSize && file.size > options.maxSize) {
    errors.push(`Файл слишком большой. Максимальный размер: ${formatFileSize(options.maxSize)}`);
  }

  // Validate MIME type
  if (options.allowedTypes && !isFileTypeAllowed(file, options.allowedTypes)) {
    errors.push(`Неподдерживаемый тип файла. Разрешены: ${options.allowedTypes.join(', ')}`);
  }

  // Validate file extension
  if (options.allowedExtensions) {
    const extension = getFileExtension(file.name);
    const isExtensionAllowed = options.allowedExtensions.some(
      ext => ext.toLowerCase() === extension.toLowerCase()
    );
    
    if (!isExtensionAllowed) {
      errors.push(`Неподдерживаемое расширение файла. Разрешены: ${options.allowedExtensions.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}