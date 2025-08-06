<template>
  <va-card class="schedule-management-card">
    <va-card-content>
      <div class="header-section">
        <h2 class="va-h4">Quản lý Phân công Nhân viên</h2>
        <p class="text-secondary">Xác nhận hoặc hủy các yêu cầu phân công lịch trực.</p>
      </div>

      <!-- BỘ LỌC THEO PIVOT_STATUS -->
      <div class="filters-container">
        <va-tabs v-model="activePivotTab" grow class="status-tabs">
          <va-tab name="ALL"> <va-icon name="list" class="mr-2" /> Tất cả </va-tab>
          <va-tab name="PENDING">
            <va-icon name="pending_actions" class="mr-2" /> Chờ xác nhận
          </va-tab>
          <va-tab name="APPROVED">
            <va-icon name="check_circle" class="mr-2" /> Đã xác nhận
          </va-tab>
          <va-tab name="IN_PROGRESS"> <va-icon name="sync" class="mr-2" /> Đang diễn ra </va-tab>
          <va-tab name="COMPLETED"> <va-icon name="done_all" class="mr-2" /> Hoàn thành </va-tab>
          <va-tab name="CANCELED"> <va-icon name="cancel" class="mr-2" /> Đã hủy </va-tab>
        </va-tabs>
      </div>

      <!-- BẢNG DỮ LIỆU PHÂN CÔNG -->
      <va-inner-loading :loading="isLoading">
        <va-data-table
          :items="paginatedAssignments"
          :columns="columns"
          class="custom-table"
          no-data-html="<div class='no-data-message'>Không có phân công nào phù hợp.</div>"
          hoverable
        >
          <template #cell(staffInfo)="{ rowData }">
            <div class="staff-info-cell">
              <va-avatar
                :src="rowData.staff.avatar || '/defaultAvatar.png'"
                :fallback-text="rowData.staff.name?.charAt(0) || '?'"
              />
              <div class="staff-details">
                <div class="staff-name">{{ rowData.staff.name }}</div>
                <div class="staff-position">{{ rowData.staff.position }}</div>
              </div>
            </div>
          </template>

          <template #cell(shiftTime)="{ rowData }">
            <div class="font-semibold text-gray-800">
              {{ formatTime(rowData.doctorShift.startTime) }} -
              {{ formatTime(rowData.doctorShift.endTime) }}
            </div>
          </template>

          <template #cell(dayWork)="{ rowData }">
            <div class="text-gray-700">{{ formatDate(rowData.doctorShift.dayWork) }}</div>
          </template>

          <template #cell(status)="{ rowData }">
            <va-chip size="small" :color="getPivotStatusColor(rowData.status)" class="font-medium">
              {{ getPivotStatusText(rowData.status) }}
            </va-chip>
          </template>

          <template #cell(actions)="{ rowData }">
            <div v-if="rowData.status === 'PENDING'" class="d-flex align-center gap-2">
              <va-button
                preset="primary"
                size="small"
                icon="check"
                color="success"
                @click="handleUpdateStatus(rowData, 'APPROVED')"
                title="Xác nhận phân công"
                class="action-button"
              >
                Xác nhận
              </va-button>
              <va-button
                preset="primary"
                size="small"
                icon="close"
                color="danger"
                @click="handleUpdateStatus(rowData, 'CANCELED')"
                title="Hủy phân công"
                class="action-button"
              >
                Hủy
              </va-button>
            </div>
            <div v-else class="text-gray-500 italic text-sm">Không có thao tác</div>
          </template>
        </va-data-table>
      </va-inner-loading>

      <!-- PHẦN PHÂN TRANG -->
      <div v-if="!isLoading && totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          <span class="info-text">
            Hiển thị <strong>{{ startRecord }}</strong> - <strong>{{ endRecord }}</strong> trên tổng
            số <strong>{{ filteredAssignments.length }}</strong> phân công
          </span>
        </div>
        <va-pagination
          v-model="currentPage"
          :pages="totalPages"
          :visible-pages="5"
          class="pagination-component"
        />
      </div>
    </va-card-content>
  </va-card>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import type { StaffDoctorShift } from '@/interfaces/doctorShift.interfaces'
import { useScheduleStore } from '@/stores/schedule.store'
import { storeToRefs } from 'pinia'

// --- STATE MANAGEMENT ---
const scheduleStore = useScheduleStore()
// Sử dụng allAssignments để lưu trữ toàn bộ dữ liệu fetch về
const { assignments: allAssignments, isLoading } = storeToRefs(scheduleStore)

// --- FILTERS & PAGINATION STATE (CLIENT-SIDE) ---
const activePivotTab = ref('IN_PROGRESS')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// --- UI CONFIG ---
const columns = ref([
  { key: 'staffInfo', label: 'Nhân viên', width: '35%' },
  {
    key: 'shiftTime',
    label: 'Ca trực',
    sortable: true,
    sortingKey: 'doctorShift.startTime',
    width: '20%',
  },
  {
    key: 'dayWork',
    label: 'Ngày trực',
    sortable: true,
    sortingKey: 'doctorShift.dayWork',
    width: '15%',
  },
  { key: 'status', label: 'Trạng thái', sortable: true, width: '15%' },
  { key: 'actions', label: 'Thao tác', width: '15%' },
])

// --- CLIENT-SIDE COMPUTED PROPERTIES ---

// 1. Lọc danh sách assignments dựa trên tab đang active
const filteredAssignments = computed(() => {
  if (activePivotTab.value === 'ALL') {
    return allAssignments.value
  }
  return allAssignments.value.filter((a) => a.status === activePivotTab.value)
})

// 2. Tính toán tổng số trang dựa trên danh sách đã lọc
const totalPages = computed(() => {
  return Math.ceil(filteredAssignments.value.length / itemsPerPage.value)
})

// 3. Lấy ra các items cho trang hiện tại
const paginatedAssignments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAssignments.value.slice(start, end)
})

// 4. Cập nhật thông tin phân trang
const startRecord = computed(() => {
  if (filteredAssignments.value.length === 0) return 0
  return (currentPage.value - 1) * itemsPerPage.value + 1
})
const endRecord = computed(() => {
  return Math.min(currentPage.value * itemsPerPage.value, filteredAssignments.value.length)
})

// --- METHODS ---
// Fetch toàn bộ dữ liệu một lần
const fetchAllAssignments = async () => {
  try {
    // Gọi API để fetch tất cả (ví dụ: size lớn)
    await scheduleStore.fetchAssignments({ page: 0, size: 10000 })
  } catch (error: any) {
    toast.error(error.message || 'Không thể tải danh sách phân công.')
  }
}

const handleUpdateStatus = async (
  assignment: StaffDoctorShift,
  newStatus: 'APPROVED' | 'CANCELED',
) => {
  try {
    await scheduleStore.updateAssignmentStatus(assignment.id, newStatus)
    toast.success('Cập nhật trạng thái phân công thành công!')

    // Sau khi cập nhật, fetch lại toàn bộ danh sách để đảm bảo dữ liệu luôn mới nhất
    await fetchAllAssignments()

    // Kiểm tra và điều chỉnh trang hiện tại nếu cần
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value
    }
  } catch (error: any) {
    toast.error(error.message || 'Cập nhật trạng thái thất bại.')
  }
}

// --- FORMATTERS ---
const formatDate = (date: string | undefined) =>
  date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
const formatTime = (time: string | undefined) => (time ? time.substring(0, 5) : 'N/A')

const getPivotStatusText = (status: string) => {
  const map: { [key: string]: string } = {
    PENDING: 'Chờ xác nhận',
    APPROVED: 'Đã xác nhận',
    CANCELED: 'Đã hủy',
    IN_PROGRESS: 'Đang diễn ra',
    COMPLETED: 'Hoàn thành',
  }
  return map[status] || status
}

const getPivotStatusColor = (status: string) => {
  const map: { [key: string]: string } = {
    PENDING: 'warning',
    APPROVED: 'success',
    CANCELED: 'danger',
    IN_PROGRESS: 'info',
    COMPLETED: 'secondary',
  }
  return map[status] || 'secondary'
}

// --- LIFECYCLE & WATCHERS ---
watch(activePivotTab, () => {
  // Khi đổi tab, reset về trang 1
  currentPage.value = 1
})

// Fetch dữ liệu khi component được mount lần đầu
onMounted(fetchAllAssignments)
</script>

<style scoped lang="scss">
/* Biến màu sắc và theme */
:root {
  --bg-color: #f5f7fa;
  --card-bg-color: #ffffff;
  --text-color: #1f2a44;
  --text-color-light: #6b7280;
  --border-color: #e5e7eb;
  --shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  --primary-color: #3b82f6;
}

/* Container chính */
.schedule-management-card {
  background-color: var(--card-bg-color);
  border-radius: 12px;
  box-shadow: var(--shadow);
  font-family: 'Be Vietnam Pro', sans-serif;
}

/* Header */
.header-section {
  text-align: center;
  padding-bottom: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  .va-h4 {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-color);
  }
  .text-secondary {
    font-size: 1rem;
    color: var(--text-color-light);
  }
}

/* Tabs lọc */
.filters-container {
  margin-bottom: 2rem;
}
.status-tabs {
  :deep(.va-tabs__tabs) {
    background-color: var(--bg-color);
    border-radius: 8px;
    padding: 6px;
  }
  :deep(.va-tab) {
    font-weight: 500;
    border-radius: 6px;
    transition: all 0.3s ease;
    &.va-tab--active {
      background-color: var(--primary-color);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
    }
  }
}

/* Bảng dữ liệu */
.custom-table {
  :deep(.va-data-table__table-thead) {
    background-color: #f8fafc !important;
    th {
      font-weight: 600;
      color: var(--text-color);
      text-transform: uppercase;
      font-size: 0.8rem;
    }
  }
  :deep(td) {
    vertical-align: middle;
  }
}

/* Cell thông tin nhân viên */
.staff-info-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  .staff-details {
    .staff-name {
      font-weight: 600;
      color: var(--text-color);
    }
    .staff-position {
      font-size: 0.85rem;
      color: var(--text-color-light);
    }
  }
}

/* Nút thao tác */
.action-button {
  border-radius: 6px;
  font-weight: 500;
}

/* Thông báo không có dữ liệu */
.no-data-message {
  text-align: center;
  color: var(--text-color-light);
  padding: 2rem;
}

/* Phân trang */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding: 0 0.5rem;
  .pagination-info .info-text {
    font-size: 0.9rem;
    color: var(--text-color-light);
    strong {
      color: var(--text-color);
    }
  }
  :deep(.va-pagination__item) {
    border-radius: 6px;
    &.va-pagination__item--active {
      background-color: var(--primary-color);
    }
  }
}
</style>
