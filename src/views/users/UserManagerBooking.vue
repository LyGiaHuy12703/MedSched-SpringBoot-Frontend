<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface Doctor {
  id: string
  name: string
  department: string
  avatar: string
  specialization: string
  experience: number
  rating: number
}

interface Booking {
  id: string
  doctor: Doctor
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'
  type: string
  reason: string
  symptoms: string
  notes?: string
  createdAt: string
  updatedAt: string
  canCancel: boolean
  canReschedule: boolean
  price: number
  paymentStatus: 'pending' | 'paid' | 'refunded'
}

const bookings = ref<Booking[]>([
  {
    id: 'BK001',
    doctor: {
      id: 'D001',
      name: 'BS. Nguyễn Thị Hoa',
      department: 'Khoa Tim mạch',
      avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg',
      specialization: 'Bác sĩ chuyên khoa Tim mạch',
      experience: 15,
      rating: 4.8,
    },
    date: '2024-02-15',
    time: '09:00',
    status: 'confirmed',
    type: 'Khám tổng quát',
    reason: 'Khám sức khỏe định kỳ',
    symptoms: 'Đau ngực nhẹ, khó thở khi gắng sức',
    notes: 'Bệnh nhân có tiền sử cao huyết áp',
    createdAt: '2024-02-10T10:30:00Z',
    updatedAt: '2024-02-12T14:20:00Z',
    canCancel: true,
    canReschedule: true,
    price: 500000,
    paymentStatus: 'paid',
  },
  {
    id: 'BK002',
    doctor: {
      id: 'D002',
      name: 'BS. Trần Văn Minh',
      department: 'Khoa Nhi',
      avatar: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg',
      specialization: 'Bác sĩ chuyên khoa Nhi',
      experience: 12,
      rating: 4.9,
    },
    date: '2024-02-20',
    time: '14:30',
    status: 'pending',
    type: 'Khám chuyên khoa',
    reason: 'Khám cho con',
    symptoms: 'Sốt cao, ho kéo dài 3 ngày',
    createdAt: '2024-02-18T08:15:00Z',
    updatedAt: '2024-02-18T08:15:00Z',
    canCancel: true,
    canReschedule: true,
    price: 300000,
    paymentStatus: 'pending',
  },
  {
    id: 'BK003',
    doctor: {
      id: 'D003',
      name: 'BS. Lê Thị Lan',
      department: 'Khoa Da liễu',
      avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
      specialization: 'Bác sĩ chuyên khoa Da liễu',
      experience: 10,
      rating: 4.7,
    },
    date: '2024-01-25',
    time: '11:00',
    status: 'completed',
    type: 'Tái khám',
    reason: 'Kiểm tra sau điều trị',
    symptoms: 'Viêm da cơ địa',
    notes: 'Đã hoàn thành điều trị, tình trạng da cải thiện tốt',
    createdAt: '2024-01-20T16:45:00Z',
    updatedAt: '2024-01-25T12:30:00Z',
    canCancel: false,
    canReschedule: false,
    price: 400000,
    paymentStatus: 'paid',
  },
  {
    id: 'BK004',
    doctor: {
      id: 'D004',
      name: 'BS. Phạm Văn Hùng',
      department: 'Khoa Thần kinh',
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg',
      specialization: 'Bác sĩ chuyên khoa Thần kinh',
      experience: 18,
      rating: 4.6,
    },
    date: '2024-01-15',
    time: '16:00',
    status: 'cancelled',
    type: 'Khám cấp cứu',
    reason: 'Đau đầu dữ dội',
    symptoms: 'Đau đầu, chóng mặt, buồn nôn',
    notes: 'Bệnh nhân hủy lịch vì có việc đột xuất',
    createdAt: '2024-01-10T09:20:00Z',
    updatedAt: '2024-01-14T07:45:00Z',
    canCancel: false,
    canReschedule: false,
    price: 600000,
    paymentStatus: 'refunded',
  },
])

// Filters and search
const searchQuery = ref('')
const filterStatus = ref('')
const filterDoctor = ref('')
const selectedTab = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(6)

// Modal states
const selectedBooking = ref<Booking | null>(null)
const isDetailModalOpen = ref(false)
const isCancelModalOpen = ref(false)
const isRescheduleModalOpen = ref(false)
const isNewBookingModalOpen = ref(false)
const cancelReason = ref('')

// Reschedule form
const rescheduleForm = ref({
  date: '',
  time: '',
  reason: '',
})

// New booking form
const newBookingForm = ref({
  doctorId: '',
  date: '',
  time: '',
  type: '',
  reason: '',
  symptoms: '',
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

const bookingTypes = [
  'Khám tổng quát',
  'Khám chuyên khoa',
  'Tái khám',
  'Khám cấp cứu',
  'Khám định kỳ',
]

// Status options
const statusOptions = [
  { value: 'pending', text: 'Chờ xác nhận', color: 'warning' },
  { value: 'confirmed', text: 'Đã xác nhận', color: 'info' },
  { value: 'completed', text: 'Hoàn thành', color: 'success' },
  { value: 'cancelled', text: 'Đã hủy', color: 'danger' },
  { value: 'rescheduled', text: 'Đã đổi lịch', color: 'secondary' },
]

// Tab options
const tabOptions = [
  { value: 'all', text: 'Tất cả', count: bookings.value.length },
  {
    value: 'upcoming',
    text: 'Sắp tới',
    count: bookings.value.filter((b) => ['pending', 'confirmed'].includes(b.status)).length,
  },
  {
    value: 'completed',
    text: 'Đã hoàn thành',
    count: bookings.value.filter((b) => b.status === 'completed').length,
  },
  {
    value: 'cancelled',
    text: 'Đã hủy',
    count: bookings.value.filter((b) => b.status === 'cancelled').length,
  },
]

// Sample doctors for new booking
const availableDoctors = ref([
  {
    id: 'D001',
    name: 'BS. Nguyễn Thị Hoa',
    department: 'Khoa Tim mạch',
    avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg',
    specialization: 'Bác sĩ chuyên khoa Tim mạch',
    experience: 15,
    rating: 4.8,
  },
  {
    id: 'D002',
    name: 'BS. Trần Văn Minh',
    department: 'Khoa Nhi',
    avatar: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg',
    specialization: 'Bác sĩ chuyên khoa Nhi',
    experience: 12,
    rating: 4.9,
  },
  {
    id: 'D005',
    name: 'BS. Hoàng Thị Mai',
    department: 'Khoa Sản',
    avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg',
    specialization: 'Bác sĩ chuyên khoa Sản',
    experience: 8,
    rating: 4.5,
  },
])

// Computed
const filteredBookings = computed(() => {
  let result = [...bookings.value]

  // Tab filter
  if (selectedTab.value === 'upcoming') {
    result = result.filter((b) => ['pending', 'confirmed'].includes(b.status))
  } else if (selectedTab.value === 'completed') {
    result = result.filter((b) => b.status === 'completed')
  } else if (selectedTab.value === 'cancelled') {
    result = result.filter((b) => b.status === 'cancelled')
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (b) =>
        b.doctor.name.toLowerCase().includes(query) ||
        b.doctor.department.toLowerCase().includes(query) ||
        b.type.toLowerCase().includes(query) ||
        b.reason.toLowerCase().includes(query) ||
        b.id.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (filterStatus.value) {
    result = result.filter((b) => b.status === filterStatus.value)
  }

  // Doctor filter
  if (filterDoctor.value) {
    result = result.filter((b) => b.doctor.id === filterDoctor.value)
  }

  return result.sort(
    (a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime(),
  )
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredBookings.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredBookings.value.length / itemsPerPage.value))

const upcomingBookings = computed(() => {
  return bookings.value
    .filter(
      (b) =>
        ['pending', 'confirmed'].includes(b.status) && new Date(b.date + ' ' + b.time) > new Date(),
    )
    .slice(0, 3)
})

const bookingStats = computed(() => {
  const total = bookings.value.length
  const pending = bookings.value.filter((b) => b.status === 'pending').length
  const confirmed = bookings.value.filter((b) => b.status === 'confirmed').length
  const completed = bookings.value.filter((b) => b.status === 'completed').length
  const cancelled = bookings.value.filter((b) => b.status === 'cancelled').length
  const totalSpent = bookings.value
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.price, 0)

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

const formatTime = (time: string) => {
  return time
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const isUpcoming = (booking: Booking) => {
  return new Date(booking.date + ' ' + booking.time) > new Date()
}

const openBookingDetail = (booking: Booking) => {
  selectedBooking.value = booking
  isDetailModalOpen.value = true
}

const closeBookingDetail = () => {
  isDetailModalOpen.value = false
  selectedBooking.value = null
}

const openCancelModal = (booking: Booking) => {
  selectedBooking.value = booking
  isCancelModalOpen.value = true
  cancelReason.value = ''
}

const closeCancelModal = () => {
  isCancelModalOpen.value = false
  selectedBooking.value = null
  cancelReason.value = ''
}

const openRescheduleModal = (booking: Booking) => {
  selectedBooking.value = booking
  isRescheduleModalOpen.value = true
  rescheduleForm.value = {
    date: booking.date,
    time: booking.time,
    reason: '',
  }
}

const closeRescheduleModal = () => {
  isRescheduleModalOpen.value = false
  selectedBooking.value = null
  rescheduleForm.value = {
    date: '',
    time: '',
    reason: '',
  }
}

const openNewBookingModal = () => {
  isNewBookingModalOpen.value = true
  newBookingForm.value = {
    doctorId: '',
    date: '',
    time: '',
    type: '',
    reason: '',
    symptoms: '',
  }
}

const closeNewBookingModal = () => {
  isNewBookingModalOpen.value = false
  newBookingForm.value = {
    doctorId: '',
    date: '',
    time: '',
    type: '',
    reason: '',
    symptoms: '',
  }
}

const cancelBooking = () => {
  if (selectedBooking.value && cancelReason.value.trim()) {
    const booking = bookings.value.find((b) => b.id === selectedBooking.value!.id)
    if (booking) {
      booking.status = 'cancelled'
      booking.notes = `Lý do hủy: ${cancelReason.value}`
      booking.canCancel = false
      booking.canReschedule = false
      booking.paymentStatus = 'refunded'
      booking.updatedAt = new Date().toISOString()
    }
    closeCancelModal()
  }
}

const rescheduleBooking = () => {
  if (selectedBooking.value && rescheduleForm.value.date && rescheduleForm.value.time) {
    const booking = bookings.value.find((b) => b.id === selectedBooking.value!.id)
    if (booking) {
      booking.date = rescheduleForm.value.date
      booking.time = rescheduleForm.value.time
      booking.status = 'rescheduled'
      if (rescheduleForm.value.reason) {
        booking.notes = `Lý do đổi lịch: ${rescheduleForm.value.reason}`
      }
      booking.updatedAt = new Date().toISOString()
    }
    closeRescheduleModal()
  }
}

const createNewBooking = () => {
  if (newBookingForm.value.doctorId && newBookingForm.value.date && newBookingForm.value.time) {
    const doctor = availableDoctors.value.find((d) => d.id === newBookingForm.value.doctorId)
    if (doctor) {
      const newBooking: Booking = {
        id: `BK${String(bookings.value.length + 1).padStart(3, '0')}`,
        doctor,
        date: newBookingForm.value.date,
        time: newBookingForm.value.time,
        status: 'pending',
        type: newBookingForm.value.type,
        reason: newBookingForm.value.reason,
        symptoms: newBookingForm.value.symptoms,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canCancel: true,
        canReschedule: true,
        price: 500000, // Default price
        paymentStatus: 'pending',
      }
      bookings.value.unshift(newBooking)
    }
    closeNewBookingModal()
  }
}

const getDoctorById = (id: string) => {
  return availableDoctors.value.find((d) => d.id === id)
}

onMounted(() => {
  console.log('Patient booking management loaded')
})
</script>

<template>
  <div class="patient-booking-management">
    <!-- Header Section -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Quản lý lịch khám của tôi</h1>
          <p class="page-subtitle">Theo dõi và quản lý tất cả các lịch khám đã đặt</p>
        </div>
        <va-button preset="primary" icon="add" @click="openNewBookingModal">
          Đặt lịch mới
        </va-button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon total">
          <va-icon name="event" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ bookingStats.total }}</div>
          <div class="stat-label">Tổng lịch khám</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon upcoming">
          <va-icon name="schedule" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ bookingStats.pending + bookingStats.confirmed }}</div>
          <div class="stat-label">Lịch sắp tới</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon completed">
          <va-icon name="check_circle" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ bookingStats.completed }}</div>
          <div class="stat-label">Đã hoàn thành</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon money">
          <va-icon name="attach_money" />
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ formatCurrency(bookingStats.totalSpent) }}</div>
          <div class="stat-label">Tổng chi phí</div>
        </div>
      </div>
    </div>

    <!-- Upcoming Bookings -->
    <div v-if="upcomingBookings.length > 0" class="upcoming-section">
      <h2 class="section-title">Lịch khám sắp tới</h2>
      <div class="upcoming-grid">
        <div v-for="booking in upcomingBookings" :key="booking.id" class="upcoming-card">
          <div class="upcoming-header">
            <va-badge :color="getStatusColor(booking.status)">
              {{ getStatusText(booking.status) }}
            </va-badge>
            <span class="booking-id">#{{ booking.id }}</span>
          </div>

          <div class="upcoming-content">
            <div class="doctor-info">
              <img :src="booking.doctor.avatar" :alt="booking.doctor.name" class="doctor-avatar" />
              <div class="doctor-details">
                <h3 class="doctor-name">{{ booking.doctor.name }}</h3>
                <p class="doctor-department">{{ booking.doctor.department }}</p>
                <div class="doctor-rating">
                  <va-icon name="star" color="warning" size="small" />
                  <span>{{ booking.doctor.rating }}/5</span>
                </div>
              </div>
            </div>

            <div class="booking-time">
              <div class="time-info">
                <va-icon name="event" />
                <span>{{ formatDate(booking.date) }}</span>
              </div>
              <div class="time-info">
                <va-icon name="access_time" />
                <span>{{ formatTime(booking.time) }}</span>
              </div>
            </div>

            <div class="booking-details">
              <div class="detail-item">
                <strong>{{ booking.type }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ booking.reason }}</span>
              </div>
              <div class="detail-item price">
                <span>{{ formatCurrency(booking.price) }}</span>
              </div>
            </div>
          </div>

          <div class="upcoming-actions">
            <va-button preset="primary" size="small" @click="openBookingDetail(booking)">
              Xem chi tiết
            </va-button>
            <va-button
              v-if="booking.canReschedule"
              preset="secondary"
              size="small"
              @click="openRescheduleModal(booking)"
            >
              Đổi lịch
            </va-button>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Tabs -->
    <div class="filters-section">
      <div class="tabs-container">
        <div class="custom-tabs">
          <button
            v-for="tab in tabOptions"
            :key="tab.value"
            class="tab-button"
            :class="{ active: selectedTab === tab.value }"
            @click="selectedTab = tab.value"
          >
            {{ tab.text }}
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>
      </div>

      <div class="filters-controls">
        <va-input
          v-model="searchQuery"
          placeholder="Tìm kiếm theo mã booking, bác sĩ, loại khám..."
          class="search-input"
        >
          <template #prepend>
            <va-icon name="search" />
          </template>
        </va-input>

        <va-select
          v-model="filterStatus"
          placeholder="Lọc theo trạng thái"
          :options="statusOptions"
          text-by="text"
          value-by="value"
          clearable
          class="filter-select"
        />

        <va-select
          v-model="filterDoctor"
          placeholder="Lọc theo bác sĩ"
          :options="availableDoctors"
          text-by="name"
          value-by="id"
          clearable
          class="filter-select"
        />
      </div>
    </div>

    <!-- Bookings List -->
    <div class="bookings-list">
      <div v-for="booking in paginatedBookings" :key="booking.id" class="booking-card">
        <div class="card-header">
          <div class="booking-info">
            <span class="booking-id">#{{ booking.id }}</span>
            <va-badge :color="getStatusColor(booking.status)">
              {{ getStatusText(booking.status) }}
            </va-badge>
            <va-badge
              :color="
                booking.paymentStatus === 'paid'
                  ? 'success'
                  : booking.paymentStatus === 'pending'
                    ? 'warning'
                    : 'info'
              "
              class="payment-badge"
            >
              {{
                booking.paymentStatus === 'paid'
                  ? 'Đã thanh toán'
                  : booking.paymentStatus === 'pending'
                    ? 'Chờ thanh toán'
                    : 'Đã hoàn tiền'
              }}
            </va-badge>
          </div>
          <div class="booking-date">
            {{ formatDate(booking.date) }} • {{ formatTime(booking.time) }}
          </div>
        </div>

        <div class="card-content">
          <div class="doctor-section">
            <img :src="booking.doctor.avatar" :alt="booking.doctor.name" class="doctor-avatar" />
            <div class="doctor-info">
              <h3 class="doctor-name">{{ booking.doctor.name }}</h3>
              <p class="doctor-department">{{ booking.doctor.department }}</p>
              <p class="doctor-specialization">{{ booking.doctor.specialization }}</p>
              <div class="doctor-rating">
                <va-icon name="star" color="warning" size="small" />
                <span
                  >{{ booking.doctor.rating }}/5 • {{ booking.doctor.experience }} năm kinh
                  nghiệm</span
                >
              </div>
            </div>
          </div>

          <div class="booking-details">
            <div class="detail-item">
              <span class="detail-label">Loại khám:</span>
              <span class="detail-value">{{ booking.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Lý do khám:</span>
              <span class="detail-value">{{ booking.reason }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Triệu chứng:</span>
              <span class="detail-value">{{ booking.symptoms }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Chi phí:</span>
              <span class="detail-value price">{{ formatCurrency(booking.price) }}</span>
            </div>
            <div v-if="booking.notes" class="detail-item">
              <span class="detail-label">Ghi chú:</span>
              <span class="detail-value">{{ booking.notes }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <va-button preset="secondary" size="small" @click="openBookingDetail(booking)">
            Xem chi tiết
          </va-button>

          <div v-if="isUpcoming(booking)" class="action-buttons">
            <va-button
              v-if="booking.canReschedule"
              preset="info"
              size="small"
              @click="openRescheduleModal(booking)"
            >
              Đổi lịch
            </va-button>
            <va-button
              v-if="booking.canCancel"
              preset="danger"
              size="small"
              @click="openCancelModal(booking)"
            >
              Hủy lịch
            </va-button>
          </div>

          <div v-if="booking.paymentStatus === 'pending'" class="payment-actions">
            <va-button preset="success" size="small"> Thanh toán </va-button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="paginatedBookings.length === 0" class="empty-state">
        <va-icon name="event_busy" size="large" />
        <h3>Không có lịch khám nào</h3>
        <p>Bạn chưa có lịch khám nào phù hợp với bộ lọc hiện tại</p>
        <va-button preset="primary" @click="openNewBookingModal"> Đặt lịch khám mới </va-button>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination-container">
      <va-pagination v-model="currentPage" :pages="totalPages" :visible-pages="5" />
    </div>

    <!-- Detail Modal -->
    <va-modal v-model="isDetailModalOpen" size="large" @close="closeBookingDetail">
      <template #header>
        <h2>Chi tiết lịch khám</h2>
      </template>

      <div v-if="selectedBooking" class="booking-detail">
        <div class="detail-header">
          <div class="booking-info">
            <h3 class="booking-id">#{{ selectedBooking.id }}</h3>
            <va-badge :color="getStatusColor(selectedBooking.status)" class="status-badge">
              {{ getStatusText(selectedBooking.status) }}
            </va-badge>
            <va-badge
              :color="
                selectedBooking.paymentStatus === 'paid'
                  ? 'success'
                  : selectedBooking.paymentStatus === 'pending'
                    ? 'warning'
                    : 'info'
              "
              class="payment-badge"
            >
              {{
                selectedBooking.paymentStatus === 'paid'
                  ? 'Đã thanh toán'
                  : selectedBooking.paymentStatus === 'pending'
                    ? 'Chờ thanh toán'
                    : 'Đã hoàn tiền'
              }}
            </va-badge>
          </div>
        </div>

        <div class="detail-sections">
          <div class="detail-section">
            <h4 class="section-title">Thông tin bác sĩ</h4>
            <div class="doctor-detail">
              <img
                :src="selectedBooking.doctor.avatar"
                :alt="selectedBooking.doctor.name"
                class="doctor-detail-avatar"
              />
              <div class="doctor-detail-info">
                <h3 class="doctor-name">{{ selectedBooking.doctor.name }}</h3>
                <p class="doctor-department">{{ selectedBooking.doctor.department }}</p>
                <p class="doctor-specialization">{{ selectedBooking.doctor.specialization }}</p>
                <div class="doctor-rating">
                  <va-icon name="star" color="warning" />
                  <span
                    >{{ selectedBooking.doctor.rating }}/5 •
                    {{ selectedBooking.doctor.experience }} năm kinh nghiệm</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">Thông tin lịch khám</h4>
            <div class="booking-detail-info">
              <div class="detail-item">
                <span class="label">Ngày khám:</span>
                <span class="value">{{ formatDate(selectedBooking.date) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Giờ khám:</span>
                <span class="value">{{ formatTime(selectedBooking.time) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Loại khám:</span>
                <span class="value">{{ selectedBooking.type }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Lý do khám:</span>
                <span class="value">{{ selectedBooking.reason }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Triệu chứng:</span>
                <span class="value">{{ selectedBooking.symptoms }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Chi phí:</span>
                <span class="value price">{{ formatCurrency(selectedBooking.price) }}</span>
              </div>
              <div v-if="selectedBooking.notes" class="detail-item">
                <span class="label">Ghi chú:</span>
                <span class="value">{{ selectedBooking.notes }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">Thông tin hệ thống</h4>
            <div class="system-info">
              <div class="detail-item">
                <span class="label">Ngày tạo:</span>
                <span class="value">{{
                  new Date(selectedBooking.createdAt).toLocaleString('vi-VN')
                }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Cập nhật lần cuối:</span>
                <span class="value">{{
                  new Date(selectedBooking.updatedAt).toLocaleString('vi-VN')
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-actions">
          <va-button
            v-if="selectedBooking.canReschedule && isUpcoming(selectedBooking)"
            preset="info"
            @click="openRescheduleModal(selectedBooking)"
          >
            Đổi lịch khám
          </va-button>
          <va-button
            v-if="selectedBooking.canCancel && isUpcoming(selectedBooking)"
            preset="danger"
            @click="openCancelModal(selectedBooking)"
          >
            Hủy lịch khám
          </va-button>
          <va-button v-if="selectedBooking.paymentStatus === 'pending'" preset="success">
            Thanh toán
          </va-button>
          <va-button preset="secondary" @click="closeBookingDetail"> Đóng </va-button>
        </div>
      </div>
    </va-modal>

    <!-- Cancel Modal -->
    <va-modal v-model="isCancelModalOpen" size="small" @close="closeCancelModal">
      <template #header>
        <h2>Hủy lịch khám</h2>
      </template>

      <div class="cancel-form">
        <p class="cancel-warning">
          Bạn có chắc chắn muốn hủy lịch khám này không? Phí khám sẽ được hoàn lại trong vòng 3-5
          ngày làm việc.
        </p>

        <va-input
          v-model="cancelReason"
          type="textarea"
          label="Lý do hủy (bắt buộc)"
          placeholder="Vui lòng cho biết lý do hủy lịch khám..."
          rows="3"
          required
        />

        <div class="cancel-actions">
          <va-button preset="secondary" @click="closeCancelModal"> Không hủy </va-button>
          <va-button preset="danger" :disabled="!cancelReason.trim()" @click="cancelBooking">
            Xác nhận hủy
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
            @click="rescheduleBooking"
          >
            Xác nhận đổi lịch
          </va-button>
        </div>
      </div>
    </va-modal>

    <!-- New Booking Modal -->
    <va-modal v-model="isNewBookingModalOpen" size="large" @close="closeNewBookingModal">
      <template #header>
        <h2>Đặt lịch khám mới</h2>
      </template>

      <div class="new-booking-form">
        <div class="form-row">
          <div class="form-group">
            <va-select
              v-model="newBookingForm.doctorId"
              label="Chọn bác sĩ"
              :options="availableDoctors"
              text-by="name"
              value-by="id"
              placeholder="Chọn bác sĩ"
              required
            >
              <template #option="{ option }">
                <div class="doctor-option">
                  <img :src="option.avatar" :alt="option.name" class="doctor-avatar-small" />
                  <div class="doctor-info">
                    <div class="doctor-name">{{ option.name }}</div>
                    <div class="doctor-department">{{ option.department }}</div>
                    <div class="doctor-rating">
                      <va-icon name="star" color="warning" size="small" />
                      <span>{{ option.rating }}/5</span>
                    </div>
                  </div>
                </div>
              </template>
            </va-select>
          </div>

          <div class="form-group">
            <va-select
              v-model="newBookingForm.type"
              label="Loại khám"
              :options="bookingTypes"
              placeholder="Chọn loại khám"
              required
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <va-input v-model="newBookingForm.date" type="date" label="Ngày khám" required />
          </div>

          <div class="form-group">
            <va-select
              v-model="newBookingForm.time"
              label="Giờ khám"
              :options="availableTimes"
              placeholder="Chọn giờ khám"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <va-input
            v-model="newBookingForm.reason"
            label="Lý do khám"
            placeholder="Nhập lý do khám bệnh..."
            required
          />
        </div>

        <div class="form-group">
          <va-input
            v-model="newBookingForm.symptoms"
            type="textarea"
            label="Triệu chứng"
            placeholder="Mô tả chi tiết các triệu chứng..."
            rows="3"
            required
          />
        </div>

        <div class="new-booking-actions">
          <va-button preset="secondary" @click="closeNewBookingModal"> Hủy </va-button>
          <va-button
            preset="primary"
            :disabled="
              !newBookingForm.doctorId ||
              !newBookingForm.date ||
              !newBookingForm.time ||
              !newBookingForm.type
            "
            @click="createNewBooking"
          >
            Đặt lịch khám
          </va-button>
        </div>
      </div>
    </va-modal>
  </div>
</template>

<style lang="scss" scoped>
.patient-booking-management {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;

  .page-header {
    margin-bottom: 2rem;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-text {
        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: var(--va-text-primary);
          margin: 0 0 0.5rem;
        }

        .page-subtitle {
          color: var(--va-text-secondary);
          font-size: 1rem;
          margin: 0;
        }
      }
    }
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .stat-card {
      background: var(--va-background-element);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid var(--va-border);
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;

        &.total {
          background: linear-gradient(135deg, #5d5fef, #4c4fe8);
        }

        &.upcoming {
          background: linear-gradient(135deg, #ffc107, #ff9800);
        }

        &.completed {
          background: linear-gradient(135deg, #3dc47e, #2eaa6b);
        }

        &.money {
          background: linear-gradient(135deg, #22cce2, #1ba8c4);
        }
      }

      .stat-content {
        .stat-number {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--va-text-primary);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--va-text-secondary);
        }
      }
    }
  }

  .upcoming-section {
    margin-bottom: 2rem;

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--va-text-primary);
    }

    .upcoming-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 1.5rem;

      .upcoming-card {
        background: var(--va-background-element);
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid var(--va-border);
        border-left: 4px solid var(--va-primary);

        .upcoming-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .booking-id {
            font-size: 0.875rem;
            color: var(--va-text-secondary);
            font-weight: 500;
          }
        }

        .upcoming-content {
          margin-bottom: 1.5rem;

          .doctor-info {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;

            .doctor-avatar {
              width: 50px;
              height: 50px;
              border-radius: 50%;
              object-fit: cover;
              margin-right: 1rem;
            }

            .doctor-details {
              .doctor-name {
                font-size: 1.125rem;
                font-weight: 600;
                margin: 0 0 0.25rem;
                color: var(--va-text-primary);
              }

              .doctor-department {
                font-size: 0.875rem;
                color: var(--va-text-secondary);
                margin: 0 0 0.25rem;
              }

              .doctor-rating {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.75rem;
                color: var(--va-text-secondary);
              }
            }
          }

          .booking-time {
            margin-bottom: 1rem;

            .time-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-bottom: 0.5rem;
              font-size: 0.875rem;
              color: var(--va-text-secondary);

              .va-icon {
                font-size: 1rem;
              }
            }
          }

          .booking-details {
            .detail-item {
              margin-bottom: 0.5rem;

              &.price {
                font-weight: 600;
                color: var(--va-primary);
              }

              strong {
                color: var(--va-text-primary);
                font-size: 1rem;
              }

              span {
                font-size: 0.875rem;
                color: var(--va-text-secondary);
              }
            }
          }
        }

        .upcoming-actions {
          display: flex;
          gap: 0.75rem;
        }
      }
    }
  }

  .filters-section {
    margin-bottom: 2rem;

    .tabs-container {
      margin-bottom: 1.5rem;

      .custom-tabs {
        display: flex;
        gap: 0.5rem;
        border-bottom: 1px solid var(--va-border);

        .tab-button {
          background: none;
          border: none;
          padding: 0.75rem 1rem;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: var(--va-text-secondary);

          &:hover {
            color: var(--va-primary);
          }

          &.active {
            color: var(--va-primary);
            border-bottom-color: var(--va-primary);
          }

          .tab-count {
            background: var(--va-background);
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 500;
          }
        }
      }
    }

    .filters-controls {
      display: flex;
      gap: 1rem;

      .search-input {
        flex: 1;
        max-width: 400px;
      }

      .filter-select {
        width: 200px;
      }
    }
  }

  .bookings-list {
    .booking-card {
      background: var(--va-background-element);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      border: 1px solid var(--va-border);
      transition:
        transform 0.2s ease,
        box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        .booking-info {
          display: flex;
          align-items: center;
          gap: 1rem;

          .booking-id {
            font-weight: 600;
            color: var(--va-primary);
          }

          .payment-badge {
            font-size: 0.75rem;
          }
        }

        .booking-date {
          font-size: 0.875rem;
          color: var(--va-text-secondary);
          font-weight: 500;
        }
      }

      .card-content {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;

        .doctor-section {
          display: flex;
          align-items: center;

          .doctor-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 1rem;
          }

          .doctor-info {
            .doctor-name {
              font-size: 1.125rem;
              font-weight: 600;
              margin: 0 0 0.25rem;
              color: var(--va-text-primary);
            }

            .doctor-department {
              font-size: 0.875rem;
              color: var(--va-text-secondary);
              margin: 0 0 0.25rem;
            }

            .doctor-specialization {
              font-size: 0.75rem;
              color: var(--va-text-secondary);
              margin: 0 0 0.25rem;
            }

            .doctor-rating {
              display: flex;
              align-items: center;
              gap: 0.25rem;
              font-size: 0.75rem;
              color: var(--va-text-secondary);
            }
          }
        }

        .booking-details {
          .detail-item {
            display: flex;
            margin-bottom: 0.5rem;

            .detail-label {
              font-weight: 500;
              color: var(--va-text-secondary);
              width: 120px;
              flex-shrink: 0;
            }

            .detail-value {
              color: var(--va-text-primary);

              &.price {
                font-weight: 600;
                color: var(--va-primary);
              }
            }
          }
        }
      }

      .card-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .action-buttons,
        .payment-actions {
          display: flex;
          gap: 0.75rem;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--va-text-secondary);

      .va-icon {
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      h3 {
        margin: 0 0 0.5rem;
        font-size: 1.25rem;
        color: var(--va-text-primary);
      }

      p {
        margin: 0 0 1.5rem;
        font-size: 0.875rem;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 2rem;
  }

  .booking-detail {
    .detail-header {
      margin-bottom: 2rem;

      .booking-info {
        display: flex;
        align-items: center;
        gap: 1rem;

        .booking-id {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--va-primary);
        }

        .payment-badge {
          font-size: 0.875rem;
        }
      }
    }

    .detail-sections {
      .detail-section {
        margin-bottom: 2rem;

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 1rem;
          color: var(--va-text-primary);
          border-bottom: 1px solid var(--va-border);
          padding-bottom: 0.5rem;
        }

        .doctor-detail {
          display: flex;
          align-items: center;
          gap: 1rem;

          .doctor-detail-avatar {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
          }

          .doctor-detail-info {
            .doctor-name {
              font-size: 1.25rem;
              font-weight: 600;
              margin: 0 0 0.25rem;
              color: var(--va-text-primary);
            }

            .doctor-department {
              font-size: 1rem;
              color: var(--va-text-secondary);
              margin: 0 0 0.25rem;
            }

            .doctor-specialization {
              font-size: 0.875rem;
              color: var(--va-text-secondary);
              margin: 0 0 0.5rem;
            }

            .doctor-rating {
              display: flex;
              align-items: center;
              gap: 0.25rem;
              font-size: 0.875rem;
              color: var(--va-text-secondary);
            }
          }
        }

        .booking-detail-info,
        .system-info {
          .detail-item {
            display: flex;
            margin-bottom: 0.75rem;

            .label {
              font-weight: 500;
              color: var(--va-text-secondary);
              width: 150px;
              flex-shrink: 0;
            }

            .value {
              color: var(--va-text-primary);

              &.price {
                font-weight: 600;
                color: var(--va-primary);
              }
            }
          }
        }
      }
    }

    .detail-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--va-border);
    }
  }

  .cancel-form {
    .cancel-warning {
      margin-bottom: 1.5rem;
      color: var(--va-text-primary);
      font-size: 1rem;
    }

    .cancel-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  }

  .reschedule-form,
  .new-booking-form {
    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;

      .form-group {
        flex: 1;
        margin-bottom: 0;
      }
    }

    .doctor-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .doctor-avatar-small {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
      }

      .doctor-info {
        .doctor-name {
          font-weight: 500;
          margin-bottom: 0.25rem;
        }

        .doctor-department {
          font-size: 0.875rem;
          color: var(--va-text-secondary);
          margin-bottom: 0.25rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--va-text-secondary);
        }
      }
    }

    .reschedule-actions,
    .new-booking-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
    }
  }
}

@media (max-width: 1200px) {
  .patient-booking-management {
    .upcoming-grid {
      grid-template-columns: 1fr;
    }

    .booking-card .card-content {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .patient-booking-management {
    padding: 1rem;

    .page-header .header-content {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .filters-controls {
      flex-direction: column;

      .search-input {
        max-width: none;
      }

      .filter-select {
        width: 100%;
      }
    }

    .custom-tabs {
      flex-wrap: wrap;
    }

    .booking-card {
      .card-actions {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;

        .action-buttons,
        .payment-actions {
          justify-content: center;
        }
      }
    }

    .detail-actions {
      flex-direction: column;
    }

    .cancel-actions,
    .reschedule-actions,
    .new-booking-actions {
      flex-direction: column;
    }

    .form-row {
      flex-direction: column;
    }
  }
}

@media (max-width: 480px) {
  .patient-booking-management {
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
