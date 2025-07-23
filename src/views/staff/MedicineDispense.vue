<template>
  <div class="medicine-dispense-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">Cấp phát thuốc & Quản lý Kho</h1>
      <p class="page-subtitle">Tìm kiếm đơn thuốc, cấp phát và nhập kho từ file Excel.</p>
    </div>

    <!-- Filters and Actions -->
    <va-card class="filters-card" outlined>
      <va-card-content>
        <div class="filters-row">
          <!-- Tìm kiếm theo Mã Bệnh Án -->
          <va-input
            v-model="searchMedicalRecordId"
            placeholder="Nhập mã bệnh án để cấp phát..."
            clearable
            class="filter-input"
            @keydown.enter="fetchPrescriptionsByMedicalRecord"
          >
            <template #prependInner>
              <va-icon name="receipt_long" color="#718096" />
            </template>
          </va-input>

          <!-- Nút bấm tìm kiếm cho Mã Bệnh Án -->
          <va-button @click="fetchPrescriptionsByMedicalRecord">Tìm Bệnh Án</va-button>

          <!-- Nút Nhập kho từ Excel -->
          <va-button icon="upload_file" @click="triggerFileInput" color="success"
            >Nhập kho từ Excel</va-button
          >
          <input ref="fileInput" type="file" hidden @change="handleFileUpload" accept=".xlsx" />
        </div>
      </va-card-content>
    </va-card>

    <!-- Prescription List (danh sách đơn thuốc cần cấp phát) -->
    <va-inner-loading :loading="loading">
      <div v-if="prescriptions.length" class="dispense-list">
        <va-card class="medical-record-card">
          <va-card-title>
            Bệnh Án: {{ currentMedicalRecordId }} - Bệnh nhân: {{ patientNameForRecord }}
          </va-card-title>
          <va-card-content>
            <!-- <div
              v-for="prescription in prescriptions"
              :key="prescription.id"
              class="prescription-item"
            >
              <div class="item-details">
                <h4 class="medicine-name">{{ prescription.medicationName }}</h4>
                <p class="quantity">Số lượng kê đơn: {{ prescription.quantity }}</p>
                <p
                  class="stock"
                  :class="{
                    'low-stock': prescription.inventory.quantityInStock < prescription.quantity,
                  }"
                >
                  Tồn kho: {{ prescription.inventory.quantityInStock }}
                </p>
              </div>
              <va-badge
                :color="
                  prescription.inventory.quantityInStock < prescription.quantity
                    ? 'danger'
                    : 'success'
                "
                :text="
                  prescription.inventory.quantityInStock < prescription.quantity
                    ? 'Không đủ thuốc'
                    : 'Sẵn sàng'
                "
              />
            </div> -->
            <div class="action-footer">
              <va-button
                icon="medication"
                @click="dispenseRecord(currentMedicalRecordId)"
                :disabled="!isStockSufficient"
              >
                Cấp phát toàn bộ đơn
              </va-button>
            </div>
          </va-card-content>
        </va-card>
      </div>

      <div v-else class="no-results">
        <va-icon name="search" size="large" color="#718096" />
        <p>Nhập mã bệnh án để tìm đơn thuốc cần cấp phát.</p>
      </div>
    </va-inner-loading>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useMedicalRecordStore } from '@/stores/medicalRecord.store'
import { useDispenseStore } from '@/stores/dispense.store'
import { useInventoryStore } from '@/stores/inventory.store'
import type { PrescriptionItem } from '@/interfaces/medicalRecord.interfaces'

// --- State ---
const searchMedicalRecordId = ref('')
const currentMedicalRecordId = ref('') // Lưu lại ID đang hiển thị
const patientNameForRecord = ref('')
const loading = ref(false)
const prescriptions = ref<PrescriptionItem[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// --- Stores ---
const dispenseStore = useDispenseStore()
const inventoryStore = useInventoryStore()
const medicalRecordStore = useMedicalRecordStore()

// --- Computed Properties ---
const isStockSufficient = computed(() => {
  if (!prescriptions.value.length) return false
  return prescriptions.value.every((p) => p.quantity >= p.quantity)
})

// --- Methods ---
const fetchPrescriptionsByMedicalRecord = async () => {
  if (!searchMedicalRecordId.value.trim()) {
    toast.warn('Vui lòng nhập mã bệnh án.')
    return
  }

  loading.value = true
  prescriptions.value = []
  try {
    await medicalRecordStore.getMedicalRecordById(searchMedicalRecordId.value.trim())
    const record = medicalRecordStore.medicalRecord
    if (!record) {
      throw new Error('Không tìm thấy bệnh án với mã đã nhập.')
    }
    console.log('Fetched medical record:', record.prescriptions)
    // Chỉ hiển thị các đơn thuốc đang chờ xử lý
    const pendingPrescriptions = record.prescriptions.filter((p) => p.status === 'PENDING')

    if (pendingPrescriptions.length === 0) {
      toast.info('Bệnh án này không có đơn thuốc nào đang chờ cấp phát.')
    } else {
      prescriptions.value = pendingPrescriptions
      currentMedicalRecordId.value = record.id
      patientNameForRecord.value = record.patient.name
    }
  } catch (err: any) {
    toast.error(err.message || 'Không tìm thấy bệnh án hoặc đã có lỗi xảy ra.')
  } finally {
    loading.value = false
  }
}

const dispenseRecord = async (medicalRecordId: string) => {
  if (!isStockSufficient.value) {
    toast.error('Không đủ thuốc trong kho để cấp phát. Vui lòng nhập thêm kho.')
    return
  }

  if (!confirm(`Bạn có chắc chắn muốn cấp phát toàn bộ thuốc cho bệnh án ${medicalRecordId}?`)) {
    return
  }

  loading.value = true
  try {
    const result = await dispenseStore.dispenseMedications(medicalRecordId)
    toast.success(
      `Cấp phát thành công! Tổng tiền: ${result.totalPrice.toLocaleString('vi-VN')} VNĐ`,
    )
    // Xóa khỏi danh sách sau khi cấp phát thành công
    prescriptions.value = []
    currentMedicalRecordId.value = ''
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
      `Nhập kho thành công! Success: ${report.successCount}, Failed: ${report.failureCount}`,
    )
    // Có thể hiển thị chi tiết lỗi nếu cần
    if (report.failureCount > 0) {
      console.error('Import errors:', report.errorDetails)
      toast.warn('Có một số dòng bị lỗi, vui lòng kiểm tra console.')
    }
  } catch (err: any) {
    toast.error(`Lỗi nhập kho: ${err.message}`)
  } finally {
    loading.value = false
    // Reset file input để có thể chọn lại cùng 1 file
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}
</script>

<style lang="scss" scoped>
// ... Giữ lại toàn bộ CSS của bạn, tôi sẽ thêm một vài class mới ...
.medicine-dispense-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
  .page-title {
    font-size: 2rem;
    font-weight: 700;
  }
  .page-subtitle {
    color: #718096;
  }
}

.filters-card {
  margin-bottom: 2rem;
  .filters-row {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  .filter-input {
    flex-grow: 1;
  }
}

.no-results {
  text-align: center;
  padding: 3rem 0;
  color: #718096;
  .va-icon {
    margin-bottom: 1rem;
  }
}

.medical-record-card {
  background: #fdfdff;
  border: 1px solid #e2e8f0;

  .prescription-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e2e8f0;

    &:last-child {
      border-bottom: none;
    }

    .item-details {
      .medicine-name {
        font-size: 1.1rem;
        font-weight: 600;
      }
      .quantity {
        color: #4a5568;
      }
      .stock {
        font-weight: 500;
        &.low-stock {
          color: #e53e3e; // Màu đỏ cho cảnh báo hết hàng
        }
      }
    }
  }

  .action-footer {
    padding: 1rem;
    text-align: right;
    border-top: 1px solid #e2e8f0;
  }
}
</style>
