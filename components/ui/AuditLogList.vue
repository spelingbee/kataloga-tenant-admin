<template>
  <div class="audit-log-list">
    <!-- Filters -->
    <div class="audit-log-list__filters">
      <div class="audit-log-list__filter-group">
        <label class="audit-log-list__filter-label">Entity Type</label>
        <select
          v-model="filters.entityType"
          class="audit-log-list__filter-select"
          @change="loadAuditLogs"
        >
          <option value="">All Types</option>
          <option value="menu">Menu</option>
          <option value="menu_item">Menu Item</option>
          <option value="category">Category</option>
          <option value="location">Location</option>
          <option value="menu_item_location">Item Location</option>
        </select>
      </div>

      <div class="audit-log-list__filter-group">
        <label class="audit-log-list__filter-label">Action</label>
        <select
          v-model="filters.action"
          class="audit-log-list__filter-select"
          @change="loadAuditLogs"
        >
          <option value="">All Actions</option>
          <option value="MENU_CREATE">Create</option>
          <option value="MENU_UPDATE">Update</option>
          <option value="MENU_DELETE">Delete</option>
          <option value="MENU_BULK_UPDATE">Bulk Update</option>
        </select>
      </div>

      <div class="audit-log-list__filter-group">
        <label class="audit-log-list__filter-label">Start Date</label>
        <input
          v-model="filters.startDate"
          type="date"
          class="audit-log-list__filter-input"
          @change="loadAuditLogs"
        />
      </div>

      <div class="audit-log-list__filter-group">
        <label class="audit-log-list__filter-label">End Date</label>
        <input
          v-model="filters.endDate"
          type="date"
          class="audit-log-list__filter-input"
          @change="loadAuditLogs"
        />
      </div>

      <button
        class="audit-log-list__filter-clear"
        @click="clearFilters"
      >
        Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="audit-log-list__loading">
      <div class="audit-log-list__spinner"></div>
      <p>Loading audit logs...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="audit-log-list__error">
      <p>{{ error }}</p>
      <button @click="loadAuditLogs" class="audit-log-list__retry">
        Retry
      </button>
    </div>

    <!-- Empty State -->
    <div v-else-if="auditLogs.length === 0" class="audit-log-list__empty">
      <p>No audit logs found</p>
    </div>

    <!-- Audit Logs Table -->
    <div v-else class="audit-log-list__table-container">
      <table class="audit-log-list__table">
        <thead class="audit-log-list__thead">
          <tr class="audit-log-list__tr">
            <th class="audit-log-list__th">Timestamp</th>
            <th class="audit-log-list__th">User</th>
            <th class="audit-log-list__th">Action</th>
            <th class="audit-log-list__th">Resource</th>
            <th class="audit-log-list__th">Details</th>
          </tr>
        </thead>
        <tbody class="audit-log-list__tbody">
          <tr
            v-for="log in auditLogs"
            :key="log.id"
            class="audit-log-list__tr"
          >
            <td class="audit-log-list__td">
              {{ formatDate(log.createdAt) }}
            </td>
            <td class="audit-log-list__td">
              <div class="audit-log-list__user">
                <div class="audit-log-list__user-name">
                  {{ log.user.firstName }} {{ log.user.lastName }}
                </div>
                <div class="audit-log-list__user-email">
                  {{ log.user.email }}
                </div>
              </div>
            </td>
            <td class="audit-log-list__td">
              <span :class="getActionClass(log.action)">
                {{ formatAction(log.action) }}
              </span>
            </td>
            <td class="audit-log-list__td">
              <div class="audit-log-list__resource">
                <div class="audit-log-list__resource-type">
                  {{ formatResource(log.resource) }}
                </div>
                <div v-if="log.resourceId" class="audit-log-list__resource-id">
                  ID: {{ log.resourceId }}
                </div>
              </div>
            </td>
            <td class="audit-log-list__td">
              <button
                class="audit-log-list__details-btn"
                @click="showDetails(log)"
              >
                View Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="meta && meta.totalPages > 1" class="audit-log-list__pagination">
      <button
        class="audit-log-list__pagination-btn"
        :disabled="!meta.hasPreviousPage"
        @click="goToPage(meta.page - 1)"
      >
        Previous
      </button>
      <span class="audit-log-list__pagination-info">
        Page {{ meta.page }} of {{ meta.totalPages }}
      </span>
      <button
        class="audit-log-list__pagination-btn"
        :disabled="!meta.hasNextPage"
        @click="goToPage(meta.page + 1)"
      >
        Next
      </button>
    </div>

    <!-- Details Modal -->
    <Modal v-if="selectedLog" @close="selectedLog = null">
      <template #header>
        <h3>Audit Log Details</h3>
      </template>
      <template #body>
        <AuditLogDetails :log="selectedLog" />
      </template>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useApi } from '~/composables/useApi';

interface AuditLog {
  id: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  details: any;
  createdAt: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const api = useApi();
const auditLogs = ref<AuditLog[]>([]);
const meta = ref<PaginationMeta | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);
const selectedLog = ref<AuditLog | null>(null);

const filters = ref({
  entityType: '',
  action: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 50,
});

const loadAuditLogs = async () => {
  loading.value = true;
  error.value = null;

  try {
    const params: any = {
      page: filters.value.page,
      limit: filters.value.limit,
    };

    if (filters.value.entityType) {
      params.entityType = filters.value.entityType;
    }
    if (filters.value.action) {
      params.action = filters.value.action;
    }
    if (filters.value.startDate) {
      params.startDate = new Date(filters.value.startDate).toISOString();
    }
    if (filters.value.endDate) {
      params.endDate = new Date(filters.value.endDate).toISOString();
    }

    const response = await api.get('/tenant/audit', { params });
    auditLogs.value = response.data.data;
    meta.value = response.data.meta;
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load audit logs';
  } finally {
    loading.value = false;
  }
};

const clearFilters = () => {
  filters.value = {
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  };
  loadAuditLogs();
};

const goToPage = (page: number) => {
  filters.value.page = page;
  loadAuditLogs();
};

const showDetails = (log: AuditLog) => {
  selectedLog.value = log;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatAction = (action: string) => {
  return action.replace('MENU_', '').replace(/_/g, ' ');
};

const formatResource = (resource: string | null) => {
  if (!resource) return 'N/A';
  return resource.replace(/_/g, ' ').toUpperCase();
};

const getActionClass = (action: string) => {
  const baseClass = 'audit-log-list__action-badge';
  if (action.includes('CREATE')) return `${baseClass} ${baseClass}--create`;
  if (action.includes('UPDATE')) return `${baseClass} ${baseClass}--update`;
  if (action.includes('DELETE')) return `${baseClass} ${baseClass}--delete`;
  return baseClass;
};

onMounted(() => {
  loadAuditLogs();
});
</script>

<style scoped lang="scss">
@use './audit-log-list';
</style>
