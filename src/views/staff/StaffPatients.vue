<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Quản lý lịch hẹn của bệnh nhân</h4>
      <p class="text-center">
        Thông tin bệnh nhân đặt lịch chưa đăng ký tại hệ thống. Nhân viên xác nhận qua điện thoại.
      </p>

      <!-- BỘ LỌC VÀ TÌM KIẾM -->
      <div class="d-flex my-4 selected-container">
        <va-select
          v-model="filterStatus"
          :options="optionsStatus"
          label="Trạng thái lịch hẹn"
          value-by="value"
          text-by="text"
          class="status-filter"
          @update:model-value="fetchAppointments"
        />
        <va-input
          v-model="searchQuery"
          placeholder="Tìm theo tên bệnh nhân hoặc mã lịch hẹn"
          class="search-input"
        >
          <template #prepend-inner>
            <va-icon name="search" />
          </template>
        </va-input>
      </div>

      <!-- BẢNG DỮ LIỆU -->
      <va-data-table
        :items="filteredAppointments"
        :columns="columns"
        class="custom-table"
        no-data-html="Không có lịch hẹn nào."
        hoverable
      >
        <template #cell(patient)="slotProps">
          <div class="d-flex align-center">
            <va-avatar
              :src="slotProps.rowData.user?.avatar || '/defaultAvatar.png'"
              size="small"
              class="mr-2"
            />
            <div>
              <div>{{ slotProps.rowData.name }}</div>
              <div class="va-text-secondary">{{ slotProps.rowData.user?.id || '' }}</div>
            </div>
          </div>
        </template>

        <template #cell(phone)="slotProps">
          <div>
            <div class="font-weight-bold">{{ slotProps.rowData.phoneReceiveInfo }}</div>
          </div>
        </template>

        <template #cell(email)="slotProps">
          {{ slotProps.rowData.emailReceiveInfo }}
        </template>

        <template #cell(actions)="slotProps">
          <va-button
            v-if="slotProps.rowData.status === 'PENDING_PAYMENT'"
            preset="primary"
            @click="openDetailModal(slotProps.rowData)"
          >
            <va-icon name="check" />
            <span class="ml-1">Xác nhận</span>
          </va-button>
          <va-button
            v-if="slotProps.rowData.status === 'PENDING_PAYMENT'"
            preset="primary"
            class="ml-2"
            @click="openDeleteModal(slotProps.rowData)"
          >
            <va-icon name="cancel" />
            <span class="ml-1">Hủy</span>
          </va-button>
          <va-button
            v-if="slotProps.rowData.status !== 'PENDING_PAYMENT'"
            preset="primary"
            class="mr-2"
            @click="openDetailModal(slotProps.rowData)"
            title="Xem chi tiết lịch hẹn"
          >
            <va-icon name="visibility" />
            <span class="ml-1">Xem chi tiết</span>
          </va-button>

          <va-button
            color="info"
            v-if="slotProps.rowData.status === 'COMPLETED'"
            @click="viewMedicalRecord(slotProps.rowData.id)"
            title="Xem hồ sơ bệnh án"
          >
            <va-icon name="description" />
          </va-button>
        </template>
      </va-data-table>
    </va-card-content>
  </va-card>

  <!-- MODAL CHI TIẾT LỊCH HẸN -->
  <va-modal v-model="isDetailModalOpen" hide-default-actions max-width="700px">
    <template #header>
      <h2 class="va-h4 items-center">
        <va-icon name="event_note" class="mr-2" />
        Chi Tiết Lịch Hẹn
      </h2>
    </template>

    <div v-if="selectedAppointment" class="space-y-6">
      <h3>Thông tin bệnh nhân</h3>
      <va-card-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><strong>Họ tên:</strong> {{ selectedAppointment.name || 'Chưa có' }}</div>
          <div><strong>Lý do khám:</strong> {{ selectedAppointment.reason }}</div>
        </div>
      </va-card-content>
      <h3>Thông tin bác sĩ</h3>
      <va-card-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Bác sĩ:</strong>
            {{ selectedAppointment.staff.user?.name || 'Chưa phân công' }}
          </div>
          <div>
            <strong>Ngày trực:</strong> {{ formatDate(selectedAppointment.doctorShift.dayWork) }}
          </div>
        </div>
      </va-card-content>
      <h3>Thông tin lịch hẹn</h3>
      <va-card-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Ngày giờ:</strong>
            {{ formatDate(selectedAppointment.date) }} {{ formatTime(selectedAppointment.time) }}
          </div>
          <div><strong>Trạng thái:</strong> {{ getStatusText(selectedAppointment.status) }}</div>
        </div>
      </va-card-content>
      <div class="flex justify-end pt-4">
        <va-button
          v-if="selectedAppointment.status === 'PENDING_PAYMENT'"
          preset="primary"
          class="mr-2"
          @click="handleChangeStatus(selectedAppointment.id, 'CONFIRMED')"
          >Xác nhận</va-button
        >
        <va-button preset="primary" @click="isDetailModalOpen = false">Đóng</va-button>
      </div>
    </div>
  </va-modal>
  <va-modal v-model="isDeleteModalOpen" hide-default-actions max-width="500px">
    <DeleteConfirm
      v-if="selectedAppointment"
      v-model="isDetailModalOpen"
      :title="'Xác nhận hủy lịch hẹn'"
      :message="'Bạn có chắc chắn muốn hủy lịch hẹn này không?'"
      @confirm="handleChangeStatus(selectedAppointment.id, 'CANCELLED')"
    />
  </va-modal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Medicine } from '@/interfaces/medicine.interface'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

// === STATE MANAGEMENT ===
const appointments = ref<Appointment[]>([])
const searchQuery = ref('')
const filterStatus = ref('0')
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const openDeleteModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDeleteModalOpen.value = true
}
const openDetailModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDetailModalOpen.value = true
}

// State cho v-model của va-select, giúp reset dễ dàng
const medicationOptions = ref<Medicine[]>([])

// === STORES ===
const appointmentStore = useAppointmentStore()
const medicineStore = useMedicineStore()

// === UI CONFIG ===
const optionsStatus = ref([
  { text: 'Chưa xác nhận', value: '0' },
  { text: 'Đã xác nhận', value: '1' },
  { text: 'Đã hủy', value: '2' },
])
const columns = ref([
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'phone', label: 'Số điện thoại', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: 'Thao tác', width: '220px' },
])

// === COMPUTED PROPERTIES ===
const filteredAppointments = computed(() => {
  if (!searchQuery.value) return appointments.value
  const query = searchQuery.value.toLowerCase()
  return appointments.value.filter(
    (apt) =>
      (apt.name && apt.name.toLowerCase().includes(query)) || apt.id.toLowerCase().includes(query),
  )
})

// === METHODS ===
const fetchAppointments = async () => {
  try {
    await appointmentStore.fetchAppointmentsByDoctor(0, 100, filterStatus.value)
    appointments.value = appointmentStore.appointments
  } catch (error) {
    toast.error('Không thể tải danh sách lịch hẹn.')
  }
}

const fetchMedications = async () => {
  try {
    await medicineStore.fetchMedicines(0, 1000)
    medicationOptions.value = medicineStore.medicines
  } catch (error) {
    toast.error('Không thể tải danh sách thuốc.')
  }
}

const viewMedicalRecord = (appointmentId: string) => {
  toast.info(`Sẽ mở chi tiết hồ sơ cho lịch hẹn ${appointmentId}`)
}

// --- Formatters ---
const formatDate = (date: string | undefined) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
const formatTime = (time: string | undefined) => (time ? time.substring(0, 5) : 'N/A')
const getStatusText = (status: string) =>
  optionsStatus.value.find((o) => o.value === status)?.text || status

// === LIFECYCLE HOOKS ===
onMounted(async () => {
  await fetchAppointments()
  await fetchMedications()
})
const handleChangeStatus = async (id: string, newStatus: string) => {
  if (newStatus === 'CANCELLED') {
    if (!selectedAppointment.value) return
    try {
      await appointmentStore.changeStatus(newStatus, id)
      toast.success('Cập nhật trạng thái thành công.')
      isDeleteModalOpen.value = false
      await fetchAppointments() // Refresh appointments after status change
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái lịch hẹn.')
    }
  } else {
    if (confirm('Bạn đã gọi điện xác nhận thành công')) {
      if (!selectedAppointment.value) return
      try {
        await appointmentStore.changeStatus(newStatus, id)
        toast.success('Cập nhật trạng thái thành công.')
        isDetailModalOpen.value = false
        await fetchAppointments() // Refresh appointments after status change
      } catch (error) {
        toast.error('Không thể cập nhật trạng thái lịch hẹn.')
      }
    }
  }
}
</script>

<style scoped lang="scss">
.selected-container {
  justify-content: space-between;
  gap: 1rem;
}
.status-filter {
  width: 220px;
}
.search-input {
  flex-grow: 1;
  max-width: 400px;
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
.font-weight-bold {
  font-weight: 600;
}
.va-text-secondary {
  color: var(--va-secondary);
}

/* Modal Chẩn đoán */
.diagnosis-content {
  padding: 0 1rem 1rem 1rem;
}
.form-section {
  background-color: var(--va-background-tertiary);
  border-radius: 8px;
  padding: 1.5rem !important;
  height: 100%;
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 150px;
  color: var(--va-secondary);
}
.prescription-list {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 8px;
}
.prescription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid var(--va-background-border);
  &:last-child {
    border-bottom: none;
  }
}
.med-info {
  display: flex;
  flex-direction: column;
  strong {
    font-size: 0.9rem;
  }
  small {
    color: var(--va-secondary);
    font-size: 0.8rem;
  }
}
.add-med-form {
  border-top: 1px solid var(--va-background-border);
  padding-top: 1rem;
  margin-top: 1rem;
}
</style>
