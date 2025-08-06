```vue
<template>
  <va-inner-loading :loading="loading">
    <va-card class="dispense-page">
      <va-card-content>
        <div class="page-header">
          <h2 class="va-h4">Cấp Phát Thuốc & Quản Lý Kho</h2>
          <p class="va-text-secondary">
            Tìm kiếm bệnh án, xem chi tiết đơn thuốc, cấp phát hoặc nhập kho từ file Excel.
          </p>
        </div>

        <!-- SEARCH & ACTIONS SECTION -->
        <div class="actions-container">
          <div class="search-group">
            <va-input
              v-model="searchMedicalRecordId"
              placeholder="Nhập mã bệnh án để tìm kiếm..."
              clearable
              class="search-input"
              @keydown.enter="fetchMedicalRecord"
            >
              <template #prepend-inner>
                <va-icon name="search" color="secondary" />
              </template>
            </va-input>
            <va-button preset="primary" @click="fetchMedicalRecord"> Tìm Kiếm </va-button>
          </div>
          <div class="import-group">
            <va-button
              preset="secondary"
              color="success"
              icon="upload_file"
              @click="triggerFileInput"
            >
              Nhập kho từ Excel
            </va-button>
            <input
              ref="fileInput"
              type="file"
              hidden
              @change="handleFileUpload"
              accept=".xlsx, .xls"
            />
          </div>
        </div>

        <!-- RESULT SECTION -->
        <div class="result-container">
          <va-inner-loading :loading="loading">
            <div v-if="medicalRecord" class="record-found">
              <div class="record-header">
                <div class="patient-info">
                  <va-avatar :src="medicalRecord.patientInfo?.avatar || '/defaultAvatar.png'" />
                  <div class="patient-details">
                    <span class="patient-name">{{ medicalRecord.patientInfo.name }}</span>
                    <span class="record-id">Mã B.A: {{ medicalRecord.id }}</span>
                  </div>
                </div>
                <div class="record-status">
                  <va-chip :color="getStatusColor(medicalRecord.status)" size="small" square>
                    {{ getStatusText(medicalRecord.status) }}
                  </va-chip>
                </div>
              </div>
              <div class="record-body">
                <p><strong>Chẩn đoán:</strong> {{ medicalRecord.diagnosis }}</p>
                <p><strong>Bác sĩ:</strong> {{ medicalRecord.doctorInfo.name }}</p>
                <p><strong>Ngày khám:</strong> {{ medicalRecord.appointmentDate }}</p>
                <div class="prescription-list">
                  <h3 class="prescription-title">Danh sách thuốc</h3>
                  <va-data-table
                    :items="medicalRecord.prescriptions"
                    :columns="prescriptionColumns"
                    class="prescription-table"
                  >
                    <template #cell(medicationName)="{ rowData }">
                      <div class="font-semibold text-gray-800">
                        {{ rowData.medicationName || 'N/A' }}
                      </div>
                    </template>
                    <template #cell(quantity)="{ rowData }">
                      <div class="text-gray-700">
                        {{ rowData.quantity || 'N/A' }} {{ rowData.priceUnit || 'Viên' }}
                      </div>
                    </template>
                    <template #cell(dosage)="{ rowData }">
                      <div class="text-gray-700">{{ rowData.dosage || 'N/A' }}</div>
                    </template>
                    <template #cell(price)="{ rowData }">
                      <div class="text-gray-700">
                        {{ (rowData.price * rowData.quantity).toLocaleString('vi-VN') }} VNĐ ({{
                          rowData.price.toLocaleString('vi-VN')
                        }}
                        VNĐ/{{ rowData.priceUnit || 'Viên' }})
                      </div>
                    </template>
                  </va-data-table>
                  <div class="total-price">
                    <strong>Tổng tiền:</strong> {{ totalPrice.toLocaleString('vi-VN') }} VNĐ
                  </div>
                </div>
              </div>
              <div class="record-actions">
                <va-button
                  preset="primary"
                  icon="visibility"
                  @click="openDetailModal(medicalRecord)"
                >
                  Xem Chi Tiết Đơn Thuốc
                </va-button>
                <va-button
                  preset="secondary"
                  color="info"
                  icon="print"
                  @click="generatePDF(medicalRecord)"
                >
                  In Đơn Thuốc
                </va-button>
              </div>
            </div>
            <div v-else class="no-results">
              <va-icon name="receipt_long" size="4rem" color="secondary" />
              <p>Chưa có thông tin bệnh án nào được tìm thấy.</p>
              <span>Nhập mã bệnh án vào ô tìm kiếm để bắt đầu.</span>
            </div>
          </va-inner-loading>
        </div>
      </va-card-content>
    </va-card>

    <!-- MODAL CHI TIẾT ĐƠN THUỐC -->
    <va-modal v-model="isDetailModalOpen" size="large" hide-default-actions class="detail-modal">
      <template #header>
        <h2 class="va-h5 modal-title">
          <va-icon name="medication" class="mr-2" />
          Chi Tiết Đơn Thuốc
        </h2>
      </template>
      <div v-if="selectedMedicalRecord" class="modal-content">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Bệnh nhân</span>
            <span class="value">{{ selectedMedicalRecord.patientInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Bác sĩ</span>
            <span class="value">{{ selectedMedicalRecord.doctorInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="label">Chẩn đoán</span>
            <span class="value">{{ selectedMedicalRecord.diagnosis }}</span>
          </div>
          <div class="info-item">
            <span class="label">Trạng thái</span>
            <span class="value">
              <va-chip :color="getStatusColor(selectedMedicalRecord.status)" size="small">
                {{ getStatusText(selectedMedicalRecord.status) }}
              </va-chip>
            </span>
          </div>
        </div>

        <h3 class="prescription-title">Danh sách thuốc</h3>
        <va-data-table
          :items="selectedMedicalRecord.prescriptions"
          :columns="prescriptionColumns"
          class="prescription-table"
        >
          <template #cell(medicationName)="{ rowData }">
            <div class="font-semibold text-gray-800">{{ rowData.medicationName || 'N/A' }}</div>
          </template>
          <template #cell(quantity)="{ rowData }">
            <div class="text-gray-700">
              {{ rowData.quantity || 'N/A' }} {{ rowData.priceUnit || 'Viên' }}
            </div>
          </template>
          <template #cell(dosage)="{ rowData }">
            <div class="text-gray-700">{{ rowData.dosage || 'N/A' }}</div>
          </template>
          <template #cell(price)="{ rowData }">
            <div class="text-gray-700">
              {{ (rowData.price * rowData.quantity).toLocaleString('vi-VN') }} VNĐ ({{
                rowData.price.toLocaleString('vi-VN')
              }}
              VNĐ/{{ rowData.priceUnit || 'Viên' }})
            </div>
          </template>
        </va-data-table>
        <div class="total-price">
          <strong>Tổng tiền:</strong> {{ totalPrice.toLocaleString('vi-VN') }} VNĐ
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <va-button preset="secondary" @click="isDetailModalOpen = false">Đóng</va-button>
          <va-button
            icon="check_circle"
            color="success"
            @click="openDispenseModal(selectedMedicalRecord.id)"
            :disabled="selectedMedicalRecord.status !== 'DA_IN_DON'"
          >
            Tiến Hành Cấp Phát
          </va-button>
        </div>
      </template>
    </va-modal>

    <!-- MODAL XÁC NHẬN CẤP PHÁT -->
    <va-modal v-model="isDispenseModalOpen" hide-default-actions size="small">
      <DeleteConfirm
        v-if="selectedMedicalRecord?.id"
        title="Xác nhận cấp phát"
        :message="`Bạn có chắc chắn muốn cấp phát toàn bộ thuốc cho bệnh án ${selectedMedicalRecord?.id}? Tổng tiền: ${totalPrice.toLocaleString('vi-VN')} VNĐ`"
        confirm-text="Đồng ý cấp phát"
        @confirm="dispenseRecord(selectedMedicalRecord.id)"
        @close-confirm="isDispenseModalOpen = false"
      />
    </va-modal>

    <!-- PDF Render Container -->
    <div v-if="pdfRenderData" class="pdf-render-area">
      <div ref="pdfTemplateRef">
        <ExportPdfPrescription
          :appointment="pdfRenderData.appointment"
          :medicalRecord="pdfRenderData.medicalRecord"
        />
      </div>
    </div>
  </va-inner-loading>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useMedicalRecordStore } from '@/stores/medicalRecord.store'
import { useInventoryStore } from '@/stores/inventory.store'
import type { MedicalRecord, PrescriptionItem } from '@/interfaces/medicalRecord.interfaces'
import type { Appointment } from '@/interfaces/appointment.interfaces'
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import ExportPdfPrescription from '@/components/medicine/ExportPdfPrescription.vue'
import html2pdf from 'html2pdf.js'

// --- State ---
const searchMedicalRecordId = ref('')
const medicalRecord = ref<MedicalRecord | null>(null)
const selectedMedicalRecord = ref<MedicalRecord | null>(null)
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const isDetailModalOpen = ref(false)
const isDispenseModalOpen = ref(false)
const pdfTemplateRef = ref<HTMLElement | null>(null)
const pdfRenderData = ref<{ appointment: Appointment; medicalRecord: MedicalRecord } | null>(null)

// --- Stores ---
const inventoryStore = useInventoryStore()
const medicalRecordStore = useMedicalRecordStore()

// --- Computed ---
const totalPrice = computed(() => {
  if (!medicalRecord.value?.prescriptions) return 0
  return medicalRecord.value.prescriptions.reduce((total, item) => {
    const quantity = item.quantity || 0
    const price = item.price || 0
    return total + quantity * price
  }, 0)
})

// --- UI Config ---
const prescriptionColumns = ref([
  { key: 'medicationName', label: 'Tên thuốc', sortable: true },
  { key: 'quantity', label: 'Số lượng' },
  { key: 'dosage', label: 'Liều dùng' },
  { key: 'price', label: 'Giá (VNĐ)', sortable: true },
])

// --- Methods ---
const fetchMedicalRecord = async () => {
  if (!searchMedicalRecordId.value.trim()) {
    toast.warn('Vui lòng nhập mã bệnh án.')
    return
  }
  loading.value = true
  medicalRecord.value = null
  try {
    await medicalRecordStore.getMedicalRecordById(searchMedicalRecordId.value.trim())
    const record = medicalRecordStore.medicalRecord
    if (!record) {
      throw new Error('Không tìm thấy bệnh án với mã đã nhập.')
    }
    const hasPendingPrescriptions = record.prescriptions.some((p) => p.status === 'PENDING')
    if (!hasPendingPrescriptions && record.status !== 'DA_IN_DON') {
      toast.info('Bệnh án này không có đơn thuốc nào đang chờ hoặc chưa được cấp phát.')
      medicalRecord.value = null
    } else {
      medicalRecord.value = record
    }
  } catch (err: any) {
    toast.error(err.message || 'Lỗi khi tìm bệnh án.')
  } finally {
    loading.value = false
  }
}

const openDetailModal = (record: MedicalRecord) => {
  selectedMedicalRecord.value = record
  isDetailModalOpen.value = true
}

const openDispenseModal = () => {
  isDispenseModalOpen.value = true
}

const dispenseRecord = async (medicalRecordId: string) => {
  isDispenseModalOpen.value = false
  isDetailModalOpen.value = false
  loading.value = true
  try {
    await medicalRecordStore.updateMedicalRecordStatus(medicalRecordId, 'DA_CAP_THUOC')
    toast.success(`Cấp phát thành công! Tổng tiền: ${totalPrice.value.toLocaleString('vi-VN')} VNĐ`)
    medicalRecord.value = null
    searchMedicalRecordId.value = ''
  } catch (err: any) {
    toast.error(`Cấp phát thất bại: ${err.message}`)
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  loading.value = true
  try {
    const report = await inventoryStore.importFromExcel(file)
    toast.success(
      `Nhập kho thành công! Thêm mới: ${report.successCount}, Thất bại: ${report.failureCount}`,
    )
    if (report.failureCount > 0) {
      console.error('Lỗi khi nhập kho:', report.errorDetails)
      toast.warn('Có một số dòng bị lỗi, vui lòng kiểm tra console.')
    }
  } catch (err: any) {
    toast.error(`Lỗi nhập kho: ${err.message}`)
  } finally {
    loading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const generatePDF = async (recordData: MedicalRecord) => {
  if (!recordData) return toast.error('Không có dữ liệu bệnh án.')
  pdfRenderData.value = {
    appointment: {
      id: recordData.appointmentId,
      name: recordData.patientInfo.name,
      date: recordData.appointmentDate,
      time: recordData.appointmentTime,
      gender: recordData.patientInfo.gender,
      dob: recordData.patientInfo.dob,
      user: {
        id: recordData.patientInfo.id,
        address: recordData.patientInfo.address,
        name: recordData.patientInfo.name,
      },
      staff: { user: { id: recordData.doctorInfo.id, name: recordData.doctorInfo.name } },
    } as Appointment,
    medicalRecord: recordData,
  }
  await nextTick()
  const element = pdfTemplateRef.value
  if (!element) return toast.error('Lỗi: Không tìm thấy mẫu PDF.')
  const opt = {
    margin: 5,
    filename: `DonThuoc_${recordData.patientInfo.name.replace(/\s/g, '')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }
  try {
    await html2pdf().from(element).set(opt).save()
  } catch (err) {
    toast.error('Lỗi khi tạo file PDF.')
  } finally {
    pdfRenderData.value = null
  }
}

const getStatusText = (status: string) => {
  const map = {
    DA_IN_DON: 'Chờ cấp phát',
    DA_CAP_THUOC: 'Đã cấp thuốc',
    TAI_CAP_THUOC: 'Tái cấp thuốc',
  }
  return map[status as keyof typeof map] || 'Không xác định'
}

const getStatusColor = (status: string) => {
  const map = { DA_IN_DON: 'warning', DA_CAP_THUOC: 'success', TAI_CAP_THUOC: 'info' }
  return map[status as keyof typeof map] || 'secondary'
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.dispense-page {
  font-family: 'Be Vietnam Pro', sans-serif;
  background-color: #f8f9fa;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  .va-h4 {
    font-weight: 700;
    color: #1b254b;
  }
  .va-text-secondary {
    color: #6c757d;
  }
}

.actions-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.search-group {
  display: flex;
  gap: 1rem;
  flex-grow: 1;
}

.search-input {
  flex-grow: 1;
}

.result-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 200px;
}

.record-found {
  padding: 1.5rem;
  .record-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }
  .patient-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .patient-details {
    display: flex;
    flex-direction: column;
  }
  .patient-name {
    font-weight: 600;
    color: #1b254b;
  }
  .record-id {
    font-size: 0.8rem;
    color: #6c757d;
  }
  .record-body {
    padding: 1rem 0;
    color: #374151;
    line-height: 1.6;
    p {
      margin: 0.5rem 0;
    }
  }
  .record-actions {
    display: flex;
    gap: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
  .prescription-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1b254b;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
    margin-top: 1rem;
  }
  .prescription-table {
    --va-data-table-thead-background: #f8f9fa;
  }
  .total-price {
    margin-top: 1rem;
    font-weight: 600;
    color: #1b254b;
    text-align: right;
  }
}

.no-results {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  color: #6c757d;
  span {
    font-size: 0.9rem;
  }
}

.detail-modal {
  .modal-title {
    color: var(--va-primary);
    font-weight: 600;
  }
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  .info-item {
    display: flex;
    flex-direction: column;
    .label {
      font-size: 0.8rem;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }
    .value {
      font-weight: 500;
    }
  }
  .prescription-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1b254b;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }
  .prescription-table {
    --va-data-table-thead-background: #f8f9fa;
  }
  .total-price {
    margin-top: 1rem;
    font-weight: 600;
    color: #1b254b;
    text-align: right;
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
  }
}

.pdf-render-area {
  position: absolute;
  left: -9999px;
  top: -9999px;
  z-index: -1;
}
</style>
