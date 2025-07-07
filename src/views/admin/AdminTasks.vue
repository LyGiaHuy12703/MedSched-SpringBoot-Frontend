<template>
  <va-inner-loading :loading="scheduleStore.loading" class="doctor-shift-page">
    <!-- Filters Card -->
    <va-card class="mb-4">
      <va-card-title>Phân Công Lịch Trực</va-card-title>
      <va-card-content>
        <div class="filters-container">
          <div class="filter-group">
            <va-input v-model="filterDate" type="date" label="Ngày trực" class="date-input" />
            <va-select
              v-model="filterDepartment"
              label="Lọc theo bộ phận"
              :options="['Tất cả', ...departmentStore.departments.map((dep) => dep.name)]"
              class="department-select"
            />
          </div>
          <va-input
            v-model="searchQuery"
            placeholder="Tìm kiếm nhân viên, bộ phận..."
            class="search-input"
          >
            <template #prepend>
              <va-icon name="search" />
            </template>
          </va-input>
        </div>
      </va-card-content>
    </va-card>

    <div class="schedule-container">
      <!-- Assignment Form Card -->
      <va-card class="shift-assignment-card">
        <va-card-title>{{
          formState.id ? 'Cập Nhật Ca Trực' : 'Phân Công Ca Trực Mới'
        }}</va-card-title>
        <va-card-content>
          <form @submit.prevent="handleSubmit" class="assignment-form">
            <va-select
              v-model="formState.departmentId"
              label="Chọn bộ phận"
              :options="departmentOptions"
              text-by="text"
              value-by="value"
              class="mb-3"
              required
              @update:modelValue="onDepartmentChangeInForm"
            />
            <va-select
              v-model="formState.staffId"
              label="Chọn nhân viên"
              :options="staffOptionsForForm"
              text-by="text"
              value-by="value"
              class="mb-3"
              required
              :disabled="!formState.departmentId"
            />
            <va-input
              v-model="formState.dayWork"
              type="date"
              label="Ngày trực"
              class="mb-3"
              required
            />
            <va-select
              v-model="formState.shiftValue"
              label="Chọn ca trực"
              :options="shiftTimes"
              text-by="label"
              value-by="value"
              class="mb-3"
              required
            />
            <div class="d-flex justify-space-between mt-3">
              <va-button type="submit" preset="primary">{{
                formState.id ? 'Cập nhật' : 'Phân công'
              }}</va-button>
              <va-button v-if="formState.id" @click="resetForm" preset="secondary">Hủy</va-button>
            </div>
          </form>
        </va-card-content>
      </va-card>

      <!-- Schedule Display Card -->
      <va-card class="shift-schedule-card">
        <va-card-title>Lịch Trực {{ formattedDate }}</va-card-title>
        <va-card-content>
          <div class="schedule-grid">
            <div class="schedule-row header">
              <div class="schedule-cell">Ca trực</div>
              <div class="schedule-cell">Thời gian</div>
              <div class="schedule-cell">Nhân viên trực</div>
              <div class="schedule-cell">Trạng thái</div>
              <div class="schedule-cell">Thao tác</div>
            </div>
            <div v-for="item in paginatedSchedule" :key="item.id" class="schedule-row">
              <div class="schedule-cell">
                <va-badge :color="item.shiftBadgeColor" :text="item.shiftLabel" />
              </div>
              <div class="schedule-cell">{{ item.startTime }} - {{ item.endTime }}</div>
              <div class="schedule-cell">
                <div class="assigned-doctor">
                  <img :src="item.staff.avatar" :alt="item.staff.name" class="doctor-avatar" />
                  <div class="doctor-info">
                    <div class="doctor-name">{{ item.staff.name }}</div>
                    <div class="doctor-department">{{ item.departmentName }}</div>
                  </div>
                </div>
              </div>
              <div class="schedule-cell">
                {{ getChangeStatusName(item.status) }}
              </div>
              <div class="schedule-cell actions">
                <va-button
                  preset="primary"
                  icon="edit"
                  size="small"
                  @click="handleEdit(item)"
                  class="mr-2"
                />
                <va-button
                  preset="danger"
                  icon="delete"
                  size="small"
                  @click="showDeleteConfirm(item.id)"
                />
              </div>
            </div>
            <div v-if="paginatedSchedule.length === 0" class="schedule-row empty">
              <div class="schedule-cell" :colspan="5">Không có ca trực nào phù hợp với bộ lọc.</div>
            </div>
          </div>
          <!-- Pagination Component -->
          <div class="pagination-container" v-if="filteredSchedule.length > itemsPerPage">
            <va-pagination
              v-model="currentPage"
              :total="filteredSchedule.length"
              :page-size="itemsPerPage"
              :show-total="true"
              :visible-pages="5"
              class="mt-5"
              @update:modelValue="handlePageChange"
            />
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- Delete Confirmation Modal -->
    <va-modal v-model="isDeleteModalVisible" hide-default-actions>
      <DeleteConfirm
        title="Xác nhận xóa lịch trực"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn lịch trực này không?"
        @close-confirm="cancelDelete"
        @confirm="confirmDelete"
      />
    </va-modal>
  </va-inner-loading>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, reactive, watch } from 'vue'
import type { DoctorShiftCreateRequest } from '@/interfaces/doctorShift.interfaces'
import { useStaffStore } from '@/stores/staff.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { toast } from 'vue3-toastify'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

// --- Constants ---
const shiftTimes = [
  { value: 'morning', start: '06:00:00', end: '14:00:00', label: 'Ca sáng', color: 'primary' },
  { value: 'afternoon', start: '14:00:00', end: '22:00:00', label: 'Ca chiều', color: 'warning' },
  { value: 'night', start: '22:00:00', end: '06:00:00', label: 'Ca đêm', color: 'info' },
]

// --- Store Initialization ---
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const scheduleStore = useScheduleStore()

// --- Component State ---
const filterDate = ref(new Date().toISOString().slice(0, 10))
const filterDepartment = ref('Tất cả')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(3)
const formState = reactive({
  id: undefined as string | undefined,
  departmentId: '',
  staffId: '' as string,
  shiftValue: 'morning' as 'morning' | 'afternoon' | 'night',
  dayWork: new Date().toISOString().slice(0, 10),
})
const isDeleteModalVisible = ref(false)
const scheduleIdToDelete = ref<string | null>(null)

// --- Computed Properties ---
const formattedDate = computed(() =>
  new Date(filterDate.value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }),
)

const departmentOptions = computed(() =>
  departmentStore.departments.map((dep) => ({ text: dep.name, value: dep.id })),
)

const staffOptionsForForm = computed(() => {
  if (!formState.departmentId) return []
  return staffStore.staffs
    .filter((staff) => staff.departments?.id === formState.departmentId)
    .map((staff) => ({ text: staff.user.name, value: staff.id }))
})

const filteredSchedule = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  const result = scheduleStore.schedules
    .filter((s) => s.dayWork === filterDate.value)
    .flatMap((schedule) => {
      const departmentId = schedule.departmentDTO?.id
      const department = departmentStore.departments.find((d) => d.id === departmentId)
      const shiftInfo = shiftTimes.find((st) => st.start === schedule.startTime) || shiftTimes[0]

      if (!Array.isArray(schedule.staffs) || schedule.staffs.length === 0) return []

      return schedule.staffs.map((staffInSchedule) => {
        const staffId = staffInSchedule.id || staffInSchedule
        const staff = staffStore.staffs.find((s) => s.id === staffId) || {
          id: staffId,
          user: { name: 'Nhân viên không xác định', avatar: '/defaultAvatar.png' },
        }

        return {
          id: schedule.id,
          startTime: schedule.startTime || '00:00:00',
          endTime: schedule.endTime || '00:00:00',
          departmentId: department?.id || '',
          departmentName: department?.name || 'Không xác định',
          departmentColor: department?.id ? `#${Math.random().toString(16).slice(2, 8)}` : '#ccc',
          staff: {
            id: staff.id,
            name: staff.user?.name || 'Không xác định',
            avatar: staff.user?.avatar || '/defaultAvatar.png',
          },
          status: schedule.status || 'active',
          shiftLabel: shiftInfo.label,
          shiftBadgeColor: shiftInfo.color,
        }
      })
    })
    .filter((item) => {
      const departmentMatch =
        filterDepartment.value === 'Tất cả' || item.departmentName === filterDepartment.value
      const searchMatch =
        !query ||
        item.staff.name.toLowerCase().includes(query) ||
        item.departmentName.toLowerCase().includes(query)
      return departmentMatch && searchMatch
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))

  return result
})

const paginatedSchedule = computed(() => {
  const start = currentPage.value - 1
  const end = start + itemsPerPage.value
  return filteredSchedule.value.slice(start, end)
})

const getChangeStatusName = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    APPROVE: 'Đã xác nhận',
    IN_PROGRESS: 'Đang trong ca trực',
    COMPLETED: 'Đã hoàn thành',
  }
  return statusMap[status] || 'Đã hủy'
}

// --- Methods ---
const fetchAllData = async () => {
  try {
    await Promise.all([
      departmentStore.fetchDepartments(0, 1000),
      staffStore.fetchAllStaffs(0, 1000),
      scheduleStore.fetchAllSchedule(0, 1000),
    ])
    currentPage.value = 1
  } catch (error) {
    toast.error('Không thể tải dữ liệu.')
  }
}

const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    departmentId: '',
    staffId: '',
    shiftValue: 'morning',
    dayWork: new Date().toISOString().slice(0, 10),
  })
}

const onDepartmentChangeInForm = () => {
  formState.staffId = ''
}

const handleSubmit = async () => {
  const selectedShift = shiftTimes.find((s) => s.value === formState.shiftValue)
  if (!formState.departmentId || !formState.staffId || !selectedShift || !formState.dayWork) {
    toast.error('Vui lòng điền đầy đủ thông tin.')
    return
  }

  const payload: DoctorShiftCreateRequest = {
    startTime: selectedShift.start,
    endTime: selectedShift.end,
    dayWork: formState.dayWork,
    staffId: formState.staffId,
  }

  try {
    if (formState.id) {
      await scheduleStore.updateById(formState.id, payload)
      toast.success('Cập nhật lịch trực thành công!')
    } else {
      await scheduleStore.createSchedule(payload)
      toast.success('Phân công lịch trực thành công!')
    }
    await fetchAllData()
    resetForm()
  } catch (error: any) {
    toast.error(error.message || 'Lỗi không xác định')
  }
}

const handleEdit = (scheduleItem: any) => {
  formState.id = scheduleItem.id
  formState.departmentId = scheduleItem.departmentId
  formState.staffId = scheduleItem.staff.id
  formState.dayWork = filterDate.value
  const shift = shiftTimes.find((s) => s.start === scheduleItem.startTime)
  formState.shiftValue = (shift ? shift.value : 'morning') as 'morning' | 'afternoon' | 'night'
}

const showDeleteConfirm = (id: string) => {
  scheduleIdToDelete.value = id
  isDeleteModalVisible.value = true
}

const cancelDelete = () => {
  isDeleteModalVisible.value = false
  scheduleIdToDelete.value = null
}

const confirmDelete = async () => {
  if (!scheduleIdToDelete.value) return
  try {
    await scheduleStore.deleteById(scheduleIdToDelete.value)
    toast.success('Xóa ca trực thành công.')
    await fetchAllData()
  } catch (error: any) {
    toast.error(`Lỗi khi xóa ca trực: ${error.message}`)
  } finally {
    cancelDelete()
  }
}

// --- Lifecycle Hooks ---
onMounted(fetchAllData)
</script>

<style lang="scss" scoped>
.doctor-shift-page {
  display: flex;
  flex-direction: column;
}
.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.filter-group {
  display: flex;
  gap: 1rem;
  align-items: center;
}
.date-input {
  min-width: 180px;
}
.department-select {
  min-width: 200px;
}
.search-input {
  max-width: 300px;
}
.schedule-container {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 1rem;
  align-items: start;
}
@media (max-width: 1200px) {
  .schedule-container {
    grid-template-columns: 1fr;
  }
}
.shift-assignment-card {
  position: sticky;
  top: 1rem;
}
.schedule-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--va-background-border);
  border-radius: 4px;
  overflow: hidden;
}
.schedule-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 3fr 2fr 1fr;
  align-items: center;
  border-bottom: 1px solid var(--va-background-border);
}
.schedule-row:last-child {
  border-bottom: none;
}
.schedule-row.header {
  background-color: var(--va-background-primary);
  font-weight: 600;
}
.schedule-row.header .schedule-cell {
  padding: 0.75rem 1rem;
}
.schedule-row.empty .schedule-cell {
  grid-column: 1 / -1;
  text-align: center;
  padding: 2rem;
  color: var(--va-text-secondary);
}
.schedule-cell {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
}
.schedule-cell.actions {
  gap: 0.5rem;
}
.assigned-doctor {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.assigned-doctor .doctor-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}
.assigned-doctor .doctor-info .doctor-name {
  font-weight: 500;
}
.assigned-doctor .doctor-info .doctor-department {
  font-size: 0.8rem;
  color: var(--va-text-secondary);
}
.pagination-container {
  display: flex;
  justify-content: center;
}
</style>
