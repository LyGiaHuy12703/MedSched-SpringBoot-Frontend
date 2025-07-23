<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Thông tin lịch trực</h4>
      <p class="text-center">Thông tin được nhân viên quản trị (Administrator) phân công.</p>

      <div class="d-flex my-3 selected-container">
        <va-select
          v-model="status"
          :options="optionsStatus"
          :rules="[(v) => !!v || 'Trạng thái là bắt buộc']"
          required-mark
          value-by="value"
          text-by="text"
          @update:model-value="fetchInitialData"
          class="status-filter"
        />
      </div>
      <va-data-table :items="schedules" :columns="columns" class="custom-table" hoverable>
        <template #cell(name)="slotProps">
          <span class="staff-name">{{
            slotProps.rowData.staffs
              ?.map((staff) => staff.user?.name)
              .filter((name) => name)
              .join(', ') || 'Không có nhân viên'
          }}</span>
        </template>
        <template #cell(status)="slotProps">
          <span
            v-if="
              ['COMPLETED', 'CANCELED', 'APPROVED', 'IN_PROGRESS'].includes(
                slotProps.rowData.status,
              )
            "
            :class="`status-text ${slotProps.rowData.status.toLowerCase()}`"
          >
            {{ slotProps.rowData.status }}
          </span>
          <va-select
            v-else
            v-model="slotProps.rowData.status"
            :options="getValidStatusOptions(slotProps.rowData.status)"
            value-by="value"
            text-by="text"
            @update:model-value="
              handleUpdateStatus(slotProps.rowData.id, $event, slotProps.rowData.status)
            "
            class="status-select"
          />
        </template>
      </va-data-table>
    </va-card-content>
  </va-card>
</template>

<script lang="ts" setup>
import type { DoctorShift } from '@/interfaces/doctorShift.interfaces'
import { useScheduleStore } from '@/stores/schedule.store'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'

// Enum ShiftStatusEnum dưới dạng object trong TypeScript
const ShiftStatusEnum = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const

// Hàm kiểm tra chuyển trạng thái hợp lệ
const isValidStatusTransition = (currentStatus: string, newStatus: string): boolean => {
  switch (currentStatus) {
    case ShiftStatusEnum.PENDING:
      return newStatus === ShiftStatusEnum.APPROVED || newStatus === ShiftStatusEnum.CANCELED
    case ShiftStatusEnum.APPROVED:
    case ShiftStatusEnum.IN_PROGRESS:
    case ShiftStatusEnum.COMPLETED:
    case ShiftStatusEnum.CANCELED:
      return false
    default:
      return false
  }
}

// Hàm lấy các tùy chọn trạng thái hợp lệ
const getValidStatusOptions = (currentStatus: string) => {
  const allOptions = [
    { text: 'Chờ xác nhận', value: 'PENDING' },
    { text: 'Xác nhận', value: 'APPROVED' },
    { text: 'Đang diễn ra', value: 'IN_PROGRESS' },
    { text: 'Đã hủy', value: 'CANCELED' },
    { text: 'Đã hoàn thành', value: 'COMPLETED' },
  ]
  return allOptions.filter(
    (option) =>
      isValidStatusTransition(currentStatus, option.value) || option.value === currentStatus,
  )
}

const status = ref('2')
const schedules = ref<DoctorShift[]>([])
const optionsStatus = ref([
  { text: 'Chờ xác nhận', value: '0' },
  { text: 'Đã xác nhận', value: '1' },
  { text: 'Đang diễn ra', value: '2' },
  { text: 'Đã hủy', value: '4' },
  { text: 'Đã hoàn thành', value: '3' },
])
const optionsStatusChange = ref([
  { text: 'Chờ xác nhận', value: 'PENDING' },
  { text: 'Xác nhận', value: 'APPROVED' },
  { text: 'Đang diễn ra', value: 'IN_PROGRESS' },
  { text: 'Đã hủy', value: 'CANCELED' },
  { text: 'Đã hoàn thành', value: 'COMPLETED' },
])
const columns = ref([
  { label: 'ID', value: 'id', key: 'id' },
  { label: 'Nhân viên tiếp nhận ca trực', value: 'name', key: 'name' },
  { label: 'Ngày trực', value: 'dayWork', key: 'dayWork' },
  { label: 'Giờ bắt đầu', value: 'startTime', key: 'startTime' },
  { label: 'Giờ kết thúc', value: 'endTime', key: 'endTime' },
  { label: 'Trạng thái', value: 'status', key: 'status' },
])

const scheduleStore = useScheduleStore()

onMounted(async () => {
  await fetchInitialData(status.value)
})

const fetchInitialData = async (statusFetch?: string) => {
  await scheduleStore.fetchSchedulesByStaff(0, 100, statusFetch)
  schedules.value = scheduleStore.schedules
}

const handleUpdateStatus = async (id: string, newStatus: string, originalStatus: string) => {
  try {
    await scheduleStore.updateStatusSchedule(id, newStatus)
    toast.success('Cập nhật trạng thái thành công')
    status.value =
      optionsStatus.value.find(
        () =>
          optionsStatusChange.value.find((change) => change.value === newStatus)?.submissionValue ||
          newStatus,
      )?.value || status.value
    await fetchInitialData(status.value)
  } catch (error: unknown) {
    toast.error(error.message || 'Cập nhật trạng thái thất bại')
    const row = schedules.value.find((item) => item.id === id)
    if (row) {
      row.status = originalStatus
    }
  }
}
</script>

<style scoped lang="scss">
.selected-container {
  justify-content: end;
  margin-bottom: 20px;
}

.status-filter {
  width: 200px;
}

.custom-table {
  :deep(.va-data-table__table-thead) {
    background-color: #ecf0f1 !important; /* Màu header */
    font-weight: bold;
  }

  :deep(.va-data-table__table-row) {
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #f5f7fa !important; /* Màu khi hover */
    }
  }

  .staff-name {
    font-size: 14px;
    color: #2c3e50;
  }

  .status-text {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
    font-size: 12px;
    text-transform: capitalize;

    &.pending {
      background-color: #ffeb3b; /* Vàng nhạt - Chờ xác nhận */
      color: #333;
    }

    &.approved {
      background-color: #4caf50; /* Xanh lá - Đã xác nhận */
      color: white;
    }

    &.in_progress {
      background-color: #2196f3; /* Xanh dương - Đang diễn ra */
      color: white;
    }

    &.canceled {
      background-color: #f44336; /* Đỏ - Đã hủy */
      color: white;
    }

    &.completed {
      background-color: #9e9e9e; /* Xám - Đã hoàn thành */
      color: white;
    }
  }

  .status-select {
    :deep(.va-input-wrapper__fieldset) {
      width: 150px;
      border-color: #ccc;

      &:hover {
        border-color: #888;
      }
    }

    :deep(.va-select-option) {
      padding: 5px 10px;
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
