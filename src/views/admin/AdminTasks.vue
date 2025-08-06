<template>
  <va-inner-loading :loading="scheduleStore.loading" class="schedule-calendar-page">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-text">
        <h2 class="va-h4 text-primary">Lịch Phân Công Trực</h2>
        <p class="text-muted">Tổng quan lịch trực của nhân viên theo tháng, tuần, ngày.</p>
      </div>
      <div class="header-actions">
        <va-button color="success" icon="add" @click="openAssignModal()">Phân Công Mới</va-button>
      </div>
    </div>
    <!-- Calendar -->
    <va-card class="calendar-card">
      <va-card-content>
        <FullCalendar :options="calendarOptions" />
      </va-card-content>
    </va-card>

    <!-- Assign Modal -->
    <va-modal
      v-model="isAssignModalVisible"
      hide-default-actions
      size="medium"
      :before-close="resetForm"
      class="custom-modal"
    >
      <template #header>
        <h3 class="va-h5 text-info">
          {{ formState.id ? 'Cập Nhật Ca Trực' : 'Phân Công Ca Trực Mới' }}
        </h3>
      </template>
      <div class="modal-form">
        <p class="text-muted text-sm mb-4">Yêu cầu sẽ được gửi đến nhân viên để chờ xác nhận.</p>
        <va-form ref="formRef" @submit.prevent="handleSubmit">
          <va-input
            v-model="formState.dayWork"
            type="date"
            label="Ngày Trực"
            class="mb-4"
            :rules="[validators.required]"
            color="info"
          />
          <va-select
            v-model="formState.shiftValue"
            label="Chọn Ca Trực"
            :options="shiftTimes"
            text-by="label"
            value-by="value"
            class="mb-4"
            :rules="[validators.required]"
            color="info"
          />
          <va-divider class="my-4" />
          <p class="text-muted mb-2">Lọc Nhân Viên (Tùy Chọn)</p>
          <va-select
            v-model="formState.departmentId"
            :options="departmentOptions"
            text-by="text"
            value-by="value"
            class="mb-4"
            clearable
            color="info"
          />
          <va-select
            v-model="formState.staffIds"
            label="Gửi Yêu Cầu Đến Nhân Viên"
            :options="staffOptionsForForm"
            text-by="text"
            value-by="value"
            class="mb-4"
            multiple
            :rules="[validators.requiredArray]"
            placeholder="Chọn ít nhất một nhân viên"
            color="info"
          >
            <template #content="{ value }">
              <va-chip
                v-for="staff in value"
                :key="staff.value"
                size="small"
                class="mr-1 mb-1"
                outline
                closable
                color="info"
                @update:modelValue="removeStaffFromSelection(staff.value)"
              >
                {{ staff.text }}
              </va-chip>
            </template>
          </va-select>
          <div class="d-flex justify-end mt-4">
            <va-button @click="isAssignModalVisible = false" preset="secondary" class="mr-2">
              Hủy
            </va-button>
            <va-button type="submit" color="success" :loading="isSubmitting">
              {{ formState.id ? 'Cập Nhật' : 'Gửi Yêu Cầu' }}
            </va-button>
          </div>
        </va-form>
      </div>
    </va-modal>

    <!-- Delete Confirmation Modal -->
    <va-modal v-model="isDeleteModalVisible" hide-default-actions class="custom-modal">
      <DeleteConfirm
        title="Xác Nhận Xóa Lịch Trực"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn lịch trực này và tất cả các yêu cầu đã gửi cho nhân viên?"
        @close-confirm="isDeleteModalVisible = false"
        @confirm="confirmDelete"
      />
    </va-modal>
  </va-inner-loading>
</template>

<script lang="ts" setup>
// ... Toàn bộ phần script của bạn giữ nguyên ...
import { computed, onMounted, ref, reactive } from 'vue'
import { toast } from 'vue3-toastify'
import FullCalendar, {
  CalendarOptions,
  EventContentArg,
  EventClickArg,
  DateSelectArg,
} from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import tippy, { Instance as TippyInstance } from 'tippy.js'
import 'tippy.js/dist/tippy.css'
import 'tippy.js/themes/light-border.css'
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import { useStaffStore } from '@/stores/staff.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useScheduleStore } from '@/stores/schedule.store'
import type {
  DoctorShift,
  DoctorShiftCreateRequest,
  DoctorShiftUpdateRequest,
} from '@/interfaces/doctorShift.interfaces'
import type { Staff } from '@/interfaces/staff.interface'

// Interfaces
interface StaffWithPivot extends Staff {
  pivot_status: 'PENDING' | 'APPROVED' | 'CANCELED'
}

interface DoctorShiftWithPivot extends DoctorShift {
  staffs: StaffWithPivot[]
}

interface FormState {
  id?: string
  departmentId: string
  staffIds: string[]
  shiftValue: 'morning' | 'afternoon' | 'night' | 'overnight'
  dayWork: string
}

// Constants
const shiftTimes = [
  {
    value: 'morning',
    start: '06:00:00',
    end: '11:30:00',
    label: 'Ca Sáng',
    className: 'morning-shift',
  },
  {
    value: 'afternoon',
    start: '13:00:00',
    end: '17:00:00',
    label: 'Ca Chiều',
    className: 'afternoon-shift',
  },
  {
    value: 'night',
    start: '17:00:00',
    end: '22:00:00',
    label: 'Ca Tối',
    className: 'night-shift',
  },
  {
    value: 'overnight',
    start: '22:00:00',
    end: '06:00:00',
    label: 'Ca Đêm',
    className: 'overnight-shift',
  },
] as const

// Stores
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const scheduleStore = useScheduleStore()

// State
const isSubmitting = ref(false)
const isAssignModalVisible = ref(false)
const isDeleteModalVisible = ref(false)
const scheduleIdToDelete = ref<string | null>(null)
const formRef = ref<any>(null)
const formState = reactive<FormState>({
  id: undefined,
  departmentId: '',
  staffIds: [],
  shiftValue: 'morning',
  dayWork: new Date().toISOString().slice(0, 10),
})

// Validators
const validators = {
  required: (v: any) => !!v || 'Trường này là bắt buộc',
  requiredArray: (v: any[]) => v.length > 0 || 'Vui lòng chọn ít nhất một nhân viên',
}

// Computed
const departmentOptions = computed(() =>
  departmentStore.departments.map((dep) => ({ text: dep.name, value: dep.id })),
)

const staffOptionsForForm = computed(() => {
  let staffList = staffStore.staffs
  if (formState.departmentId) {
    staffList = staffList.filter((staff) => staff.departments?.id === formState.departmentId)
  }
  return staffList.map((staff) => ({ text: staff.user.name, value: staff.id }))
})

const calendarEvents = computed(() => {
  return (scheduleStore.schedules as DoctorShiftWithPivot[]).map((shift) => {
    const shiftInfo = getShiftInfo(shift)
    const isOvernight = shift.endTime < shift.startTime
    const endDate = new Date(shift.dayWork)
    if (isOvernight) endDate.setDate(endDate.getDate() + 1)

    return {
      id: shift.id,
      title: shiftInfo.label,
      start: `${shift.dayWork}T${shift.startTime}`,
      end: `${endDate.toISOString().slice(0, 10)}T${shift.endTime}`,
      classNames: [shiftInfo.className],
      borderColor: 'transparent',
      extendedProps: { shiftData: shift },
    }
  })
})

const calendarOptions = computed(
  (): CalendarOptions => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
    locale: 'vi',
    buttonText: { today: 'Hôm nay', month: 'Tháng', week: 'Tuần', day: 'Ngày' },
    weekends: true,
    editable: false,
    selectable: true,
    events: calendarEvents.value,
    eventClick: handleEventClick,
    select: handleDateSelect,
    eventContent: (arg: EventContentArg) => {
      const shiftData = arg.event.extendedProps.shiftData as DoctorShiftWithPivot
      const staffAvatarsHtml = shiftData.staffs
        .slice(0, 3)
        .map(
          (staff) => `
        <div class="fc-event-avatar-wrapper">
          <img src="${staff.user?.avatar || '/defaultAvatar.png'}" class="fc-event-avatar" />
          <div class="fc-event-avatar-status ${getStaffStatusColor(staff.pivot_status)}"></div>
        </div>
      `,
        )
        .join('')

      const moreStaffHtml =
        shiftData.staffs.length > 3
          ? `<div class="fc-event-avatar-more">+${shiftData.staffs.length - 3}</div>`
          : ''

      return {
        html: `
        <div class="fc-event-main-frame">
          <div class="fc-event-title text-white">${arg.event.title}</div>
          <div class="fc-event-avatars">${staffAvatarsHtml}${moreStaffHtml}</div>
        </div>
      `,
      }
    },
    eventDidMount: (info) => {
      const shiftData = info.event.extendedProps.shiftData as DoctorShiftWithPivot
      const staffListHtml = shiftData.staffs
        .map(
          (staff) => `
        <div class="tippy-staff-row">
          <div class="tippy-status-dot" style="background-color: ${getStaffStatusColor(staff.pivot_status, true)};"></div>
          <span>${staff.user?.name} (${getStaffStatusText(staff.pivot_status)})</span>
        </div>
      `,
        )
        .join('')

      tippy(info.el, {
        content: `<div class="tippy-content-wrapper"><h4>Nhân Viên Trực</h4>${staffListHtml}</div>`,
        allowHTML: true,
        theme: 'light-border',
      })
    },
    eventWillUnmount: (info) => {
      const tippyInstance = (info.el as any)._tippy as TippyInstance
      if (tippyInstance) tippyInstance.destroy()
    },
    dayMaxEvents: true,
    height: 'auto',
    eventDisplay: 'block',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false,
      hour12: false,
    },
  }),
)

// Methods
const fetchAllData = async () => {
  await Promise.all([
    departmentStore.fetchDepartments(0, 1000),
    staffStore.fetchAllStaffs(0, 1000),
    scheduleStore.fetchAllSchedule(0, 1000),
  ])
}

const resetForm = () => {
  Object.assign(formState, {
    id: undefined,
    departmentId: '',
    staffIds: [],
    shiftValue: 'morning',
    dayWork: new Date().toISOString().slice(0, 10),
  })
  formRef.value?.reset()
  return true
}

const openAssignModal = (shift: DoctorShiftWithPivot | null = null) => {
  resetForm()
  if (shift) {
    const shiftInfo = getShiftInfo(shift)
    formState.id = shift.id
    formState.dayWork = shift.dayWork
    formState.staffIds = shift.staffs.map((s) => s.id)
    formState.shiftValue = shiftInfo.value as any
    formState.departmentId = shift.departments?.id || ''
  }
  isAssignModalVisible.value = true
}

const removeStaffFromSelection = (staffIdToRemove: string) => {
  formState.staffIds = formState.staffIds.filter((id) => id !== staffIdToRemove)
}

const handleSubmit = async () => {
  const isValid = await formRef.value.validate()
  if (!isValid) return
  isSubmitting.value = true
  const selectedShift = shiftTimes.find((s) => s.value === formState.shiftValue)!
  const payload: DoctorShiftCreateRequest | DoctorShiftUpdateRequest = {
    startTime: selectedShift.start,
    endTime: selectedShift.end,
    dayWork: formState.dayWork,
    staffIds: formState.staffIds,
    status: 'PENDING',
    departmentId: formState.departmentId || undefined,
  }

  try {
    if (formState.id) {
      await scheduleStore.updateById(formState.id, payload)
      toast.success('Cập nhật yêu cầu thành công!')
    } else {
      await scheduleStore.createSchedule(payload as DoctorShiftCreateRequest)
      toast.success('Đã gửi yêu cầu đến các nhân viên!')
    }
    isAssignModalVisible.value = false
    await fetchAllData()
  } catch (error: any) {
    toast.error(error.message || 'Thao tác thất bại.')
  } finally {
    isSubmitting.value = false
  }
}

const handleEventClick = (clickInfo: EventClickArg) => {
  const shiftData = clickInfo.event.extendedProps.shiftData as DoctorShiftWithPivot
  if (canModifyShift(shiftData)) {
    openAssignModal(shiftData)
  } else {
    toast.info('Chỉ có thể chỉnh sửa các ca trực ở trạng thái "Chờ xác nhận".')
  }
}

const handleDateSelect = (selectInfo: DateSelectArg) => {
  resetForm()
  formState.dayWork = selectInfo.startStr
  isAssignModalVisible.value = true
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
    isDeleteModalVisible.value = false
  }
}

const canModifyShift = (shift: DoctorShift) => shift.status === 'PENDING'

const getShiftInfo = (shift: DoctorShift) => {
  const foundShift = shiftTimes.find(
    (st) => st.start === shift.startTime && st.end === shift.endTime,
  )

  if (!foundShift) {
    console.warn(
      `CẢNH BÁO: Không tìm thấy thông tin ca trực cho: ${shift.startTime} - ${shift.endTime}. Sử dụng ca mặc định. Vui lòng kiểm tra và cập nhật hằng số 'shiftTimes'.`,
    )
    return shiftTimes[0]
  }

  return foundShift
}

const getStaffStatusText = (status: string) =>
  ({ PENDING: 'Chờ', APPROVED: 'Xác nhận', COMPLETED: 'Hoàn thành', CANCELED: 'Từ chối' })[status] || 'Không rõ'

const getStaffStatusColor = (status: string, isHex = false) => {
  const map: Record<string, string> = {
    PENDING: '#FFC107',
    APPROVED: '#28A745',
    COMPLETED: 'blue',
    CANCELED: '#DC3545',
  }
  const vaMap: Record<string, string> = {
    PENDING: 'warning',
    APPROVED: 'success',
    COMPLETED: 'info',
    CANCELED: 'danger',
  }
  return isHex ? map[status] || '#6c757d' : vaMap[status] || 'secondary'
}

onMounted(fetchAllData)
</script>

<style lang="scss">
// --- Biến Màu Sắc & Giao Diện ---
$primary-color: #0288d1;
$primary-color-dark: #01579b;
$background-color: #f8f9fa;
$card-background: #ffffff;
$text-color: #212529;
$text-muted-color: #6c757d;

// --- Thiết Lập Font Chữ ---
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

// --- Tổng Thể Trang ---
.schedule-calendar-page {
  padding: 2rem;
  background-color: $background-color;
  min-height: 100vh;
  font-family: 'Be Vietnam Pro', sans-serif;
}

// --- Header Của Trang ---
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  .header-text {
    .va-h4 {
      font-weight: 700;
      color: $primary-color-dark;
      margin-bottom: 0.25rem;
    }
    .text-muted {
      color: $text-muted-color;
      font-size: 1rem;
    }
  }
}

// --- Thẻ Lịch ---
.calendar-card {
  border-radius: 12px;
  overflow: hidden;
  background-color: $card-background;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  .va-card-content {
    padding: 1.5rem;
  }
}
th {
  z-index: 0 !important;
}
// --- Tùy Chỉnh FullCalendar ---
.fc {
  --fc-button-bg-color: #{$primary-color};
  --fc-button-hover-bg-color: #{$primary-color-dark};
  --fc-button-active-bg-color: #{$primary-color-dark};
  --fc-button-border-color: transparent;
  --fc-button-text-color: #fff;
  --fc-today-bg-color: rgba(79, 195, 247, 0.15);
  --fc-border-color: #dee2e6;

  .fc-toolbar-title {
    font-weight: 600;
    color: $primary-color-dark;
  }
  .fc-daygrid-day-number {
    color: $text-muted-color;
    padding: 8px;
  }
}

// --- Tùy Chỉnh Giao Diện Sự Kiện ---
.fc-event-main-frame {
  padding: 6px 8px;
  overflow: hidden;
  height: 100%;
  border-radius: 6px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  }
}

.fc-event-title {
  font-weight: 600;
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.25);
}
.fc-event-avatars {
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.fc-event-avatar-wrapper {
  position: relative;
  &:not(:first-child) {
    margin-left: -12px;
  }
}

.fc-event-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid $card-background;
  object-fit: cover;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  background-color: #e0e0e0;
}

.fc-event-avatar-status {
  position: absolute;
  bottom: -1px;
  right: -1px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  border: 2px solid $card-background;
  &.success {
    background-color: #28a745;
  }
  &.warning {
    background-color: #ffc107;
  }
  &.danger {
    background-color: #dc3545;
  }
}

.fc-event-avatar-more {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2px solid $card-background;
  margin-left: -12px;
  background-color: $text-muted-color;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: bold;
}

// --- Tùy Chỉnh Tooltip (Tippy.js) ---
.tippy-box[data-theme~='light-border'] {
  border: 1px solid #dee2e6;
  font-size: 0.9rem;
  border-radius: 8px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
  background: $card-background;
  color: $text-color;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.tippy-content-wrapper {
  padding: 12px;
  h4 {
    margin: 0 0 12px 0;
    font-weight: 600;
    color: $primary-color;
    border-bottom: 1px solid #e9ecef;
    padding-bottom: 8px;
  }
  .tippy-staff-row {
    display: flex;
    align-items: center;
    padding: 6px 0;
    &:not(:last-child) {
      margin-bottom: 4px;
    }
    .tippy-status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 10px;
      flex-shrink: 0;
    }
  }
}

// --- Tùy Chỉnh Modal ---
.custom-modal {
  // Áp dụng hiệu ứng kính mờ cho lớp phủ (background)
  .va-modal__overlay {
    background: rgba(22, 22, 22, 0.6);
    backdrop-filter: blur(8px);
  }

  // Hộp thoại modal bây giờ chỉ cần có nền trắng và bóng đổ
  .va-modal__container {
    background: $card-background;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }

  .va-modal__header {
    background-color: rgba(2, 136, 209, 0.05);
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-form {
    padding: 1.5rem 2rem 2rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .va-input {
    --va-input-border-radius: 8px;
    --va-input-color: #{$text-color};
  }

  .va-chip {
    --va-chip-border-radius: 6px;
  }
}

// --- Định Nghĩa Màu Sắc Cho Các Class Ca Trực ---
.fc-event.morning-shift .fc-event-main-frame {
  background: linear-gradient(135deg, #4dabf7 0%, #228be6 100%);
}

.fc-event.afternoon-shift .fc-event-main-frame {
  background: linear-gradient(135deg, #ffdd57 0%, #ffc107 100%);
}

.fc-event.night-shift .fc-event-main-frame {
  background: linear-gradient(135deg, #be95c4 0%, #8e44ad 100%);
}

.fc-event.overnight-shift .fc-event-main-frame {
  background: linear-gradient(135deg, #5c6bc0 0%, #311b92 100%);
}
</style>
