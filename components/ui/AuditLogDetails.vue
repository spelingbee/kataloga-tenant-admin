<template>
  <div class="audit-log-details">
    <div class="audit-log-details__section">
      <h4 class="audit-log-details__section-title">Basic Information</h4>
      <div class="audit-log-details__grid">
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">Timestamp:</span>
          <span class="audit-log-details__value">{{ formatDate(log.createdAt) }}</span>
        </div>
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">Action:</span>
          <span :class="getActionClass(log.action)">
            {{ formatAction(log.action) }}
          </span>
        </div>
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">Resource Type:</span>
          <span class="audit-log-details__value">{{ formatResource(log.resource) }}</span>
        </div>
        <div v-if="log.resourceId" class="audit-log-details__field">
          <span class="audit-log-details__label">Resource ID:</span>
          <span class="audit-log-details__value audit-log-details__value--mono">
            {{ log.resourceId }}
          </span>
        </div>
      </div>
    </div>

    <div class="audit-log-details__section">
      <h4 class="audit-log-details__section-title">User Information</h4>
      <div class="audit-log-details__grid">
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">Name:</span>
          <span class="audit-log-details__value">
            {{ log.user.firstName }} {{ log.user.lastName }}
          </span>
        </div>
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">Email:</span>
          <span class="audit-log-details__value">{{ log.user.email }}</span>
        </div>
        <div class="audit-log-details__field">
          <span class="audit-log-details__label">User ID:</span>
          <span class="audit-log-details__value audit-log-details__value--mono">
            {{ log.user.id }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="log.details" class="audit-log-details__section">
      <h4 class="audit-log-details__section-title">Change Details</h4>
      
      <!-- Display changes if available -->
      <div v-if="log.details.changes" class="audit-log-details__changes">
        <div
          v-for="(value, key) in log.details.changes"
          :key="key"
          class="audit-log-details__change-item"
        >
          <span class="audit-log-details__change-key">{{ formatKey(key) }}:</span>
          <div class="audit-log-details__change-values">
            <div v-if="value.before !== undefined" class="audit-log-details__change-before">
              <span class="audit-log-details__change-label">Before:</span>
              <span class="audit-log-details__change-value">
                {{ formatValue(value.before) }}
              </span>
            </div>
            <div v-if="value.after !== undefined" class="audit-log-details__change-after">
              <span class="audit-log-details__change-label">After:</span>
              <span class="audit-log-details__change-value">
                {{ formatValue(value.after) }}
              </span>
            </div>
            <div v-if="value.before === undefined && value.after === undefined">
              <span class="audit-log-details__change-value">
                {{ formatValue(value) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Display raw details as JSON if no structured changes -->
      <div v-else class="audit-log-details__raw">
        <pre class="audit-log-details__json">{{ JSON.stringify(log.details, null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

interface Props {
  log: AuditLog;
}

defineProps<Props>();

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const formatAction = (action: string) => {
  return action.replace('MENU_', '').replace(/_/g, ' ');
};

const formatResource = (resource: string | null) => {
  if (!resource) return 'N/A';
  return resource.replace(/_/g, ' ').toUpperCase();
};

const formatKey = (key: string) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const formatValue = (value: any) => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getActionClass = (action: string) => {
  const baseClass = 'audit-log-details__action-badge';
  if (action.includes('CREATE')) return `${baseClass} ${baseClass}--create`;
  if (action.includes('UPDATE')) return `${baseClass} ${baseClass}--update`;
  if (action.includes('DELETE')) return `${baseClass} ${baseClass}--delete`;
  return baseClass;
};
</script>

<style scoped lang="scss">
@use './audit-log-details';
</style>
