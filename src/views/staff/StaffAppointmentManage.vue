<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Quản lý lịch hẹn của bác sĩ</h4>
      <p class="text-center">Xem và thực hiện chẩn đoán cho các lịch hẹn đã được xác nhận.</p>

      <!-- BỘ LỌC VÀ TÌM KIẾM -->
      <div class="d-flex my-4 selected-container">
        <va-select
          v-model="filterStatus"
          :options="optionsStatus"
          label="Lọc theo trạng thái"
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
              <div class="font-weight-bold">{{ slotProps.rowData.name }}</div>
              <div class="va-text-secondary">{{ slotProps.rowData.user?.email }}</div>
            </div>
          </div>
        </template>

        <template #cell(appointmentDateTime)="slotProps">
          <div>
            <div class="font-weight-bold">{{ formatTime(slotProps.rowData.time) }}</div>
            <div class="va-text-secondary">{{ formatDate(slotProps.rowData.date) }}</div>
          </div>
        </template>

        <template #cell(status)="slotProps">
          <va-chip size="small" :color="getStatusColor(slotProps.rowData.status)">
            <div v-if="getStatusText(slotProps.rowData.status) === 'CONFIRMED'">Đã xác nhận</div>
            <div v-else-if="getStatusText(slotProps.rowData.status) === 'COMPLETED'">
              Đã hoàn thành
            </div>
            <div v-else>Đã hủy</div>
          </va-chip>
        </template>

        <template #cell(actions)="slotProps">
          <va-button
            v-if="slotProps.rowData.status !== 'COMPLETED'"
            preset="primary"
            class="mr-2"
            @click="openDetailModal(slotProps.rowData)"
            title="Xem chi tiết lịch hẹn"
          >
            <va-icon name="visibility" />
            Xem chi tiết
          </va-button>
          <va-button
            v-if="slotProps.rowData.status === 'COMPLETED'"
            preset="primary"
            class="mr-2"
            @click="onOpenModalPrescriptions(slotProps.rowData)"
          >
            <va-icon name="visibility" />
            Chi tiết chẩn đoán
          </va-button>
          <va-button
            color="primary"
            v-if="slotProps.rowData.status === 'CONFIRMED'"
            @click="openAddDiagnosisModal(slotProps.rowData)"
            title="Thực hiện chẩn đoán"
          >
            <va-icon name="medical_services" />
            Chẩn đoán
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

    <div v-if="selectedAppointment" class="space-y-6 p-4">
      <!-- Patient Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin bệnh nhân</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Họ tên:</strong>
              {{ selectedAppointment.name || 'Chưa có' }}
            </div>
            <div>
              <strong class="text-gray-700">Lý do khám:</strong>
              {{ selectedAppointment.reason }}
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Doctor Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin bác sĩ</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Bác sĩ:</strong>
              {{ selectedAppointment.staff.user?.name || 'Chưa phân công' }}
            </div>
            <div>
              <strong class="text-gray-700">Ngày trực:</strong>
              {{ formatDate(selectedAppointment.doctorShift.dayWork) }}
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Appointment Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin lịch hẹn</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Ngày giờ:</strong>
              {{ formatDate(selectedAppointment.date) }} {{ formatTime(selectedAppointment.time) }}
            </div>
            <div class="flex items-center">
              <strong class="text-gray-700 mr-2">Trạng thái:</strong>
              <span
                :class="{
                  'text-green-600': getStatusText(selectedAppointment.status) === 'CONFIRMED',
                  'text-blue-600': getStatusText(selectedAppointment.status) === 'COMPLETED',
                  'text-red-600': getStatusText(selectedAppointment.status) === 'CANCELLED',
                }"
              >
                {{
                  getStatusText(selectedAppointment.status) === 'CONFIRMED'
                    ? 'Đã xác nhận'
                    : getStatusText(selectedAppointment.status) === 'COMPLETED'
                      ? 'Đã hoàn thành'
                      : 'Đã hủy'
                }}
              </span>
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Close Button -->
      <div class="flex justify-end pt-4">
        <va-button preset="primary" class="px-6" @click="isDetailModalOpen = false">
          Đóng
        </va-button>
      </div>
    </div>
  </va-modal>

  <va-modal v-model="isDetailModalPrescriptions" hide-default-actions max-width="800px">
    <template #header>
      <h2 class="va-h4 items-center">
        <va-icon name="event_note" class="mr-2" />
        Hồ sơ chẩn đoán và kê đơn
      </h2>
    </template>

    <div v-if="selectedAppointment" class="space-y-6 p-4">
      <!-- Patient Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin bệnh nhân</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Họ tên:</strong>
              {{ selectedAppointment.name || 'Chưa có' }}
            </div>
            <div>
              <strong class="text-gray-700">Lý do khám:</strong>
              {{ selectedAppointment.reason }}
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Doctor Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin bác sĩ</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Bác sĩ:</strong>
              {{ selectedAppointment.staff.user?.name || 'Chưa phân công' }}
            </div>
            <div>
              <strong class="text-gray-700">Ngày trực:</strong>
              {{ formatDate(selectedAppointment.doctorShift.dayWork) }}
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Diagnosis Information -->
      <section>
        <h3 class="text-lg font-semibold mb-2">Thông tin chẩn đoán</h3>
        <va-card-content v-if="selectedAppointment.medicalRecord" class="bg-gray-50 rounded-lg p-4">
          <div class="space-y-3">
            <p>
              <strong class="text-gray-700">Kết luận chẩn đoán:</strong>
              {{ selectedAppointment.medicalRecord.diagnosis }}
            </p>
            <p>
              <strong class="text-gray-700">Hướng điều trị:</strong>
              {{ selectedAppointment.medicalRecord.treatment }}
            </p>
            <p>
              <strong class="text-gray-700">Ghi chú:</strong>
              {{ selectedAppointment.medicalRecord.notes || 'Không có ghi chú' }}
            </p>

            <!-- Prescription List -->
            <div class="mt-4">
              <h4 class="text-md font-semibold">Đơn thuốc</h4>
              <ul class="list-disc pl-5 mt-2">
                <li
                  v-for="(item, index) in selectedAppointment.medicalRecord.prescriptions"
                  :key="index"
                  class="py-1"
                >
                  {{ item.medicationName }} - SL: {{ item.quantity }}, Liều: {{ item.dosage }}
                </li>
              </ul>
            </div>
          </div>

          <!-- Close Button -->
          <div class="flex justify-end pt-4">
            <va-button preset="primary" class="px-6" @click="isDetailModalPrescriptions = false">
              Đóng
            </va-button>
          </div>
        </va-card-content>

        <!-- No Medical Record -->
        <va-card-content v-else class="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
          <va-icon name="medical_services" size="large" color="secondary" class="mb-3" />
          <p>Chưa có hồ sơ bệnh án cho lịch hẹn này.</p>
        </va-card-content>
      </section>
    </div>
  </va-modal>

  <!-- MODAL CHẨN ĐOÁN VÀ KÊ ĐƠN -->
  <va-modal v-model="isAddDiagnosisModalOpen" hide-default-actions max-width="800px">
    <template #header>
      <h2 class="va-h4 items-center">
        <va-icon name="edit_note" class="mr-2" />
        Tạo Hồ Sơ Bệnh Án & Kê Đơn
      </h2>
    </template>

    <va-form ref="diagnosisFormRef" @submit.prevent="handleCreateMedicalRecord" class="space-y-6">
      <div v-if="selectedAppointment">
        <!-- Chẩn đoán -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Chẩn đoán</h3>
          <va-card>
            <va-card-content>
              <p class="mb-4">
                Chẩn đoán cho bệnh nhân:
                <strong class="text-primary">{{ selectedAppointment.name || 'Chưa có' }}</strong>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <va-input
                  v-model="newMedicalRecord.diagnosis"
                  label="Kết luận chẩn đoán"
                  :rules="[(v) => !!v || 'Chẩn đoán là bắt buộc']"
                  required-mark
                />
                <va-input
                  v-model="newMedicalRecord.treatment"
                  label="Hướng điều trị"
                  :rules="[(v) => !!v || 'Hướng điều trị là bắt buộc']"
                  required-mark
                />
                <va-textarea
                  v-model="newMedicalRecord.notes"
                  label="Ghi chú thêm (nếu có)"
                  :min-rows="3"
                  class="sm:col-span-2"
                />
              </div>
            </va-card-content>
          </va-card>
        </div>

        <!-- ======================= -->
        <!-- PHẦN KÊ ĐƠN ĐƯỢC VIẾT LẠI -->
        <!-- ======================= -->
        <div>
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Đơn thuốc</h3>
          <va-card>
            <va-card-content>
              <!-- Danh sách thuốc đã thêm -->
              <div
                v-if="newMedicalRecord.prescriptions.length === 0"
                class="text-center text-gray-500 py-4"
              >
                <va-icon name="vaccines" size="large" color="secondary" class="mb-2" />
                <p>Chưa có thuốc nào trong đơn.</p>
              </div>
              <div v-else class="space-y-2 mb-4">
                <div
                  v-for="(med, index) in newMedicalRecord.prescriptions"
                  :key="index"
                  class="flex justify-between items-center border rounded-md px-3 py-2 bg-gray-50"
                >
                  <div>
                    <div class="font-semibold">{{ med.medicationName }}</div>
                    <div class="text-sm text-gray-600">
                      SL: {{ med.quantity }} – {{ med.dosage }}
                    </div>
                  </div>
                  <va-button
                    preset="secondary"
                    icon="delete"
                    color="danger"
                    @click="removePrescriptionItem(index)"
                    size="small"
                  />
                </div>
              </div>

              <!-- Form thêm thuốc mới -->
              <div class="border-t pt-4">
                <h4 class="font-semibold mb-2">Thêm thuốc vào đơn</h4>
                <div class="space-y-4">
                  <va-select
                    v-model="selectedMedication"
                    label="Tìm và chọn thuốc để thêm"
                    :options="medicationOptions"
                    track-by="id"
                    text-by="name"
                    searchable
                    clearable
                    no-options-text="Không tìm thấy thuốc"
                    @update:model-value="onMedicationSelect"
                  />
                  <!-- Các input này chỉ hiện khi đã chọn thuốc -->
                  <div
                    v-if="newItemForm.medicationId"
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <va-input
                      v-model.number="newItemForm.quantity"
                      label="Số lượng"
                      type="number"
                      min="1"
                      :rules="[(v) => v > 0 || 'Số lượng phải lớn hơn 0']"
                    />
                    <va-input
                      v-model="newItemForm.dosage"
                      label="Liều dùng"
                      placeholder="VD: 2 viên/ngày, sau ăn"
                      :rules="[(v) => !!v.trim() || 'Liều dùng là bắt buộc']"
                    />
                  </div>
                  <va-button
                    v-if="newItemForm.medicationId"
                    @click="addPrescriptionItem"
                    :disabled="!newItemForm.quantity || !newItemForm.dosage"
                    icon="add"
                    class="mt-2"
                  >
                    Thêm vào đơn
                  </va-button>
                </div>
              </div>
            </va-card-content>
          </va-card>
        </div>

        <!-- Nút hành động -->
        <div class="flex justify-end gap-3 pt-4">
          <va-button preset="secondary" @click="closeAddDiagnosisModal">Hủy</va-button>
          <va-button icon="save" type="submit">Lưu Hồ Sơ Bệnh Án</va-button>
        </div>
      </div>
    </va-form>
  </va-modal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, type App } from 'vue'
import { toast } from 'vue3-toastify'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import type { RequestMedicalRecord, PrescriptionItem } from '@/interfaces/medicalRecord.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Medicine } from '@/interfaces/medicine.interface'
import { useMedicalRecordStore } from '@/stores/medicalRecord.store'

// === STATE MANAGEMENT ===
const appointments = ref<Appointment[]>([])
const searchQuery = ref('')
const filterStatus = ref('1')
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)
const isAddDiagnosisModalOpen = ref(false)
const isDetailModalPrescriptions = ref(false)
const diagnosisFormRef = ref<Form | null>(null)

const onOpenModalPrescriptions = (appointment: Appointment) => {
  isDetailModalPrescriptions.value = true
  selectedAppointment.value = appointment
}

const openDetailModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDetailModalOpen.value = true
}

// --- State cho Modal Chẩn Đoán ---
const newMedicalRecord = ref<RequestMedicalRecord>({
  appointmentId: '',
  diagnosis: '',
  treatment: '',
  notes: '',
  prescriptions: [],
})

// === LOGIC KÊ ĐƠN ĐÃ CẤU TRÚC LẠI ===
// Hàm helper để tạo object rỗng cho form thêm thuốc
const createInitialNewItemForm = (): Partial<PrescriptionItem> => ({
  medicationId: undefined,
  medicationName: undefined,
  quantity: 1,
  dosage: '',
})

const newItemForm = ref<Partial<PrescriptionItem>>(createInitialNewItemForm())
const selectedMedication = ref<Medicine | null>(null)
const medicationOptions = ref<Medicine[]>([])

// === STORES ===
const appointmentStore = useAppointmentStore()
const medicalRecordStore = useMedicalRecordStore()
const medicineStore = useMedicineStore()

// === UI CONFIG ===
const optionsStatus = ref([
  // { text: 'Chưa thanh toán', value: '0' },
  { text: 'Đã xác nhận', value: '1' },
  { text: 'Hoàn thành', value: '3' },
  { text: 'Đã hủy', value: '2' },
])
const columns = ref([
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'appointmentDateTime', label: 'Thời gian hẹn', sortable: true },
  { key: 'reason', label: 'Lý do khám' },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'actions', label: 'Thao tác' },
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

// --- Modal handlers ---
const openAddDiagnosisModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  newMedicalRecord.value = {
    appointmentId: appointment.id,
    diagnosis: '',
    treatment: '',
    notes: '',
    prescriptions: [],
  }
  // Reset form thêm thuốc về trạng thái ban đầu
  newItemForm.value = createInitialNewItemForm()
  selectedMedication.value = null
  isAddDiagnosisModalOpen.value = true
}

const closeAddDiagnosisModal = () => {
  isAddDiagnosisModalOpen.value = false
  selectedAppointment.value = null
  diagnosisFormRef.value?.reset()
}

// --- Prescription handlers (Đã viết lại) ---
const onMedicationSelect = (medication: Medicine | null) => {
  if (medication) {
    // Khi chọn thuốc, cập nhật form thêm thuốc
    newItemForm.value = {
      medicationId: medication.id,
      medicationName: medication.name,
      quantity: 1,
      dosage: '',
    }
  } else {
    // Khi xóa lựa chọn, reset form
    newItemForm.value = createInitialNewItemForm()
  }
}

const addPrescriptionItem = () => {
  // Đảm bảo các trường cần thiết đã được điền
  if (!newItemForm.value.quantity || !newItemForm.value.dosage?.trim()) {
    toast.warning('Vui lòng điền đủ số lượng và liều dùng.')
    return
  }

  // Thêm thuốc vào đơn chính
  newMedicalRecord.value.prescriptions.push(newItemForm.value as PrescriptionItem)

  // Reset form để chuẩn bị thêm thuốc tiếp theo
  newItemForm.value = createInitialNewItemForm()
  selectedMedication.value = null // Xóa lựa chọn trong va-select
}

const removePrescriptionItem = (index: number) => {
  newMedicalRecord.value.prescriptions.splice(index, 1)
}

const viewMedicalRecord = (appointmentId: string) => {
  toast.info(`Sẽ mở chi tiết hồ sơ cho lịch hẹn ${appointmentId}`)
}

// --- Form submission ---
const handleCreateMedicalRecord = async () => {
  if (!diagnosisFormRef.value) return
  const isValid = await diagnosisFormRef.value.validate()
  if (!isValid) {
    toast.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
    return
  }

  try {
    await medicalRecordStore.addMedicalRecord(newMedicalRecord.value)
    toast.success('Tạo hồ sơ bệnh án thành công!')
    closeAddDiagnosisModal()
    filterStatus.value = 'COMPLETED'
    await fetchAppointments()
  } catch (error: any) {
    toast.error(error.message || 'Tạo hồ sơ thất bại.')
  }
}

// --- Formatters ---
const formatDate = (date: string | undefined) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
const formatTime = (time: string | undefined) => (time ? time.substring(0, 5) : 'N/A')
const getStatusText = (status: string) =>
  optionsStatus.value.find((o) => o.value === status)?.text || status
const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return 'primary'
    case 'COMPLETED':
      return 'success'
    case 'CANCELLED':
      return 'danger'
    case 'PENDING_PAYMENT':
      return 'warning'
    default:
      return 'secondary'
  }
}

// === LIFECYCLE HOOKS ===
onMounted(async () => {
  await fetchAppointments()
  await fetchMedications()
})
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
