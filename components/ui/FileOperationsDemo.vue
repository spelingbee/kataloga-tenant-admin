<!--
  File Operations Demo Component
  
  Demonstrates enhanced file operations functionality:
  - File downloads with progress
  - Report generation with error handling
  - File uploads with validation
  - Binary data detection
  
  Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
-->

<template>
  <div class="file-operations-demo">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      <!-- File Download Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Скачивание файлов</h3>
        
        <div class="space-y-4">
          <button
            @click="downloadSampleFile"
            :disabled="fileOps.isOperating.value"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Скачать образец файла
          </button>
          
          <button
            @click="downloadLargeFile"
            :disabled="fileOps.isOperating.value"
            class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            Скачать большой файл (с прогрессом)
          </button>
        </div>
        
        <!-- Progress indicator -->
        <div v-if="fileOps.state.isDownloading" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Скачивание...</span>
            <span>{{ fileOps.progressPercentage.value }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${fileOps.progressPercentage.value}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Report Generation Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Генерация отчетов</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Тип отчета
            </label>
            <select 
              v-model="selectedReportType"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="(label, type) in REPORT_TYPES" :key="type" :value="type">
                {{ label }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Формат
            </label>
            <select 
              v-model="selectedReportFormat"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option v-for="(label, format) in REPORT_FORMATS" :key="format" :value="format">
                {{ label }}
              </option>
            </select>
          </div>
          
          <button
            @click="generateReport"
            :disabled="fileOps.isOperating.value"
            class="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Сгенерировать отчет
          </button>
        </div>
        
        <!-- Report generation progress -->
        <div v-if="fileOps.state.isGeneratingReport" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Генерация отчета...</span>
            <span>{{ fileOps.progressPercentage.value }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-purple-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${fileOps.progressPercentage.value}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- File Upload Section -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold mb-4">Загрузка файлов</h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Выберите файл
            </label>
            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              accept=".pdf,.xlsx,.csv,.jpg,.png"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          
          <button
            @click="uploadSelectedFile"
            :disabled="!selectedFile || fileOps.isOperating.value"
            class="w-full px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
          >
            Загрузить файл
          </button>
        </div>
        
        <!-- Upload progress -->
        <div v-if="fileOps.state.isUploading" class="mt-4">
          <div class="flex justify-between text-sm text-gray-600 mb-1">
            <span>Загрузка...</span>
            <span>{{ fileOps.progressPercentage.value }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-orange-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${fileOps.progressPercentage.value}%` }"
            ></div>
          </div>
        </div>
        
        <!-- Selected file info -->
        <div v-if="selectedFile" class="mt-4 p-3 bg-gray-50 rounded">
          <p class="text-sm text-gray-600">
            <strong>Файл:</strong> {{ selectedFile.name }}
          </p>
          <p class="text-sm text-gray-600">
            <strong>Размер:</strong> {{ fileOps.formatFileSize(selectedFile.size) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="fileOps.hasError.value" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Ошибка файловой операции</h3>
          <p class="mt-1 text-sm text-red-700">{{ fileOps.state.error }}</p>
          <button
            @click="fileOps.resetState"
            class="mt-2 text-sm text-red-600 hover:text-red-500 underline"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>

    <!-- Operation Status -->
    <div v-if="fileOps.isOperating.value" class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <svg class="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-blue-700">
            Выполняется файловая операция...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useFileOperations, REPORT_TYPES, REPORT_FORMATS } from '~/composables/useFileOperations';
import { ReportType, ReportFormat } from '~/types/enhanced-api';

// File operations composable
const fileOps = useFileOperations();

// Report generation state
const selectedReportType = ref<ReportType>(ReportType.SALES);
const selectedReportFormat = ref<ReportFormat>(ReportFormat.EXCEL);

// File upload state
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement>();

/**
 * Download a sample file to demonstrate basic file download
 * Requirements: 10.1, 10.2, 10.5
 */
const downloadSampleFile = async () => {
  try {
    await fileOps.downloadFile('/api/files/sample.pdf', {}, {
      filename: 'sample-document.pdf',
      successMessage: 'Образец файла успешно скачан'
    });
  } catch (error) {
    console.error('Download failed:', error);
  }
};

/**
 * Download a large file with progress indication
 * Requirements: 10.3, 10.5
 */
const downloadLargeFile = async () => {
  try {
    await fileOps.downloadFile('/api/files/large-report.xlsx', {}, {
      filename: 'large-report.xlsx',
      showProgress: true,
      successMessage: 'Большой файл успешно скачан'
    });
  } catch (error) {
    console.error('Large file download failed:', error);
  }
};

/**
 * Generate and download report
 * Requirements: 10.3, 10.4, 10.5
 */
const generateReport = async () => {
  try {
    await fileOps.generateReport({
      type: selectedReportType.value,
      format: selectedReportFormat.value,
      dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      dateTo: new Date().toISOString(),
      filters: {
        includeDetails: true
      }
    }, {
      showProgress: true,
      successMessage: `Отчет "${REPORT_TYPES[selectedReportType.value]}" готов к скачиванию`
    });
  } catch (error) {
    console.error('Report generation failed:', error);
  }
};

/**
 * Handle file selection for upload
 */
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0];
  }
};

/**
 * Upload selected file
 * Requirements: 10.3, 10.5
 */
const uploadSelectedFile = async () => {
  if (!selectedFile.value) return;
  
  try {
    await fileOps.uploadFile('/api/files/upload', selectedFile.value, {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'image/jpeg', 'image/png'],
      successMessage: `Файл "${selectedFile.value.name}" успешно загружен`
    });
    
    // Clear selection after successful upload
    selectedFile.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    console.error('File upload failed:', error);
  }
};
</script>

<style scoped>
.file-operations-demo {
  @apply max-w-7xl mx-auto p-6;
}
</style>