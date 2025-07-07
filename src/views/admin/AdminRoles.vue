<template>
  <va-inner-loading :loading="roleStore.loading">
    <va-card>
      <va-card-content>
        <div class="justify-content-around my-3">
          <div class="my-3"><h1>Quản lý vai trò</h1></div>
          <div><va-button @click="onShowAddModal">Thêm vai trò</va-button></div>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
          <va-input
            v-model="searchQuery"
            placeholder="Nhập mã, tên hoặc mô tả để tìm kiếm..."
            clearable
            class="filter-input"
            aria-label="Tìm kiếm bác sĩ theo tên"
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
        <va-data-table
          :columns="columns"
          :items="roleList"
          hoverable
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
        </va-data-table>
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

        <div class="d-flex">
          <VaAlert class="!mt-6" color="info" outline>
            Number of filtered items:
            <VaChip>{{ filteredCount }}</VaChip>
          </VaAlert>
          <VaAlert class="!mt-6" color="info" outline>
            Total items:
            <VaChip>{{ total }}</VaChip>
          </VaAlert>
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>
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
    console.error('ID is missing or undefined', id)
    toast.error('ID không được để trống')
    return
  } else {
    console.log('oke', data, id)
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
:deep(.va-data-table__table-thead) {
  background-color: #ecf0f1 !important; /* đổi màu header */
}
.pagination-container {
  justify-content: end;
}
</style>
