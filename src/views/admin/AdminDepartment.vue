<template>
  <va-card>
    <va-card-content>
      <div class="justify-content-around my-3">
        <div class="my-3"><h1>Quản lý bộ phận (Khoa)</h1></div>
        <div><va-button @click="onShowModalAdd">Thêm bộ phận</va-button></div>
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
        <va-input
          v-model="searchQuery"
          placeholder="Nhập mã bộ phận, tên, mô tả..."
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
      <VaDataTable :items="departmentList" :columns="columns" hoverable>
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
  { key: 'id', name: 'id', label: 'ID', field: 'id', sortable: true },
  { key: 'name', name: 'name', label: 'Tên bộ phận', field: 'name' },
  { key: 'description', name: 'description', label: 'Mô tả', field: 'description' },
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
async function onEditDepartment(department: DepartmentRequest) {
  try {
    await departmentStore.updateDepartment(selectedDepartment.value!.id, department)
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
.pagination-container {
  justify-content: end;
  margin-top: 40px;
}
:deep(.va-data-table__table-thead) {
  background-color: #ecf0f1 !important; /* đổi màu header */
}
</style>
