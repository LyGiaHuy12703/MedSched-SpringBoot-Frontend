<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import StatCard from '@/components/dashboard/StatCard.vue'
// import LineChart from '@/components/dashboard/LineChart.vue'
// import PieChart from '@/components/dashboard/PieChart.vue'

// Dashboard statistics
const dashboardStats = ref({
  totalPatients: 2847,
  totalDoctors: 156,
  totalStaff: 324,
  totalAppointments: 1892,
  todayAppointments: 47,
  pendingAppointments: 23,
  completedAppointments: 1654,
  cancelledAppointments: 215,
  totalRevenue: 2847500,
  monthlyRevenue: 485600,
  averageWaitTime: 18,
  patientSatisfaction: 4.7,
})

// Department statistics
const departmentStats = ref([
  { name: 'Khoa Nội', patients: 456, doctors: 12, revenue: 567800 },
  { name: 'Khoa Ngoại', patients: 389, doctors: 15, revenue: 678900 },
  { name: 'Khoa Sản', patients: 234, doctors: 8, revenue: 345600 },
  { name: 'Khoa Nhi', patients: 567, doctors: 18, revenue: 789000 },
  { name: 'Khoa Mắt', patients: 123, doctors: 6, revenue: 234500 },
  { name: 'Khoa Tai Mũi Họng', patients: 178, doctors: 7, revenue: 298700 },
])

// Monthly appointment trends
const appointmentTrends = ref({
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  datasets: [
    {
      label: 'Lịch hẹn hoàn thành',
      data: [120, 135, 145, 160, 155, 170, 165, 180, 175, 190, 185, 200],
      borderColor: '#3DC47E',
      backgroundColor: 'rgba(61, 196, 126, 0.1)',
      tension: 0.4,
      fill: true,
    },
    {
      label: 'Lịch hẹn hủy',
      data: [15, 18, 12, 20, 16, 22, 19, 25, 21, 28, 24, 30],
      borderColor: '#E84D39',
      backgroundColor: 'rgba(232, 77, 57, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
})

// Revenue trends
const revenueTrends = ref({
  labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
  datasets: [
    {
      label: 'Doanh thu (triệu VNĐ)',
      data: [180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345],
      borderColor: '#5D5FEF',
      backgroundColor: 'rgba(93, 95, 239, 0.1)',
      tension: 0.4,
      fill: true,
    },
  ],
})

// Patient age distribution
const patientAgeDistribution = ref({
  labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
  datasets: [
    {
      data: [15, 25, 30, 20, 10],
      backgroundColor: ['#5D5FEF', '#3DC47E', '#22CCE2', '#FFC107', '#E84D39'],
      borderWidth: 0,
    },
  ],
})

// Top performing doctors
const topDoctors = ref([
  {
    id: 1,
    name: 'BS. Nguyễn Văn A',
    department: 'Khoa Tim mạch',
    patients: 156,
    rating: 4.9,
    revenue: 234500,
    avatar: 'https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg',
  },
  {
    id: 2,
    name: 'BS. Trần Thị B',
    department: 'Khoa Nhi',
    patients: 142,
    rating: 4.8,
    revenue: 198700,
    avatar: 'https://images.pexels.com/photos/5452268/pexels-photo-5452268.jpeg',
  },
  {
    id: 3,
    name: 'BS. Lê Văn C',
    department: 'Khoa Ngoại',
    patients: 138,
    rating: 4.7,
    revenue: 187600,
    avatar: 'https://images.pexels.com/photos/5452201/pexels-photo-5452201.jpeg',
  },
])

// Recent system activities
const recentActivities = ref([
  {
    id: 1,
    type: 'appointment',
    message: 'Lịch hẹn mới được tạo',
    user: 'Nguyễn Văn A',
    time: '5 phút trước',
    icon: 'event',
  },
  {
    id: 2,
    type: 'staff',
    message: 'Nhân viên mới được thêm',
    user: 'Admin',
    time: '15 phút trước',
    icon: 'person_add',
  },
  {
    id: 3,
    type: 'payment',
    message: 'Thanh toán hoàn thành',
    user: 'Trần Thị B',
    time: '30 phút trước',
    icon: 'payment',
  },
])

// Computed values
const growthPercentages = computed(() => ({
  patients: '+12.5%',
  appointments: '+8.3%',
  revenue: '+15.7%',
  satisfaction: '+2.1%',
}))

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('vi-VN').format(num)
}

onMounted(() => {
  // Load dashboard data
  console.log('Dashboard loaded')
})
</script>

<template>
  <div class="admin-dashboard">
    <div class="dashboard-header">
      <h1 class="dashboard-title">Tổng quan hệ thống</h1>
      <p class="dashboard-subtitle">Thống kê và báo cáo tổng quan</p>
    </div>

    <!-- Key Metrics -->
    <div class="metrics-grid">
      <StatCard
        title="Tổng bệnh nhân"
        :value="formatNumber(dashboardStats.totalPatients)"
        icon="people"
        :change="growthPercentages.patients"
        trend="up"
        color="primary"
      />
      <StatCard
        title="Tổng bác sĩ"
        :value="formatNumber(dashboardStats.totalDoctors)"
        icon="medical_services"
        change="+5.2%"
        trend="up"
        color="success"
      />
      <StatCard
        title="Tổng nhân viên"
        :value="formatNumber(dashboardStats.totalStaff)"
        icon="badge"
        change="+3.8%"
        trend="up"
        color="info"
      />
      <StatCard
        title="Lịch hẹn hôm nay"
        :value="formatNumber(dashboardStats.todayAppointments)"
        icon="today"
        :change="growthPercentages.appointments"
        trend="up"
        color="warning"
      />
    </div>

    <!-- Revenue and Appointment Metrics -->
    <div class="secondary-metrics">
      <va-card class="metric-card">
        <va-card-content>
          <div class="metric-content">
            <div class="metric-info">
              <h3 class="metric-title">Doanh thu tháng</h3>
              <div class="metric-value">{{ formatCurrency(dashboardStats.monthlyRevenue) }}</div>
              <div class="metric-change positive">
                <va-icon name="trending_up" />
                {{ growthPercentages.revenue }}
              </div>
            </div>
            <div class="metric-icon revenue">
              <va-icon name="attach_money" />
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="metric-card">
        <va-card-content>
          <div class="metric-content">
            <div class="metric-info">
              <h3 class="metric-title">Đánh giá trung bình</h3>
              <div class="metric-value">{{ dashboardStats.patientSatisfaction }}/5.0</div>
              <div class="metric-change positive">
                <va-icon name="trending_up" />
                {{ growthPercentages.satisfaction }}
              </div>
            </div>
            <div class="metric-icon satisfaction">
              <va-icon name="star" />
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="metric-card">
        <va-card-content>
          <div class="metric-content">
            <div class="metric-info">
              <h3 class="metric-title">Thời gian chờ TB</h3>
              <div class="metric-value">{{ dashboardStats.averageWaitTime }} phút</div>
              <div class="metric-change negative">
                <va-icon name="trending_down" />
                -2.3%
              </div>
            </div>
            <div class="metric-icon wait-time">
              <va-icon name="schedule" />
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <va-card class="chart-card large">
        <va-card-title>Xu hướng lịch hẹn theo tháng</va-card-title>
        <va-card-content>
          <LineChart :chart-data="appointmentTrends" />
        </va-card-content>
      </va-card>

      <va-card class="chart-card">
        <va-card-title>Phân bố độ tuổi bệnh nhân</va-card-title>
        <va-card-content>
          <PieChart :chart-data="patientAgeDistribution" />
        </va-card-content>
      </va-card>
    </div>

    <!-- Department Statistics -->
    <va-card class="department-stats">
      <va-card-title>Thống kê theo khoa</va-card-title>
      <va-card-content>
        <div class="department-grid">
          <div v-for="dept in departmentStats" :key="dept.name" class="department-item">
            <div class="department-header">
              <h4 class="department-name">{{ dept.name }}</h4>
              <va-badge color="primary">{{ dept.doctors }} BS</va-badge>
            </div>
            <div class="department-metrics">
              <div class="dept-metric">
                <span class="metric-label">Bệnh nhân</span>
                <span class="metric-value">{{ formatNumber(dept.patients) }}</span>
              </div>
              <div class="dept-metric">
                <span class="metric-label">Doanh thu</span>
                <span class="metric-value">{{ formatCurrency(dept.revenue) }}</span>
              </div>
            </div>
          </div>
        </div>
      </va-card-content>
    </va-card>

    <!-- Top Doctors and Recent Activities -->
    <div class="bottom-section">
      <va-card class="top-doctors">
        <va-card-title>Bác sĩ xuất sắc</va-card-title>
        <va-card-content>
          <div class="doctors-list">
            <div v-for="doctor in topDoctors" :key="doctor.id" class="doctor-item">
              <img :src="doctor.avatar" :alt="doctor.name" class="doctor-avatar" />
              <div class="doctor-info">
                <h4 class="doctor-name">{{ doctor.name }}</h4>
                <p class="doctor-department">{{ doctor.department }}</p>
                <div class="doctor-stats">
                  <span class="stat">{{ doctor.patients }} BN</span>
                  <span class="stat">
                    <va-icon name="star" color="warning" size="small" />
                    {{ doctor.rating }}
                  </span>
                </div>
              </div>
              <div class="doctor-revenue">
                {{ formatCurrency(doctor.revenue) }}
              </div>
            </div>
          </div>
        </va-card-content>
      </va-card>

      <va-card class="recent-activities">
        <va-card-title>Hoạt động gần đây</va-card-title>
        <va-card-content>
          <div class="activities-list">
            <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
              <div class="activity-icon">
                <va-icon :name="activity.icon" />
              </div>
              <div class="activity-content">
                <p class="activity-message">{{ activity.message }}</p>
                <div class="activity-meta">
                  <span class="activity-user">{{ activity.user }}</span>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </va-card-content>
      </va-card>
    </div>

    <!-- Quick Actions -->
    <va-card class="quick-actions">
      <va-card-title>Thao tác nhanh</va-card-title>
      <va-card-content>
        <div class="actions-grid">
          <va-button preset="primary" icon="person_add" class="action-btn">
            Thêm bệnh nhân
          </va-button>
          <va-button preset="success" icon="event" class="action-btn"> Tạo lịch hẹn </va-button>
          <va-button preset="info" icon="medical_services" class="action-btn">
            Thêm bác sĩ
          </va-button>
          <va-button preset="warning" icon="assessment" class="action-btn"> Xem báo cáo </va-button>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<style lang="scss" scoped>
.admin-dashboard {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;

  .dashboard-header {
    margin-bottom: 2rem;

    .dashboard-title {
      font-size: 2rem;
      font-weight: 700;
      color: var(--va-text-primary);
      margin: 0 0 0.5rem;
    }

    .dashboard-subtitle {
      color: var(--va-text-secondary);
      font-size: 1rem;
      margin: 0;
    }
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .secondary-metrics {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;

    .metric-card {
      .metric-content {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .metric-info {
          .metric-title {
            font-size: 0.875rem;
            color: var(--va-text-secondary);
            margin: 0 0 0.5rem;
          }

          .metric-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--va-text-primary);
            margin-bottom: 0.5rem;
          }

          .metric-change {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.875rem;
            font-weight: 500;

            &.positive {
              color: var(--va-success);
            }

            &.negative {
              color: var(--va-danger);
            }
          }
        }

        .metric-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;

          &.revenue {
            background: linear-gradient(135deg, #3dc47e, #2eaa6b);
          }

          &.satisfaction {
            background: linear-gradient(135deg, #ffc107, #ff9800);
          }

          &.wait-time {
            background: linear-gradient(135deg, #22cce2, #1ba8c4);
          }
        }
      }
    }
  }

  .charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    .chart-card {
      height: 400px;

      &.large {
        .va-card__content {
          height: calc(100% - 60px);
        }
      }
    }
  }

  .department-stats {
    margin-bottom: 2rem;

    .department-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;

      .department-item {
        padding: 1.5rem;
        background: var(--va-background);
        border-radius: 12px;
        border: 1px solid var(--va-border);

        .department-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;

          .department-name {
            font-size: 1.125rem;
            font-weight: 600;
            margin: 0;
            color: var(--va-text-primary);
          }
        }

        .department-metrics {
          display: flex;
          justify-content: space-between;

          .dept-metric {
            display: flex;
            flex-direction: column;
            align-items: center;

            .metric-label {
              font-size: 0.875rem;
              color: var(--va-text-secondary);
              margin-bottom: 0.25rem;
            }

            .metric-value {
              font-size: 1.125rem;
              font-weight: 600;
              color: var(--va-text-primary);
            }
          }
        }
      }
    }
  }

  .bottom-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2rem;

    .top-doctors {
      .doctors-list {
        .doctor-item {
          display: flex;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid var(--va-border);

          &:last-child {
            border-bottom: none;
          }

          .doctor-avatar {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 1rem;
          }

          .doctor-info {
            flex: 1;

            .doctor-name {
              font-size: 1rem;
              font-weight: 600;
              margin: 0 0 0.25rem;
              color: var(--va-text-primary);
            }

            .doctor-department {
              font-size: 0.875rem;
              color: var(--va-text-secondary);
              margin: 0 0 0.5rem;
            }

            .doctor-stats {
              display: flex;
              gap: 1rem;

              .stat {
                font-size: 0.75rem;
                color: var(--va-text-secondary);
                display: flex;
                align-items: center;
                gap: 0.25rem;
              }
            }
          }

          .doctor-revenue {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--va-success);
          }
        }
      }
    }

    .recent-activities {
      .activities-list {
        .activity-item {
          display: flex;
          align-items: flex-start;
          padding: 1rem 0;
          border-bottom: 1px solid var(--va-border);

          &:last-child {
            border-bottom: none;
          }

          .activity-icon {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--va-primary);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            flex-shrink: 0;
          }

          .activity-content {
            flex: 1;

            .activity-message {
              font-size: 0.875rem;
              color: var(--va-text-primary);
              margin: 0 0 0.5rem;
            }

            .activity-meta {
              display: flex;
              gap: 1rem;
              font-size: 0.75rem;
              color: var(--va-text-secondary);

              .activity-user {
                font-weight: 500;
              }
            }
          }
        }
      }
    }
  }

  .quick-actions {
    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;

      .action-btn {
        height: 60px;
        font-size: 1rem;
      }
    }
  }
}

@media (max-width: 1200px) {
  .admin-dashboard {
    .charts-section {
      grid-template-columns: 1fr;
    }

    .bottom-section {
      grid-template-columns: 1fr;
    }
  }
}

@media (max-width: 768px) {
  .admin-dashboard {
    padding: 1rem;

    .metrics-grid {
      grid-template-columns: 1fr;
    }

    .secondary-metrics {
      grid-template-columns: 1fr;
    }

    .department-stats {
      .department-grid {
        grid-template-columns: 1fr;
      }
    }

    .quick-actions {
      .actions-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  }
}

@media (max-width: 480px) {
  .admin-dashboard {
    .quick-actions {
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
