<template>
  <va-inner-loading :loading="roleStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">Quản lý vai trò</h1>

        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã, tên hoặc mô tả để tìm kiếm..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm vai trò"
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
          Thêm vai trò
        </va-button>
        <va-data-table
          :columns="columns"
          :items="roleList"
          hoverable
          class="custom-table"
          @filtered="filteredCount = $event.items.length"
        >
          <template #cell(id)="slotProps">
            role0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
          </template>
          <template #cell(active)="slotProps">
            <VaChip :color="slotProps.rowData.active ? '#3D9209' : '#E42222'">
              {{ slotProps.rowData.active ? 'Active' : 'Inactive' }}
            </VaChip>
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
        </va-data-table>

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
          <AddRole
            v-if="isShowAddModal"
            :role-data="roleData"
            @save-role="onSaveRole"
            @close-modal="onShowAddModal"
          />
        </VaModal>
        <VaModal v-model="isShowEditModal" hide-default-actions>
          <EditRole
            :role-data="selectedRoleForEdit!"
            @close-modal="onShowEditModal"
            @edit-role="handleEdit"
          />
        </VaModal>
        <VaModal v-model="isShowDetailModal" hide-default-actions @ok="onCloseDetailModal">
          <DetailRole :role-detail="selectedRoleForDetail!" @close-modal="onCloseDetailModal" />
        </VaModal>
        <VaModal v-model="isShowDeleteModal" hide-default-actions>
          <DeleteConfirm
            :title="'Cảnh báo xóa vai trò'"
            :message="`Bạn có muốn xóa vai trò ${selectedRoleForDelete?.name} không?`"
            @close-confirm="onCloseConfirm"
            @confirm="deleteRole"
          />
        </VaModal>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRoleStore } from '@/stores/role.store'
import {
  type CreateRoleRequest,
  type Role,
  type UpdateRoleRequest,
} from '@/interfaces/role.interface'
import { toast } from 'vue3-toastify'
import DetailRole from '@/components/role/DetailRole.vue'
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import AddRole from '@/components/role/AddRole.vue'
import EditRole from '@/components/role/EditRole.vue'

const roleStore = useRoleStore()
const roleList = ref<Role[]>([])
const isShowAddModal = ref(false)
const isShowDetailModal = ref(false)
const selectedRoleForDetail = ref<Role | null>(null)
const isShowEditModal = ref(false)
const selectedRoleForEdit = ref<Role | null>(null)
const isShowDeleteModal = ref(false)
const selectedRoleForDelete = ref<Role | null>(null)

const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  fetchInitData()
}
const handleSearch = async () => {
  currentPage.value = 1
  await performSearch()
}
const performSearch = async () => {
  const hasSearch = !!searchQuery.value
  if (hasSearch) {
    await roleStore.fetchAllRoles(currentPage.value - 1, 5, searchQuery.value)
    roleList.value = roleStore.roles
    total.value = roleStore.meta?.total || 0
    totalPages.value = roleStore.meta?.pages || 0
  } else {
    await fetchInitData()
  }
}
/**
 * Pagination
 */
const currentPage = ref(roleStore.meta?.page || 1)
const pageSize = ref(roleStore.meta?.pageSize || 5)
const total = ref(roleStore.meta?.total || 0)
const totalPages = ref(roleStore.meta?.pages || 0)
watch(currentPage, async () => {
  await performSearch()
})
/**==========END=========== */
/**
 * Filter
 */

const filteredCount = ref(roleList.value.length)

/**==========END=========== */
const columns = [
  { key: 'id', label: 'STT' },
  { key: 'name', label: 'Tên vai trò' },
  { key: 'description', label: 'Mô tả' },
  { key: 'active', label: 'trạng thái' },
  { key: 'actions', label: 'Hành động' },
]

onMounted(async () => {
  await fetchInitData()
})

const fetchInitData = async () => {
  await roleStore.fetchAllRoles(currentPage.value - 1, pageSize.value)
  roleList.value = roleStore.roles
  if (roleStore.meta) {
    currentPage.value = roleStore.meta.page
    pageSize.value = roleStore.meta.pageSize
    total.value = roleStore.meta.total
    totalPages.value = roleStore.meta.pages
  }
}
async function onPageChange(page: number) {
  currentPage.value = page
  await performSearch()
}
/**
 * ADD EVENT
 */
const roleData = reactive<CreateRoleRequest>({
  name: '',
  description: '',
  permissions: [],
})
function onShowAddModal() {
  isShowAddModal.value = !isShowAddModal.value
}
const onSaveRole = async (data: CreateRoleRequest) => {
  try {
    await roleStore.createRole(data)
    toast.success('Thêm vai trò thành công')
    isShowAddModal.value = false
    await fetchInitData()
  } catch (error: unknown) {
    toast.error(`Thêm vai trò thất bại: ${error.message}`)
  }
}
/**==========END=========== */
/**
 * DETAIL EVENT
 */
function onShowDetailModal(item: Role) {
  isShowDetailModal.value = !isShowDetailModal.value
  selectedRoleForDetail.value = item
}
function onCloseDetailModal() {
  isShowDetailModal.value = false
  selectedRoleForDetail.value = null
}
/**==========END=========== */
/**
 * EDIT EVENT
 */
function onShowEditModal(item: Role) {
  isShowEditModal.value = !isShowEditModal.value
  selectedRoleForEdit.value = item
}
const handleEdit = async (id: string, data: UpdateRoleRequest) => {
  if (!id) {
    toast.error('ID không được để trống')
    return
  } 
  try {
    await roleStore.updateRole(id, data)
    toast.success('Cập nhật vai trò thành công')
    isShowEditModal.value = false
    await fetchInitData()
  } catch (error: unknown) {
    toast.error(`Cập nhật vai trò thất bại: ${error.message}`)
  }
}
/**==========END=========== */
/**
 * DELETE EVENT
 */
function onShowDeleteModal(item: Role) {
  isShowDeleteModal.value = !isShowDeleteModal.value
  selectedRoleForDelete.value = item
}
function onCloseConfirm() {
  isShowDeleteModal.value = false
  selectedRoleForDelete.value = null
}
const deleteRole = async () => {
  try {
    if (selectedRoleForDelete.value) {
      await roleStore.deleteRole(selectedRoleForDelete.value.id!)
      toast.success('Xóa vai trò thành công')
      isShowDeleteModal.value = false
      await fetchInitData()
    }
  } catch (error: unknown) {
    toast.error(`Xóa vai trò thất bại: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**==========END=========== */
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
