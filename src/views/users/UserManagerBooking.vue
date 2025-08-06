<script setup lang="ts">
import type { Appointment } from '@/interfaces/appointment.interfaces'
import { useAppointmentStore } from '@/stores/appointment.store'
import { ref, computed, onMounted } from 'vue'
import '@assets/user/UserManagerBooking.scss'
import type { PaymentRequest } from '@/interfaces/payment.interface'
import { usePaymentStore } from '@/stores/payment.store'
import { toast } from 'vue3-toastify'
import type { PatientFeedbackCreate } from '@/interfaces/patientFeedback.interfaces'
import { usePatientFeedbackStore } from '@/stores/patientFeedback.store'
import DeleteConfirm from '@/components/DeleteConfirm.vue'

const appointmentStore = useAppointmentStore()
const paymentStore = usePaymentStore()
const feedbackStore = usePatientFeedbackStore()
const appointments = ref<Appointment[]>([])
const feedbackData = ref<PatientFeedbackCreate>({
  feedback: '',
  rating: 0,
  appointmentId: '',
})
onMounted(async () => {
  await fetchInitData()
})
const fetchInitData = async () => {
  await appointmentStore.fetchAppointmentsByPatient(0, 4)
  appointments.value = appointmentStore.appointments
}

// Filters and search
const searchQuery = ref('')
const filterStatus = ref('')
const selectedTab = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(6)

// Modal states
const selectedAppointment = ref<Appointment | null>(null)
const isDetailModalOpen = ref(false)
const isFeedbackModalOpen = ref(false)
const isRescheduleModalOpen = ref(false)
const cancelReason = ref('')

// Reschedule form
const rescheduleForm = ref({
  date: '',
  time: '',
  reason: '',
})

const availableTimes = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
]

// Status options
const statusOptions = [
  { value: 'PENDING', text: 'Chờ xác nhận', color: 'warning' },
  { value: 'PENDING_PAYMENT', text: 'Chưa thanh toán', color: 'warning' },
  { value: 'CONFIRMED', text: 'Đã xác nhận', color: 'info' },
  { value: 'COMPLETED', text: 'Hoàn thành', color: 'success' },
  { value: 'CANCELLED', text: 'Đã hủy', color: 'danger' },
]

// Tab options
const tabOptions = computed(() => [
  { value: 'all', text: 'Tất cả', count: appointments.value.length },
  {
    value: 'PENDING_PAYMENT',
    text: 'Chưa thanh toán',
    count: appointments.value.filter((apt) => ['PENDING_PAYMENT'].includes(apt.status)).length,
  },
  {
    value: 'upcoming',
    text: 'Sắp tới',
    count: appointments.value.filter((apt) => ['CONFIRMED'].includes(apt.status)).length,
  },
  {
    value: 'COMPLETED',
    text: 'Đã hoàn thành',
    count: appointments.value.filter((apt) => apt.status === 'COMPLETED').length,
  },
  {
    value: 'CANCELLED',
    text: 'Đã hủy',
    count: appointments.value.filter((apt) => apt.status === 'CANCELLED').length,
  },
])
// Computed
const filteredAppointments = computed(() => {
  let result = [...appointments.value]

  // Tab filter
  if (selectedTab.value === 'upcoming') {
    result = result.filter((apt) => ['CONFIRMED'].includes(apt.status))
  } else if (selectedTab.value === 'PENDING_PAYMENT') {
    result = result.filter((apt) => apt.status === 'PENDING_PAYMENT')
  } else if (selectedTab.value === 'COMPLETED') {
    result = result.filter((apt) => apt.status === 'COMPLETED')
  } else if (selectedTab.value === 'CANCELLED') {
    result = result.filter((apt) => apt.status === 'CANCELLED')
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (apt) =>
        apt.staff.user.name.toLowerCase().includes(query) ||
        apt.staff.departments.name.toLowerCase().includes(query) ||
        // apt.type.toLowerCase().includes(query) ||
        apt.reason.toLowerCase().includes(query) ||
        apt.id.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (filterStatus.value) {
    result = result.filter((apt) => apt.status === filterStatus.value)
  }

  return result
})

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredAppointments.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / itemsPerPage.value))

const upcomingAppointments = computed(() => {
  return appointments.value
    .filter(
      (apt) =>
        ['PENDING', 'CONFIRMED'].includes(apt.status) &&
        new Date(apt.date + ' ' + apt.time) >= new Date(),
    )
    .slice(0, 3)
})
const isShowDeleteModal = ref(false)
const selectedDelete = ref('')
function onShowDeleteModal(id: string) {
  selectedDelete.value = id
  isShowDeleteModal.value = true
}

function onCloseModalDelete() {
  isShowDeleteModal.value = false
}
const handleDelete = async (id: string) => {
  try {
    await appointmentStore.deleteAppointment(id)
    toast.success('Hủy lịch hẹn thành công')
    isShowDeleteModal.value = false
    fetchInitData()
  } catch (e) {
    toast.error('Hủy lịch hẹn thất bại')
  }
}
const appointmentStats = computed(() => {
  const total = appointments.value.length
  const pending = appointments.value.filter((apt) => apt.status === 'PENDING_PAYMENT').length
  const confirmed = appointments.value.filter((apt) => apt.status === 'CONFIRMED').length
  const completed = appointments.value.filter((apt) => apt.status === 'COMPLETED').length
  const cancelled = appointments.value.filter((apt) => apt.status === 'CANCELLED').length
  const totalSpent = appointments.value
    .filter((apt) => apt.invoice.status === 'PAID')
    .reduce((sum, apt) => sum + apt.invoice.totalAmount, 0)

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    totalSpent,
  }
})

// Methods
const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find((opt) => opt.value === status)
  return statusOption?.color || 'secondary'
}

const getStatusText = (status: string) => {
  const statusOption = statusOptions.find((opt) => opt.value === status)
  return statusOption?.text || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatShortDate = (date: string) => {
  return new Date(date).toLocaleDateString('vi-VN')
}

const formatTime = (time: string) => {
  return time
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const getDaysUntilAppointment = (appointment: Appointment) => {
  const now = new Date()
  const appointmentDate = new Date(appointment.date) // Chỉ lấy ngày, không cần giờ

  // Đặt giờ, phút, giây về 0 để so sánh chính xác các ngày
  now.setHours(0, 0, 0, 0)
  appointmentDate.setHours(0, 0, 0, 0)

  // Tính số mili giây chênh lệch
  const diffTime = appointmentDate.getTime() - now.getTime()

  // Chuyển đổi sang số ngày
  const diffDays = diffTime / (1000 * 60 * 60 * 24)

  if (diffDays < 0) {
    return 'Đã qua'
  }
  if (diffDays === 0) {
    return 'Hôm nay'
  }
  if (diffDays === 1) {
    return 'Ngày mai'
  }
  // Nếu lớn hơn 1, hiển thị số ngày còn lại
  return `${diffDays} ngày nữa`
}

const openAppointmentDetail = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  isDetailModalOpen.value = true
}

const closeAppointmentDetail = () => {
  isDetailModalOpen.value = false
  selectedAppointment.value = null
}

const openHandleFeedback = (appointment: Appointment) => {
  selectedAppointment.value = appointment
  feedbackData.value.appointmentId = appointment.id
  isFeedbackModalOpen.value = true
  cancelReason.value = ''
}

const closeFeedbackModal = () => {
  isFeedbackModalOpen.value = false
  selectedAppointment.value = null
  feedbackData.value = {
    feedback: '',
    rating: 0,
    appointmentId: '',
  }
}

const closeRescheduleModal = () => {
  isRescheduleModalOpen.value = false
  selectedAppointment.value = null
  rescheduleForm.value = {
    date: '',
    time: '',
    reason: '',
  }
}
const submitFeedback = async () => {
  try {
    await feedbackStore.addPatientFeedback(feedbackData.value)
    toast.success('Gửi đánh giá thành công!')
    closeFeedbackModal()
  } catch (error: any) {
    toast.error(error.message || 'Gửi đánh giá thất bại.')
  }
}
const rescheduleAppointment = () => {
  if (selectedAppointment.value && rescheduleForm.value.date && rescheduleForm.value.time) {
    const appointment = appointments.value.find((apt) => apt.id === selectedAppointment.value!.id)
    if (appointment) {
      appointment.date = rescheduleForm.value.date
      appointment.time = rescheduleForm.value.time
      if (rescheduleForm.value.reason) {
        appointment.notes = `Lý do đổi lịch: ${rescheduleForm.value.reason}`
      }
    }
    closeRescheduleModal()
  }
}
const requestPayment = ref<PaymentRequest>({
  amount: 0,
  appointmentId: '',
})
const handlePayment = async (amount: number, appointment: string) => {
  requestPayment.value.amount = amount
  requestPayment.value.appointmentId = appointment
  toast.info('Đang tạo yêu cầu thanh toán, vui lòng chờ...')
  const paymentUrl = await paymentStore.createPaymentVNPay(requestPayment.value)
  if (paymentUrl) {
    window.location.href = paymentUrl
  } else {
    toast.error('Không nhận được URL thanh toán từ hệ thống.')
  }
}
</script>

<template>
  <va-inner-loading :loading="paymentStore.loading">
    <div class="user-manage-bookings">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">Lịch khám của tôi</h1>
            <p class="hero-subtitle">
              Quản lý và theo dõi tất cả các lịch khám đã đặt một cách dễ dàng
            </p>
          </div>
          <div class="hero-stats">
            <div class="stat-item">
              <div class="stat-number">{{ appointmentStats.total }}</div>
              <div class="stat-label">Tổng lịch khám</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">
                {{ appointmentStats.pending + appointmentStats.confirmed }}
              </div>
              <div class="stat-label">Sắp tới</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ formatCurrency(appointmentStats.totalSpent) }}</div>
              <div class="stat-label">Tổng chi phí</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card upcoming">
            <div class="stat-icon">
              <va-icon name="schedule" />
            </div>
            <div class="stat-content">
              <div class="stat-number">
                {{ appointmentStats.pending + appointmentStats.confirmed }}
              </div>
              <div class="stat-label">Lịch sắp tới</div>
              <div class="stat-description">Cần chuẩn bị</div>
            </div>
          </div>

          <div class="stat-card completed">
            <div class="stat-icon">
              <va-icon name="check_circle" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.completed }}</div>
              <div class="stat-label">Đã hoàn thành</div>
              <div class="stat-description">Khám thành công</div>
            </div>
          </div>

          <div class="stat-card pending">
            <div class="stat-icon">
              <va-icon name="hourglass_empty" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.pending }}</div>
              <div class="stat-label">Chờ xác nhận</div>
              <div class="stat-description">Đang xử lý</div>
            </div>
          </div>

          <div class="stat-card total">
            <div class="stat-icon">
              <va-icon name="event" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ appointmentStats.total }}</div>
              <div class="stat-label">Tổng lịch khám</div>
              <div class="stat-description">Tất cả thời gian</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upcoming Appointments Highlight -->
      <div v-if="upcomingAppointments.length > 0" class="upcoming-section">
        <div class="section-header">
          <h2 class="section-title">
            <va-icon name="upcoming" />
            Lịch khám sắp tới
          </h2>
          <p class="section-subtitle">Những lịch hẹn quan trọng cần chú ý</p>
        </div>

        <div class="upcoming-grid">
          <div
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            class="upcoming-card"
            :class="{
              urgent:
                getDaysUntilAppointment(appointment) === 'Hôm nay' ||
                getDaysUntilAppointment(appointment) === 'Ngày mai',
            }"
          >
            <div class="card-header">
              <div class="appointment-badge">
                <va-badge :color="getStatusColor(appointment.status)" class="status-badge">
                  {{ getStatusText(appointment.status) }}
                </va-badge>
                <!-- <span class="appointment-id">#{{ appointment.id }}</span> -->
              </div>
              <div class="countdown">
                <va-icon name="access_time" />
                <span>{{ getDaysUntilAppointment(appointment) }}</span>
              </div>
            </div>

            <div class="card-body">
              <div class="doctor-section">
                <div class="doctor-avatar-container">
                  <img
                    :src="appointment.staff.user.avatar"
                    :alt="appointment.staff.user.name"
                    class="doctor-avatar"
                  />
                  <div class="doctor-rating">
                    <va-icon name="star" />
                    <span>{{ appointment.staff.rating }}</span>
                  </div>
                </div>
                <div class="doctor-info">
                  <h3 class="doctor-name">{{ appointment.staff.user.name }}</h3>
                  <p class="doctor-department">{{ appointment.staff.departments.name }}</p>
                  <p class="doctor-experience">
                    {{ appointment.staff.experienceYear }} năm kinh nghiệm
                  </p>
                </div>
              </div>

              <div class="appointment-details">
                <div class="detail-row">
                  <va-icon name="event" />
                  <span
                    >{{ formatShortDate(appointment.date) }} lúc
                    {{ formatTime(appointment.time) }}</span
                  >
                </div>
                <div class="detail-row">
                  <va-icon name="medical_services" />
                  <span>{{ appointment.services.map((ser) => ser.name).join(', ') }}</span>
                </div>
                <div class="detail-row">
                  <va-icon name="attach_money" />
                  <span>{{ formatCurrency(appointment.invoice.totalAmount) }}</span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <va-button preset="primary" size="small" @click="openAppointmentDetail(appointment)">
                <va-icon name="visibility" />
                Xem chi tiết
              </va-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters and Tabs -->
      <div class="filters-section">
        <div class="filters-header">
          <h2 class="filters-title">Tất cả lịch khám</h2>
          <div class="filters-controls"></div>
        </div>

        <div class="tabs-container">
          <div class="custom-tabs">
            <button
              v-for="tab in tabOptions"
              :key="tab.value"
              class="tab-button"
              :class="{ active: selectedTab === tab.value }"
              @click="selectedTab = tab.value"
            >
              <span class="tab-text">{{ tab.text }}</span>
              <span class="tab-count">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Appointments List -->
      <div class="appointments-section">
        <div class="appointments-grid">
          <div
            v-for="appointment in paginatedAppointments"
            :key="appointment.id"
            class="appointment-card"
            @click="openAppointmentDetail(appointment)"
          >
            <div class="card-header">
              <div class="header-left">
                <va-badge :color="getStatusColor(appointment.status)">
                  {{ getStatusText(appointment.status) }}
                </va-badge>
              </div>
              <div class="header-right">
                <div class="appointment-date">
                  <va-icon name="event" />
                  <span>{{ formatShortDate(appointment.date) }}</span>
                </div>
                <div class="appointment-time">
                  <va-icon name="access_time" />
                  <span>{{ formatTime(appointment.time) }}</span>
                </div>
              </div>
            </div>

            <div class="card-body">
              <div class="doctor-section">
                <img
                  :src="appointment.staff.user.avatar"
                  :alt="appointment.staff.user.name"
                  class="doctor-avatar"
                />
                <div class="doctor-info">
                  <h3 class="doctor-name">{{ appointment.staff.user.name }}</h3>
                  <p class="doctor-department">{{ appointment.staff.departments.name }}</p>
                  <div class="doctor-meta">
                    <span class="rating">
                      <va-icon name="star" />
                      {{ appointment.staff.rating }}
                    </span>
                    <span class="experience">{{ appointment.staff.experienceYear }} năm</span>
                  </div>
                </div>
              </div>

              <div class="appointment-info">
                <div class="info-item">
                  <span class="label">Loại khám:</span>
                  <span class="value">{{
                    appointment.services.map((ser) => ser.name).join(',')
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Lý do:</span>
                  <span class="value">{{ appointment.reason }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Chi phí:</span>
                  <span class="value price">{{
                    formatCurrency(appointment.invoice.totalAmount)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Thanh toán:</span>
                  <va-badge
                    :color="
                      appointment.invoice.method === 'PAID'
                        ? 'success'
                        : appointment.invoice.status === 'UNPAID'
                          ? 'warning'
                          : 'info'
                    "
                    size="small"
                  >
                    {{
                      appointment.invoice.status === 'PAID'
                        ? 'Đã thanh toán'
                        : appointment.invoice.status === 'UNPAID'
                          ? 'Chờ thanh toán'
                          : 'Đã hoàn tiền'
                    }}
                  </va-badge>
                </div>
              </div>
            </div>

            <div class="card-footer" @click.stop>
              <div class="footer-left">
                <va-button preset="primary" @click="openAppointmentDetail(appointment)">
                  Chi tiết
                </va-button>
              </div>
              <div class="footer-right">
                <va-button
                  v-if="
                    getDaysUntilAppointment(appointment) !== 'Hôm nay' &&
                    appointment.status !== 'CANCELLED'
                  "
                  @click="onShowDeleteModal(appointment.id)"
                  >Hủy</va-button
                >

                <va-button
                  preset="primary"
                  v-if="
                    appointment.invoice.status === 'UNPAID' && appointment.status !== 'CANCELLED'
                  "
                  @click="handlePayment(appointment.invoice.totalAmount, appointment.id)"
                >
                  Thanh toán
                </va-button>

                <va-button
                  v-if="appointment.status === 'COMPLETED'"
                  preset="danger"
                  @click="openHandleFeedback(appointment)"
                >
                  Đánh giá
                </va-button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="paginatedAppointments.length === 0" class="empty-state">
          <div class="empty-icon">
            <va-icon name="event_busy" />
          </div>
          <h3 class="empty-title">Không có lịch khám nào</h3>
          <p class="empty-description">Bạn chưa có lịch khám nào phù hợp với bộ lọc hiện tại</p>
          <va-button preset="primary" to="/bookings" class="empty-action">
            <va-icon name="add" />
            Đặt lịch khám mới
          </va-button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination-container">
          <va-pagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
        </div>
      </div>

      <va-modal
        v-model="isDetailModalOpen"
        hide-default-actions
        size="large"
        class="appointment-detail-modal"
        @close="closeAppointmentDetail"
      >
        <div v-if="selectedAppointment" class="appointment-detail">
          <div class="detail-sections">
            <!-- Thông tin bác sĩ -->
            <div class="detail-section">
              <h4 class="section-title">
                <va-icon name="person" />
                Thông tin bác sĩ
              </h4>
              <div class="doctor-detail">
                <img
                  :src="selectedAppointment.staff.user.avatar || '/defaultAvatar.png'"
                  :alt="selectedAppointment.staff.user.name"
                  class="doctor-detail-avatar"
                />
                <div class="doctor-detail-info">
                  <h3 class="doctor-name">{{ selectedAppointment.staff.user.name }}</h3>
                  <p class="doctor-department">{{ selectedAppointment.staff.departments.name }}</p>
                  <div class="doctor-rating">
                    <va-icon name="star" />
                    <span
                      >{{ selectedAppointment.staff.rating }}/5 •
                      {{ selectedAppointment.staff.experienceYear }} năm kinh nghiệm</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- Thông tin lịch khám -->
            <div class="detail-section">
              <h4 class="section-title">
                <va-icon name="event" />
                Thông tin lịch khám
              </h4>
              <div class="appointment-detail-info">
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="label">Ngày khám:</span>
                    <span class="value">{{ formatDate(selectedAppointment.date) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Giờ khám:</span>
                    <span class="value">{{ formatTime(selectedAppointment.time) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Loại khám:</span>
                    <span class="value">{{
                      selectedAppointment.services.map((ser) => ser.name).join(', ')
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Trạng thái:</span>
                    <va-badge :color="getStatusColor(selectedAppointment.status)">
                      {{ getStatusText(selectedAppointment.status) }}
                    </va-badge>
                  </div>
                  <div class="detail-item">
                    <span class="label">Chi phí:</span>
                    <span class="value price">{{
                      formatCurrency(selectedAppointment.invoice.totalAmount)
                    }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Thanh toán:</span>
                    <va-badge
                      :color="
                        selectedAppointment.invoice.status === 'PAID'
                          ? 'success'
                          : selectedAppointment.invoice.status === 'UNPAID'
                            ? 'warning'
                            : 'info'
                      "
                    >
                      {{
                        selectedAppointment.invoice.status === 'PAID'
                          ? 'Đã thanh toán'
                          : selectedAppointment.invoice.status === 'UNPAID'
                            ? 'Chưa thanh toán'
                            : 'Đã hoàn tiền'
                      }}
                    </va-badge>
                  </div>
                </div>

                <div class="detail-item full-width">
                  <span class="label">Lý do khám:</span>
                  <span class="value">{{ selectedAppointment.reason }}</span>
                </div>
                <div v-if="selectedAppointment.notes" class="detail-item full-width">
                  <span class="label">Ghi chú:</span>
                  <span class="value">{{ selectedAppointment.notes }}</span>
                </div>
              </div>
            </div>

            <!-- Thông tin hồ sơ bệnh án -->
            <div v-if="selectedAppointment.medicalRecord" class="detail-section">
              <h4 class="section-title">
                <va-icon name="medical_services" />
                Hồ sơ bệnh án
              </h4>
              <va-card>
                <va-card-content>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="label">Chẩn đoán:</span>
                      <span class="value">{{ selectedAppointment.medicalRecord.diagnosis }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="label">Hướng điều trị:</span>
                      <span class="value">{{ selectedAppointment.medicalRecord.treatment }}</span>
                    </div>
                    <div
                      v-if="selectedAppointment.medicalRecord.notes"
                      class="detail-item full-width"
                    >
                      <span class="label">Ghi chú:</span>
                      <span class="value">{{ selectedAppointment.medicalRecord.notes }}</span>
                    </div>
                  </div>

                  <div
                    v-if="selectedAppointment.medicalRecord.prescriptions.length > 0"
                    class="prescription-list"
                  >
                    <h5 class="prescription-title">Đơn thuốc</h5>
                    <va-list>
                      <va-list-item
                        v-for="(prescription, index) in selectedAppointment.medicalRecord
                          .prescriptions"
                        :key="index"
                        class="prescription-item"
                      >
                        <va-list-item-section>
                          <va-list-item-label>
                            {{ prescription.medicationName }}
                          </va-list-item-label>
                          <va-list-item-label caption>
                            Số lượng: {{ prescription.quantity }} | Liều dùng:
                            {{ prescription.dosage }}
                          </va-list-item-label>
                        </va-list-item-section>
                      </va-list-item>
                    </va-list>
                  </div>
                  <div v-else class="no-prescriptions">
                    <va-icon name="info" color="secondary" />
                    <span>Không có đơn thuốc.</span>
                  </div>
                </va-card-content>
              </va-card>
            </div>
          </div>

          <div class="detail-actions">
            <va-button
              v-if="selectedAppointment.status === 'PAYMENT_PENDING'"
              preset="success"
              @click="handlePayment"
            >
              <va-icon name="payment" />
              Thanh toán
            </va-button>
            <va-button preset="secondary" @click="closeAppointmentDetail">
              <va-icon name="close" />
              Đóng
            </va-button>
          </div>
        </div>
      </va-modal>

      <!-- Feedback Modal -->
      <va-modal
        v-model="isFeedbackModalOpen"
        size="small"
        @close="closeFeedbackModal"
        hide-default-actions
      >
        <template #header>
          <h2 class="va-h4 items-center">
            <va-icon name="feedback" class="mr-2" />
            Gửi đánh giá lịch hẹn
          </h2>
        </template>

        <div class="feedback-form">
          <div class="feedback-info">
            <va-icon name="info" color="info" />
            <p>Vui lòng gửi đánh giá và đánh giá của bạn về lịch hẹn này.</p>
          </div>
          <va-rating
            v-model="feedbackData.rating"
            :max="5"
            label="Đánh giá"
            :rules="[(v) => v > 0 || 'Vui lòng chọn số sao đánh giá']"
            required-mark
          />
          <va-textarea
            v-model="feedbackData.feedback"
            placeholder="Vui lòng nhập đánh giá của bạn..."
            rows="4"
            :rules="[(v) => !!v.trim() || 'đánh giá là bắt buộc']"
            required-mark
          />

          <div class="feedback-actions">
            <va-button preset="secondary" @click="closeFeedbackModal">Hủy</va-button>
            <va-button
              preset="primary"
              :disabled="!feedbackData.feedback.trim() || feedbackData.rating === 0"
              @click="submitFeedback"
            >
              Gửi đánh giá
            </va-button>
          </div>
        </div>
      </va-modal>

      <!-- Reschedule Modal -->
      <va-modal v-model="isRescheduleModalOpen" size="medium" @close="closeRescheduleModal">
        <template #header>
          <h2>Đổi lịch khám</h2>
        </template>

        <div class="reschedule-form">
          <div class="form-group">
            <va-input v-model="rescheduleForm.date" type="date" label="Ngày khám mới" required />
          </div>

          <div class="form-group">
            <va-select
              v-model="rescheduleForm.time"
              label="Giờ khám mới"
              :options="availableTimes"
              placeholder="Chọn giờ khám"
              required
            />
          </div>

          <div class="form-group">
            <va-input
              v-model="rescheduleForm.reason"
              type="textarea"
              label="Lý do đổi lịch (tùy chọn)"
              placeholder="Cho biết lý do đổi lịch..."
              rows="3"
            />
          </div>

          <div class="reschedule-actions">
            <va-button preset="secondary" @click="closeRescheduleModal"> Hủy </va-button>
            <va-button
              preset="primary"
              :disabled="!rescheduleForm.date || !rescheduleForm.time"
              @click="rescheduleAppointment"
            >
              Xác nhận đổi lịch
            </va-button>
          </div>
        </div>
      </va-modal>
      <va-modal v-model="isShowDeleteModal" hide-default-actions @close="onCloseModalDelete">
        <DeleteConfirm
          title="Cảnh báo hủy lịch hẹn"
          message="Bạn có chắc chắn muốn hủy lịch hẹn không?"
          @confirm="handleDelete(selectedDelete)"
          @close-confirm="onCloseModalDelete"
        />
      </va-modal>
    </div>
  </va-inner-loading>
</template>
