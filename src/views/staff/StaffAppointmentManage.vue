<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Quản lý lịch hẹn của bác sĩ</h4>
      <p class="text-center text-gray-600">
        Xem và thực hiện chẩn đoán cho các lịch hẹn đã được xác nhận.
      </p>

      <!-- BỘ LỌC VÀ TÌM KIẾM -->
      <div class="d-flex my-4 selected-container justify-between">
        <va-tabs
          v-model="activeTab"
          grow
          class="status-tabs"
          @update:model-value="fetchAppointments"
        >
          <va-tab name="confirmed" value="1">
            <va-icon name="check_circle" class="mr-2" /> Đã xác nhận
          </va-tab>
          <va-tab name="completed" value="3">
            <va-icon name="done_all" class="mr-2" /> Hoàn thành
          </va-tab>
          <va-tab name="cancelled" value="2">
            <va-icon name="cancel" class="mr-2" /> Đã hủy
          </va-tab>
        </va-tabs>
        <va-input
          v-model="filterDate"
          type="date"
          label="Lọc theo ngày"
          class="date-input input-field"
          clearable
          :rules="[(v) => !v || isValidDate(v) || 'Ngày không hợp lệ']"
        />
      </div>

      <!-- BẢNG DỮ LIỆU -->
      <va-data-table
        :items="filteredAppointments"
        :columns="columns"
        class="custom-table"
        no-data-html="<div class='text-center text-gray-500 py-4'>Không có lịch hẹn nào.</div>"
        hoverable
      >
        <template #cell(patient)="slotProps">
          <div class="d-flex align-center">
            <va-avatar
              :src="slotProps.rowData.user?.avatar || '/defaultAvatar.png'"
              size="small"
              class="mr-3"
            />
            <div>
              <div class="font-semibold text-gray-800">{{ slotProps.rowData.name }}</div>
              <div class="text-sm text-gray-500">{{ slotProps.rowData.user?.email }}</div>
            </div>
          </div>
        </template>

        <template #cell(appointmentDateTime)="slotProps">
          <div>
            <div class="font-semibold text-gray-800">{{ formatTime(slotProps.rowData.time) }}</div>
            <div class="text-sm text-gray-500">{{ formatDate(slotProps.rowData.date) }}</div>
          </div>
        </template>

        <template #cell(status)="slotProps">
          <va-chip
            size="small"
            :color="getStatusColor(slotProps.rowData.status)"
            class="font-medium"
          >
            <div v-if="getStatusText(slotProps.rowData.status) === 'CONFIRMED'">Đã xác nhận</div>
            <div v-else-if="getStatusText(slotProps.rowData.status) === 'COMPLETED'">
              Đã hoàn thành
            </div>
            <div v-else>Đã hủy</div>
          </va-chip>
        </template>

        <template #cell(actions)="slotProps">
          <div class="d-flex align-center gap-2">
            <va-button
              v-if="slotProps.rowData.status !== 'COMPLETED'"
              preset="primary"
              icon="visibility"
              @click="openDetailModal(slotProps.rowData)"
              title="Xem chi tiết lịch hẹn"
              class="action-button"
              >Xem chi tiết</va-button
            >
            <va-button
              v-if="slotProps.rowData.status === 'COMPLETED'"
              preset="primary"
              icon="visibility"
              @click="onOpenModalPrescriptions(slotProps.rowData)"
              title="Chi tiết chẩn đoán"
              class="action-button"
              >Chi tiết chẩn đoán</va-button
            >
            <va-button
              v-if="slotProps.rowData.status === 'CONFIRMED'"
              preset="primary"
              icon="medical_services"
              @click="openAddDiagnosisModal(slotProps.rowData)"
              title="Thực hiện chẩn đoán"
              class="action-button"
              >Chẩn đoán</va-button
            >
            <va-button
              v-if="slotProps.rowData.status === 'COMPLETED'"
              preset="primary"
              icon="description"
              color="success"
              @click="generatePDF(slotProps.rowData)"
              title="Xem hồ sơ bệnh án"
              class="action-button"
              >In chẩn đoán</va-button
            >
          </div>
        </template>
      </va-data-table>
    </va-card-content>
  </va-card>

  <!-- MODAL CHI TIẾT LỊCH HẸN -->
  <va-modal v-model="isDetailModalOpen" hide-default-actions max-width="700px" class="custom-modal">
    <template #header>
      <h2 class="va-h4 d-flex align-center bg-gray-100 p-4 rounded-t-lg">
        <va-icon name="event_note" class="mr-2 text-primary" />
        Chi Tiết Lịch Hẹn
      </h2>
    </template>

    <div v-if="selectedAppointment" class="space-y-6 p-6">
      <!-- Patient Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin bệnh nhân</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-5 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Họ tên:</strong>
              <span class="ml-2">{{ selectedAppointment.name || 'Chưa có' }}</span>
            </div>
            <div>
              <strong class="text-gray-700">Lý do khám:</strong>
              <span class="ml-2">{{ selectedAppointment.reason }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Doctor Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin bác sĩ</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-5 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Bác sĩ:</strong>
              <span class="ml-2">{{
                selectedAppointment.staff.user?.name || 'Chưa phân công'
              }}</span>
            </div>
            <div>
              <strong class="text-gray-700">Ngày trực:</strong>
              <span class="ml-2">{{ formatDate(selectedAppointment.doctorShift.dayWork) }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Appointment Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin lịch hẹn</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-5 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Ngày giờ:</strong>
              <span class="ml-2">
                {{ formatDate(selectedAppointment.date) }}
                {{ formatTime(selectedAppointment.time) }}
              </span>
            </div>
            <div class="flex items-center">
              <strong class="text-gray-700 mr-2">Trạng thái:</strong>
              <span
                :class="{
                  'text-green-600 font-medium':
                    getStatusText(selectedAppointment.status) === 'CONFIRMED',
                  'text-blue-600 font-medium':
                    getStatusText(selectedAppointment.status) === 'COMPLETED',
                  'text-red-600 font-medium':
                    getStatusText(selectedAppointment.status) === 'CANCELLED',
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
        <va-button preset="secondary" class="px-6 action-button" @click="isDetailModalOpen = false">
          Đóng
        </va-button>
      </div>
    </div>
  </va-modal>

  <!-- MODAL HỒ SƠ CHẨN ĐOÁN -->
  <va-modal
    v-model="isDetailModalPrescriptions"
    hide-default-actions
    max-width="800px"
    class="custom-modal"
  >
    <template #header>
      <h2 class="va-h4 d-flex align-center bg-gray-100 p-4 rounded-t-lg">
        <va-icon name="event_note" class="mr-2 text-primary" />
        Hồ sơ chẩn đoán và kê đơn
      </h2>
    </template>

    <div v-if="selectedAppointment" class="space-y-6 p-6">
      <!-- Patient Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin bệnh nhân</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-5 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Họ tên:</strong>
              <span class="ml-2">{{ selectedAppointment.name || 'Chưa có' }}</span>
            </div>
            <div>
              <strong class="text-gray-700">Lý do khám:</strong>
              <span class="ml-2">{{ selectedAppointment.reason }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Doctor Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin bác sĩ</h3>
        <va-card-content class="bg-gray-50 rounded-lg p-5 shadow-sm">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong class="text-gray-700">Bác sĩ:</strong>
              <span class="ml-2">{{
                selectedAppointment.staff.user?.name || 'Chưa phân công'
              }}</span>
            </div>
            <div>
              <strong class="text-gray-700">Ngày trực:</strong>
              <span class="ml-2">{{ formatDate(selectedAppointment.doctorShift.dayWork) }}</span>
            </div>
          </div>
        </va-card-content>
      </section>

      <!-- Diagnosis Information -->
      <section class="modal-section">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">Thông tin chẩn đoán</h3>
        <va-card-content
          v-if="selectedAppointment.medicalRecord"
          class="bg-gray-50 rounded-lg p-5 shadow-sm"
        >
          <div class="space-y-4">
            <p>
              <strong class="text-gray-700">Kết luận chẩn đoán:</strong>
              <span class="ml-2">{{ selectedAppointment.medicalRecord.diagnosis }}</span>
            </p>
            <p>
              <strong class="text-gray-700">Hướng điều trị:</strong>
              <span class="ml-2">{{ selectedAppointment.medicalRecord.treatment }}</span>
            </p>
            <p>
              <strong class="text-gray-700">Ghi chú:</strong>
              <span class="ml-2">{{
                selectedAppointment.medicalRecord.notes || 'Không có ghi chú'
              }}</span>
            </p>

            <!-- Prescription List -->
            <div class="mt-4">
              <h4 class="text-md font-semibold text-gray-800">Đơn thuốc</h4>
              <ul class="list-disc pl-5 mt-2 text-gray-600">
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
            <va-button
              preset="secondary"
              class="px-6 action-button"
              @click="isDetailModalPrescriptions = false"
            >
              Đóng
            </va-button>
          </div>
        </va-card-content>

        <!-- No Medical Record -->
        <va-card-content
          v-else
          class="text-center text-gray-500 py-6 bg-gray-50 rounded-lg shadow-sm"
        >
          <va-icon name="medical_services" size="large" color="secondary" class="mb-3" />
          <p>Chưa có hồ sơ bệnh án cho lịch hẹn này.</p>
        </va-card-content>
      </section>
    </div>
  </va-modal>

  <!-- MODAL CHẨN ĐOÁN VÀ KÊ ĐƠN -->
  <va-modal
    v-model="isAddDiagnosisModalOpen"
    hide-default-actions
    max-width="800px"
    class="custom-modal"
  >
    <template #header>
      <h2 class="va-h4 d-flex align-center bg-gray-100 p-4 rounded-t-lg">
        <va-icon name="edit_note" class="mr-2 text-primary" />
        Tạo Hồ Sơ Bệnh Án & Kê Đơn
      </h2>
    </template>

    <va-form
      ref="diagnosisFormRef"
      @submit.prevent="handleCreateMedicalRecord"
      class="space-y-6 p-6"
    >
      <div v-if="selectedAppointment">
        <!-- Chẩn đoán -->
        <div class="modal-section">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Chẩn đoán</h3>
          <va-card class="shadow-sm">
            <va-card-content class="p-5">
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
                  class="input-field"
                />
                <va-input
                  v-model="newMedicalRecord.treatment"
                  label="Hướng điều trị"
                  :rules="[(v) => !!v || 'Hướng điều trị là bắt buộc']"
                  required-mark
                  class="input-field"
                />
                <va-textarea
                  v-model="newMedicalRecord.notes"
                  label="Ghi chú thêm (nếu có)"
                  :min-rows="3"
                  class="sm:col-span-2 input-field"
                />
              </div>
            </va-card-content>
          </va-card>
        </div>

        <!-- PHẦN KÊ ĐƠN -->
        <div class="modal-section">
          <h3 class="text-lg font-semibold text-gray-800 mb-3">Đơn thuốc</h3>
          <va-card class="shadow-sm">
            <va-card-content class="p-5">
              <!-- Danh sách thuốc đã thêm -->
              <div
                v-if="newMedicalRecord.prescriptions.length === 0"
                class="text-center text-gray-500 py-4"
              >
                <va-icon name="vaccines" size="large" color="secondary" class="mb-2" />
                <p>Chưa có thuốc nào trong đơn.</p>
              </div>
              <div v-else class="space-y-3 mb-4">
                <div
                  v-for="(med, index) in newMedicalRecord.prescriptions"
                  :key="index"
                  class="flex justify-between items-center border rounded-md px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div>
                    <div class="font-semibold text-gray-800">{{ med.medicationName }}</div>
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
                    class="action-button"
                  />
                </div>
              </div>

              <!-- Form thêm thuốc mới -->
              <div class="border-t pt-4">
                <h4 class="font-semibold text-gray-800 mb-3">Thêm thuốc vào đơn</h4>
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
                    class="input-field"
                  />
                  <div
                    v-if="newItemForm.medicationId"
                    class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2"
                  >
                    <va-input
                      v-model.number="newItemForm.quantity"
                      label="Số lượng"
                      type="number"
                      min="1"
                      :rules="[(v) => v > 0 || 'Số lượng phải lớn hơn 0']"
                      class="input-field"
                    />
                    <va-input
                      v-model="newItemForm.dosage"
                      label="Liều dùng"
                      placeholder="VD: 2 viên/ngày, sau ăn"
                      :rules="[(v) => !!v.trim() || 'Liều dùng là bắt buộc']"
                      class="input-field"
                    />
                  </div>
                  <va-button
                    v-if="newItemForm.medicationId"
                    @click="addPrescriptionItem"
                    :disabled="!newItemForm.quantity || !newItemForm.dosage"
                    icon="add"
                    class="mt-2 action-button"
                    preset="primary"
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
          <va-button preset="secondary" @click="closeAddDiagnosisModal" class="action-button">
            Hủy
          </va-button>
          <va-button icon="save" type="submit" class="action-button">Lưu Hồ Sơ Bệnh Án</va-button>
          <!-- <va-button
            icon="download"
            @click="generatePDF(selectedAppointment)"
            class="action-button"
            preset="secondary"
          >
            Xuất PDF
          </va-button> -->
        </div>
      </div>
    </va-form>
  </va-modal>

  <!-- Trong <template> -->
  <div v-if="pdfRenderData" style="position: absolute; left: -9999px; top: -9999px; z-index: -1">
    <div ref="pdfTemplateRef">
      <export-pdf-prescription
        :appointment="pdfRenderData.appointment"
        :medicalRecord="pdfRenderData.medicalRecord"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import html2pdf from 'html2pdf.js'
import { ref, computed, onMounted, nextTick } from 'vue'
import { toast } from 'vue3-toastify'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import type { RequestMedicalRecord, PrescriptionItem } from '@/interfaces/medicalRecord.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Medicine } from '@/interfaces/medicine.interface'
import { useMedicalRecordStore } from '@/stores/medicalRecord.store'
import ExportPdfPrescription from '@/components/medicine/ExportPdfPrescription.vue'

// === STATE MANAGEMENT ===
const appointments = ref<Appointment[]>([])
const filterDate = ref<string>('') // State cho lọc theo ngày
const activeTab = ref('confirmed') // Tab mặc định là "Đã xác nhận"
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)
const isAddDiagnosisModalOpen = ref(false)
const isDetailModalPrescriptions = ref(false)
const diagnosisFormRef = ref<Form | null>(null)

// --- State cho Modal Chẩn Đoán ---
const newMedicalRecord = ref<RequestMedicalRecord>({
  appointmentId: '',
  diagnosis: '',
  treatment: '',
  notes: '',
  prescriptions: [],
})

// === LOGIC KÊ ĐƠN ===
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
const columns = ref([
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'appointmentDateTime', label: 'Thời gian hẹn', sortable: true },
  { key: 'reason', label: 'Lý do khám' },
  { key: 'status', label: 'Trạng thái', sortable: true },
  { key: 'actions', label: 'Thao tác' },
])

// === COMPUTED PROPERTIES ===
const filterStatus = computed(() => {
  switch (activeTab.value) {
    case 'confirmed':
      return '1'
    case 'completed':
      return '3'
    case 'cancelled':
      return '2'
    default:
      return '1'
  }
})

const filteredAppointments = computed(() => {
  if (!filterDate.value) return appointments.value
  return appointments.value.filter((apt) => {
    const appointmentDate = apt.date ? new Date(apt.date).toISOString().split('T')[0] : ''
    return appointmentDate === filterDate.value
  })
})

// === METHODS ===
const isValidDate = (dateString: string) => {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

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
const openDetailModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDetailModalOpen.value = true
}

const onOpenModalPrescriptions = (appointment: Appointment) => {
  isDetailModalPrescriptions.value = true
  selectedAppointment.value = appointment
}

const openAddDiagnosisModal = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  newMedicalRecord.value = {
    appointmentId: appointment.id,
    diagnosis: '',
    treatment: '',
    notes: '',
    prescriptions: [],
  }
  newItemForm.value = createInitialNewItemForm()
  selectedMedication.value = null
  isAddDiagnosisModalOpen.value = true
}

const closeAddDiagnosisModal = () => {
  isAddDiagnosisModalOpen.value = false
  selectedAppointment.value = null
  diagnosisFormRef.value?.reset()
}

// --- Prescription handlers ---
const onMedicationSelect = (medication: Medicine | null) => {
  if (medication) {
    newItemForm.value = {
      medicationId: medication.id,
      medicationName: medication.name,
      quantity: 1,
      dosage: '',
    }
  } else {
    newItemForm.value = createInitialNewItemForm()
  }
}

const addPrescriptionItem = () => {
  if (!newItemForm.value.quantity || !newItemForm.value.dosage?.trim()) {
    toast.warning('Vui lòng điền đủ số lượng và liều dùng.')
    return
  }

  newMedicalRecord.value.prescriptions.push(newItemForm.value as PrescriptionItem)
  newItemForm.value = createInitialNewItemForm()
  selectedMedication.value = null
}

const removePrescriptionItem = (index: number) => {
  newMedicalRecord.value.prescriptions.splice(index, 1)
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
    activeTab.value = 'completed' // Chuyển sang tab "Hoàn thành" sau khi lưu
    await fetchAppointments()
  } catch (error: any) {
    toast.error(error.message || 'Tạo hồ sơ thất bại.')
  }
}

// --- Formatters ---
const formatDate = (date: string | undefined) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
const formatTime = (time: string | undefined) => (time ? time.substring(0, 5) : 'N/A')
const getStatusText = (status: string) => {
  switch (status) {
    case '1':
      return 'CONFIRMED'
    case '3':
      return 'COMPLETED'
    case '2':
      return 'CANCELLED'
    default:
      return status
  }
}
const getStatusColor = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
    case '1':
      return 'primary'
    case 'COMPLETED':
    case '3':
      return 'success'
    case 'CANCELLED':
    case '2':
      return 'danger'
    default:
      return 'secondary'
  }
}

// --- PDF Generation ---
const pdfTemplateRef = ref<HTMLElement | null>(null)
const pdfRenderData = ref<{ appointment: Appointment; medicalRecord: any } | null>(null)

const generatePDF = async (appointmentData: Appointment) => {
  let medicalRecordData = null

  if (isAddDiagnosisModalOpen.value && selectedAppointment.value?.id === appointmentData.id) {
    medicalRecordData = newMedicalRecord.value
  } else if (appointmentData.medicalRecord) {
    medicalRecordData = appointmentData.medicalRecord
  }

  if (!appointmentData || !medicalRecordData) {
    toast.error('Không có đủ dữ liệu bệnh án để xuất file PDF.')
    return
  }

  pdfRenderData.value = {
    appointment: appointmentData,
    medicalRecord: medicalRecordData,
  }

  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 100))

  const element = pdfTemplateRef.value
  if (!element) {
    toast.error('Lỗi: Không tìm thấy mẫu PDF để render.')
    pdfRenderData.value = null
    return
  }

  const opt = {
    margin: 5,
    filename: `DonThuoc_${appointmentData.name.replace(/\s/g, '')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }

  try {
    await html2pdf().from(element).set(opt).save()
  } catch (err) {
    toast.error('Đã có lỗi xảy ra khi tạo file PDF.')
    console.error('html2pdf error:', err)
  } finally {
    pdfRenderData.value = null
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
    transition: all 0.2s ease;
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.custom-modal {
  :deep(.va-modal__inner) {
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
  }
  :deep(.va-modal__content) {
    padding: 0;
  }
}

.modal-section {
  background-color: #f9fafb;
  border-radius: 8px;
  padding: 1rem;
  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
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

.prescription-list {
  max-height: 200px;
  overflow-y: auto;
  padding-right: 8px;
}

.prescription-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0.5rem;
  border-bottom: 1px solid #e2e8f0;
  &:last-child {
    border-bottom: none;
  }
}

.add-med-form {
  border-top: 1px solid #e2e8f0;
  padding-top: 1rem;
  margin-top: 1rem;
}
</style>
