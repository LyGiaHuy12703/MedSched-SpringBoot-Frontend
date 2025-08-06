<template>
  <va-inner-loading :loading="medicineStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">Quản lý dữ liệu thuốc</h1>

        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã thuốc, tên, mô tả..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm thuốc theo tên"
          >
            <template #prependInner>
              <va-icon name="search" color="text-gray-600" size="medium" />
            </template>
          </va-input>
          <va-button preset="secondary" @click="resetFilters" class="action-button px-6 py-2">
            Xóa bộ lọc
          </va-button>
          <va-button preset="primary" @click="handleSearch" class="action-button px-6 py-2">
            Tìm kiếm
          </va-button>
        </div>
        <va-button preset="primary" @click="onShowModalAdd" class="action-button px-6 py-2 mb-2">
          Thêm thuốc
        </va-button>
        <VaDataTable
          :items="medicineList"
          :columns="columns"
          hoverable
          class="custom-table"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="slotProps">
            med0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
          </template>
          <template #cell(actions)="slotProps">
            <div class="d-flex justify-center gap-2">
              <VaButton
                preset="primary"
                size="small"
                icon="visibility"
                @click="onShowDetailModal(slotProps.rowData)"
                class="action-button px-3 py-2"
                title="Xem chi tiết"
                >Xem chi tiết</VaButton
              >
              <VaButton
                preset="primary"
                size="small"
                color="warning"
                icon="edit"
                @click="onShowEditModal(slotProps.rowData)"
                class="action-button px-3 py-2"
                title="Chỉnh sửa"
                >Chỉnh sửa</VaButton
              >
              <VaButton
                preset="primary"
                color="danger"
                size="small"
                icon="delete"
                @click="onShowDeleteModal(slotProps.rowData)"
                class="action-button px-3 py-2"
                title="Xóa"
                >Xóa</VaButton
              >
            </div>
          </template>
        </VaDataTable>

        <div class="d-flex justify-end my-2 pagination-container">
          <VaPagination
            v-model="currentPage"
            :total="total"
            :pages="totalPages"
            :rows-per-page="pageSize"
            :rows-per-page-options="[5, 10, 20]"
            :visible-pages="5"
            class="custom-pagination"
            @update:modelValue="onPageChange"
          />
        </div>

        <div class="d-flex gap-4">
          <va-alert color="secondary" outline class="bg-blue-50 border-blue-200">
            Số mục đã lọc: <va-chip color="danger" outline>{{ filteredCount }}</va-chip>
          </va-alert>
          <va-alert color="secondary" outline class="bg-blue-50 border-blue-200">
            Tổng số mục: <va-chip color="danger" outline>{{ total }}</va-chip>
          </va-alert>
        </div>

        <va-modal v-model="isShowAddModal" hide-default-actions @close="onCloseModalAdd">
          <AddMedicine
            :medicineData="medicineData"
            @save-medicine="onSaveMedicine"
            @close-modal="onCloseModalAdd"
          />
        </va-modal>
        <va-modal v-model="isShowDetailModal" hide-default-actions @close="onCloseModalDetail">
          <DetailMedicine :medicine-data="selectedMedicine" @close-modal="onCloseModalDetail" />
        </va-modal>
        <va-modal v-model="showModalEdit" hide-default-actions @close="onCloseModalEdit">
          <EditMedicine
            :medicine-data="medicineDataEdit"
            @edit-medicine="onEditMedicine"
            @close="onCloseModalEdit"
          />
        </va-modal>
        <va-modal v-model="showModalDelete" hide-default-actions>
          <DeleteConfirm
            title="Cảnh báo xóa thuốc"
            message="Bạn có muốn xóa dữ liệu thuốc không?"
            @confirm="onDeleteMedicine"
            @close-confirm="onCloseModalDelete"
          />
        </va-modal>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<script setup lang="ts">
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import AddMedicine from '@/components/medicine/AddMedicine.vue'
import DetailMedicine from '@/components/medicine/DetailMedicine.vue'
import EditMedicine from '@/components/medicine/EditMedicine.vue'
import { type CreateMedicineRequest, type Medicine } from '@/interfaces/medicine.interface'
import { useMedicineStore } from '@/stores/medicine.store'
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

const medicineStore = useMedicineStore()
const medicineList = ref(medicineStore.medicines || [])
const columns = [
  { label: 'STT', value: 'id', key: 'id' },
  { label: 'Tên thuốc', value: 'name', key: 'name' },
  { label: 'Giá', value: 'price', key: 'price' },
  { label: 'Mô tả', value: 'description', key: 'description' },
  { label: 'Hành động', value: 'actions', key: 'actions', sortable: false },
]
const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchInitData()
  toast.info('Đã xóa bộ lọc tìm kiếm')
}
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch()
}
const performSearch = async () => {
  const hasSearch = !!searchQuery.value

  if (hasSearch) {
    await medicineStore.fetchMedicines(
      currentPage.value - 1,
      5,
      hasSearch ? searchQuery.value : undefined,
    )
    medicineList.value = medicineStore.medicines
    total.value = medicineStore.meta?.total || 0
    totalPages.value = medicineStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
/**
 * Pagination
 */
const currentPage = ref(medicineStore.meta?.page || 1)
const pageSize = ref(medicineStore.meta?.pageSize || 5)
const total = ref(medicineStore.meta?.total || 0)
const totalPages = ref(medicineStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})

/**==========END=========== */
/**
 * FILTER
 */
const filteredCount = ref(medicineList.value.length)

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
/**==========END=========== */

onMounted(async () => {
  await fetchInitData()
})

const fetchInitData = async () => {
  await medicineStore.fetchMedicines(currentPage.value - 1, 5)
  medicineList.value = medicineStore.medicines
  if (medicineStore.meta) {
    currentPage.value = medicineStore.meta.page
    pageSize.value = medicineStore.meta.pageSize
    total.value = medicineStore.meta.total
    totalPages.value = medicineStore.meta.pages
  }
}

/**
 * ADD EVENT HANDLERS
 */
const medicineData = ref<CreateMedicineRequest>({
  name: '',
  description: '',
  dosage: '',
  sideEffects: '',
  price: 0,
})
const isShowAddModal = ref(false)
const onShowModalAdd = () => {
  isShowAddModal.value = !isShowAddModal.value
}
const onCloseModalAdd = () => {
  isShowAddModal.value = false
}
const onSaveMedicine = async (data: CreateMedicineRequest) => {
  try {
    await medicineStore.addMedicine(data)
    toast.success('Thêm thuốc thành công!')
    isShowAddModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Thêm thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============ */
/**
 * DETAIL EVENT HANDLERS
 */
const isShowDetailModal = ref(false)
const selectedMedicine = ref<Medicine | null>(null)
const onShowDetailModal = (item: Medicine) => {
  selectedMedicine.value = item
  isShowDetailModal.value = true
}
const onCloseModalDetail = () => {
  isShowDetailModal.value = false
  selectedMedicine.value = null
}
/**===========END============= */
/**
 * EDIT EVENT HANDLERS
 */
const medicineDataEdit = ref<Medicine | null>(null)
const showModalEdit = ref(false)
const onShowEditModal = (item: Medicine) => {
  medicineDataEdit.value = item
  showModalEdit.value = true
}
const onCloseModalEdit = () => {
  showModalEdit.value = false
  selectedMedicine.value = null
}
const onEditMedicine = async (data: Medicine) => {
  if (!medicineDataEdit.value) return
  try {
    await medicineStore.updateMedicine(data.id, data)
    toast.success('Cập nhật thuốc thành công!')
    showModalEdit.value = false
    medicineDataEdit.value = null
    await fetchInitData()
  } catch (error) {
    toast.error(`Cập nhật thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============= */
/**
 * DELETE EVENT HANDLERS
 */
const showModalDelete = ref(false)
const onShowDeleteModal = (item: Medicine) => {
  selectedMedicine.value = item
  showModalDelete.value = true
}
const onCloseModalDelete = () => {
  showModalDelete.value = false
  selectedMedicine.value = null
}
const onDeleteMedicine = async () => {
  if (!selectedMedicine.value) return
  try {
    await medicineStore.deleteMedicine(selectedMedicine.value.id)
    toast.success('Xóa thuốc thành công!')
    showModalDelete.value = false
    selectedMedicine.value = null
    await fetchInitData()
  } catch (error) {
    toast.error(`Xóa thuốc thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============= */
</script>

<style scoped lang="scss">
.input-field {
  :deep(.va-input-wrapper) {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
    padding: 0.5rem;
    &:hover {
      border-color: var(--va-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
    }
  }
  :deep(.va-input-wrapper__field) {
    font-size: 1rem;
    color: #1e293b;
  }
}

.custom-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  :deep(.va-data-table__table) {
    border-collapse: separate;
    border-spacing: 0;
  }
  :deep(.va-data-table__table-thead) {
    background-color: #e5e7eb !important;
    th {
      font-weight: 600;
      color: #1e293b;
      padding: 1.25rem;
      border-bottom: 2px solid #d1d5db;
      text-transform: uppercase;
      font-size: 0.875rem;
    }
  }
  :deep(.va-data-table__table-row) {
    transition: background-color 0.3s ease;
    &:nth-child(even) {
      background-color: #f9fafb;
    }
    &:hover {
      background-color: #d1d5db !important;
    }
    td {
      padding: 1.25rem;
      border-bottom: 1px solid #e5e7eb;
      vertical-align: middle;
      font-size: 1rem;
    }
  }
}

.action-button {
  :deep(.va-button) {
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
  }
}

.pagination-container {
  justify-content: flex-end;
}

.custom-pagination {
  :deep(.va-pagination__item) {
    border-radius: 6px;
    margin: 0 2px;
    transition: all 0.3s ease;
    &:hover {
      background-color: #e5e7eb;
      transform: scale(1.1);
    }
    &.va-pagination__item--active {
      background-color: var(--va-primary);
      color: #ffffff;
    }
  }
}

.font-semibold {
  font-weight: 600;
}

.text-gray-500 {
  color: #6b7280;
}

.text-gray-600 {
  color: #4b5563;
}

.text-gray-700 {
  color: #374151;
}

.text-gray-800 {
  color: #1e293b;
}
:deep(.va-data-table__table-th) {
  --va-data-table-align: center !important;
}
</style>
