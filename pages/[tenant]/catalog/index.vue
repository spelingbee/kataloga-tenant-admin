<template>
  <div class="catalog-page">
    <PageHeader
      :title="t('catalog.title') || 'Каталог товаров'"
      :subtitle="t('catalog.subtitle') || 'Управление глобальным списком товаров вашего заведения'"
      :back-label="t('dashboard.title')"
      back-to="/"
    >
      <template #actions>
        <button class="catalog-page__add-btn" @click="handleCreateProduct">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ t('catalog.addProduct') || 'Добавить товар' }}
        </button>
      </template>
    </PageHeader>

    <div class="catalog-page__content">
      <div v-if="menuStore.isFetching && (!menuStore.catalogProducts || menuStore.catalogProducts.length === 0)" class="catalog-page__loading">
        <LoadingSpinner />
        <p>{{ t('common.loading') }}</p>
      </div>

      <div v-else-if="!menuStore.catalogProducts || menuStore.catalogProducts.length === 0" class="catalog-page__empty">
        <EmptyState
          icon="📦"
          :title="t('catalog.emptyTitle') || 'Каталог пуст'"
          :description="t('catalog.emptyDesc') || 'Добавьте товары в каталог, чтобы потом быстро добавлять их в различные меню.'"
        >
          <template #actions>
            <button class="catalog-page__add-btn" @click="handleCreateProduct">
              {{ t('catalog.addProduct') || 'Добавить товар' }}
            </button>
          </template>
        </EmptyState>
      </div>

      <div v-else class="catalog-page__table-wrapper">
        <CatalogTable
          :products="menuStore.catalogProducts"
          @edit="handleEditProduct"
          @delete="handleDeleteProduct"
        />
      </div>
    </div>

    <!-- Product Creation/Edit Dialog -->
    <ProductDialog
      v-model="isProductDialogOpen"
      :product="selectedProduct"
      @saved="handleProductSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PageHeader } from '~/components/ui'
import LoadingSpinner from '~/components/ui/LoadingSpinner.vue'
import EmptyState from '~/components/ui/EmptyState.vue'
import CatalogTable from '~/components/catalog/CatalogTable.vue'
import ProductDialog from '~/components/catalog/ProductDialog.vue'
import { useEnhancedMenuStore } from '~/stores/enhanced-menu'
import type { Product } from '~/types/business'

definePageMeta({
  middleware: ['auth']
})

const { t } = useI18n()
const menuStore = useEnhancedMenuStore()

// State
const isProductDialogOpen = ref(false)
const selectedProduct = ref<Product | null>(null)

onMounted(async () => {
  await menuStore.fetchCatalog()
})

const handleCreateProduct = () => {
  selectedProduct.value = null
  isProductDialogOpen.value = true
}

const handleEditProduct = (product: Product) => {
  selectedProduct.value = product
  isProductDialogOpen.value = true
}

const handleDeleteProduct = async (id: string) => {
  if (confirm(t('common.deleteConfirm') || 'Вы уверены, что хотите удалить этот товар?')) {
    try {
      await menuStore.deleteCatalogProduct(id)
    } catch (error) {
      console.error('Failed to delete product', error)
    }
  }
}

const handleProductSaved = (product: Product) => {
  // Store already handles state updates
  selectedProduct.value = null
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.catalog-page {
  padding: $spacing-xl;
  min-height: 100vh;
  background: $bg-secondary;

  &__content {
    margin-top: $spacing-xl;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: $spacing-3xl;
    gap: $spacing-md;
    color: $text-secondary;
  }

  &__table-wrapper {
    background: $bg-primary;
    border-radius: $radius-lg;
    box-shadow: $shadow-sm;
    border: 1px solid $border-light;
  }

  &__add-btn {
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
}
</style>
