<template>
  <va-inner-loading :loading="invoiceStore.loading">
    <va-card class="invoice-management-page">
      <va-card-content>
        <div class="page-header">
          <h2 class="va-h4">Quản Lý Viện Phí</h2>
          <p class="va-text-secondary">Tổng hợp và quản lý thông tin viện phí của bệnh nhân.</p>
        </div>

        <!-- BỘ LỌC VÀ TÌM KIẾM -->
        <div class="filters-container">
          <va-tabs v-model="activeTab" grow class="status-tabs">
            <va-tab name="unpaid">
              <va-icon name="hourglass_bottom" class="mr-2" /> Chưa thanh toán
            </va-tab>
            <va-tab name="paid">
              <va-icon name="check_circle" class="mr-2" /> Đã thanh toán
            </va-tab>
          </va-tabs>
          <div class="search-actions">
            <va-input
              v-model="searchQuery"
              placeholder="Tìm theo tên hoặc mã hóa đơn..."
              class="search-input"
              clearable
            >
              <template #prepend-inner>
                <va-icon name="search" color="secondary" />
              </template>
            </va-input>
            <va-date-input
              v-model="filterDate"
              label="Lọc theo ngày"
              class="date-input"
              clearable
            />
          </div>
        </div>

        <!-- BẢNG DỮ LIỆU -->
        <va-data-table
          :items="filteredInvoices"
          :columns="columns"
          class="custom-table"
          no-data-html="<div class='no-data-message'>Không tìm thấy hóa đơn nào.</div>"
          hoverable
        >
          <template #cell(id)="{ rowIndex }">
            <span class="invoice-id">INV-{{ rowIndex + 1 + (currentPage - 1) * pageSize }}</span>
          </template>
          <template #cell(patient)="{ rowData }">
            <div class="patient-cell">
              <va-avatar :src="rowData.appointmentDTO?.avatar || '/defaultAvatar.png'" />
              <div class="patient-info">
                <div class="patient-name">{{ rowData.appointmentDTO?.name || 'N/A' }}</div>
                <div class="patient-email">
                  {{ rowData.appointmentDTO?.emailReceiveInfo || 'N/A' }}
                </div>
              </div>
            </div>
          </template>
          <template #cell(phone)="{ rowData }">
            <span>{{ rowData.appointmentDTO?.phoneReceiveInfo || 'N/A' }}</span>
          </template>
          <template #cell(totalAmount)="slotProps">
            <span class="amount-cell">{{ formatCurrency(slotProps.rowData.totalAmount) }}</span>
          </template>
          <template #cell(invoiceDate)="{ value }">
            <span>{{ formatDate(value) }}</span>
          </template>

          <template #cell(actions)="{ rowData }">
            <div class="actions-cell">
              <va-button
                v-if="rowData.status === 'UNPAID'"
                icon="check"
                color="success"
                size="small"
                @click="handleConfirmPayment(rowData.id)"
                title="Xác nhận thanh toán"
              >
                Xác nhận
              </va-button>
              <va-button
                icon="visibility"
                preset="secondary"
                size="small"
                @click="openDetailModal(rowData)"
                title="Xem chi tiết hóa đơn"
              >
                Xem chi tiết
              </va-button>
            </div>
          </template>
        </va-data-table>

        <!-- PHÂN TRANG -->
        <div class="pagination-container">
          <span class="pagination-info">
            Hiển thị <strong>{{ (currentPage - 1) * pageSize + 1 }}</strong
            >-<strong>{{ Math.min(currentPage * pageSize, totalInvoices) }}</strong> trên
            <strong>{{ totalInvoices }}</strong>
          </span>
          <va-pagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
        </div>
      </va-card-content>
    </va-card>
  </va-inner-loading>

  <!-- MODAL CHI TIẾT HÓA ĐƠN -->
  <va-modal v-model="isDetailModalOpen" size="large" hide-default-actions class="detail-modal">
    <template #header>
      <h2 class="modal-title">
        <va-icon name="receipt_long" class="mr-2" />
        Chi tiết hóa đơn #{{ selectedInvoice?.id }}
      </h2>
    </template>
    <div v-if="selectedInvoice" class="modal-content">
      <div class="info-section">
        <h3 class="section-title">Thông tin bệnh nhân</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Họ tên:</span
            ><span class="value">{{ selectedInvoice.appointmentDTO?.name || 'N/A' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Số điện thoại:</span
            ><span class="value">{{
              selectedInvoice.appointmentDTO?.phoneReceiveInfo || 'N/A'
            }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">Email:</span
            ><span class="value">{{
              selectedInvoice.appointmentDTO?.emailReceiveInfo || 'N/A'
            }}</span>
          </div>
        </div>
      </div>

      <div class="info-section">
        <h3 class="section-title">Thông tin thanh toán</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Ngày lập:</span
            ><span class="value">{{ formatDate(selectedInvoice.invoiceDate) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Tổng tiền:</span
            ><span class="value amount">{{ formatCurrency(selectedInvoice.totalAmount) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Trạng thái:</span
            ><span class="value">
              <va-chip
                size="small"
                :color="selectedInvoice.status === 'PAID' ? 'success' : 'warning'"
              >
                {{ selectedInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' }}
              </va-chip>
            </span>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="modal-footer">
        <va-button preset="secondary" @click="isDetailModalOpen = false">Đóng</va-button>
      </div>
    </template>
  </va-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { toast } from 'vue3-toastify'
import { useModal } from 'vuestic-ui'
import { useInvoiceStore } from '@/stores/invoice.store'
import type { Invoice } from '@/interfaces/invoice.interfaces'
import { storeToRefs } from 'pinia'

// === STORES VÀ HOOKS ===
const invoiceStore = useInvoiceStore()
const { confirm } = useModal()

// === STATE ===
const { invoices, meta } = storeToRefs(invoiceStore)
const searchQuery = ref('')
const filterDate = ref<Date | null>(null) // Sử dụng kiểu Date cho va-date-input
const selectedInvoice = ref<Invoice | null>(null)
const isDetailModalOpen = ref(false)
const currentPage = ref(1)
const pageSize = ref(10) // Tăng số lượng mặc định
const activeTab = ref<'unpaid' | 'paid'>('unpaid')

// === COMPUTED PROPERTIES ===
const filterApiStatus = computed(() => (activeTab.value === 'paid' ? '1' : '0'))
const totalInvoices = computed(() => meta.value?.total || 0)
const totalPages = computed(() => meta.value?.pages || 0)

const filteredInvoices = computed(() => {
  // Lọc phía client chỉ được áp dụng khi không có phân trang server-side mạnh mẽ
  // Ở đây chúng ta vẫn giữ lại để có trải nghiệm lọc tức thì
  if (!searchQuery.value) return invoices.value
  const query = searchQuery.value.toLowerCase().trim()
  return invoices.value.filter(
    (invoice) =>
      (invoice.appointmentDTO?.name && invoice.appointmentDTO.name.toLowerCase().includes(query)) ||
      invoice.id.toLowerCase().includes(query),
  )
})

// === UI CONFIG ===
const columns = ref([
  { key: 'id', label: 'Mã HĐ', sortable: true },
  { key: 'patient', label: 'Bệnh nhân', sortable: true },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'totalAmount', label: 'Tổng tiền', sortable: true },
  { key: 'invoiceDate', label: 'Ngày lập', sortable: true },
  { key: 'actions', label: 'Thao tác', width: '220px' },
])

// === METHODS ===
const fetchInvoices = async () => {
  const dateString = filterDate.value ? filterDate.value.toISOString().split('T')[0] : undefined
  try {
    await invoiceStore.fetchInvoicesByPatient(
      currentPage.value - 1,
      pageSize.value,
      filterApiStatus.value,
      dateString, // Thêm tham số lọc theo ngày
    )
  } catch (error) {
    toast.error('Không thể tải danh sách hóa đơn.')
  }
}

const openDetailModal = (invoice: Invoice) => {
  selectedInvoice.value = invoice
  isDetailModalOpen.value = true
}

const handleConfirmPayment = async (invoiceId: string) => {
  const ok = await confirm({
    title: 'Xác nhận thanh toán',
    message: `Bạn có chắc chắn hóa đơn #${invoiceId} đã được thanh toán đầy đủ?`,
    okText: 'Đã thanh toán',
    cancelText: 'Hủy bỏ',
    blur: true,
  })
  if (ok) {
    try {
      await invoiceStore.changeStatus('1', invoiceId)
      toast.success('Cập nhật trạng thái thành công!')
      await fetchInvoices() // Tải lại dữ liệu sau khi cập nhật
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái hóa đơn.')
    }
  }
}

// --- FORMATTERS ---
const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A')
const formatCurrency = (amount?: number) =>
  typeof amount === 'number'
    ? amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
    : 'N/A'

// === LIFECYCLE & WATCHERS ===
onMounted(fetchInvoices)
watch(activeTab, () => {
  currentPage.value = 1
  fetchInvoices()
})
watch([currentPage, pageSize, filterDate], fetchInvoices)
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.invoice-management-page {
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

.filters-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1.5rem;
}

.status-tabs {
  flex-shrink: 0;
  :deep(.va-tabs__tabs) {
    background-color: #e9ecef;
    border-radius: 8px;
    padding: 4px;
  }
  :deep(.va-tab) {
    font-weight: 500;
    border-radius: 6px;
    &.va-tab--active {
      background-color: #fff;
      color: var(--va-primary);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  }
}

.search-actions {
  display: flex;
  gap: 1rem;
  flex-grow: 1;
  justify-content: flex-end;
}

.search-input {
  width: 300px;
}
.date-input {
  width: 200px;
}

.custom-table {
  --va-data-table-thead-background: #f8f9fa;
  .invoice-id {
    font-weight: 600;
    color: var(--va-primary);
  }
  .patient-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .patient-info {
    display: flex;
    flex-direction: column;
  }
  .patient-name {
    font-weight: 600;
  }
  .patient-email {
    font-size: 0.8rem;
    color: #6c757d;
  }
  .amount-cell {
    font-weight: 600;
    color: #198754;
  }
  .actions-cell {
    display: flex;
    gap: 0.5rem;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  .pagination-info {
    font-size: 0.9rem;
    color: #6c757d;
  }
}

.detail-modal {
  .modal-title {
    font-weight: 600;
    color: var(--va-primary);
  }
  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  .info-section {
    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e9ecef;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .info-item {
      .label {
        display: block;
        font-size: 0.8rem;
        color: #6c757d;
        margin-bottom: 0.25rem;
      }
      .value {
        font-weight: 500;
      }
      .value.amount {
        font-weight: 600;
        color: #198754;
      }
    }
    .full-width {
      grid-column: 1 / -1;
    }
  }
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e9ecef;
  }
}
</style>
