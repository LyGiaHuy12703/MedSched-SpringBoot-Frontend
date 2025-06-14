<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Quản lý lịch hẹn</h4>
      <p class="text-center">Xem và quản lý các lịch hẹn đã đặt.</p>

      <div class="d-flex my-3 selected-container">
        <va-select
          v-model="filterStatus"
          :options="optionsStatus"
          :rules="[(v) => !!v || 'Trạng thái là bắt buộc']"
          required-mark
          value-by="value"
          text-by="text"
          @update:model-value="fetchFilteredAppointments"
          class="status-filter"
        />
        <va-input
          v-model="searchQuery"
          placeholder="Tìm theo tên hoặc mã lịch hẹn"
          class="search-input"
          style="margin-left: 10px"
        >
          <template #prepend>
            <va-icon name="search" />
          </template>
        </va-input>
      </div>
      <va-data-table :items="filteredAppointments" :columns="columns" class="custom-table">
        <template #cell(staff)="slotProps">
          <span class="staff-name">
            {{ slotProps.rowData.staff.user?.name || 'Không có nhân viên' }}
          </span>
        </template>
        <template #cell(doctor)="slotProps">
          <span class="staff-name">
            {{ slotProps.rowData.doctorShift.staff?.user?.name || 'Chưa phân công' }}
          </span>
        </template>
        <template #cell(dateTime)="slotProps">
          <span>
            {{ formatDate(slotProps.rowData.date) }} {{ formatTime(slotProps.rowData.time) }}
          </span>
        </template>
        <template #cell(status)="slotProps">
          <span
            v-if="
              ['completed', 'cancelled', 'no-show', 'confirmed'].includes(slotProps.rowData.status)
            "
            :class="`status-text ${slotProps.rowData.status}`"
          >
            {{ getStatusText(slotProps.rowData.status) }}
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

  <va-modal v-model="isDetailModalOpen" @close="closeAppointmentDetail">
    <template #header>
      <h2>Chi tiết lịch hẹn</h2>
    </template>
    <div v-if="selectedAppointment" class="appointment-detail">
      <div class="detail-section">
        <h4>Thông tin nhân viên</h4>
        <div class="patient-detail">
          <div>
            <div>
              <strong>Họ tên:</strong> {{ selectedAppointment.staff.user?.name || 'Chưa có' }}
            </div>
            <div><strong>Lý do:</strong> {{ selectedAppointment.reason }}</div>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h4>Thông tin bác sĩ</h4>
        <div class="doctor-detail">
          <div>
            <div>
              <strong>Bác sĩ:</strong>
              {{ selectedAppointment.doctorShift.staff?.user?.name || 'Chưa phân công' }}
            </div>
            <div>
              <strong>Ngày trực:</strong> {{ formatDate(selectedAppointment.doctorShift.dayWork) }}
            </div>
          </div>
        </div>
      </div>
      <div class="detail-section">
        <h4>Thông tin lịch hẹn</h4>
        <div>
          <div>
            <strong>Ngày giờ:</strong> {{ formatDate(selectedAppointment.date) }}
            {{ formatTime(selectedAppointment.time) }}
          </div>
          <div><strong>Trạng thái:</strong> {{ getStatusText(selectedAppointment.status) }}</div>
        </div>
      </div>
    </div>
  </va-modal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'

const appointments = ref<Appointment[]>([])
const searchQuery = ref('')
const filterStatus = ref('')
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)

const optionsStatus = ref([
  { text: 'Chờ xác nhận', value: 'pending' },
  { text: 'Đã xác nhận', value: 'confirmed' },
  { text: 'Hoàn thành', value: 'completed' },
  { text: 'Đã hủy', value: 'cancelled' },
  { text: 'Không đến', value: 'no-show' },
])

const columns = ref([
  { label: 'Mã lịch hẹn', value: 'id', key: 'id' },
  { label: 'Bệnh nhân', value: 'user', key: 'user' },
  { label: 'Bác sĩ', value: 'doctor', key: 'doctor' },
  { label: 'Ngày & Giờ', value: 'dateTime', key: 'dateTime' },
  { label: 'Trạng thái', value: 'status', key: 'status' },
])

const appointmentStore = useAppointmentStore()

const filteredAppointments = computed(() => {
  let result = [...appointments.value]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (apt) =>
        apt.staff.user?.name.toLowerCase().includes(query) ||
        apt.id.toLowerCase().includes(query) ||
        apt.doctorShift.staff?.user?.name.toLowerCase().includes(query),
    )
  }
  if (filterStatus.value) {
    result = result.filter((apt) => apt.status === filterStatus.value)
  }
  return result
})

const fetchFilteredAppointments = async (statusFetch?: string) => {
  try {
    await appointmentStore.fetchAppointmentsByDoctor(0, 100)
    appointments.value = appointmentStore.appointments
  } catch (error) {
    console.error('Lỗi khi fetch lịch hẹn:', error)
  }
}

const getValidStatusOptions = (currentStatus: string) => {
  const allOptions = [
    { text: 'Chờ xác nhận', value: 'pending' },
    { text: 'Đã xác nhận', value: 'confirmed' },
    { text: 'Đã hủy', value: 'cancelled' },
  ]
  if (currentStatus === 'pending') {
    return allOptions.filter(
      (option) => option.value === 'confirmed' || option.value === 'cancelled',
    )
  }
  return []
}

const getStatusText = (status: string) => {
  const option = optionsStatus.value.find((opt) => opt.value === status)
  return option?.text || status
}

const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN')
const formatTime = (time: string) => time

const closeAppointmentDetail = () => {
  isDetailModalOpen.value = false
  selectedAppointment.value = null
}

const handleUpdateStatus = async (
  appointmentId: string,
  newStatus: string,
  originalStatus: string,
) => {
  try {
    // await appointmentStore.updateAppointment(appointmentId, newStatus)
    toast.success('Cập nhật trạng thái thành công')
    filterStatus.value = newStatus
    await fetchFilteredAppointments(newStatus)
  } catch (error: unknown) {
    toast.error(error.message || 'Cập nhật trạng thái thất bại')
    const appointment = appointments.value.find((apt) => apt.id === appointmentId)
    if (appointment) {
      appointment.status = originalStatus
    }
  }
}

onMounted(async () => {
  await fetchFilteredAppointments()
})
</script>

<style scoped lang="scss">
.selected-container {
  justify-content: end;
  margin-bottom: 20px;
}

.status-filter {
  width: 200px;
}

.search-input {
  width: 250px;
}

.custom-table {
  :deep(.va-data-table__table-thead) {
    background-color: #ecf0f1 !important;
    font-weight: bold;
  }

  :deep(.va-data-table__table-row) {
    transition: background-color 0.3s ease;
    &:hover {
      background-color: #f5f7fa !important;
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
      background-color: #ffeb3b;
      color: #333;
    }

    &.confirmed {
      background-color: #4caf50;
      color: white;
    }

    &.completed {
      background-color: #9e9e9e;
      color: white;
    }

    &.cancelled {
      background-color: #f44336;
      color: white;
    }

    &.no-show {
      background-color: #9c27b0;
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

.appointment-detail {
  .detail-section {
    margin-bottom: 1.5rem;

    h4 {
      font-size: 1rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .patient-detail,
    .doctor-detail {
      display: flex;
      align-items: center;
      gap: 1rem;

      div {
        font-size: 0.9rem;
        color: #2c3e50;

        strong {
          color: #7f8c8d;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .selected-container {
    flex-direction: column;
    align-items: end;

    .status-filter,
    .search-input {
      width: 100%;
      margin-bottom: 10px;
    }
  }

  .custom-table .status-text {
    font-size: 10px;
    padding: 1px 6px;
  }
}
</style>
