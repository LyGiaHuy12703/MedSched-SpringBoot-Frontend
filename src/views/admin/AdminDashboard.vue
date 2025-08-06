<template>
  <va-card class="admin-dashboard">
    <va-card-content>
      <header class="dashboard-header">
        <div class="header-text">
          <h1 class="va-h2">Dashboard Quản Trị</h1>
          <p class="va-text-secondary">Tổng quan hoạt động và hiệu suất của toàn hệ thống.</p>
        </div>
      </header>

      <!-- Thống kê chính -->
      <div class="main-stats-grid">
        <router-link to="/admin/users" class="stat-card gradient-blue">
          <div class="stat-content">
            <va-icon name="group" class="stat-icon" />
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(stats.patients) }}</span>
              <span class="stat-label">Bệnh Nhân</span>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/staff" class="stat-card gradient-green">
          <div class="stat-content">
            <va-icon name="badge" class="stat-icon" />
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(stats.staff) }}</span>
              <span class="stat-label">Nhân Viên</span>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/invoices" class="stat-card gradient-orange">
          <div class="stat-content">
            <va-icon name="payments" class="stat-icon" />
            <div class="stat-info">
              <span class="stat-value">{{ formatCurrency(totalRevenue) }}</span>
              <span class="stat-label">Tổng Doanh Thu</span>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/appointments" class="stat-card gradient-purple">
          <div class="stat-content">
            <va-icon name="event_available" class="stat-icon" />
            <div class="stat-info">
              <span class="stat-value">{{ formatNumber(appointmentStats.confirmed) }}</span>
              <span class="stat-label">Lịch Hẹn Sắp Tới</span>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Biểu đồ -->
      <div class="charts-section">
        <div class="chart-wrapper large">
          <h3 class="chart-title">Doanh Thu 6 Tháng Gần Nhất</h3>
          <Bar v-if="chartLoaded" :data="barChartData" :options="barChartOptions" />
        </div>
        <div class="chart-wrapper small">
          <h3 class="chart-title">Trạng Thái Lịch Hẹn</h3>
          <Doughnut
            v-if="chartLoaded"
            :data="appointmentDoughnutData"
            :options="doughnutChartOptions"
          />
        </div>
      </div>

      <!-- Thống kê phụ -->
      <div class="secondary-stats-grid">
        <router-link to="/admin/departments" class="stat-card-secondary">
          <va-icon name="business" class="stat-icon-secondary" />
          <div class="stat-info-secondary">
            <span class="stat-label-secondary">Số Khoa/Phòng</span>
            <span class="stat-value-secondary">{{ formatNumber(stats.departments) }}</span>
          </div>
        </router-link>
        <router-link to="/admin/medicines" class="stat-card-secondary">
          <va-icon name="medication" class="stat-icon-secondary" />
          <div class="stat-info-secondary">
            <span class="stat-label-secondary">Danh Mục Thuốc</span>
            <span class="stat-value-secondary">{{ formatNumber(stats.medicines) }}</span>
          </div>
        </router-link>
        <router-link to="/admin/services" class="stat-card-secondary">
          <va-icon name="medical_services" class="stat-icon-secondary" />
          <div class="stat-info-secondary">
            <span class="stat-label-secondary">Dịch Vụ Y Tế</span>
            <span class="stat-value-secondary">{{ formatNumber(stats.services) }}</span>
          </div>
        </router-link>
        <router-link to="/admin/roles" class="stat-card-secondary">
          <va-icon name="manage_accounts" class="stat-icon-secondary" />
          <div class="stat-info-secondary">
            <span class="stat-label-secondary">Số Lượng Vai Trò</span>
            <span class="stat-value-secondary">{{ formatNumber(stats.roles) }}</span>
          </div>
        </router-link>
      </div>
    </va-card-content>
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
import { useDepartmentStore } from '@/stores/department.store'
import { useStaffStore } from '@/stores/staff.store'
import { useUserStore } from '@/stores/users.store'
import { useMedicineStore } from '@/stores/medicine.store'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useRoleStore } from '@/stores/role.store'
import { useServiceStore } from '@/stores/service.store'
import { useInvoiceStore } from '@/stores/invoice.store'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)

// --- KHỞI TẠO STORE ---
const departmentStore = useDepartmentStore()
const staffStore = useStaffStore()
const userStore = useUserStore()
const medicineStore = useMedicineStore()
const appointmentStore = useAppointmentStore()
const roleStore = useRoleStore()
const serviceStore = useServiceStore()
const invoiceStore = useInvoiceStore()

// --- LẤY STATE REACTIVE TỪ STORE ---
const { departments } = storeToRefs(departmentStore)
const { staffs } = storeToRefs(staffStore)
const { users } = storeToRefs(userStore)
const { medicines } = storeToRefs(medicineStore)
const { appointments } = storeToRefs(appointmentStore)
const { roles } = storeToRefs(roleStore)
const { services } = storeToRefs(serviceStore)
const { invoices } = storeToRefs(invoiceStore)

// --- STATE CỦA COMPONENT ---
const loadingStats = ref(true)
const chartLoaded = ref(false)

// --- COMPUTED PROPERTIES ---
const stats = computed(() => ({
  patients: users.value.filter(
    (u) => u.role && Array.isArray(u.role) && u.role.some((r) => r.name === 'PATIENT'),
  ).length,
  staff: staffs.value.length,
  departments: departments.value.length,
  medicines: medicines.value.length,
  roles: roles.value.length,
  services: services.value.length,
}))

const appointmentStats = computed(() => ({
  total: appointments.value.length,
  pending_payment: appointments.value.filter(
    (a) => a.status === 'PENDING_PAYMENT' || a.status === 'PAYMENT_FAILED',
  ).length,
  confirmed: appointments.value.filter((a) => a.status === 'CONFIRMED').length,
  cancelled: appointments.value.filter((a) => a.status === 'CANCELLED').length,
  completed: appointments.value.filter((a) => a.status === 'COMPLETED').length,
}))

const totalRevenue = computed(() => {
  return invoices.value
    .filter((i) => i.status === 'PAID')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0)
})

// --- CHART OPTIONS ---
const barChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { callback: (value: any) => `${value / 1000000}tr` },
    },
    x: { grid: { display: false } },
  },
}

const doughnutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const } },
}

// --- CHART DATA ---
const barChartData = computed(() => {
  const labels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return d.toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' })
  }).reverse()
  const data = Array(6).fill(0)
  invoices.value.forEach((invoice) => {
    if (invoice.status === 'PAID') {
      const invoiceDate = new Date(invoice.invoiceDate)
      const monthYear = invoiceDate.toLocaleString('vi-VN', { month: '2-digit', year: 'numeric' })
      const index = labels.indexOf(monthYear)
      if (index > -1) data[index] += invoice.totalAmount
    }
  })
  return {
    labels,
    datasets: [
      {
        label: 'Doanh thu (VNĐ)',
        backgroundColor: 'rgba(67, 97, 238, 0.8)',
        borderColor: 'rgba(67, 97, 238, 1)',
        borderRadius: 6,
        data,
      },
    ],
  }
})

// *** PHẦN BỔ SUNG LẠI ***
const appointmentDoughnutData = computed(() => ({
  labels: ['Hoàn thành', 'Sắp tới', 'Chờ thanh toán', 'Đã hủy'],
  datasets: [
    {
      backgroundColor: ['#40916c', '#4895ef', '#f77f00', '#6c757d'],
      borderColor: '#fff',
      borderWidth: 2,
      data: [
        appointmentStats.value.completed,
        appointmentStats.value.confirmed,
        appointmentStats.value.pending_payment,
        appointmentStats.value.cancelled,
      ],
    },
  ],
}))
// *** KẾT THÚC PHẦN BỔ SUNG ***

// --- HELPER FUNCTIONS ---
const formatNumber = (num: number) => (num != null ? num.toLocaleString('vi-VN') : '0')
const formatCurrency = (num: number) =>
  num != null ? num.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : '0 đ'

// --- DATA FETCHING ---
const fetchData = async () => {
  loadingStats.value = true
  chartLoaded.value = false
  try {
    await Promise.all([
      departmentStore.fetchDepartments(0, 1000),
      staffStore.fetchAllStaffs(0, 1000),
      userStore.fetchUsers(0, 1000),
      medicineStore.fetchMedicines(0, 1000),
      appointmentStore.fetchAllAppointments(0, 10000),
      roleStore.fetchAllRoles(0, 1000),
      serviceStore.fetchServices(0, 1000),
      invoiceStore.fetchInvoicesByPatient(0, 10000),
    ])
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu dashboard:', error)
  } finally {
    loadingStats.value = false
    chartLoaded.value = true
  }
}

onMounted(fetchData)
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');

.admin-dashboard {
  background-color: #f8f9fa;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding: 2rem;
}

.dashboard-header {
  margin-bottom: 2rem;
  .va-h2 {
    font-weight: 700;
    color: #1b254b;
  }
  .va-text-secondary {
    color: #6c757d;
  }
}

.main-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.stat-card {
  color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    transition: transform 0.5s ease;
    transform: scale(0);
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    &::before {
      transform: scale(1);
    }
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .stat-icon {
    font-size: 2.5rem;
    opacity: 0.8;
  }

  .stat-info {
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
      display: block;
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
}

.gradient-blue {
  background: linear-gradient(135deg, #4361ee 0%, #4895ef 100%);
}
.gradient-green {
  background: linear-gradient(135deg, #40916c 0%, #52b788 100%);
}
.gradient-orange {
  background: linear-gradient(135deg, #f77f00 0%, #fcbf49 100%);
}
.gradient-purple {
  background: linear-gradient(135deg, #6f42c1 0%, #be95c4 100%);
}

.charts-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.chart-wrapper {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  &.large {
    height: 400px;
  }
  &.small {
    height: 400px;
  }
  .chart-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    color: #1b254b;
  }
}

.secondary-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
}

.stat-card-secondary {
  background-color: #fff;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  text-decoration: none;
  color: inherit;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    .stat-icon-secondary {
      transform: scale(1.1);
    }
  }

  .stat-icon-secondary {
    font-size: 2.2rem;
    color: var(--va-primary);
    transition: transform 0.3s ease;
  }

  .stat-info-secondary {
    .stat-label-secondary {
      font-size: 0.9rem;
      color: #6c757d;
      display: block;
    }
    .stat-value-secondary {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1b254b;
    }
  }
}

// Responsive
@media (max-width: 992px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
}
</style>
