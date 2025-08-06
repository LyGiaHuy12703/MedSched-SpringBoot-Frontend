<script setup lang="ts">
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import DetailStaff from '@/components/staff/DetailStaff.vue'
import DetailUser from '@/components/users/DetailUser.vue'
import { type Staff } from '@/interfaces/staff.interface'
import type { RequestUpdateStatusUser, User } from '@/interfaces/user.interface'
import { useStaffStore } from '@/stores/staff.store'
import { useUserStore } from '@/stores/users.store'
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

const activeTab = ref('users')
const router = useRouter()
const userStore = useUserStore()
const staffStore = useStaffStore()
const staffs = ref<Staff[]>([])
const users = ref<User[]>([])
const columns = [
  { key: 'id', label: 'STT', width: '60px' },
  { key: 'name', label: 'Họ & tên' },
  { key: 'email', label: 'Email' },
  { key: 'age', label: 'Tuổi', width: '80px' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'avatar', label: 'Ảnh đại diện' },
  { key: 'active', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', sortable: false },
]
const columnsStaffTable = [
  { key: 'id', label: 'STT', width: '60px' },
  { key: 'name', label: 'Họ & tên' },
  { key: 'email', label: 'Email' },
  { key: 'roles', label: 'Vai trò' },
  { key: 'avatar', label: 'Ảnh đại diện' },
  { key: 'active', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', sortable: false },
]

/**
 * Pagination
 */
const currentPage = ref(userStore.meta?.page || 1)
const pageSize = ref(userStore.meta?.pageSize || 5)
const total = ref(userStore.meta?.total || 0)
const totalPages = ref(userStore.meta?.pages || 0)
const currentPageStaff = ref(staffStore.meta?.page || 1)
const pageSizeStaff = ref(staffStore.meta?.pageSize || 5)
const totalStaff = ref(staffStore.meta?.total || 0)
const totalPagesStaff = ref(staffStore.meta?.pages || 0)
watch(currentPage, async () => {
  await fetchAllUsers()
})
watch(currentPageStaff, async () => {
  await fetchAllStaffs()
})
watch(activeTab, async () => {
  currentPage.value = 1
  currentPageStaff.value = 1

  if (userStore.meta) {
    pageSize.value = userStore.meta.pageSize
    total.value = userStore.meta.total
    totalPages.value = userStore.meta.pages
  } else {
    pageSize.value = 5
    total.value = 0
    totalPages.value = 0
  }
  if (staffStore.meta) {
    pageSizeStaff.value = staffStore.meta.pageSize
    totalStaff.value = staffStore.meta.total
    totalPagesStaff.value = staffStore.meta.pages
  } else {
    pageSizeStaff.value = 5
    totalStaff.value = 0
    totalPagesStaff.value = 0
  }

  if (activeTab.value === 'users') {
    await fetchAllUsers()
  } else {
    await fetchAllStaffs()
  }
})
async function fetchAllUsers() {
  await userStore.fetchUsers(currentPage.value - 1, 5)
  users.value = userStore.users
  if (userStore.meta) {
    currentPage.value = userStore.meta.page
    pageSize.value = userStore.meta.pageSize
    total.value = userStore.meta.total
    totalPages.value = userStore.meta.pages
  }
}
async function fetchAllStaffs() {
  await staffStore.fetchAllStaffs(currentPageStaff.value - 1, 5)
  staffs.value = staffStore.staffs
  if (staffStore.meta) {
    currentPageStaff.value = staffStore.meta.page
    pageSizeStaff.value = staffStore.meta.pageSize
    totalStaff.value = staffStore.meta.total
    totalPagesStaff.value = staffStore.meta.pages
  }
}
onMounted(async () => {
  await fetchAllUsers()
  await fetchAllStaffs()
})
async function onPageChange(page: number) {
  if (activeTab.value === 'users') {
    currentPage.value = page
    await fetchAllUsers()
  } else {
    currentPageStaff.value = page
    await fetchAllStaffs()
  }
}

/**
 * Filter
 */
const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  currentPageStaff.value = 1
  if (activeTab.value === 'users') {
    fetchAllUsers()
  } else {
    fetchAllStaffs()
  }
  toast.info('Đã xóa bộ lọc tìm kiếm')
}
const handleSearch = async () => {
  currentPage.value = 1
  currentPageStaff.value = 1
  await performSearch()
}
const performSearch = async () => {
  const hasSearch = !!searchQuery.value
  if (hasSearch) {
    if (activeTab.value === 'users') {
      await userStore.fetchUsers(currentPage.value - 1, 5, searchQuery.value)
      users.value = userStore.users
      total.value = userStore.meta?.total || 0
      totalPages.value = userStore.meta?.pages || 0
    } else {
      await staffStore.fetchAllStaffs(currentPage.value - 1, 5, undefined, searchQuery.value)
      staffs.value = staffStore.staffs
      totalStaff.value = staffStore.meta?.total || 0
      totalPagesStaff.value = staffStore.meta?.pages || 0
    }
  } else {
    if (activeTab.value === 'users') {
      fetchAllUsers()
    } else {
      fetchAllStaffs()
    }
  }
}
const filteredCount = ref(users.value.length)

/**
 * Update Status
 */
const isShowModalConfirm = ref(false)
const idUpdateStatus = ref('')
const selectedUserChangeData = reactive<RequestUpdateStatusUser>({
  status: true,
})
function onSwitchChange(data: User) {
  isShowModalConfirm.value = true
  idUpdateStatus.value = data.id
  selectedUserChangeData.status = data.active
}
const changeStatusUser = async () => {
  try {
    await userStore.updateStatusUser(idUpdateStatus.value, selectedUserChangeData)
    toast.success('Cập nhật trạng thái thành công')
    isShowModalConfirm.value = false
    idUpdateStatus.value = ''
    await fetchAllUsers()
  } catch (error: unknown) {
    toast.error(
      `Không thể chuyển đổi trạng thái: ${(error as Error).message || 'Lỗi không xác định'}`,
    )
  }
}

/**
 * Add Staff
 */
const isShowModalAdd = ref(false)
function onShowModalAdd() {
  router.push({ name: 'AdminUsersAddStaff' })
}

/**
 * Edit Event
 */
function onShowEditStaffModal(data: Staff) {
  router.push({
    name: 'AdminUsersEditStaff',
    params: { id: data.id },
  })
}

/**
 * Detail Event
 */
const isShowDetailModal = ref(false)
const isShowDetailStaffModal = ref(false)
const selectedUserDetail = ref<User | null>(null)
const selectedStaffDetail = ref<Staff | null>(null)
function onShowDetailModal(data: User) {
  selectedUserDetail.value = data
  isShowDetailModal.value = true
}
function onShowDetailStaffModal(data: Staff) {
  selectedStaffDetail.value = data
  isShowDetailStaffModal.value = true
}
function onCloseDetailModal() {
  isShowDetailModal.value = false
  selectedUserDetail.value = null
}
function onCloseDetailStaffModal() {
  isShowDetailStaffModal.value = false
  selectedStaffDetail.value = null
}
async function onCloseAllModal() {
  isShowModalAdd.value = false
  isShowModalConfirm.value = false
  selectedUserChangeData.status = true
}
</script>

<template>
  <va-inner-loading :loading="staffStore.loading || userStore.loading">
    <va-card class="shadow-sm">
      <va-card-content class="p-6">
        <h1 class="text-3xl font-semibold text-gray-800 text-center mb-6">Quản lý tài khoản</h1>

        <!-- TABS -->
        <div class="role-tabs mb-6">
          <va-tabs v-model="activeTab" grow class="custom-tabs">
            <va-tab name="users" class="tab">
              <va-icon name="person" class="tab-icon mr-2" size="medium" />
              Người dùng
            </va-tab>
            <va-tab name="doctor" class="tab">
              <va-icon name="local_hospital" class="tab-icon mr-2" size="medium" />
              Nhân viên
            </va-tab>
          </va-tabs>
        </div>

        <!-- BỘ LỌC VÀ TÌM KIẾM -->
        <div class="d-flex gap-4 mb-6 align-center">
          <va-input
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên, email, vai trò..."
            clearable
            class="input-field flex-grow"
            aria-label="Tìm kiếm theo tên, email, vai trò"
          >
            <template #prependInner>
              <va-icon name="search" color="text-gray-600" size="medium" />
            </template>
          </va-input>
          <va-button preset="secondary" class="action-button px-6 py-2" @click="resetFilters">
            Xóa bộ lọc
          </va-button>
          <va-button preset="primary" class="action-button px-6 py-2" @click="handleSearch">
            Tìm kiếm
          </va-button>
        </div>

        <!-- TAB NGƯỜI DÙNG -->
        <div v-if="activeTab === 'users'" class="mt-6">
          <va-data-table
            :items="users"
            :columns="columns"
            hoverable
            :filter="searchQuery"
            :filter-method="customFilteringFn"
            class="custom-table"
            no-data-html="<div class='text-center text-gray-500 py-4'>Không có dữ liệu.</div>"
            @filtered="filteredCount = $event.items.length"
          >
            <template #cell(id)="{ rowIndex }">
              {{ rowIndex + 1 + (currentPage - 1) * pageSize }}
            </template>
            <template #cell(active)="{ rowData }">
              <div class="d-flex justify-center">
                <va-switch
                  v-model="rowData.active"
                  size="medium"
                  color="success"
                  @change="onSwitchChange(rowData)"
                />
              </div>
            </template>
            <template #cell(avatar)="{ rowData }">
              <div class="d-flex justify-center">
                <va-avatar :src="rowData.avatar || '/defaultAvatar.png'" size="medium" />
              </div>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="d-flex justify-center gap-2">
                <va-button
                  preset="primary"
                  icon="visibility"
                  size="small"
                  class="action-button px-3 py-2"
                  @click="onShowDetailModal(rowData)"
                  title="Xem chi tiết"
                  >Xem chi tiết</va-button
                >
              </div>
            </template>
          </va-data-table>

          <div class="d-flex justify-end my-2 pagination-container">
            <va-pagination
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
        </div>

        <!-- TAB NHÂN VIÊN -->
        <div v-else class="mt-6">
          <div class="mb-2">
            <va-button preset="primary" class="action-button px-6 py-2" @click="onShowModalAdd">
              Thêm nhân viên
            </va-button>
          </div>
          <va-data-table
            :items="staffs"
            :columns="columnsStaffTable"
            hoverable
            :filter="searchQuery"
            :filter-method="customFilteringFn"
            class="custom-table"
            no-data-html="<div class='text-center text-gray-500 py-4'>Không có dữ liệu.</div>"
            @filtered="filteredCount = $event.items.length"
          >
            <template #cell(id)="{ rowIndex }">
              {{ rowIndex + 1 + (currentPageStaff - 1) * pageSizeStaff }}
            </template>
            <template #cell(name)="{ rowData }">
              <div class="font-semibold text-gray-800">{{ rowData.user.name || 'N/A' }}</div>
            </template>
            <template #cell(email)="{ rowData }">
              <div class="text-gray-700">{{ rowData.user.email || 'N/A' }}</div>
            </template>
            <template #cell(roles)="{ rowData }">
              <div class="text-gray-700">
                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  {{ rowData.roles[0] || 'Chưa có vai trò' }}
                </span>
              </div>
            </template>
            <template #cell(active)="{ rowData }">
              <div class="d-flex justify-center">
                <va-switch
                  v-model="rowData.user.active"
                  size="medium"
                  color="success"
                  @change="onSwitchChange(rowData.user)"
                />
              </div>
            </template>
            <template #cell(avatar)="{ rowData }">
              <div class="d-flex justify-center">
                <va-avatar :src="rowData.user.avatar || '/defaultAvatar.png'" size="medium" />
              </div>
            </template>
            <template #cell(actions)="{ rowData }">
              <div class="d-flex justify-center gap-2">
                <va-button
                  preset="primary"
                  size="small"
                  icon="visibility"
                  class="action-button px-3 py-2"
                  @click="onShowDetailStaffModal(rowData)"
                  title="Xem chi tiết"
                  >Xem chi tiết</va-button
                >
                <va-button
                  preset="primary"
                  icon="edit"
                  size="small"
                  color="warning"
                  class="action-button px-3 py-2"
                  @click="onShowEditStaffModal(rowData)"
                  title="Chỉnh sửa"
                  >Chỉnh sửa</va-button
                >
              </div>
            </template>
          </va-data-table>

          <div class="d-flex justify-end my-2 pagination-container">
            <va-pagination
              v-model="currentPageStaff"
              :total="totalStaff"
              :pages="totalPagesStaff"
              :rows-per-page="pageSizeStaff"
              :rows-per-page-options="[5, 10, 20]"
              :visible-pages="5"
              class="custom-pagination"
              @update:modelValue="onPageChange"
            />
          </div>

          <div class="d-flex gap-4 mt-6">
            <va-alert color="info" class="bg-blue-50 border-blue-200">
              Số mục đã lọc: <va-chip color="info">{{ filteredCount }}</va-chip>
            </va-alert>
            <va-alert color="info" class="bg-blue-50 border-blue-200">
              Tổng số mục: <va-chip color="info">{{ totalStaff }}</va-chip>
            </va-alert>
          </div>
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>

  <!-- MODAL CHI TIẾT NGƯỜI DÙNG -->
  <va-modal v-model="isShowDetailModal" hide-default-actions max-width="800px" class="custom-modal">
    <template #header>
      <h2
        class="text-2xl font-semibold text-gray-800 d-flex align-center bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-t-xl"
      >
        <va-icon name="person" size="large" class="mr-4 text-blue-600" />
        Chi tiết người dùng
      </h2>
    </template>
    <div class="p-8">
      <DetailUser
        v-if="isShowDetailModal && selectedUserDetail"
        :userData="selectedUserDetail"
        @close-modal="onCloseDetailModal"
      />
      <div class="flex justify-end mt-6">
        <va-button
          preset="secondary"
          class="px-8 py-3 action-button text-gray-600 text-base"
          @click="onCloseDetailModal"
        >
          Đóng
        </va-button>
      </div>
    </div>
  </va-modal>

  <!-- MODAL CHI TIẾT NHÂN VIÊN -->
  <va-modal
    v-model="isShowDetailStaffModal"
    hide-default-actions
    max-width="800px"
    class="custom-modal"
  >
    <template #header>
      <h2
        class="text-2xl font-semibold text-gray-800 d-flex align-center bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-t-xl"
      >
        <va-icon name="local_hospital" size="large" class="mr-4 text-blue-600" />
        Chi tiết nhân viên
      </h2>
    </template>
    <div class="p-8">
      <DetailStaff
        v-if="isShowDetailStaffModal && selectedStaffDetail"
        :staff-data="selectedStaffDetail"
        @close-modal-staff="onCloseDetailStaffModal"
      />
      <div class="flex justify-end mt-6">
        <va-button
          preset="secondary"
          class="px-8 py-3 action-button text-gray-600 text-base"
          @click="onCloseDetailStaffModal"
        >
          Đóng
        </va-button>
      </div>
    </div>
  </va-modal>

  <!-- MODAL XÁC NHẬN TRẠNG THÁI -->
  <va-modal
    v-model="isShowModalConfirm"
    hide-default-actions
    max-width="600px"
    class="custom-modal"
  >
    <template #header>
      <h2
        class="text-2xl font-semibold text-gray-800 d-flex align-center bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-t-xl"
      >
        <va-icon name="check_circle" size="large" class="mr-4 text-green-700" />
        Xác nhận chuyển trạng thái
      </h2>
    </template>
    <div class="p-8">
      <DeleteConfirm
        :title="'Chuyển trạng thái người dùng'"
        :message="'Bạn có chắc chắn muốn chuyển trạng thái người dùng?'"
        confirm-text="Xác nhận"
        @close-confirm="onCloseAllModal"
        @confirm="changeStatusUser"
        class="confirm-modal"
      />
    </div>
  </va-modal>
</template>

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

.custom-tabs {
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 0.25rem;
  :deep(.va-tabs__container) {
    gap: 0.5rem;
  }
  :deep(.va-tab) {
    border-radius: 6px;
    transition: all 0.3s ease;
    font-weight: 500;
    color: #4b5563;
    &:hover {
      background-color: #e5e7eb;
      transform: scale(1.05);
    }
    &.va-tab--active {
      background-color: var(--va-primary);
      color: #ffffff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
  .tab-icon {
    color: var(--va-primary);
  }
}

.custom-table {
  border-radius: 12px;
  /* overflow: hidden; */
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

.custom-modal {
  :deep(.va-modal__inner) {
    border-radius: 16px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    background-color: #ffffff;
  }
  :deep(.va-modal__content) {
    padding: 0;
  }
}

.confirm-modal {
  :deep(.va-card) {
    background-color: #f0fdf4;
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid #bbf7d0;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.05);
  }
  :deep(h2) {
    font-size: 1.5rem;
    font-weight: 600;
    color: #166534;
    margin-bottom: 1.5rem;
  }
  :deep(p) {
    font-size: 1.125rem;
    color: #4b5563;
    margin-bottom: 2rem;
  }
  :deep(.va-button) {
    border-radius: 8px;
    font-weight: 500;
    padding: 0.875rem 2rem;
    font-size: 1rem;
    transition: all 0.3s ease;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
