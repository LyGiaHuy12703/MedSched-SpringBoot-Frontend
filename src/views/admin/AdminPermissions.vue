<template>
  <va-inner-loading :loading="permissionStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">Quản lý quyền hạn</h1>

        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên, đường dẫn, module, phương thức..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm quyền hạn"
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
        <va-button preset="primary" @click="onShowAddModal" class="action-button px-6 py-2 mb-2">
          Thêm quyền hạn
        </va-button>
        <VaDataTable
          :items="permissionList"
          :columns="columns"
          hoverable
          class="custom-table"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="slotProps">
            per0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
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
                icon="edit"
                color="warning"
                @click="onShowEditModal(slotProps.rowData)"
                class="action-button px-3 py-2"
                title="Chỉnh sửa"
                >Chỉnh sửa</VaButton
              >
              <VaButton
                preset="primary"
                size="small"
                icon="delete"
                color="danger"
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
            Số mục đã lọc: <va-chip color="danger" outline>{{ filteredCount }}</va-chip>
          </va-alert>
          <va-alert color="secondary" outline class="bg-blue-50 border-blue-200">
            Tổng số mục: <va-chip color="danger" outline>{{ total }}</va-chip>
          </va-alert>
        </div>

        <VaModal v-model="isShowAddModal" hide-default-actions>
          <AddPermission
            v-if="isShowAddModal"
            :permissionData="permissionData"
            @save-permission="onSavePermission"
            @close-modal="onShowAddModal"
          />
        </VaModal>
        <VaModal v-model="isShowEditModal" hide-default-actions>
          <EditPermission
            v-if="isShowEditModal && selectedPermissionForEdit"
            :permissionData="selectedPermissionForEdit!"
            @edit-permission="onChangePermission"
            @close-modal="onShowEditModal"
          />
        </VaModal>
        <VaModal v-model="isShowDetailModal" hide-default-actions @ok="onCloseDetailModal">
          <DetailPermission
            v-if="isShowDetailModal && selectedPermissionForDetail"
            :permissionDetail="selectedPermissionForDetail!"
            @close-modal="onCloseDetailModal"
          />
        </VaModal>
        <VaModal v-model="isShowDeleteModal" hide-default-actions>
          <DeleteConfirm
            :title="'Cảnh báo xóa quyền hạn'"
            :message="'Bạn có muốn xóa quyền hạn không?'"
            @close-confirm="onCloseConfirm"
            @confirm="deletePermission"
          />
        </VaModal>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { usePermissionStore } from '@/stores/permission.store'
import type { CreatePermissionRequest, Permission } from '@/interfaces/permission.interface'
import { toast } from 'vue3-toastify'
import DetailPermission from '@/components/permission/DetailPermission.vue'
import AddPermission from '@/components/permission/AddPermission.vue'
import EditPermission from '@/components/permission/EditPermission.vue'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

const permissionStore = usePermissionStore()
const permissionList = ref<Permission[]>([])
const isShowAddModal = ref(false)
const isShowDetailModal = ref(false)
const selectedPermissionForDetail = ref<Permission | null>(null)
const isShowEditModal = ref(false)
const selectedPermissionForEdit = ref<Permission | null>(null)
const isShowDeleteModal = ref(false)
const selectedPermissionForDelete = ref<Permission | null>(null)

/**
 * Pagination
 */
const currentPage = ref(permissionStore.meta?.page || 1)
const pageSize = ref(permissionStore.meta?.pageSize || 5)
const total = ref(permissionStore.meta?.total || 0)
const totalPages = ref(permissionStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})

/**==========END=========== */

const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchPermissionData()
  toast.info('Đã xóa bộ lọc tìm kiếm')
}
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch()
}
const performSearch = async () => {
  const hasSearch = !!searchQuery.value
  if (hasSearch) {
    await permissionStore.fetchPermissions(currentPage.value - 1, 5, searchQuery.value)
    permissionList.value = permissionStore.permissions
    total.value = permissionStore.meta?.total || 0
    totalPages.value = permissionStore.meta?.pages || 0
  } else {
    await fetchPermissionData()
  }
}
const filteredCount = ref(permissionList.value.length)

const columns = [
  { key: 'id', label: 'STT' },
  { key: 'name', label: 'Tên quyền hạn' },
  { key: 'apiPath', label: 'Đường dẫn API' },
  { key: 'module', label: 'Module' },
  { key: 'method', label: 'Phương thức' },
  { key: 'actions', label: 'Hành động', sortable: false },
]

onMounted(async () => {
  await fetchPermissionData()
})

async function fetchPermissionData() {
  await permissionStore.fetchPermissions(currentPage.value - 1, 5)
  permissionList.value = permissionStore.permissions
  if (permissionStore.meta) {
    currentPage.value = permissionStore.meta.page
    pageSize.value = permissionStore.meta.pageSize
    total.value = permissionStore.meta.total
    totalPages.value = permissionStore.meta.pages
  }
}

async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
/**========ADD EVENT======= */
const permissionData = reactive<CreatePermissionRequest>({
  name: '',
  module: '',
  apiPath: '',
  method: '',
})

function onShowAddModal() {
  isShowAddModal.value = !isShowAddModal.value
}

const onSavePermission = async (data: CreatePermissionRequest) => {
  try {
    await permissionStore.addPermission(data)
    toast.success('Thêm quyền hạn thành công')
    isShowAddModal.value = false
    await fetchPermissionData()
  } catch (error: unknown) {
    toast.error(`Thêm quyền hạn thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**=========DETAIL EVENT============== */
function onShowDetailModal(item: Permission) {
  isShowDetailModal.value = !isShowDetailModal.value
  selectedPermissionForDetail.value = item
}
function onCloseDetailModal() {
  isShowDetailModal.value = false
  selectedPermissionForDetail.value = null
}
/**========END============= */
/**=========EDIT EVENT============== */
function onShowEditModal(item: Permission) {
  isShowEditModal.value = !isShowEditModal.value
  selectedPermissionForEdit.value = item
}
const onChangePermission = async (data: Permission) => {
  try {
    await permissionStore.updatePermission(data.id!, data)
    toast.success('Cập nhật quyền hạn thành công')
    isShowEditModal.value = false
    await fetchPermissionData()
  } catch (error: unknown) {
    toast.error(`Cập nhật quyền hạn thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**=========END============= */
/**=========DELETE EVENT============== */
function onShowDeleteModal(item: Permission) {
  isShowDeleteModal.value = !isShowDeleteModal.value
  selectedPermissionForDelete.value = item
}
function onCloseConfirm() {
  isShowDeleteModal.value = false
  selectedPermissionForDelete.value = null
}
const deletePermission = async () => {
  try {
    if (selectedPermissionForDelete.value) {
      await permissionStore.deletePermission(selectedPermissionForDelete.value.id!)
      toast.success('Xóa quyền hạn thành công')
      isShowDeleteModal.value = false
      await fetchPermissionData()
    }
  } catch (error: unknown) {
    toast.error(`Xóa quyền hạn thất bại: ${error.message || 'Lỗi không xác định'}`)
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
