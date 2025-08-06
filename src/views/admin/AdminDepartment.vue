<template>
  <va-inner-loading :loading="departmentStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">
          Quản lý bộ phận (Khoa)
        </h1>

        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã bộ phận, tên, mô tả..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm bộ phận theo tên"
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
        <div class="justify-end mb-2">
          <va-button preset="primary" @click="onShowModalAdd" class="action-button px-6 py-2">
            Thêm bộ phận
          </va-button>
        </div>
        <VaDataTable :items="departmentList" :columns="columns" hoverable class="custom-table">
          <template #cell(id)="slotProps">
            dept0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
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

        <div class="d-flex justify-end mt-6 pagination-container my-2">
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
          <AddDepartment
            :department-data="departmentData"
            @close-modal="onCloseModalAdd"
            @save-department="onAddDepartment"
          />
        </va-modal>
        <va-modal v-model="isShowEditModal" hide-default-actions @close="onCloseModalEdit">
          <EditDepartment
            :department-data="selectedDepartment!"
            @close-modal="onCloseModalEdit"
            @edit-department="onEditDepartment"
          />
        </va-modal>
        <va-modal v-model="isShowDetailModal" hide-default-actions @close="onCloseModalDetail">
          <DetailDepartment
            :department-data="selectedDepartment!"
            @close-modal="onCloseModalDetail"
          />
        </va-modal>
        <va-modal v-model="isShowDeleteModal" hide-default-actions @close="onCloseModalDelete">
          <DeleteConfirm
            title="Cảnh báo xóa bộ phận"
            message="Bạn có chắc chắn muốn xóa bộ phận không?"
            @confirm="onDeleteDepartment"
            @close-confirm="onCloseModalDelete"
          />
        </va-modal>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<script setup lang="ts">
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import AddDepartment from '@/components/department/AddDepartment.vue'
import DetailDepartment from '@/components/department/DetailDepartment.vue'
import EditDepartment from '@/components/department/EditDepartment.vue'
import type { Department, DepartmentRequest } from '@/interfaces/department.interface'
import { useDepartmentStore } from '@/stores/department.store'
import { onMounted, ref, watch } from 'vue'
import { toast } from 'vue3-toastify'

const departmentStore = useDepartmentStore()
const departmentList = ref(departmentStore.departments || [])
const columns = ref([
  { key: 'id', name: 'id', label: 'STT', field: 'id', sortable: true },
  { key: 'name', name: 'name', label: 'Tên bộ phận', field: 'name' },
  { key: 'description', name: 'description', label: 'Mô tả', field: 'description' },
  {
    key: 'examinationTime',
    name: 'examinationTime',
    label: 'Thời gian khám chữa bệnh',
    field: 'examinationTime',
  },
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
    await departmentStore.fetchDepartments(
      currentPage.value - 1,
      5,
      hasSearch ? searchQuery.value : undefined,
    )
    departmentList.value = departmentStore.departments
    total.value = departmentStore.meta?.total || 0
    totalPages.value = departmentStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
/**
 * Pagination
 */
const currentPage = ref(departmentStore.meta?.page || 1)
const pageSize = ref(departmentStore.meta?.pageSize || 5)
const total = ref(departmentStore.meta?.total || 0)
const totalPages = ref(departmentStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})

/**==========END=========== */

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
/**==========END=========== */
onMounted(async () => {
  departmentStore.meta = {
    page: 0,
    pageSize: 5,
    total: 0,
    pages: 0,
  }
  await fetchInitData()
})
const fetchInitData = async () => {
  await departmentStore.fetchDepartments(currentPage.value - 1, 5)
  departmentList.value = departmentStore.departments
  total.value = departmentStore.meta?.total || 0
  totalPages.value = departmentStore.meta?.pages || 0
}

// Modal visibility states
const isShowAddModal = ref(false)
const isShowEditModal = ref(false)
const isShowDetailModal = ref(false)
const isShowDeleteModal = ref(false)

// Selected department for edit/detail/delete
const selectedDepartment = ref<Department | null>(null)

// Modal open handlers
function onShowModalAdd() {
  isShowAddModal.value = true
}
function onShowEditModal(department: Department) {
  selectedDepartment.value = department
  isShowEditModal.value = true
}
function onShowDetailModal(department: Department) {
  selectedDepartment.value = department
  isShowDetailModal.value = true
}
function onShowDeleteModal(department: Department) {
  selectedDepartment.value = department
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
 * ADD DEPARTMENT
 */
const departmentData = ref<DepartmentRequest>({
  name: '',
  description: '',
  examinationTime: 0,
  serviceId: [],
})
async function onAddDepartment(department: DepartmentRequest) {
  try {
    await departmentStore.addDepartment(department)
    toast.success('Thêm bộ phận thành công!')
    isShowAddModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Thêm bộ phận thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**========END ============= */
/**
 * EDIT DEPARTMENT
 */
async function onEditDepartment(id: string, request: DepartmentRequest) {
  try {
    await departmentStore.updateDepartment(id, request)
    toast.success('Cập nhật bộ phận thành công!')
    isShowEditModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Cập nhật bộ phận thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**========END ============= */
/**
 * DELETE DEPARTMENT
 */
async function onDeleteDepartment() {
  if (!selectedDepartment.value) return
  try {
    await departmentStore.deleteDepartment(selectedDepartment.value.id)
    toast.success('Xóa bộ phận thành công!')
    isShowDeleteModal.value = false
    await fetchInitData()
  } catch (error) {
    toast.error(`Xóa bộ phận thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
  selectedDepartment.value = null
}
/**=========END============ */
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
