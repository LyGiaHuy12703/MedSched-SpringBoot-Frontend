<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Medicine } from '@/interfaces/medicine.interface'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

// === STORES ===
const appointmentStore = useAppointmentStore()
const medicineStore = useMedicineStore()

// === TRẠNG THÁI CỦA COMPONENT ===
const appointments = ref<Appointment[]>([])
const searchQuery = ref('')
const filterDate = ref<string>('') // State lọc theo ngày
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)
const isDeleteModalOpen = ref(false)

// --- Phân trang ---
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)
const totalPages = ref(0)

// --- Trạng thái giao diện cho Tabs ---
const activeTab = ref<'pending' | 'confirmed' | 'cancelled'>('pending')
const medicationOptions = ref<Medicine[]>([])

// === TÍNH TOÁN ===
const filterApiStatus = computed(() => {
  switch (activeTab.value) {
    case 'pending':
      return '0' // PENDING_PAYMENT
    case 'confirmed':
      return '1' // CONFIRMED
    case 'cancelled':
      return '2' // CANCELLED
    default:
      return '0'
  }
})

const filteredAppointments = computed(() => {
  let result = appointments.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    result = result.filter(
      (apt) =>
        (apt.name && apt.name.toLowerCase().includes(query)) ||
        apt.id.toLowerCase().includes(query),
    )
  }
  if (filterDate.value) {
    result = result.filter((apt) => {
      const appointmentDate = apt.date ? new Date(apt.date).toISOString().split('T')[0] : ''
      return appointmentDate === filterDate.value
    })
  }
  return result
})

// === CẤU HÌNH GIAO DIỆN ===
const columns = ref([
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'phone', label: 'Số điện thoại', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'actions', label: 'Thao tác' },
])

// === PHƯƠNG THỨC ===
const isValidDate = (dateString: string) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

const fetchAppointments = async () => {
  try {
    await appointmentStore.fetchAllAppointments(
      currentPage.value - 1,
      pageSize.value,
      filterApiStatus.value,
    )
    appointments.value = appointmentStore.appointments
    total.value = appointmentStore.meta?.total || 0
    totalPages.value = appointmentStore.meta?.pages || 0
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

const openDetailModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDetailModalOpen.value = true
}

const openDeleteModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDeleteModalOpen.value = true
}

const onCloseModalDelete = () => {
  isDeleteModalOpen.value = false
  selectedAppointment.value = null
}

const viewMedicalRecord = (appointmentId: string) => {
  toast.info(`Sẽ mở chi tiết hồ sơ cho lịch hẹn ${appointmentId}`)
}

const handleChangeStatus = async (id: string, newStatus: string) => {
  try {
    if (newStatus === 'CANCELLED') {
      if (!selectedAppointment.value) return
      await appointmentStore.changeStatus(newStatus, id)
      toast.success('Hủy lịch hẹn thành công.')
      isDeleteModalOpen.value = false
    } else {
      if (confirm('Bạn đã gọi điện xác nhận thành công?')) {
        if (!selectedAppointment.value) return
        await appointmentStore.changeStatus(newStatus, id)
        toast.success('Xác nhận lịch hẹn thành công.')
        isDetailModalOpen.value = false
      } else {
        return
      }
    }
    await fetchAppointments()
  } catch (error) {
    toast.error('Không thể cập nhật trạng thái lịch hẹn.')
  }
}

// --- Định dạng ---
const formatDate = (date: string | undefined) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
const formatTime = (time: string | undefined) => (time ? time.substring(0, 5) : 'N/A')
const getStatusText = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'PENDING_PAYMENT'
    case 'CONFIRMED':
      return 'CONFIRMED'
    case 'CANCELLED':
      return 'CANCELLED'
    default:
      return 'UNKNOWN'
  }
}
const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING_PAYMENT':
      return 'warning'
    case 'CONFIRMED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    default:
      return 'secondary'
  }
}

// === VÒNG ĐỜI VÀ WATCH ===
onMounted(async () => {
  await fetchAppointments()
  await fetchMedications()
})

watch([activeTab, currentPage, filterDate], () => {
  currentPage.value = 1 // Reset về trang 1 khi status hoặc ngày thay đổi
  fetchAppointments()
})
</script>

<template>
  <va-inner-loading :loading="appointmentStore.loading">
    <va-card>
      <va-card-content>
        <h4 class="va-h4 text-center">Quản lý lịch hẹn của bệnh nhân</h4>
        <p class="text-center text-gray-600">
          Thông tin bệnh nhân đặt lịch chưa đăng ký tại hệ thống. Nhân viên xác nhận qua điện thoại.
        </p>

        <!-- BỘ LỌC VÀ TÌM KIẾM -->
        <div class="d-flex my-4 selected-container justify-between">
          <va-tabs
            v-model="activeTab"
            grow
            class="status-tabs"
            @update:model-value="fetchAppointments"
          >
            <va-tab name="pending" value="0">
              <va-icon name="hourglass_bottom" class="mr-2" /> Chưa xác nhận
            </va-tab>
            <va-tab name="confirmed" value="1">
              <va-icon name="check_circle" class="mr-2" /> Đã xác nhận
            </va-tab>
            <va-tab name="cancelled" value="2">
              <va-icon name="cancel" class="mr-2" /> Đã hủy
            </va-tab>
          </va-tabs>
          <div class="d-flex gap-3">
            <va-input
              v-model="filterDate"
              type="date"
              label="Lọc theo ngày"
              class="date-input input-field"
              clearable
              :rules="[(v) => !v || isValidDate(v) || 'Ngày không hợp lệ']"
            />
          </div>
        </div>

        <!-- BẢNG DỮ LIỆU -->
        <va-data-table
          :items="filteredAppointments"
          :columns="columns"
          class="custom-table"
          no-data-html="<div class='text-center text-gray-500 py-4'>Không có lịch hẹn nào.</div>"
          hoverable
        >
          <template #cell(patient)="{ rowData }">
            <div class="d-flex align-center">
              <va-avatar
                :src="rowData.user?.avatar || '/defaultAvatar.png'"
                size="small"
                class="mr-3"
              />
              <div>
                <div class="font-semibold text-gray-800">{{ rowData.name || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ rowData.user?.id || 'N/A' }}</div>
              </div>
            </div>
          </template>
          <template #cell(phone)="{ rowData }">
            <div class="font-semibold text-gray-800">{{ rowData.phoneReceiveInfo || 'N/A' }}</div>
          </template>
          <template #cell(email)="{ rowData }">
            <div>{{ rowData.emailReceiveInfo || 'N/A' }}</div>
          </template>
          <template #cell(actions)="{ rowData }">
            <div class="d-flex align-center gap-2">
              <va-button
                v-if="rowData.status === 'PENDING_PAYMENT'"
                preset="primary"
                icon="check"
                @click="openDetailModal(rowData)"
                title="Xác nhận lịch hẹn"
                class="action-button"
              >
                Xác nhận
              </va-button>
              <va-button
                v-if="rowData.status === 'PENDING_PAYMENT'"
                preset="primary"
                icon="cancel"
                color="danger"
                @click="openDeleteModal(rowData)"
                title="Hủy lịch hẹn"
                class="action-button"
              >
                Hủy
              </va-button>
              <va-button
                v-if="rowData.status !== 'PENDING_PAYMENT'"
                preset="primary"
                icon="visibility"
                @click="openDetailModal(rowData)"
                title="Xem chi tiết lịch hẹn"
                class="action-button"
              >
                Xem chi tiết
              </va-button>
              <va-button
                v-if="rowData.status === 'COMPLETED'"
                preset="primary"
                icon="description"
                color="info"
                @click="viewMedicalRecord(rowData.id)"
                title="Xem hồ sơ bệnh án"
                class="action-button"
              >
                Hồ sơ
              </va-button>
            </div>
          </template>
        </va-data-table>

        <!-- PHÂN TRANG -->
        <div class="d-flex justify-end my-4">
          <VaPagination
            v-model="currentPage"
            :total="total"
            :pages="totalPages"
            :page-size="pageSize"
            @update:page-size="pageSize = $event"
            :page-size-options="[5, 10, 20]"
            :visible-pages="5"
            class="action-button"
          />
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>

  <!-- MODAL CHI TIẾT LỊCH HẸN -->
  <va-modal v-model="isDetailModalOpen" hide-default-actions max-width="800px" class="custom-modal">
    <template #header>
      <h2
        class="text-xl font-semibold text-gray-800 d-flex align-center bg-gradient-to-r from-gray-100 to-gray-200 p-5 rounded-t-lg"
      >
        <va-icon name="event_note" size="medium" class="mr-3 text-primary" />
        Chi tiết lịch hẹn #{{ selectedAppointment?.id }}
      </h2>
    </template>
    <div v-if="selectedAppointment" class="p-6 space-y-8">
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Thông tin bệnh nhân</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Họ tên:</strong>
              <span class="text-gray-700">{{ selectedAppointment.name || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Lý do khám:</strong>
              <span class="text-gray-700">{{ selectedAppointment.reason || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Số điện thoại:</strong>
              <span class="text-gray-700">{{ selectedAppointment.phoneReceiveInfo || 'N/A' }}</span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Email:</strong>
              <span class="text-gray-700">{{ selectedAppointment.emailReceiveInfo || 'N/A' }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Thông tin bác sĩ</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Bác sĩ:</strong>
              <span class="text-gray-700">{{
                selectedAppointment.staff?.user?.name || 'Chưa phân công'
              }}</span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Ngày trực:</strong>
              <span class="text-gray-700">{{
                formatDate(selectedAppointment.doctorShift?.dayWork)
              }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Thông tin lịch hẹn</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Ngày giờ:</strong>
              <span class="text-gray-700">
                {{ formatDate(selectedAppointment.date) }}
                {{ formatTime(selectedAppointment.time) }}
              </span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-800 font-medium w-32">Trạng thái:</strong>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="{
                  'bg-yellow-100 text-yellow-800':
                    getStatusText(selectedAppointment.status) === 'PENDING_PAYMENT',
                  'bg-green-100 text-green-800':
                    getStatusText(selectedAppointment.status) === 'CONFIRMED',
                  'bg-red-100 text-red-800':
                    getStatusText(selectedAppointment.status) === 'CANCELLED',
                }"
              >
                <span v-if="getStatusText(selectedAppointment.status) === 'PENDING_PAYMENT'"
                  >Chưa xác nhận</span
                >
                <span v-else-if="getStatusText(selectedAppointment.status) === 'CONFIRMED'"
                  >Đã xác nhận</span
                >
                <span v-else-if="getStatusText(selectedAppointment.status) === 'CANCELLED'"
                  >Đã hủy</span
                >
                <span v-else>Không xác định</span>
              </span>
            </div>
          </div>
        </va-card-content>
      </section>

      <div class="flex justify-end gap-4 pt-6">
        <va-button
          v-if="selectedAppointment.status === 'PENDING_PAYMENT'"
          preset="primary"
          icon="cancel"
          color="danger"
          class="px-6 py-2 action-button"
          @click="openDeleteModal(selectedAppointment)"
        >
          Hủy
        </va-button>
        <va-button
          v-if="selectedAppointment.status === 'PENDING_PAYMENT'"
          preset="primary"
          icon="check"
          color="success"
          class="px-6 py-2 action-button"
          @click="handleChangeStatus(selectedAppointment.id, 'CONFIRMED')"
        >
          Xác nhận
        </va-button>
        <va-button
          preset="secondary"
          class="px-6 py-2 action-button text-gray-600"
          @click="isDetailModalOpen = false"
        >
          Đóng
        </va-button>
      </div>
    </div>
  </va-modal>

  <!-- MODAL XÁC NHẬN HỦY -->
  <va-modal v-model="isDeleteModalOpen" hide-default-actions max-width="500px" class="custom-modal">
    <template #header>
      <h2
        class="text-xl font-semibold text-gray-800 d-flex align-center bg-gradient-to-r from-gray-100 to-gray-200 p-5 rounded-t-lg"
      >
        <va-icon name="cancel" size="medium" class="mr-3 text-red-600" />
        Xác nhận hủy lịch hẹn
      </h2>
    </template>
    <div class="p-6">
      <DeleteConfirm
        v-if="selectedAppointment"
        :title="'Xác nhận hủy lịch hẹn'"
        :message="'Bạn có chắc chắn muốn hủy lịch hẹn này không?'"
        @confirm="handleChangeStatus(selectedAppointment.id, 'CANCELLED')"
        @close-confirm="onCloseModalDelete"
        class="delete-confirm"
      />
    </div>
  </va-modal>
</template>

<style scoped lang="scss">
.selected-container {
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.status-tabs {
  max-width: 600px;
  :deep(.va-tabs__tabs) {
    border-radius: 8px;
    overflow: hidden;
  }
  :deep(.va-tab) {
    font-weight: 500;
    padding: 0.75rem 1rem;
    transition: all 0.3s ease;
    &.va-tab--active {
      background-color: var(--va-primary);
      color: white;
    }
  }
}

.date-input {
  flex-grow: 1;
  max-width: 200px;
  :deep(.va-input-wrapper) {
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
}

.input-field {
  :deep(.va-input-wrapper) {
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    transition: all 0.2s ease;
    &:hover {
      border-color: var(--va-primary);
    }
  }
  :deep(.va-input-wrapper__label) {
    font-weight: 500;
    color: #1e293b;
  }
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  :deep(.va-data-table__table) {
    border-collapse: separate;
    border-spacing: 0;
  }
  :deep(.va-data-table__table-thead) {
    background-color: #f1f5f9 !important;
    th {
      font-weight: 600;
      color: #1e293b;
      padding: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }
  }
  :deep(.va-data-table__table-row) {
    transition: background-color 0.2s ease;
    &:nth-child(even) {
      background-color: #f8fafc;
    }
    &:hover {
      background-color: #e5e7eb !important;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }
  }
}

.action-button {
  :deep(.va-button) {
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }
  }
}

.custom-modal {
  :deep(.va-modal__inner) {
    border-radius: 12px;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
  }
  :deep(.va-modal__content) {
    padding: 0;
  }
}

.modal-section {
  background-color: #f9fafb;
  border-radius: 10px;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  &:not(:last-child) {
    border-bottom: none;
  }
}

.delete-confirm {
  :deep(.va-card) {
    background-color: #fef2f2;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #fecaca;
  }
  :deep(h2) {
    font-size: 1.25rem;
    font-weight: 600;
    color: #b91c1c;
    margin-bottom: 1rem;
  }
  :deep(p) {
    font-size: 1rem;
    color: #4b5563;
    margin-bottom: 1.5rem;
  }
  :deep(.va-button) {
    border-radius: 6px;
    font-weight: 500;
    padding: 0.75rem 1.5rem;
    transition: all 0.2s ease;
    &:hover {
      transform: scale(1.05);
      box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
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
</style>
