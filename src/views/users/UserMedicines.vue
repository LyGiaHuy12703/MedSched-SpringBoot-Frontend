```vue
<template>
  <div class="find-medicine-page">
    <h1 class="page-title">Tìm Kiếm Thuốc</h1>

    <!-- Filters -->
    <va-card class="filters-card" outlined>
      <va-card-content>
        <div class="filters-row">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập tên thuốc..."
            clearable
            class="filter-input"
            aria-label="Tìm kiếm thuốc theo tên"
          >
            <template #prependInner>
              <va-icon name="search" color="#718096" />
            </template>
          </va-input>
          <va-select
            v-model="selectedTherapeuticGroup"
            label="Chọn nhóm điều trị"
            :options="therapeuticGroups.map((group) => ({ value: group, text: group }))"
            clearable
            class="filter-select"
            value-by="value"
            text-by="text"
            aria-label="Chọn nhóm điều trị"
          />
          <div class="filter-actions">
            <va-button preset="secondary" @click="resetFilters" class="action-button">
              Xóa bộ lọc
            </va-button>
            <va-button preset="primary" @click="performSearch" class="action-button">
              Tìm kiếm
            </va-button>
          </div>
        </div>
      </va-card-content>
    </va-card>

    <!-- Medicines List -->
    <va-inner-loading :loading="medicineStore.loading">
      <div v-if="medicines.length" class="medicines-grid">
        <div v-for="medicine in medicines" :key="medicine.id" class="medicine-card">
          <div class="medicine-content">
            <h2 class="medicine-name">{{ medicine.name }}</h2>
            <p class="medicine-description">{{ truncateText(medicine.description, 80) }}</p>
            <p class="medicine-info">
              <span class="label">Nhóm điều trị:</span>
              {{ medicine.therapeuticGroup || 'Chưa có thông tin' }}
            </p>
            <p class="medicine-info">
              <span class="label">Giá:</span>
              {{ medicine.price ? `${medicine.price.toLocaleString()} VNĐ` : 'Chưa có thông tin' }}
            </p>
            <va-button
              preset="primary"
              class="view-details-button"
              @click="openDetailsModal(medicine)"
              aria-label="Xem chi tiết thuốc"
            >
              Xem chi tiết
            </va-button>
          </div>
        </div>
      </div>
      <div v-else class="no-results">
        <va-icon name="sentiment_dissatisfied" size="large" color="#718096" />
        <p>Không tìm thấy thuốc nào phù hợp. Vui lòng thử lại với bộ lọc khác.</p>
      </div>
      <div class="pagination-container">
        <va-pagination
          v-model="currentPage"
          :total="total"
          :pages="totalPages"
          :rows-per-page="pageSize"
          :rows-per-page-options="[5, 10, 20]"
          :visible-pages="5"
          @update:modelValue="onPageChange"
          aria-label="Phân trang danh sách thuốc"
        />
      </div>
    </va-inner-loading>

    <!-- Modal chi tiết thuốc -->
    <va-modal v-model="showModal" hide-default-actions size="large" class="medicine-modal">
      <MedicineDetail
        v-if="selectedMedicine"
        :medicine="selectedMedicine"
        class="modal-content"
        @close="handleShowModal"
      />
    </va-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import {
  VaCard,
  VaCardContent,
  VaInput,
  VaSelect,
  VaButton,
  VaIcon,
  VaInnerLoading,
  VaPagination,
  VaModal,
} from 'vuestic-ui'
import type { Medicine } from '@/interfaces/medicine.interface'
import { useMedicineStore } from '@/stores/medicine.store'
import MedicineDetail from '@/components/client/MedicineDetail.vue'

const medicineStore = useMedicineStore()

// Pagination
const currentPage = ref(medicineStore.meta?.page || 1)
const pageSize = ref(medicineStore.meta?.pageSize || 6)
const total = ref(medicineStore.meta?.total || 0)
const totalPages = ref(medicineStore.meta?.pages || 0)

// State
const medicines = ref<Medicine[]>([])
const therapeuticGroups = ref<string[]>(['Giảm đau', 'Kháng sinh', 'Hạ sốt', 'Tiêu hóa'])
const searchQuery = ref('')
const selectedTherapeuticGroup = ref('')
const showModal = ref(false)
const selectedMedicine = ref<Medicine | null>(null)

onMounted(async () => {
  medicineStore.meta = {
    page: 1,
    pageSize: 6,
    total: 0,
    pages: 0,
  }
  await fetchInitData()
})

async function fetchInitData() {
  await medicineStore.fetchMedicines(currentPage.value - 1, pageSize.value)
  medicines.value = medicineStore.medicines
  total.value = medicineStore.meta?.total || 0
  totalPages.value = medicineStore.meta?.pages || 0
}

const performSearch = async () => {
  const hasSearch = !!searchQuery.value
  const hasGroup = !!selectedTherapeuticGroup.value

  if (hasSearch || hasGroup) {
    await medicineStore.fetchMedicines(
      0,
      pageSize.value,
      hasGroup ? selectedTherapeuticGroup.value : undefined,
      hasSearch ? searchQuery.value : undefined,
    )
    medicines.value = medicineStore.medicines
    total.value = medicineStore.meta?.total || 0
    totalPages.value = medicineStore.meta?.pages || 0
    toast.info('Đã tìm kiếm thuốc')
  } else {
    await fetchInitData()
  }
}

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedTherapeuticGroup.value = ''
  currentPage.value = 1
  fetchInitData()
  toast.info('Đã xóa bộ lọc tìm kiếm')
}

const openDetailsModal = (medicine: Medicine) => {
  selectedMedicine.value = medicine
  showModal.value = true
}

const formatDate = (date?: string) => {
  if (!date) return 'Chưa có thông tin'
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
const handleShowModal = () => {
  showModal.value = false
  selectedMedicine.value = null
}
const truncateText = (text?: string, maxLength: number = 100) => {
  if (!text) return 'Chưa có thông tin'
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text
}
</script>

<style lang="scss" scoped>
.find-medicine-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;

  .page-title {
    font-size: 2rem;
    font-weight: 700;
    color: #2d3748;
    text-align: center;
    margin-bottom: 2rem;
  }

  .filters-card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    margin-bottom: 2rem;
  }

  .filters-row {
    display: grid;
    grid-template-columns: 2fr 1fr auto;
    gap: 1rem;
    align-items: flex-end;

    .filter-input,
    .filter-select {
      min-width: 0;

      :deep(.va-input-wrapper__content),
      :deep(.va-select__content) {
        border-radius: 8px;
        border: 1px solid #e2e8f0;
        transition: border-color 0.3s ease;

        &:hover {
          border-color: #4fd1c5;
        }
      }
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;

      .action-button {
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
        transition: all 0.3s ease;

        &.va-button--preset-primary {
          background: #4fd1c5;
          &:hover {
            background: #3bada1;
          }
        }

        &.va-button--preset-secondary {
          border: 1px solid #e2e8f0;
          &:hover {
            background: #f7fafc;
          }
        }
      }
    }
  }

  .medicines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;

    .medicine-card {
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
      }

      .medicine-content {
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;

        .medicine-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #2d3748;
          line-height: 1.4;
        }

        .medicine-description {
          font-size: 0.875rem;
          color: #718096;
          line-height: 1.5;
        }

        .medicine-info {
          font-size: 0.875rem;
          color: #4a5568;

          .label {
            font-weight: 500;
            color: #2d3748;
            margin-right: 0.5rem;
          }
        }

        .view-details-button {
          margin-top: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          background: #4fd1c5;
          font-size: 0.875rem;
          transition: background 0.3s ease;

          &:hover {
            background: #3bada1;
          }
        }
      }
    }
  }

  .no-results {
    text-align: center;
    padding: 3rem 0;
    color: #718096;

    .va-icon {
      margin-bottom: 1rem;
    }

    p {
      font-size: 1rem;
      margin: 0;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;

    :deep(.va-pagination) {
      .va-button {
        border-radius: 6px;
        padding: 0.5rem;
        font-size: 0.9rem;

        &.va-button--active {
          background: #4fd1c5;
          color: #ffffff;
        }
      }
    }
  }

  .medicine-modal {
    :deep(.va-modal__dialog) {
      border-radius: 12px;
      max-width: 800px;
    }

    .modal-content {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .modal-section {
        border-bottom: 1px solid #e2e8f0;
        padding-bottom: 1rem;

        &:last-child {
          border-bottom: none;
        }

        .modal-section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 0.75rem;
        }

        p {
          font-size: 0.875rem;
          color: #4a5568;
          margin: 0.5rem 0;

          strong {
            color: #2d3748;
            margin-right: 0.5rem;
          }
        }
      }
    }

    :deep(.va-modal__footer) {
      padding: 1rem;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: flex-end;

      .va-button {
        padding: 0.5rem 1.5rem;
        border-radius: 8px;
      }
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .filters-row {
      grid-template-columns: 1fr;
      gap: 1rem;

      .filter-actions {
        justify-content: flex-end;
      }
    }

    .medicines-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .filters-card {
      padding: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
    }

    .medicine-card {
      .medicine-content {
        padding: 1rem;
      }
    }
  }
}
</style>
```
