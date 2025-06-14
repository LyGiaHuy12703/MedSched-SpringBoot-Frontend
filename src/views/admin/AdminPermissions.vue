<template>
  <va-card>
    <va-card-content>
      <div class="justify-content-around my-3">
        <div class="my-3"><h1>Quản lý quyền hạn</h1></div>
        <div><va-button @click="onShowAddModal">Thêm quyền hạn</va-button></div>
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
        <va-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo tên, đường dẫn, module, phương thức..."
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

      <VaDataTable
        :items="permissionList"
        :columns="columns"
        hoverable
        @filtered="filteredCount = $event.items.length"
      >
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
  { key: 'id', label: 'ID' },
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
  await permissionStore.fetchPermissions(currentPage.value - 1, pageSize.value)
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
.pagination-container {
  justify-content: end;
  margin-top: 40px;
}
:deep(.va-data-table__table-thead) {
  background-color: #ecf0f1 !important; /* đổi màu header */
}
</style>
