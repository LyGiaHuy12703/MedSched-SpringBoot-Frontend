<template>
  <div class="doctor-shift-page">
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
              v-model="formState.staffIds"
              label="Chọn nhân viên"
              :options="staffOptionsForForm"
              text-by="text"
              value-by="value"
              class="mb-3"
              multiple
              required
              :disabled="!formState.departmentId"
            />
            <va-select
              v-model="formState.shiftValue"
              label="Chọn ca trực"
              :options="shiftTimes"
              text-by="label"
              value-by="value"
              class="mb-3"
              required
            >
            </va-select>
            <div class="d-flex justify-space-between mt-3">
              <va-button type="submit" preset="primary">{{
                formState.id ? 'Cập nhật' : 'Phân công'
              }}</va-button>
              <va-button v-if="formState.id" @click="resetForm" preset="secondary">Hủy</va-button>
            </div>
          </form>
          <!-- For Debugging: <pre>{{ formState }}</pre> -->
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
              <div class="schedule-cell">Bộ phận</div>
              <div class="schedule-cell">Thao tác</div>
            </div>
            <!-- REFACTORED: Use the new computed property -->
            <div v-for="item in filteredSchedule" :key="item.id" class="schedule-row">
              {{ console.log(item) }}
              <div class="schedule-cell">
                <va-badge :color="item.shiftBadgeColor" :text="item.shiftLabel" />
              </div>
              <div class="schedule-cell">{{ item.startTime }} - {{ item.endTime }}</div>
              <div class="schedule-cell">
                <div class="assigned-doctor" v-if="item.staffs.length > 0">
                  <img
                    :src="item.staffs[0].avatar"
                    :alt="item.staffs[0].name"
                    class="doctor-avatar"
                  />
                  <div class="doctor-info">
                    <div class="doctor-name">{{ item.staffNames }}</div>
                    <div class="doctor-department">{{ item.departmentName }}</div>
                  </div>
                </div>
              </div>
              <div class="schedule-cell">
                <span
                  class="department-color"
                  :style="{ backgroundColor: item.departmentColor }"
                ></span>
                {{ item.departmentName }}
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
            <div v-if="filteredSchedule.length === 0" class="schedule-row empty">
              <div class="schedule-cell" :colspan="5">Không có ca trực nào phù hợp với bộ lọc.</div>
            </div>
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
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, reactive } from 'vue'
import type { DoctorShiftCreateRequest } from '@/interfaces/doctorShift.interfaces'
import { useStaffStore } from '@/stores/staff.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { toast } from 'vue3-toastify'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

// --- Constants ---
const shiftTimes = [
  { value: 'morning', start: '07:00', end: '13:00', label: 'Ca sáng', color: 'primary' },
  { value: 'afternoon', start: '13:00', end: '19:00', label: 'Ca chiều', color: 'warning' },
  { value: 'night', start: '19:00', end: '07:00', label: 'Ca đêm', color: 'info' },
]

// --- Store Initialization ---
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const scheduleStore = useScheduleStore()

// --- Component State ---
// Filters
const filterDate = ref(new Date().toISOString().slice(0, 10))
const filterDepartment = ref('Tất cả')
const searchQuery = ref('')

// REFACTORED: Centralized form state
const initialFormState = {
  id: undefined as string | undefined,
  departmentId: '',
  staffIds: [] as string[],
  shiftValue: 'morning' as 'morning' | 'afternoon' | 'night',
}
const formState = reactive({ ...initialFormState })

// Modal State
const isDeleteModalVisible = ref(false)
const scheduleIdToDelete = ref<string | null>(null)

// UI State
const departmentColors = ref<Record<string, string>>({})

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
    .filter((staff) => staff.departments.id === formState.departmentId)
    .map((staff) => ({ text: staff.user.name, value: staff.id }))
})

// REFACTORED: A single, powerful computed property for the schedule list
const filteredSchedule = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()

  return scheduleStore.schedules
    .filter((s) => s.dayWork === filterDate.value) // 1. Filter by date
    .map((schedule) => {
      // 2. Map to a richer display object
      const department = departmentStore.departments.find((d) => d.id === schedule.departments)
      const staffDetails = schedule.staffs
        .map((staff) => staffStore.staffs.find((s) => s.id === staff.id))
        .filter(Boolean)
        .map((fullStaff) => ({
          id: fullStaff!.id,
          name: fullStaff!.user.name,
          avatar:
            fullStaff!.user.avatar ||
            'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg',
        }))

      const shiftInfo = shiftTimes.find((st) => st.start === schedule.startTime) || shiftTimes[0]

      return {
        id: schedule.id,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        departmentId: department?.id || '',
        departmentName: department?.name || 'Không xác định',
        departmentColor: departmentColors.value[department?.id || ''] || '#ccc',
        staffs: staffDetails,
        staffIds: staffDetails.map((s) => s.id),
        staffNames: staffDetails.map((s) => s.name).join(', '),
        shiftLabel: shiftInfo.label,
        shiftBadgeColor: shiftInfo.color,
      }
    })
    .filter((item) => {
      // 3. Filter by department and search query
      const departmentMatch =
        filterDepartment.value === 'Tất cả' || item.departmentName === filterDepartment.value
      const searchMatch =
        !query ||
        item.staffNames.toLowerCase().includes(query) ||
        item.departmentName.toLowerCase().includes(query)
      return departmentMatch && searchMatch
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime)) // 4. Sort by time
})

// --- Methods & Event Handlers ---
const fetchAllData = async () => {
  try {
    await Promise.all([
      departmentStore.fetchDepartments(0, 1000),
      staffStore.fetchAllStaffs(0, 1000),
      scheduleStore.fetchAllSchedule(0, 1000),
    ])
    generateDepartmentColors()
  } catch (error) {
    toast.error('Không thể tải dữ liệu cần thiết.')
  }
}

const generateDepartmentColors = () => {
  const colors = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f1c40f',
    '#9b59b6',
    '#e67e22',
    '#1abc9c',
    '#34495e',
  ]
  const newColors: Record<string, string> = {}
  departmentStore.departments.forEach((dep, idx) => {
    newColors[dep.id] = colors[idx % colors.length]
  })
  departmentColors.value = newColors
}

const resetForm = () => {
  Object.assign(formState, initialFormState)
}

const onDepartmentChangeInForm = () => {
  formState.staffIds = []
}

const handleSubmit = async () => {
  const selectedShift = shiftTimes.find((s) => s.value === formState.shiftValue)
  if (!formState.departmentId || formState.staffIds.length === 0 || !selectedShift) {
    toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.')
    return
  }

  const payload: DoctorShiftCreateRequest = {
    startTime: selectedShift.start,
    endTime: selectedShift.end,
    dayWork: filterDate.value,
    staffIds: formState.staffIds,
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
    toast.error(` ${error.message || 'Lỗi không xác định'}`)
  }
}

const handleEdit = (scheduleItem: (typeof filteredSchedule.value)[0]) => {
  formState.id = scheduleItem.id
  formState.departmentId = scheduleItem.departmentId
  formState.staffIds = scheduleItem.staffIds
  formState.shiftValue = scheduleItem.shiftValue
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
onMounted(() => {
  fetchAllData()
})
</script>

<style lang="scss" scoped>
/* CSS của bạn không thay đổi */
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
.department-legend-wrapper .legend-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
}
.department-legend-wrapper .department-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
.department-legend-wrapper .legend-item {
  display: flex;
  align-items: center;
}
.department-legend-wrapper .legend-color {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-right: 0.5rem;
  border: 1px solid #ddd;
}
.department-legend-wrapper .legend-label {
  font-size: 0.875rem;
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
.department-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 0.5rem;
  flex-shrink: 0;
}
</style>
