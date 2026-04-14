<template>
  <div class="menu-page">
    <PageHeader 
      :title="t('menu.title')" 
      :subtitle="t('menu.subtitle')"
      :back-label="t('dashboard.title')"
      back-to="/"
    >
      <template #actions>
        <button class="menu-page__add-btn" @click="handleAddItem">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('menu.addMenuItem') }}
        </button>
      </template>
    </PageHeader>


    <MenuItemList />
  </div>
</template>

<script setup lang="ts">
import MenuItemList from '~/components/menu/MenuItemList.vue'
import {PageHeader} from "../../../components/ui";

const { t } = useI18n()

definePageMeta({
  middleware: ['auth']
})

const router = useRouter()

const { navigateToTenant } = useNavigation()

const handleAddItem = () => {
  navigateToTenant('/menu/items/new')
}

const goBack = () => {
  navigateToTenant('/')
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.menu-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;
}

.menu-page__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xl;
}

.menu-page__title {
  margin: 0 0 $spacing-xs 0;
  font-size: $font-size-3xl;
  font-weight: $font-weight-bold;
  color: $text-primary;
}

.menu-page__subtitle {
  margin: 0;
  font-size: $font-size-lg;
  color: $text-secondary;
}

.menu-page__add-btn {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-lg;
  font-size: $font-size-base;
  font-weight: $font-weight-medium;
  color: $text-white;
  background: $primary-color;
  border: none;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-base;
  
  svg {
    width: 20px;
    height: 20px;
  }
  
  &:hover {
    background: $primary-dark;
  }
}
</style>
