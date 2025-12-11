<template>
  <div class="item-sales-history-page">
    <div class="item-sales-history-page__container">
      <MenuItemSalesHistory
        :menu-item-id="itemId"
        :menu-item-name="itemName"
        @close="handleClose"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import MenuItemSalesHistory from '~/components/dashboard/MenuItemSalesHistory.vue'

const route = useRoute()
const router = useRouter()

const itemId = computed(() => route.params.id as string)
const itemName = computed(() => (route.query.name as string) || undefined)

const { navigateToTenant } = useNavigation()

const handleClose = () => {
  navigateToTenant('/analytics')
}

// Middleware to check feature access
definePageMeta({
  middleware: 'auth',
})
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.item-sales-history-page {
  min-height: 100vh;
  background: $bg-secondary;
  padding: $spacing-xl;
}

.item-sales-history-page__container {
  max-width: 1400px;
  margin: 0 auto;
  background: $bg-primary;
  border-radius: $radius-lg;
  padding: $spacing-xl;
  box-shadow: $shadow-md;
}

@media (max-width: $breakpoint-md) {
  .item-sales-history-page {
    padding: $spacing-md;
  }

  .item-sales-history-page__container {
    padding: $spacing-md;
  }
}
</style>
