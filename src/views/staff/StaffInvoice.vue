<template>
  <va-card>
    <va-card-content>
      <h4 class="va-h4 text-center">Quản lý thông tin viện phí</h4>
      <p class="text-center">Thông tin viện phí của bệnh nhân được tổng hợp hiển thị dưới đây.</p>

      <!-- BỘ LỌC VÀ TÌM KIẾM -->
      <div class="d-flex my-4 selected-container">
        <va-select
          v-model="filterStatus"
          :options="optionsStatus"
          label="Trạng thái hóa đơn"
          value-by="value"
          text-by="text"
          class="status-filter"
          @update:model-value="fetchInvoices"
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
        :items="filteredInvoices"
        :columns="columns"
        class="custom-table"
        no-data-html="Không có lịch hẹn nào."
        hoverable
      >
        <template #cell(id)="slotProps">
          Invoice0{{ slotProps.rowIndex + 1 + (currentPage - 1) * pageSize }}
        </template>
        <template #cell(patient)="slotProps">
          <div class="d-flex align-center">
            <va-avatar
              :src="slotProps.rowData.id || '/defaultAvatar.png'"
              size="small"
              class="mr-2"
            />
            <div>
              <div>{{ slotProps.rowData.appointmentDTO.name }}</div>
            </div>
          </div>
        </template>

        <template #cell(phone)="slotProps">
          <div>
            <div>
              {{ slotProps.rowData.appointmentDTO.phoneReceiveInfo }}
            </div>
          </div>
        </template>

        <template #cell(email)="slotProps">
          {{ slotProps.rowData.appointmentDTO.emailReceiveInfo }}
        </template>

        <template #cell(actions)="slotProps">
          <va-button
            v-if="slotProps.rowData.status === 'UNPAID'"
            class="mr-2"
            preset="primary"
            @click="openDetailModal(slotProps.rowData)"
          >
            <va-icon name="check" />
            <span class="ml-1">Xác nhận</span>
          </va-button>

          <va-button
            v-if="slotProps.rowData.status === 'PAID'"
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
        Thông tin hóa đơn
      </h2>
    </template>

    <div v-if="selectedInvoice" class="space-y-6">
      <h3>Thông tin bệnh nhân</h3>
      <va-card-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><strong>Họ tên:</strong> {{ selectedInvoice.appointmentDTO.name || 'Chưa có' }}</div>
        </div>
      </va-card-content>

      <h3>Thông tin hóa đơn</h3>
      <va-card-content>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <strong>Ngày lập hóa đơn:</strong>
            {{ formatDate(selectedInvoice.invoiceDate) }}
          </div>
          <div>
            <strong>Tổng số tiền: </strong>
            {{
              selectedInvoice.totalAmount.toLocaleString('vi-VN', {
                style: 'currency',
                currency: 'VND',
              })
            }}
          </div>
          <div>
            <strong>Trạng thái:</strong>
            {{
              getStatusText(selectedInvoice.status) === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'
            }}
          </div>
        </div>
      </va-card-content>
      <div class="flex justify-end pt-4">
        <va-button
          v-if="selectedInvoice.status === 'UNPAID'"
          preset="primary"
          class="mr-2"
          @click="handleChangeStatus(selectedInvoice.id, 'PAID')"
          >Xác nhận</va-button
        >
        <va-button preset="primary" @click="isDetailModalOpen = false">Đóng</va-button>
      </div>
    </div>
  </va-modal>
  <va-modal v-model="isDeleteModalOpen" hide-default-actions max-width="500px">
    <DeleteConfirm
      v-if="selectedInvoice"
      v-model="isDetailModalOpen"
      :title="'Xác nhận hủy lịch hẹn'"
      :message="'Bạn có chắc chắn muốn hủy lịch hẹn này không?'"
      @confirm="handleChangeStatus(selectedInvoice.id, 'CANCELLED')"
    />
  </va-modal>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Medicine } from '@/interfaces/medicine.interface'
import DeleteConfirm from '@/components/DeleteConfirm.vue'
import type { Invoice } from '@/interfaces/invoice.interfaces'
import { useInvoiceStore } from '@/stores/invoice.store'

// === STATE MANAGEMENT ===
const invoices = ref<Invoice[]>([])
const searchQuery = ref('')
const filterStatus = ref('0')
const selectedInvoice = ref<Invoice | null>(null)
const isDetailModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const openDeleteModal = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isDeleteModalOpen.value = true
}
const openDetailModal = (appointment: Invoice) => {
  selectedInvoice.value = appointment
  isDetailModalOpen.value = true
}

// State cho v-model của va-select, giúp reset dễ dàng
const medicationOptions = ref<Medicine[]>([])

// === STORES ===
const invoiceStore = useInvoiceStore()
const medicineStore = useMedicineStore()

// === UI CONFIG ===
const optionsStatus = ref([
  { text: 'Chưa thanh toán', value: '0' },
  { text: 'Đã thanh toán', value: '1' },
  // { text: 'Đã hủy', value: '2' },
])
const columns = ref([
  { key: 'id', label: 'Mã lịch khám', sortable: true },
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'phone', label: 'Số điện thoại', sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'actions', label: 'Thao tác', width: '220px' },
])

// === COMPUTED PROPERTIES ===
const filteredInvoices = computed(() => {
  if (!searchQuery.value) return invoices.value
  const query = searchQuery.value.toLowerCase()
  return invoices.value.filter(
    (apt) =>
      (apt.appointmentDTO.name && apt.appointmentDTO.name.toLowerCase().includes(query)) ||
      apt.id.toLowerCase().includes(query),
  )
})

// === METHODS ===
const fetchInvoices = async () => {
  try {
    await invoiceStore.fetchInvoicesByPatient(0, 100, filterStatus.value)
    invoices.value = invoiceStore.invoices
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
const getStatusText = (status: string) =>
  optionsStatus.value.find((o) => o.value === status)?.text || status

// === LIFECYCLE HOOKS ===
onMounted(async () => {
  await fetchInvoices()
  await fetchMedications()
})
const handleChangeStatus = async (id: string, newStatus: string) => {
  if (confirm('Xác nhận đã nhận đủ tiền và muốn cập nhật trạng thái?')) {
    if (!selectedInvoice.value) return
    try {
      await invoiceStore.changeStatus(newStatus, id)
      toast.success('Cập nhật trạng thái thành công.')
      isDetailModalOpen.value = false
      await fetchInvoices() // Refresh appointments after status change
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái lịch hẹn.')
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
