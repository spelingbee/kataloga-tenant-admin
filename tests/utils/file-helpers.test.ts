/**
 * Tests for file helper utilities
 * 
 * Tests file operation utility functions:
 * - Binary data detection
 * - Filename extraction from headers
 * - File size formatting
 * - File validation
 * 
 * Requirements: 10.1, 10.2
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isBinaryContentType,
  extractFilenameFromContentDisposition,
  generateFilenameFromContentType,
  formatFileSize,
  isFileTypeAllowed,
  isFileSizeValid,
  getFileExtension,
  getMimeTypeFromExtension,
  validateFile,
  triggerFileDownload,
  readFileAsText,
  readFileAsDataURL,
  readFileAsArrayBuffer
} from '~/utils/file-helpers';

describe('file-helpers', () => {
  describe('isBinaryContentType', () => {
    it('should detect binary content types correctly', () => {
      // Binary types
      expect(isBinaryContentType('application/pdf')).toBe(true);
      expect(isBinaryContentType('application/vnd.ms-excel')).toBe(true);
      expect(isBinaryContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe(true);
      expect(isBinaryContentType('application/zip')).toBe(true);
      expect(isBinaryContentType('application/octet-stream')).toBe(true);
      expect(isBinaryContentType('image/jpeg')).toBe(true);
      expect(isBinaryContentType('image/png')).toBe(true);
      expect(isBinaryContentType('video/mp4')).toBe(true);
      expect(isBinaryContentType('audio/mpeg')).toBe(true);

      // Non-binary types
      expect(isBinaryContentType('text/plain')).toBe(false);
      expect(isBinaryContentType('application/json')).toBe(false);
      expect(isBinaryContentType('text/html')).toBe(false);
      expect(isBinaryContentType('application/xml')).toBe(false);
    });

    it('should handle case insensitive matching', () => {
      expect(isBinaryContentType('APPLICATION/PDF')).toBe(true);
      expect(isBinaryContentType('Image/JPEG')).toBe(true);
      expect(isBinaryContentType('TEXT/PLAIN')).toBe(false);
    });
  });

  describe('extractFilenameFromContentDisposition', () => {
    it('should extract filename from RFC 5987 format', () => {
      const header = 'attachment; filename*=UTF-8\'\'test%20file.pdf';
      expect(extractFilenameFromContentDisposition(header)).toBe('test file.pdf');
    });

    it('should extract filename from RFC 2231 format', () => {
      const header = 'attachment; filename*=utf-8\'en\'test%20file.pdf';
      expect(extractFilenameFromContentDisposition(header)).toBe('test file.pdf');
    });

    it('should extract filename from quoted format', () => {
      const header = 'attachment; filename="test file.pdf"';
      expect(extractFilenameFromContentDisposition(header)).toBe('test file.pdf');
    });

    it('should extract filename from unquoted format', () => {
      const header = 'attachment; filename=test.pdf';
      expect(extractFilenameFromContentDisposition(header)).toBe('test.pdf');
    });

    it('should handle malformed headers gracefully', () => {
      expect(extractFilenameFromContentDisposition('')).toBe(null);
      expect(extractFilenameFromContentDisposition('attachment')).toBe(null);
      expect(extractFilenameFromContentDisposition('filename=')).toBe(null);
    });

    it('should handle decoding errors gracefully', () => {
      const header = 'attachment; filename*=UTF-8\'\'%ZZ%invalid';
      // Should return the raw value if decoding fails
      expect(extractFilenameFromContentDisposition(header)).toBe('%ZZ%invalid');
    });
  });

  describe('generateFilenameFromContentType', () => {
    beforeEach(() => {
      // Mock Date to ensure consistent timestamps
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2023-01-01T12:00:00Z'));
    });

    it('should generate filename for known content types', () => {
      expect(generateFilenameFromContentType('application/pdf')).toBe('download_20230101T120000.pdf');
      expect(generateFilenameFromContentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')).toBe('download_20230101T120000.xlsx');
      expect(generateFilenameFromContentType('text/csv')).toBe('download_20230101T120000.csv');
      expect(generateFilenameFromContentType('image/jpeg')).toBe('download_20230101T120000.jpg');
    });

    it('should use custom prefix', () => {
      expect(generateFilenameFromContentType('application/pdf', 'report')).toBe('report_20230101T120000.pdf');
    });

    it('should handle unknown content types', () => {
      expect(generateFilenameFromContentType('application/unknown')).toBe('download_20230101T120000');
    });

    it('should handle content type with parameters', () => {
      expect(generateFilenameFromContentType('application/pdf; charset=utf-8')).toBe('download_20230101T120000.pdf');
    });
  });

  describe('formatFileSize', () => {
    it('should format file sizes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512 B');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1.5 MB');
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB');
      expect(formatFileSize(1024 * 1024 * 1024 * 1024)).toBe('1 TB');
    });

    it('should handle invalid sizes', () => {
      expect(formatFileSize(-1)).toBe('Invalid size');
    });

    it('should handle very large sizes', () => {
      const veryLarge = 1024 ** 6; // Larger than TB
      expect(formatFileSize(veryLarge)).toContain('TB');
    });
  });

  describe('isFileTypeAllowed', () => {
    const pdfFile = new File([''], 'test.pdf', { type: 'application/pdf' });
    const jpegFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const txtFile = new File([''], 'test.txt', { type: 'text/plain' });

    it('should allow all types when no restrictions', () => {
      expect(isFileTypeAllowed(pdfFile, [])).toBe(true);
      expect(isFileTypeAllowed(pdfFile, undefined as any)).toBe(true);
    });

    it('should check exact MIME types', () => {
      expect(isFileTypeAllowed(pdfFile, ['application/pdf'])).toBe(true);
      expect(isFileTypeAllowed(pdfFile, ['image/jpeg'])).toBe(false);
    });

    it('should check wildcard types', () => {
      expect(isFileTypeAllowed(jpegFile, ['image/*'])).toBe(true);
      expect(isFileTypeAllowed(pdfFile, ['image/*'])).toBe(false);
    });

    it('should check file extensions', () => {
      expect(isFileTypeAllowed(pdfFile, ['.pdf'])).toBe(true);
      expect(isFileTypeAllowed(pdfFile, ['.jpg'])).toBe(false);
    });

    it('should handle case insensitive extensions', () => {
      expect(isFileTypeAllowed(pdfFile, ['.PDF'])).toBe(true);
    });
  });

  describe('isFileSizeValid', () => {
    it('should validate file size correctly', () => {
      const smallFile = new File(['x'.repeat(100)], 'small.txt');
      const largeFile = new File(['x'.repeat(2000)], 'large.txt');

      expect(isFileSizeValid(smallFile, 1000)).toBe(true);
      expect(isFileSizeValid(largeFile, 1000)).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extensions correctly', () => {
      expect(getFileExtension('test.pdf')).toBe('pdf');
      expect(getFileExtension('document.docx')).toBe('docx');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('test.')).toBe('');
      expect(getFileExtension('.hidden')).toBe('hidden'); // Hidden files have extension after the dot
    });

    it('should handle case sensitivity', () => {
      expect(getFileExtension('TEST.PDF')).toBe('pdf');
    });
  });

  describe('getMimeTypeFromExtension', () => {
    it('should return correct MIME types', () => {
      expect(getMimeTypeFromExtension('pdf')).toBe('application/pdf');
      expect(getMimeTypeFromExtension('xlsx')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      expect(getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('jpeg')).toBe('image/jpeg');
      expect(getMimeTypeFromExtension('png')).toBe('image/png');
      expect(getMimeTypeFromExtension('csv')).toBe('text/csv');
    });

    it('should handle case insensitive extensions', () => {
      expect(getMimeTypeFromExtension('PDF')).toBe('application/pdf');
      expect(getMimeTypeFromExtension('JPG')).toBe('image/jpeg');
    });

    it('should return default for unknown extensions', () => {
      expect(getMimeTypeFromExtension('unknown')).toBe('application/octet-stream');
    });
  });

  describe('validateFile', () => {
    const pdfFile = new File(['x'.repeat(1000)], 'test.pdf', { type: 'application/pdf' });

    it('should validate file successfully', () => {
      const result = validateFile(pdfFile, {
        maxSize: 2000,
        allowedTypes: ['application/pdf'],
        allowedExtensions: ['pdf']
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect size violations', () => {
      const result = validateFile(pdfFile, {
        maxSize: 500
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Файл слишком большой. Максимальный размер: 500 B');
    });

    it('should detect type violations', () => {
      const result = validateFile(pdfFile, {
        allowedTypes: ['image/jpeg']
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Неподдерживаемый тип файла. Разрешены: image/jpeg');
    });

    it('should detect extension violations', () => {
      const result = validateFile(pdfFile, {
        allowedExtensions: ['jpg', 'png']
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Неподдерживаемое расширение файла. Разрешены: jpg, png');
    });

    it('should collect multiple errors', () => {
      const result = validateFile(pdfFile, {
        maxSize: 500,
        allowedTypes: ['image/jpeg'],
        allowedExtensions: ['jpg']
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe('triggerFileDownload', () => {
    it('should not trigger download on server', () => {
      // Mock server environment
      Object.defineProperty(import.meta, 'client', { value: false });
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const blob = new Blob(['test'], { type: 'text/plain' });
      
      triggerFileDownload(blob, 'test.txt');

      expect(consoleSpy).toHaveBeenCalledWith('triggerFileDownload can only be called in browser environment');
    });
  });

  describe('file reading functions', () => {
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

    it('should read file as text', async () => {
      const result = await readFileAsText(testFile);
      expect(result).toBe('test content');
    });

    it('should read file as data URL', async () => {
      const result = await readFileAsDataURL(testFile);
      expect(result).toMatch(/^data:text\/plain;base64,/);
    });

    it('should read file as array buffer', async () => {
      const result = await readFileAsArrayBuffer(testFile);
      expect(result).toBeInstanceOf(ArrayBuffer);
    });
  });
});