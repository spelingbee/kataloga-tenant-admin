<template>
  <div class="catalog-table">
    <DataTable
      :columns="columns"
      :data="products"
      :loading="loading"
      :error="error"
      searchable
      :search-placeholder="t('catalog.searchPlaceholder') || 'Поиск по каталогу...'"
    >
      <!-- Image Cell -->
      <template #cell-imageUrl="{ value, row }">
        <div class="catalog-table__image">
          <img
            v-if="value"
            :src="mediaService.resolveImageUrl(value)"
            :alt="row.name"
            class="catalog-table__img"
          />
          <div v-else class="catalog-table__img-placeholder">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </template>

      <!-- Price Cell -->
      <template #cell-basePrice="{ value }">
        <span class="catalog-table__price">{{ formatCurrency(value) }}</span>
      </template>

      <!-- Status Cell -->
      <template #cell-inStock="{ value }">
        <span
          class="catalog-table__status"
          :class="value ? 'catalog-table__status--active' : 'catalog-table__status--inactive'"
        >
          {{ value ? t('common.inStock') || 'В наличии' : t('common.outOfStock') || 'Нет в наличии' }}
        </span>
      </template>

      <!-- Usage Cell (How many menus) -->
      <template #cell-usage="{ row }">
        <span class="catalog-table__usage-badge">
          {{ row._count?.menuItems || 0 }} {{ t('catalog.menus') || 'меню' }}
        </span>
      </template>

      <!-- Actions Cell -->
      <template #cell-actions="{ row }">
        <div class="catalog-table__actions">
          <button
            class="catalog-table__action-btn"
            :title="t('common.edit')"
            @click="emit('edit', row)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            class="catalog-table__action-btn catalog-table__action-btn--delete"
            :title="t('common.delete')"
            @click="emit('delete', row.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Product } from '~/types/business'
import DataTable from '~/components/ui/DataTable/DataTable.vue'
import { useCurrency } from '~/composables/useCurrency'
import { useMediaService } from '~/services/media.service'

interface Props {
  products: Product[]
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

const emit = defineEmits<{
  edit: [product: Product]
  delete: [id: string]
}>()

const { t } = useI18n()
const { formatCurrency } = useCurrency()
const mediaService = useMediaService()

const columns = [
  { key: 'imageUrl', label: t('common.image') || 'Фото' },
  { key: 'name', label: t('common.name') || 'Название', sortable: true },
  { key: 'basePrice', label: t('common.price') || 'Базовая цена', sortable: true },
  { key: 'inStock', label: t('common.status') || 'Статус' },
  { key: 'usage', label: t('catalog.usage') || 'Использование' },
  { key: 'actions', label: t('common.actions') || 'Действия' }
]
</script>

<style scoped lang="scss">
@use '@/assets/scss/variables' as *;

.catalog-table {
  background: $bg-primary;
  border-radius: $radius-lg;
  overflow: hidden;

  &__image {
    width: 48px;
    height: 48px;
    border-radius: $radius-md;
    overflow: hidden;
    background: $bg-secondary;
    border: 1px solid $border-light;
  }

  &__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-light;
    opacity: 0.5;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  &__price {
    font-weight: $font-weight-medium;
    color: $text-primary;
  }

  &__usage-badge {
    display: inline-flex;
    padding: $spacing-xs $spacing-sm;
    background: rgba($primary-color, 0.1);
    color: $primary-color;
    border-radius: $radius-full;
    font-size: $font-size-xs;
    font-weight: $font-weight-semibold;
  }

  &__status {
    font-size: $font-size-xs;
    font-weight: $font-weight-medium;
    padding: $spacing-xs $spacing-sm;
    border-radius: $radius-full;

    &--active {
      background: rgba($success-color, 0.1);
      color: $success-color;
    }

    &--inactive {
      background: rgba($error-color, 0.1);
      color: $error-color;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-sm;
  }

  &__action-btn {
    padding: $spacing-xs;
    color: $text-secondary;
    background: transparent;
    border: 1px solid transparent;
    border-radius: $radius-md;
    cursor: pointer;
    transition: all $transition-base;

    &:hover {
      background: rgba($primary-color, 0.1);
      color: $primary-color;
      border-color: rgba($primary-color, 0.2);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
