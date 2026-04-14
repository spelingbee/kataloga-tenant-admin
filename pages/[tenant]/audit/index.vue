<template>
  <div class="audit-page">
    <PageHeader 
      title="Audit Trail" 
      subtitle="View complete change history for all operations"
    />


    <AuditLogList />
  </div>
</template>

<script setup lang="ts">
import { useFeatureAccess } from '~/composables/useFeatureAccess';
import { FeatureKey } from '~/types';

definePageMeta({
  middleware: 'auth',
});

const { hasFeature, redirectToUpgrade } = useFeatureAccess();

// Check if user has access to audit trail feature
onMounted(async () => {
  const hasAccess = await hasFeature(FeatureKey.AUDIT_TRAIL);
  if (!hasAccess) {
    redirectToUpgrade(FeatureKey.AUDIT_TRAIL);
  }
});
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.audit-page {
  padding: $spacing-xl;
}

.audit-page__header {
  margin-bottom: $spacing-xl;
}

.audit-page__title {
  font-size: 2rem;
  font-weight: 700;
  color: $text-primary;
  margin-bottom: $spacing-sm;
}

.audit-page__description {
  font-size: 1rem;
  color: $text-secondary;
}
</style>
