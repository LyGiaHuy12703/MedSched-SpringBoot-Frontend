<template>
  <va-inner-loading :loading="serviceStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">Quản lý dịch vụ</h1>

        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã dịch vụ, tên, mô tả..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm dịch vụ theo tên"
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

        <div class="d-flex gap-4 mb-6 align-center">
          <va-button preset="primary" @click="onShowModalAdd" class="action-button px-6 py-2">
            Thêm dịch vụ
          </va-button>
          <input
            ref="fileInput"
            type="file"
            accept=".xlsx"
            class="hidden"
            @change="onFileSelected"
          />
          <va-button preset="secondary" class="action-button px-6 py-2" @click="triggerFileInput">
            Import Excel
          </va-button>
          <span v-if="selectedFile" class="ml-2 text-gray-700">{{ selectedFile.name }}</span>
          <va-button
            preset="primary"
            class="action-button px-6 py-2"
            :disabled="!selectedFile"
            @click="submitImport"
          >
            Submit
          </va-button>
          <va-button
            preset="secondary"
            class="action-button px-6 py-2"
            @click="exportServicesToExcel"
          >
            Export Excel
          </va-button>
          <va-button preset="secondary" class="action-button px-6 py-2">
            <a
              href="/excel/data-services-frame.xlsx"
              download="template-import-services.xlsx"
              style="text-decoration: none; color: inherit"
            >
              Download Excel Template
            </a>
          </va-button>
        </div>

        <VaDataTable :items="serviceList" :columns="columns" hoverable class="custom-table mt-2">
          <template #cell(id)="slotProps">
            ser0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
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
                size="small"
                color="danger"
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

        <div class="d-flex gap-4 mt-6">
          <va-alert color="secondary" outline class="bg-blue-50 border-blue-200">
            Số mục đã lọc: <va-chip color="danger" outline>{{ total <= 5 ? total : 5 }}</va-chip>
          </va-alert>
          <va-alert color="secondary" outline class="bg-blue-50 border-blue-200">
            Tổng số mục: <va-chip color="danger" outline>{{ total }}</va-chip>
          </va-alert>
        </div>

        <va-modal v-model="isShowAddModal" hide-default-actions @close="onCloseModalAdd">
          <AddService
            :service-data="serviceData"
            @close-modal="onCloseModalAdd"
            @save-service="onAddService"
          />
        </va-modal>
        <va-modal v-model="isShowEditModal" hide-default-actions @close="onCloseModalEdit">
          <EditService
            :service-data="selectedService!"
            @close-modal="onCloseModalEdit"
            @edit-service="onEditService"
          />
        </va-modal>
        <va-modal v-model="isShowDetailModal" hide-default-actions @close="onCloseModalDetail">
          <DetailService :service-data="selectedService!" @close-modal="onCloseModalDetail" />
        </va-modal>
        <va-modal v-model="isShowDeleteModal" hide-default-actions @close="onCloseModalDelete">
          <DeleteConfirm
            title="Cảnh báo xóa dịch vụ"
            message="Bạn có chắc chắn muốn xóa dịch vụ không?"
            @confirm="onDeleteService"
            @close-confirm="onCloseModalDelete"
          />
        </va-modal>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<script setup lang="ts">
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import AddService from '@/components/services/AddService.vue'
import DetailService from '@/components/services/DetailService.vue'
import EditService from '@/components/services/EditService.vue'
import type { Service, ServiceRequest } from '@/interfaces/service.interfaces'
import { useServiceStore } from '@/stores/service.store'
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

const serviceStore = useServiceStore()
const serviceList = ref(serviceStore.services || [])
const columns = ref([
  { key: 'id', name: 'id', label: 'STT', field: 'id', sortable: true },
  { key: 'name', name: 'name', label: 'Tên dịch vụ', field: 'name' },
  { key: 'description', name: 'description', label: 'Mô tả', field: 'description' },
  { key: 'price', name: 'price', label: 'Giá', field: 'price', sortable: true },
  { key: 'actions', name: 'actions', label: 'Hành động', field: 'actions', sortable: false },
])
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
    await serviceStore.fetchServices(
      currentPage.value - 1,
      5,
      hasSearch ? searchQuery.value : undefined,
    )
    serviceList.value = serviceStore.services
    total.value = serviceStore.meta?.total || 0
    totalPages.value = serviceStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
/**
 * Pagination
 */
const currentPage = ref(serviceStore.meta?.page || 1)
const pageSize = ref(serviceStore.meta?.pageSize || 5)
const total = ref(serviceStore.meta?.total || 0)
const totalPages = ref(serviceStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}

onMounted(async () => {
  serviceStore.meta = {
    page: 0,
    pageSize: 5,
    total: 0,
    pages: 0,
  }
  await fetchInitData()
})
const fetchInitData = async () => {
  await serviceStore.fetchServices(currentPage.value - 1, 5)
  serviceList.value = serviceStore.services
  total.value = serviceStore.meta?.total || 0
  totalPages.value = serviceStore.meta?.pages || 0
}

// Modal visibility states
const isShowAddModal = ref(false)
const isShowEditModal = ref(false)
const isShowDetailModal = ref(false)
const isShowDeleteModal = ref(false)

// Selected service for edit/detail/delete
const selectedService = ref<Service | null>(null)

// Modal open handlers
function onShowModalAdd() {
  isShowAddModal.value = true
}
function onShowEditModal(service: Service) {
  selectedService.value = service
  isShowEditModal.value = true
}
function onShowDetailModal(service: Service) {
  selectedService.value = service
  isShowDetailModal.value = true
}
function onShowDeleteModal(service: Service) {
  selectedService.value = service
  isShowDeleteModal.value = true
}

// Modal close handlers
function onCloseModalAdd() {
  isShowAddModal.value = false
}
function onCloseModalEdit() {
  isShowEditModal.value = false
}
function onCloseModalDetail() {
  isShowDetailModal.value = false
}
function onCloseModalDelete() {
  isShowDeleteModal.value = false
}
/**
 * ADD SERVICE
 */
const serviceData = ref<ServiceRequest>({
  name: '',
  description: '',
  price: 0,
})
async function onAddService(service: ServiceRequest) {
  try {
    await serviceStore.addService(service)
    toast.success('Thêm dịch vụ thành công!')
    isShowAddModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Thêm dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**
 * EDIT SERVICE
 */
async function onEditService(service: ServiceRequest) {
  try {
    await serviceStore.updateService(selectedService.value!.id, service)
    toast.success('Cập nhật dịch vụ thành công!')
    isShowEditModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Cập nhật dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**
 * DELETE SERVICE
 */
async function onDeleteService() {
  if (!selectedService.value) return
  try {
    await serviceStore.deleteService(selectedService.value.id)
    toast.success('Xóa dịch vụ thành công!')
    isShowDeleteModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Xóa dịch vụ thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
  selectedService.value = null
}
/**
 * EXPORT EXCEL
 */
async function exportServicesToExcel() {
  try {
    await serviceStore.exportExcel()
    toast.success('Xuất Excel thành công!')
  } catch (error) {
    toast.error(error.message)
  }
}
/**
 * IMPORT EXCEL
 */
const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}
// Lưu file khi người dùng chọn
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const submitImport = async () => {
  if (!selectedFile.value) return

  try {
    const res = await serviceStore.importExcel(selectedFile.value)
    if (res.success) {
      toast.success('Import thành công')
      selectedFile.value = null
      await fetchInitData()
    } else {
      toast.error('Import thất bại!')
    }
  } catch (err) {
    toast.error('Lỗi khi import:', err)
  }
}
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
