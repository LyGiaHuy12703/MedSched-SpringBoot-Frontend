<script setup lang="ts">
import type { Department } from '@/interfaces/department.interface'
import type { Staff } from '@/interfaces/staff.interface'
import { useCountStore } from '@/stores/countStore.store'
import { useDepartmentStore } from '@/stores/department.store'
import { useStaffStore } from '@/stores/staff.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const countStore = useCountStore()
const staffs = ref<Staff[]>([])
const departments = ref<Department[]>([])

onMounted(async () => {
  await Promise.all([
    staffStore.fetchAllStaffs(0, 1000),
    departmentStore.fetchDepartments(0, 4),
    countStore.fetchCounts(),
  ])
  staffs.value = staffStore.staffs
  departments.value = departmentStore.departments
})

const sampleImages = [
  './pexels-tara-winstead-7722680.jpg',
  './pexels-zeynep-ozata-2153642453-32828952.jpg',
  './pexels-mart-production-7089401.jpg',
  './pexels-vidalbalielojrfotografia-4005611.jpg',
]

const topRatedDoctors = computed(() => {
  return [...staffs.value].sort((a, b) => b.rating - a.rating).slice(0, 3)
})

const departmentsWithImageAndCount = computed(() => {
  return departments.value.map((dep, index) => ({
    ...dep,
    image: sampleImages[index % sampleImages.length],
    count:
      staffs.value.filter((staff) => staff.departments.id === dep.id).length + ' nhân viên y tế',
  }))
})

const searchQuery = ref('')

const features = [
  {
    icon: 'calendar_today',
    title: 'Đặt lịch dễ dàng',
    description: 'Đặt lịch khám chỉ với vài bước đơn giản',
  },
  {
    icon: 'medical_services',
    title: 'Đội ngũ chuyên nghiệp',
    description: 'Các bác sĩ có nhiều năm kinh nghiệm',
  },
  {
    icon: 'access_time',
    title: 'Tiết kiệm thời gian',
    description: 'Không cần xếp hàng chờ đợi',
  },
  {
    icon: 'security',
    title: 'An toàn & Bảo mật',
    description: 'Thông tin được bảo vệ tuyệt đối',
  },
]

const navigateToBooking = () => {
  router.push('/bookings')
}
</script>

<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">Chăm sóc sức khỏe toàn diện cho bạn</h1>
        <p class="hero-subtitle">
          Đặt lịch khám với các bác sĩ hàng đầu một cách dễ dàng và an toàn
        </p>
        <div class="search-box">
          <va-input
            v-model="searchQuery"
            placeholder="Tìm kiếm bác sĩ hoặc chuyên khoa..."
            class="search-input"
          >
            <template #prepend>
              <va-icon name="search" />
            </template>
          </va-input>
          <va-button preset="primary" @click="navigateToBooking">Tìm kiếm</va-button>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <h2 class="section-title">Tại sao chọn chúng tôi?</h2>
        <div class="features-grid">
          <div v-for="feature in features" :key="feature.title" class="feature-card">
            <va-icon :name="feature.icon" size="large" color="primary" />
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>
    <!-- Specialties Section -->
    <section class="specialties-section">
      <div class="container">
        <h2 class="section-title">Chuyên khoa</h2>
        <div class="specialties-grid">
          <div
            v-for="specialty in departmentsWithImageAndCount"
            :key="specialty.name"
            class="specialty-card"
          >
            <img :src="specialty.image" :alt="specialty.name" class="specialty-image" />
            <div class="specialty-info">
              <h3 class="specialty-name">{{ specialty.name }}</h3>
              <p class="specialty-count">{{ specialty.count }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- About Us Section -->
    <section class="about-section">
      <div class="container">
        <h2 class="section-title">Về chúng tôi</h2>
        <p class="about-description">
          Chúng tôi cam kết mang đến dịch vụ chăm sóc sức khỏe chất lượng cao với đội ngũ chuyên
          nghiệp và công nghệ hiện đại.
        </p>
        <div v-if="countStore.isLoading" class="loading">Đang tải dữ liệu...</div>
        <div v-else-if="countStore.error" class="error">{{ countStore.error }}</div>
        <div v-else-if="countStore.stats.patients === null" class="no-data">
          Chưa có dữ liệu thống kê.
        </div>
        <div v-else class="stats-grid">
          <div class="stat-card">
            <va-icon name="group" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.stats.patients?.toLocaleString() ?? '0' }}</h3>
            <p class="stat-label">Bệnh nhân</p>
          </div>
          <div class="stat-card">
            <va-icon name="medical_services" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.stats.staff?.toLocaleString() ?? '0' }}</h3>
            <p class="stat-label">Nhân viên y tế</p>
          </div>
          <div class="stat-card">
            <va-icon name="local_hospital" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.stats.departments?.toLocaleString() ?? '0' }}</h3>
            <p class="stat-label">Chuyên khoa</p>
          </div>
          <div class="stat-card">
            <va-icon name="health_and_safety" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.stats.services?.toLocaleString() ?? '0' }}</h3>
            <p class="stat-label">Dịch vụ</p>
          </div>
          <div class="stat-card">
            <va-icon name="event" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.successRate ?? '100' }}%</h3>
            <p class="stat-label">Tỷ lệ lịch hẹn thành công</p>
          </div>
          <div class="stat-card">
            <va-icon name="star" size="large" color="primary" />
            <h3 class="stat-number">{{ countStore.stats.feedbackPoint ?? '5' }}/5</h3>
            <p class="stat-label">Đánh giá hài lòng</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  .hero-section {
    background: linear-gradient(135deg, rgba(93, 95, 239, 0.2), rgba(93, 95, 239, 0.05));
    padding: 4rem 1rem;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0,0 C30,50 70,50 100,0 L100,100 L0,100 Z" fill="rgba(93,95,239,0.1)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      max-width: 900px;
      margin: 0 auto;
      text-align: center;
      position: relative;
      z-index: 0;

      .hero-title {
        font-size: 3rem;
        font-weight: 800;
        color: var(--va-primary);
        margin-bottom: 1.5rem;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 1.5rem;
        color: var(--va-text-secondary);
        margin-bottom: 2.5rem;
        max-width: 600px;
        margin-left: auto;
        margin-right: auto;
      }

      .search-box {
        display: flex;
        gap: 1rem;
        max-width: 700px;
        margin: 0 auto;
        background: white;
        padding: 0.5rem;
        border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

        .search-input {
          flex: 1;
          background: transparent;
        }

        .va-button {
          border-radius: 25px;
          padding: 0.75rem 2rem;
        }
      }
    }
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 3rem;
    color: var(--va-text-primary);
    position: relative;

    &::after {
      content: '';
      width: 60px;
      height: 4px;
      background: var(--va-primary);
      position: absolute;
      bottom: -1rem;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 2px;
    }
  }

  .about-section {
    background: var(--va-background-element);
    margin-bottom: 5px;
    .about-description {
      text-align: center;
      max-width: 800px;
      margin: 0 auto 2rem;
      font-size: 1.2rem;
      color: var(--va-text-secondary);
    }

    .loading,
    .no-data,
    .error {
      text-align: center;
      font-size: 1.2rem;
      color: var(--va-text-secondary);
      margin: 2rem 0;
    }

    .error {
      color: var(--va-danger);
    }

    .no-data {
      color: var(--va-warning);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;

      .stat-card {
        text-align: center;
        padding: 2rem;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-8px);
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--va-primary);
          margin: 1rem 0 0.5rem;
        }

        .stat-label {
          color: var(--va-text-secondary);
          font-size: 1rem;
        }
      }
    }
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;

    .feature-card {
      text-align: center;
      padding: 2.5rem;
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .feature-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1rem 0;
      }

      .feature-description {
        color: var(--va-text-secondary);
        font-size: 1rem;
      }
    }
  }

  .specialties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;

    .specialty-card {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      &:hover .specialty-image {
        transform: scale(1.05);
      }

      .specialty-image {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        transition: transform 0.4s ease;
      }

      .specialty-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1.5rem;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
        color: white;

        .specialty-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .specialty-count {
          font-size: 1rem;
          opacity: 0.9;
        }
      }
    }
  }

  .doctors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;

    .doctor-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
      }

      .doctor-image {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
      }

      .doctor-info {
        padding: 2rem;

        .doctor-name {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .doctor-specialty {
          color: var(--va-text-secondary);
          margin-bottom: 0.75rem;
          font-size: 1rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          color: var(--va-text-secondary);
          font-size: 1rem;
        }

        .va-button {
          border-radius: 8px;
        }
      }
    }
  }

  .cta-section {
    background: linear-gradient(135deg, var(--va-primary), var(--va-primary-dark));
    color: white;
    padding: 5rem 1rem;

    .cta-content {
      text-align: center;
      max-width: 800px;
      margin: 0 auto;

      .cta-title {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 1.5rem;
      }

      .cta-description {
        font-size: 1.3rem;
        margin-bottom: 2.5rem;
        opacity: 0.9;
      }

      .va-button {
        border-radius: 25px;
        padding: 1rem 3rem;
        font-size: 1.1rem;
      }
    }
  }

  @media (max-width: 768px) {
    .hero-section {
      padding: 3rem 1rem;

      .hero-content {
        .hero-title {
          font-size: 2.2rem;
        }

        .hero-subtitle {
          font-size: 1.2rem;
        }

        .search-box {
          flex-direction: column;
          padding: 0.5rem;
        }
      }
    }

    .container {
      padding: 3rem 1rem;
    }

    .section-title {
      font-size: 2rem;
    }

    .stats-grid {
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }
  }

  @media (max-width: 480px) {
    .hero-section {
      .hero-content {
        .hero-title {
          font-size: 1.8rem;
        }

        .hero-subtitle {
          font-size: 1rem;
        }
      }
    }

    .features-grid,
    .specialties-grid,
    .doctors-grid,
    .stats-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
