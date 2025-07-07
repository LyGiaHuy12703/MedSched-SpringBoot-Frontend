<template>
  <va-inner-loading :loading="staffStore.loading || userStore.loading">
    <va-card>
      <va-card-content>
        <div class="justify-content-around my-3">
          <di class="my-3"><h1>Quản lý tài khoản</h1></di>
        </div>
        <div class="role-tabs">
          <va-tabs v-model="activeTab" grow>
            <va-tab name="users" class="tab">
              <va-icon name="person" class="tab-icon" />
              Users
            </va-tab>
            <va-tab name="doctor" class="tab">
              <VaIcon name="local_hospital" class="tab-icon" />
              Staff
            </va-tab>
          </va-tabs>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mb-6 my-3">
          <va-input
            v-model="searchQuery"
            placeholder="Tìm kiếm theo tên, email, vai trò..."
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

        <div v-if="activeTab === 'users'" class="mt-3">
          <va-data-table
            :items="users"
            :columns="columns"
            hoverable
            :filter="filter"
            :filter-method="customFilteringFn"
            @filtered="filteredCount = $event.items.length"
          >
            <template #cell(id)="slotProps">
              {{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
            </template>
            <template #cell(active)="slotProps">
              <div class="active">
                <va-switch
                  v-model="slotProps.rowData.active"
                  size="small"
                  color="success"
                  @change="onSwitchChange(slotProps.rowData)"
                />
              </div>
            </template>
            <template #cell(avatar)="slotProps">
              <div class="avatar">
                <va-avatar :src="slotProps.rowData.avatar || '/defaultAvatar.png'" size="small" />
              </div>
            </template>
            <template #cell(actions)="slotProps">
              <div class="actions">
                <VaButton
                  preset="plain"
                  icon="visibility"
                  @click="onShowDetailModal(slotProps.rowData)"
                />
              </div>
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
        </div>
        <div v-else>
          <div class="mb-3">
            <va-button @click="onShowModalAdd"> Thêm nhân viên</va-button>
          </div>
          <va-data-table
            :items="staffs"
            :columns="columnsStaffTable"
            hoverable
            :filter="filter"
            :filter-method="customFilteringFn"
            @filtered="filteredCount = $event.items.length"
          >
            <template #cell(id)="slotProps">
              {{ slotProps.rowIndex + 1 + (currentPageStaff - 1) * pageSizeStaff }}
            </template>
            <template #cell(name)="slotProps">
              <div>
                <p>{{ slotProps.rowData.user.name }}</p>
              </div>
            </template>
            <template #cell(email)="slotProps">
              <div>
                <p>{{ slotProps.rowData.user.email }}</p>
              </div>
            </template>
            <template #cell(roles)="slotProps">
              <div>
                <p>
                  [{{
                    slotProps.rowData.roles.map((role) => role.name).join(', ') ||
                    'Chưa có vai trò'
                  }}]
                </p>
              </div>
            </template>
            <template #cell(active)="slotProps">
              <div class="active">
                <va-switch
                  v-model="slotProps.rowData.user.active"
                  size="small"
                  color="success"
                  @change="onSwitchChange(slotProps.rowData.user)"
                />
              </div>
            </template>
            <template #cell(avatar)="slotProps">
              <div class="avatar">
                <va-avatar
                  :src="slotProps.rowData.user.avatar || '/defaultAvatar.png'"
                  size="small"
                />
              </div>
            </template>
            <template #cell(actions)="slotProps">
              <div class="actions">
                <VaButton
                  preset="plain"
                  icon="visibility"
                  @click="onShowDetailStaffModal(slotProps.rowData)"
                />
                <VaButton
                  preset="plain"
                  icon="edit"
                  class="ml-3"
                  @click="onShowEditStaffModal(slotProps.rowData)"
                />
              </div>
            </template>
          </va-data-table>
          <div class="my-3 d-flex pagination-container">
            <VaPagination
              v-model="currentPageStaff"
              :total="totalStaff"
              :pages="totalPagesStaff"
              :rows-per-page="pageSizeStaff"
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
              <VaChip>{{ totalStaff }}</VaChip>
            </VaAlert>
          </div>
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>
  <va-modal v-model="isShowDetailStaffModal" hide-default-actions @close="onCloseDetailStaffModal">
    <DetailStaff
      v-if="isShowDetailStaffModal && selectedStaffDetail"
      :staff-data="selectedStaffDetail"
      @close-modal-staff="onCloseDetailStaffModal"
    />
  </va-modal>
  <va-modal v-model="isShowDetailModal" hide-default-actions @close="onCloseDetailModal">
    <DetailUser
      v-if="isShowDetailModal && selectedUserDetail"
      :userData="selectedUserDetail"
      @close-modal="onCloseDetailModal"
    />
  </va-modal>
  <va-modal v-model="isShowModalConfirm" hide-default-actions>
    <DeleteConfirm
      :title="'Chuyển trạng thái người dùng'"
      :message="'Xác nhận chuyển trạng thái người dùng?'"
      @close-confirm="onCloseAllModal"
      @confirm="changeStatusUser"
    />
  </va-modal>
</template>
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
  { key: 'id', label: 'STT' },
  { key: 'name', label: 'Họ & tên' },
  { key: 'email', label: 'Email' },
  { key: 'age', label: 'Tuổi' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'avatar', label: 'Ảnh đại diện' },
  { key: 'active', label: 'Trạng thái' },
  { key: 'actions', label: 'Hành động', sortable: false },
]
const columnsStaffTable = [
  { key: 'id', label: 'STT' },
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
  // Reset current page về 1 khi chuyển tab
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

  // Gọi lại fetch dữ liệu cho tab hiện tại
  if (activeTab.value === 'users') {
    await fetchAllUsers()
  } else {
    await fetchAllStaffs()
  }
})
async function fetchAllUsers() {
  await userStore.fetchUsers(currentPage.value - 1, pageSize.value)
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
  currentPage.value = page
  await fetchAllUsers()
  await fetchAllStaffs()
}
/**==========END=========== */

/**
 * filter
 */

const searchQuery = ref('')
const resetFilters = () => {
  searchQuery.value = ''
  currentPage.value = 1
  if (activeTab.value === 'users') {
    fetchAllUsers()
  } else {
    fetchAllStaffs()
  }
  toast.info('Đã xóa bộ lọc tìm kiếm')
}
const handleSearch = async () => {
  currentPage.value = 1
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

/**===========END============== */
/**
 * UPDATE STATUS
 */
const isShowModalConfirm = ref(false)
const idUpdateStatus = ref('')
const selectedUserChangeData = reactive<RequestUpdateStatusUser>({
  status: true,
})
function onSwitchChange(data: User) {
  isShowModalConfirm.value = !isShowModalConfirm.value
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
    toast.error(`Không thể chuyển đổi trạng thái: ${error.message || 'Lỗi không xác định'}`)
  }
}
/**===========END============== */
/**
 * ADD STAFF
 */
const isShowModalAdd = ref(false)
function onShowModalAdd() {
  router.push({ name: 'AdminUsersAddStaff' })
}
/**============END============ */
/**
 * EDIT EVENT
 */
function onShowEditStaffModal(data: Staff) {
  router.push({
    name: 'AdminUsersEditStaff',
    params: { id: data.id },
  })
}
/**===========END============== */
/**
 * DETAIL EVENT
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
  // await fetchAllUsers()
  // await fetchAllStaffs()
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
:deep(.va-data-table__table-td:has(.avatar)) {
  display: flex;
  justify-content: center !important;
}
:deep(.va-data-table__table-td:has(.active)) {
  justify-content: center !important;
}
.actions {
  display: flex;
  justify-content: center !important;
}
</style>
