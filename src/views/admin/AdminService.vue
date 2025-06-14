<template>
  <va-card>
    <va-card-content>
      <div class="justify-content-around my-3">
        <div class="my-3"><h1>Quản lý dịch vụ</h1></div>
        <div><va-button @click="onShowModalAdd">Thêm dịch vụ</va-button></div>
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
        <va-input
          v-model="searchQuery"
          placeholder="Nhập mã dịch vụ, tên, mô tả..."
          clearable
          class="filter-input"
          aria-label="Tìm kiếm dịch vụ theo tên"
        >
          <template #prependInner>
            <va-icon name="search" color="#718096" />
          </template>
        </va-input>

        <div class="filter-actions">
          <va-button preset="secondary" @click="resetFilters" class="action-button">
            Xóa bộ lọc
          </va-button>
          <va-button preset="primary" @click="handleSearch" class="action-button">
            Tìm kiếm
          </va-button>
        </div>
      </div>
      <VaDataTable :items="serviceList" :columns="columns" hoverable>
        <template #cell(actions)="slotProps">
          <VaButton
            preset="plain"
            icon="visibility"
            @click="onShowDetailModal(slotProps.rowData)"
          />
          <VaButton
            preset="plain"
            icon="edit"
            class="ml-3"
            @click="onShowEditModal(slotProps.rowData)"
          />
          <VaButton
            preset="plain"
            icon="delete"
            class="ml-3"
            @click="onShowDeleteModal(slotProps.rowData)"
          />
        </template>
      </VaDataTable>
      <div class="my-3 d-flex pagination-container">
        <VaPagination
          v-model="currentPage"
          :total="total"
          :pages="totalPages"
          :rows-per-page="pageSize"
          :rows-per-page-options="[5, 10, 20]"
          :visible-pages="5"
          class="mt-6"
          @update:modelValue="onPageChange"
        />
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
      <div class="d-flex">
        <VaAlert class="!mt-6" color="info" outline>
          Number of filtered items:
          <VaChip>{{ total <= 5 ? total : 5 }}</VaChip>
        </VaAlert>
        <VaAlert class="!mt-6" color="info" outline>
          Total items:
          <VaChip>{{ total }}</VaChip>
        </VaAlert>
      </div>
    </va-card-content>
  </va-card>
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
  { key: 'id', name: 'id', label: 'ID', field: 'id', sortable: true },
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
</script>

<style scoped lang="scss">
.pagination-container {
  justify-content: end;
  margin-top: 40px;
}
:deep(.va-data-table__table-thead) {
  background-color: #ecf0f1 !important; /* đổi màu header */
}
</style>
