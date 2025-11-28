<template>
  <div class="menu-page">
    <div class="menu-page__header">
      <div>
        <h1 class="menu-page__title">Menu Management</h1>
        <p class="menu-page__subtitle">
          Manage your menu items, categories, and availability
        </p>
      </div>
      <button class="menu-page__add-btn" @click="handleAddItem">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add Menu Item
      </button>
    </div>

    <MenuItemList />
  </div>
</template>

<script setup lang="ts">
import MenuItemList from '~/components/menu/MenuItemList.vue'

definePageMeta({
  middleware: ['auth']
})

const router = useRouter()

const handleAddItem = () => {
  router.push('/menu/items/new')
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
