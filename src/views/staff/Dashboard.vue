<template>
  <va-card class="staff-dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1>{{ greeting }}, {{ user?.name }}!</h1>
          <p>
            Đây là không gian làm việc của bạn với vai trò
            <strong>{{ userRoleText }}</strong>
          </p>
        </div>
        <div v-if="isDoctor || isPharmacist || isSupporter" class="schedule-status-wrapper">
          <va-inner-loading :loading="loadingStats" class="schedule-status-loader">
            <router-link to="/staff/my-schedules" class="schedule-status-link">
              <div class="schedule-status" :class="scheduleStatusClass">
                <va-icon :name="scheduleStatusIcon" class="status-icon" />
                <span class="status-text">{{ scheduleStatusText }}</span>
              </div>
            </router-link>
          </va-inner-loading>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- DOCTOR VIEW -->
      <div v-if="isDoctor" class="doctor-view">
        <div class="main-panel">
          <h2 class="section-title">Tổng Quan Lịch Hẹn</h2>
          <div class="stats-grid-doctor">
            <div class="stat-card gradient-blue">
              <va-icon name="event_note" />
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(appointmentStats.total) }}</span>
                <span class="stat-label">Tổng Lịch Hẹn</span>
              </div>
            </div>
            <div class="stat-card gradient-green">
              <va-icon name="check_circle" />
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(appointmentStats.completed) }}</span>
                <span class="stat-label">Đã Hoàn Thành</span>
              </div>
            </div>
            <div class="stat-card gradient-orange">
              <va-icon name="pending_actions" />
              <div class="stat-info">
                <span class="stat-value">{{ formatNumber(appointmentStats.confirmed) }}</span>
                <span class="stat-label">Sắp Tới</span>
              </div>
            </div>
          </div>
          <div class="chart-wrapper">
            <h3>Phân Bố Trạng Thái Lịch Hẹn</h3>
            <Doughnut v-if="chartLoaded" :data="appointmentDoughnutData" :options="chartOptions" />
          </div>
        </div>

        <div class="side-panel">
          <h2 class="section-title">Lịch Hẹn Sắp Tới</h2>
          <div class="upcoming-appointments">
            <div v-if="upcomingAppointments.length > 0">
              <router-link
                v-for="app in upcomingAppointments"
                :key="app.id"
                :to="`/staff/appointments/${app.id}`"
                class="appointment-item"
                :class="getAppointmentUrgencyClass(app)"
              >
                <div class="appointment-date-time">
                  <span class="date">{{ formatDate(app.date, 'short') }}</span>
                  <span class="time">{{ formatTime(app.time) }}</span>
                </div>
                <div class="appointment-details">
                  <div class="patient-name">{{ app.name }}</div>
                  <div class="appointment-reason">{{ app.reason }}</div>
                </div>
                <va-icon name="chevron_right" class="arrow-icon" />
              </router-link>
            </div>
            <div v-else class="no-appointments">
              <va-icon name="event_available" />
              <p>Không có lịch hẹn nào sắp tới.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PHARMACIST VIEW -->
      <div v-if="isPharmacist" class="pharmacist-view">
        <h2 class="section-title">Quản Lý Dược Phẩm</h2>
        <div class="stats-grid">
          <div class="stat-card-simple">
            <va-icon name="medication" class="stat-icon-simple" />
            <div class="stat-info-simple">
              <span class="stat-label-simple">Tổng số thuốc</span>
              <span class="stat-value-simple">{{ formatNumber(stats.medicines) }}</span>
            </div>
          </div>
          <div class="stat-card-simple">
            <va-icon name="receipt_long" class="stat-icon-simple" />
            <div class="stat-info-simple">
              <span class="stat-label-simple">Đơn thuốc đã xử lý</span>
              <span class="stat-value-simple">{{ formatNumber(stats.prescriptions) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- SUPPORTER VIEW -->
      <div v-if="isSupporter" class="supporter-view">
        <h2 class="section-title">Tổng Quan Hệ Thống</h2>
        <div class="stats-grid">
          <div class="stat-card-simple">
            <va-icon name="event_note" class="stat-icon-simple" />
            <div class="stat-info-simple">
              <span class="stat-label-simple">Tổng lịch hẹn</span>
              <span class="stat-value-simple">{{ formatNumber(appointmentStats.total) }}</span>
            </div>
          </div>
          <div class="stat-card-simple">
            <va-icon name="receipt" class="stat-icon-simple" />
            <div class="stat-info-simple">
              <span class="stat-label-simple">Tổng hóa đơn</span>
              <span class="stat-value-simple">{{ formatNumber(invoiceStats.total) }}</span>
            </div>
          </div>
          <div class="stat-card-simple">
            <va-icon name="payments" class="stat-icon-simple" />
            <div class="stat-info-simple">
              <span class="stat-label-simple">Tổng doanh thu</span>
              <span class="stat-value-simple">{{ formatCurrency(totalRevenue) }}</span>
            </div>
          </div>
        </div>
        <div class="charts-container">
          <div class="chart-wrapper">
            <h3>Doanh Thu 6 Tháng Gần Nhất</h3>
            <Bar v-if="chartLoaded" :data="barChartData" :options="barChartOptions" />
          </div>
          <div class="chart-wrapper">
            <h3>Phân Bổ Trạng Thái Hóa Đơn</h3>
            <Doughnut v-if="chartLoaded" :data="invoiceDoughnutData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </va-card>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
} from 'chart.js'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useInvoiceStore } from '@/stores/invoice.store'
import { useMedicineStore } from '@/stores/medicine.store'
import type { Appointment } from '@/interfaces/appointment.interfaces'

// --- SETUP ---
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)
const authStore = useAuthStore()
const scheduleStore = useScheduleStore()
const appointmentStore = useAppointmentStore()
const invoiceStore = useInvoiceStore()
const medicineStore = useMedicineStore()

// --- STATE ---
const { assignments } = storeToRefs(scheduleStore)
const loadingStats = ref(true)
const chartLoaded = ref(false)
const stats = ref({ medicines: 0, prescriptions: 0 })
const appointmentStats = ref({
  total: 0,
  pending_payment: 0,
  confirmed: 0,
  cancelled: 0,
  completed: 0,
})
const invoiceStats = ref({ total: 0, paid: 0, unpaid: 0 })
const totalRevenue = ref(0)

// --- COMPUTED PROPERTIES ---
const user = computed(() => authStore.getAuth?.user)
const userRole = computed(() => user.value?.role[0]?.name || 'Unknown')
const isDoctor = computed(() => userRole.value === 'DOCTOR')
const isPharmacist = computed(() => userRole.value === 'PHARMACIST')
const isSupporter = computed(() => userRole.value === 'SUPPORTER')

const userRoleText = computed(() => {
  if (isDoctor.value) return 'Bác sĩ'
  if (isPharmacist.value) return 'Dược sĩ'
  if (isSupporter.value) return 'Hỗ trợ viên'
  return 'Nhân viên'
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Chào buổi sáng'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
})

// ====================================================================
// LOGIC LỊCH TRỰC
// ====================================================================

const parseDateTime = (timeString: string, dayWork: string): Date => {
  return new Date(`${dayWork}T${timeString}`)
}

const currentScheduleStatus = computed(() => {
  if (!assignments.value?.length) {
    return { text: 'Không có lịch trực', icon: 'highlight_off', class: 'status--inactive' }
  }

  const now = new Date()
  let nextUpcomingShift = null

  for (const assignment of assignments.value) {
    const startTime = parseDateTime(
      assignment.doctorShift.startTime,
      assignment.doctorShift.dayWork,
    )
    const endTime = parseDateTime(assignment.doctorShift.endTime, assignment.doctorShift.dayWork)

    if (assignment.status === 'IN_PROGRESS' && startTime <= now && now <= endTime) {
      return { text: 'Đang trong ca trực', icon: 'check_circle', class: 'status--active' }
    }

    if (assignment.status === 'APPROVED' && startTime > now) {
      if (!nextUpcomingShift || startTime < nextUpcomingShift.startTime) {
        nextUpcomingShift = {
          startTime,
          timeLabel: assignment.doctorShift.startTime.substring(0, 5),
          dayLabel: new Date(assignment.doctorShift.dayWork).toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
          }),
        }
      }
    }
  }

  if (nextUpcomingShift) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const shiftDay = new Date(nextUpcomingShift.startTime)
    shiftDay.setHours(0, 0, 0, 0)
    const dayText =
      today.getTime() === shiftDay.getTime() ? 'hôm nay' : `vào ${nextUpcomingShift.dayLabel}`
    return {
      text: `Ca tiếp theo: ${nextUpcomingShift.timeLabel} ${dayText}`,
      icon: 'update',
      class: 'status--upcoming',
    }
  }

  return { text: 'Không có lịch trực', icon: 'highlight_off', class: 'status--inactive' }
})

const scheduleStatusText = computed(() => currentScheduleStatus.value.text)
const scheduleStatusIcon = computed(() => currentScheduleStatus.value.icon)
const scheduleStatusClass = computed(() => currentScheduleStatus.value.class)

// ====================================================================

const upcomingAppointments = computed(() => {
  if (!appointmentStore.appointments) return []
  const now = new Date()
  return appointmentStore.appointments
    .filter((app) => app.status === 'CONFIRMED' && new Date(`${app.date}T${app.time}`) > now)
    .sort(
      (a, b) =>
        new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
    )
    .slice(0, 5)
})

// --- CHART DATA & OPTIONS ---
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}
const barChartOptions = {
  ...chartOptions,
  scales: { y: { beginAtZero: true, ticks: { callback: (value: any) => `${value}tr` } } },
}

const barChartData = computed(() => {
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' })
  }).reverse()
  const data = Array(6).fill(0)
  invoiceStore.invoices.forEach((invoice) => {
    if (invoice.status === 'PAID') {
      const invoiceDate = new Date(invoice.invoiceDate)
      const monthYear = invoiceDate.toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' })
      const index = labels.indexOf(monthYear)
      if (index > -1) data[index] += invoice.totalAmount / 1_000_000
    }
  })
  return {
    labels,
    datasets: [
      {
        label: 'Doanh thu (triệu VNĐ)',
        backgroundColor: 'rgba(67, 97, 238, 0.8)',
        borderRadius: 6,
        data,
      },
    ],
  }
})

const appointmentDoughnutData = computed(() => ({
  labels: ['Hoàn thành', 'Sắp tới', 'Chờ thanh toán', 'Đã hủy'],
  datasets: [
    {
      backgroundColor: ['#28a745', '#007bff', '#ffc107', '#6c757d'],
      data: [
        appointmentStats.value.completed,
        appointmentStats.value.confirmed,
        appointmentStats.value.pending_payment,
        appointmentStats.value.cancelled,
      ],
    },
  ],
}))

const invoiceDoughnutData = computed(() => ({
  labels: ['Đã thanh toán', 'Chưa thanh toán'],
  datasets: [
    {
      backgroundColor: ['#28a745', '#ffc107'],
      data: [invoiceStats.value.paid, invoiceStats.value.unpaid],
    },
  ],
}))

// --- HELPER FUNCTIONS ---
const formatNumber = (num: number) => num?.toLocaleString('vi-VN') || '0'
const formatCurrency = (num: number) =>
  num?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) || '0 đ'
const formatTime = (time: string) => time.substring(0, 5)
const formatDate = (dateStr: string, format: 'short' | 'long' = 'long') => {
  const date = new Date(dateStr)
  return format === 'short'
    ? date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    : date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })
}
const getAppointmentUrgencyClass = (app: Appointment) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const appointmentDate = new Date(app.date)
  appointmentDate.setHours(0, 0, 0, 0)
  const diffTime = appointmentDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'urgent'
  if (diffDays === 1) return 'soon'
  return 'normal'
}

// --- DATA FETCHING ---
const fetchData = async () => {
  loadingStats.value = true
  const promises = []

  if (isDoctor.value || isPharmacist.value || isSupporter.value) {
    // Gọi API assignments mới và hiệu quả hơn
    promises.push(scheduleStore.fetchAssignments({ page: 0, size: 100 }))
  }

  if (isDoctor.value) promises.push(appointmentStore.fetchAppointmentsByDoctor(0, 100))
  if (isPharmacist.value) promises.push(medicineStore.fetchMedicines(0, 100))
  if (isSupporter.value)
    promises.push(
      appointmentStore.fetchAllAppointments(0, 10000),
      invoiceStore.fetchInvoicesByPatient(0, 10000),
    )

  await Promise.all(promises)

  // --- PROCESS DATA ---
  if (isDoctor.value || isSupporter.value) {
    const apps = appointmentStore.appointments
    appointmentStats.value = {
      total: apps.length,
      pending_payment: apps.filter(
        (a) => a.status === 'PENDING_PAYMENT' || a.status === 'PAYMENT_FAILED',
      ).length,
      confirmed: apps.filter((a) => a.status === 'CONFIRMED').length,
      cancelled: apps.filter((a) => a.status === 'CANCELLED').length,
      completed: apps.filter((a) => a.status === 'COMPLETED').length,
    }
  }
  if (isPharmacist.value) {
    stats.value.medicines = medicineStore.medicines.length
  }
  if (isSupporter.value) {
    const invs = invoiceStore.invoices
    invoiceStats.value = {
      total: invs.length,
      paid: invs.filter((i) => i.status === 'PAID').length,
      unpaid: invs.filter((i) => i.status === 'UNPAID').length,
    }
    totalRevenue.value = invs
      .filter((i) => i.status === 'PAID')
      .reduce((sum, inv) => sum + inv.totalAmount, 0)
  }

  loadingStats.value = false
  chartLoaded.value = true
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
// --- GLOBAL STYLING ---
.staff-dashboard {
  background-color: #f4f7fe;
  padding: 2rem;
  font-family: 'Be Vietnam Pro', sans-serif;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #344767;
  margin-bottom: 1.5rem;
}

.chart-wrapper {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 400px;
  h3 {
    margin-top: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
}

// --- HEADER ---
.dashboard-header {
  margin-bottom: 2rem;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-text {
  h1 {
    font-size: 2rem;
    font-weight: 700;
    color: #344767;
    margin: 0;
  }
  p {
    color: #67748e;
    margin: 0.25rem 0 0;
  }
}
.schedule-status-wrapper {
  min-width: 200px;
}
.schedule-status-link {
  text-decoration: none;
}
.schedule-status {
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  transition: all 0.3s ease;
  .status-icon {
    margin-right: 0.75rem;
    font-size: 1.25rem;
  }
  .status-text {
    font-weight: 600;
  }
  &.status--active {
    background-color: #e8f5e9;
    color: #388e3c;
    &:hover {
      background-color: #dceddc;
      transform: translateY(-2px);
    }
  }
  &.status--inactive {
    background-color: #fbe9e7;
    color: #d32f2f;
    &:hover {
      background-color: #f8deda;
      transform: translateY(-2px);
    }
  }
  &.status--upcoming {
    background-color: #fff3e0;
    color: #ef6c00;
    &:hover {
      background-color: #ffeccb;
      transform: translateY(-2px);
    }
  }
}

// --- MAIN CONTENT ---
.dashboard-content {
  margin-top: 2rem;
}

// --- DOCTOR VIEW ---
.doctor-view {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.stats-grid-doctor {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  .va-icon {
    font-size: 2.5rem;
    opacity: 0.8;
  }
  .stat-info {
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      display: block;
    }
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
}

.gradient-blue {
  background: linear-gradient(135deg, #4361ee, #4895ef);
}
.gradient-green {
  background: linear-gradient(135deg, #40916c, #52b788);
}
.gradient-orange {
  background: linear-gradient(135deg, #f77f00, #fcbf49);
}

.side-panel .upcoming-appointments {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: calc(100% - 3.5rem);
}
.appointment-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.75rem;
  margin-bottom: 0.75rem;
  transition: all 0.2s ease;
  text-decoration: none;
  color: inherit;
  border-left: 5px solid transparent;

  &:hover {
    background-color: #f4f7fe;
    transform: translateX(5px);
  }

  &.urgent {
    border-left-color: #d32f2f;
    background-color: rgba(211, 47, 47, 0.05);
  }
  &.soon {
    border-left-color: #f77f00;
    background-color: rgba(247, 127, 0, 0.05);
  }
  &.normal {
    border-left-color: #4361ee;
  }

  .appointment-date-time {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-right: 1rem;
    padding-right: 1rem;
    border-right: 1px solid #e0e0e0;
    min-width: 60px;
    .date {
      font-size: 0.9rem;
      font-weight: 600;
      color: #344767;
    }
    .time {
      font-size: 1rem;
      font-weight: 700;
      color: #4361ee;
    }
  }
  .appointment-details {
    flex-grow: 1;
    .patient-name {
      font-weight: 600;
      color: #344767;
    }
    .appointment-reason {
      font-size: 0.85rem;
      color: #67748e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 180px;
    }
  }
  .arrow-icon {
    margin-left: auto;
    color: #b0bec5;
    transition: color 0.2s ease;
  }
  &:hover .arrow-icon {
    color: #4361ee;
  }
}
.no-appointments {
  text-align: center;
  padding: 3rem 1rem;
  color: #67748e;
  .va-icon {
    font-size: 3rem;
    opacity: 0.5;
    margin-bottom: 1rem;
  }
}

// --- PHARMACIST & SUPPORTER VIEW ---
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card-simple {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  .stat-icon-simple {
    font-size: 2rem;
    color: #4361ee;
  }
  .stat-info-simple {
    .stat-label-simple {
      font-size: 0.9rem;
      color: #67748e;
      display: block;
    }
    .stat-value-simple {
      font-size: 1.5rem;
      font-weight: 700;
      color: #344767;
    }
  }
}

.charts-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

// --- RESPONSIVE ---
@media (max-width: 1200px) {
  .doctor-view {
    grid-template-columns: 1fr;
  }
  .side-panel .upcoming-appointments {
    height: auto;
  }
}
@media (max-width: 992px) {
  .charts-container {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .schedule-status-wrapper {
    align-self: stretch;
  }
}
</style>
