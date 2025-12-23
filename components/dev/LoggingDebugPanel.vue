<!--
  Logging Debug Panel
  
  Development tool for monitoring enhanced logging system
  Requirement 9.2: Production-optimized logging monitoring
  Requirement 9.3: Error context visualization
-->

<template>
  <div v-if="isDev" class="logging-debug-panel">
    <div class="panel-header">
      <h3>🔍 Enhanced Logging Debug Panel</h3>
      <div class="panel-controls">
        <button @click="refreshStats" class="btn btn-sm">🔄 Refresh</button>
        <button @click="clearLogs" class="btn btn-sm btn-warning">🗑️ Clear Logs</button>
        <button @click="exportLogs" class="btn btn-sm btn-info">📤 Export</button>
        <button @click="togglePanel" class="btn btn-sm">{{ isExpanded ? '➖' : '➕' }}</button>
      </div>
    </div>

    <div v-if="isExpanded" class="panel-content">
      <!-- Error Statistics -->
      <div class="stats-section">
        <h4>📊 Error Statistics</h4>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ errorStats.totalErrors }}</div>
            <div class="stat-label">Total Errors</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ legacyReport.totalDetections }}</div>
            <div class="stat-label">Legacy Detections</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ Object.keys(errorStats.performanceMetrics).length }}</div>
            <div class="stat-label">Performance Metrics</div>
          </div>
        </div>
      </div>

      <!-- Error Breakdown -->
      <div v-if="Object.keys(errorStats.errorsByType).length > 0" class="errors-section">
        <h4>❌ Error Breakdown</h4>
        <div class="error-breakdown">
          <div 
            v-for="(count, errorType) in errorStats.errorsByType" 
            :key="errorType"
            class="error-type"
          >
            <span class="error-code">{{ errorType }}</span>
            <span class="error-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Legacy Detection Report -->
      <div v-if="legacyReport.totalDetections > 0" class="legacy-section">
        <h4>🔄 Legacy Format Detections</h4>
        
        <div class="legacy-breakdown">
          <div class="breakdown-group">
            <h5>By Format:</h5>
            <div 
              v-for="(count, format) in legacyReport.formatBreakdown" 
              :key="format"
              class="breakdown-item"
            >
              <span class="format-name">{{ format }}</span>
              <span class="format-count">{{ count }}</span>
            </div>
          </div>
          
          <div class="breakdown-group">
            <h5>By URL:</h5>
            <div 
              v-for="(count, url) in legacyReport.urlBreakdown" 
              :key="url"
              class="breakdown-item"
            >
              <span class="url-name">{{ url }}</span>
              <span class="url-count">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Errors -->
      <div v-if="errorStats.recentErrors.length > 0" class="recent-errors-section">
        <h4>🚨 Recent Errors</h4>
        <div class="recent-errors">
          <div 
            v-for="(error, index) in errorStats.recentErrors" 
            :key="index"
            class="error-entry"
          >
            <div class="error-header">
              <span class="error-level" :class="`level-${error.level}`">{{ error.level.toUpperCase() }}</span>
              <span class="error-time">{{ formatTime(error.context.timestamp) }}</span>
              <span v-if="error.context.requestId" class="request-id">{{ error.context.requestId }}</span>
            </div>
            <div class="error-message">{{ error.message }}</div>
            <div v-if="error.context.url" class="error-url">{{ error.context.url }}</div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div v-if="Object.keys(errorStats.performanceMetrics).length > 0" class="performance-section">
        <h4>⚡ Performance Metrics</h4>
        <div class="performance-metrics">
          <div 
            v-for="(avgDuration, operation) in errorStats.performanceMetrics" 
            :key="operation"
            class="metric-entry"
          >
            <span class="operation-name">{{ operation }}</span>
            <span class="avg-duration" :class="{ 'slow': avgDuration > 2000 }">
              {{ Math.round(avgDuration) }}ms
            </span>
          </div>
        </div>
      </div>

      <!-- Recent Legacy Detections -->
      <div v-if="legacyReport.recentDetections.length > 0" class="recent-legacy-section">
        <h4>🔄 Recent Legacy Detections</h4>
        <div class="recent-legacy">
          <div 
            v-for="(detection, index) in legacyReport.recentDetections" 
            :key="index"
            class="legacy-entry"
          >
            <div class="legacy-header">
              <span class="legacy-format">{{ detection.format }}</span>
              <span class="legacy-time">{{ formatTime(detection.timestamp.toISOString()) }}</span>
              <span class="legacy-request-id">{{ detection.requestId }}</span>
            </div>
            <div class="legacy-url">{{ detection.url }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const isDev = import.meta.dev;

// State
const isExpanded = ref(false);
const errorStats = ref({
  totalErrors: 0,
  errorsByType: {} as Record<string, number>,
  recentErrors: [] as any[],
  legacyDetections: 0,
  performanceMetrics: {} as Record<string, number>
});

const legacyReport = ref({
  totalDetections: 0,
  urlBreakdown: {} as Record<string, number>,
  formatBreakdown: {} as Record<string, number>,
  recentDetections: [] as any[]
});

// Composables
const { getErrorStats, getLegacyReport, clearLogs: clearLoggerLogs, exportLogs: exportLoggerLogs } = useEnhancedLogger();
const { info: showInfo, success: showSuccess } = useEnhancedToast();

// Methods
const refreshStats = () => {
  if (!isDev) return;
  
  errorStats.value = getErrorStats();
  legacyReport.value = getLegacyReport();
};

const clearLogs = () => {
  if (!isDev) return;
  
  clearLoggerLogs();
  refreshStats();
  showSuccess('Logs cleared successfully');
};

const exportLogs = () => {
  if (!isDev) return;
  
  const exported = exportLoggerLogs();
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `enhanced-logs-${new Date().toISOString().slice(0, 19)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showSuccess('Logs exported successfully');
};

const togglePanel = () => {
  isExpanded.value = !isExpanded.value;
  if (isExpanded.value) {
    refreshStats();
  }
};

const formatTime = (timestamp?: string) => {
  if (!timestamp) return 'Unknown';
  return new Date(timestamp).toLocaleTimeString();
};

// Auto-refresh stats every 30 seconds when expanded
let refreshInterval: NodeJS.Timeout | null = null;

watch(isExpanded, (expanded) => {
  if (expanded) {
    refreshStats();
    refreshInterval = setInterval(refreshStats, 30000);
  } else if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Initial load
onMounted(() => {
  if (isDev) {
    refreshStats();
  }
});
</script>

<style scoped>
.logging-debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  z-index: 9999;
  font-size: 12px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.panel-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.panel-controls {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 11px;
  transition: background-color 0.2s;
}

.btn:hover {
  background: #f3f4f6;
}

.btn-warning {
  border-color: #f59e0b;
  color: #f59e0b;
}

.btn-info {
  border-color: #3b82f6;
  color: #3b82f6;
}

.panel-content {
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.stats-section,
.errors-section,
.legacy-section,
.recent-errors-section,
.performance-section,
.recent-legacy-section {
  margin-bottom: 20px;
}

.stats-section h4,
.errors-section h4,
.legacy-section h4,
.recent-errors-section h4,
.performance-section h4,
.recent-legacy-section h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stat-card {
  text-align: center;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.stat-label {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
}

.error-breakdown,
.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-type,
.metric-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9fafb;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
}

.error-code,
.operation-name {
  font-family: monospace;
  font-size: 11px;
  color: #374151;
}

.error-count,
.avg-duration {
  font-weight: 600;
  color: #1f2937;
}

.avg-duration.slow {
  color: #ef4444;
}

.legacy-breakdown {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.breakdown-group h5 {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background: #f9fafb;
  border-radius: 4px;
  margin-bottom: 4px;
}

.format-name,
.url-name {
  font-family: monospace;
  font-size: 10px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 120px;
}

.format-count,
.url-count {
  font-weight: 600;
  color: #1f2937;
}

.recent-errors,
.recent-legacy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.error-entry,
.legacy-entry {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.error-header,
.legacy-header {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 6px;
}

.error-level {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.level-error {
  background: #fef2f2;
  color: #dc2626;
}

.level-warn {
  background: #fffbeb;
  color: #d97706;
}

.level-info {
  background: #eff6ff;
  color: #2563eb;
}

.level-debug {
  background: #f3f4f6;
  color: #4b5563;
}

.error-time,
.legacy-time {
  font-size: 10px;
  color: #6b7280;
}

.request-id,
.legacy-request-id {
  font-family: monospace;
  font-size: 10px;
  color: #6b7280;
  background: #e5e7eb;
  padding: 2px 4px;
  border-radius: 2px;
}

.error-message {
  font-size: 11px;
  color: #374151;
  margin-bottom: 4px;
}

.error-url,
.legacy-url {
  font-family: monospace;
  font-size: 10px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legacy-format {
  font-family: monospace;
  font-size: 10px;
  background: #e5e7eb;
  padding: 2px 4px;
  border-radius: 2px;
  color: #374151;
}
</style>