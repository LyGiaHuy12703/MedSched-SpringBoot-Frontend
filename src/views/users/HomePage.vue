<script setup lang="ts">
import type { Department } from '@/interfaces/department.interface'
import type { Staff } from '@/interfaces/staff.interface'
import { useDepartmentStore } from '@/stores/department.store'
import { useStaffStore } from '@/stores/staff.store'
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const staffStore = useStaffStore()
const departmentStore = useDepartmentStore()
const staffs = ref<Staff[]>([])
const departments = ref<Department[]>([])
onMounted(async () => {
  await staffStore.fetchAllStaffs(0, 1000)
  await departmentStore.fetchDepartments(0, 4)
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
  return [...staffs.value]
    .sort((a, b) => b.rating - a.rating) // Sắp xếp giảm dần theo rating
    .slice(0, 3) // Lấy 3 bác sĩ đầu tiên
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
    title: 'Đội ngũ y tế chuyên nghiệp',
    description: 'Các bác sĩ có nhiều năm kinh nghiệm',
  },
  {
    icon: 'access_time',
    title: 'Tiết kiệm thời gian',
    description: 'Không cần xếp hàng chờ đợi tại bệnh viện',
  },
  {
    icon: 'security',
    title: 'An toàn & Bảo mật',
    description: 'Thông tin cá nhân được bảo vệ tuyệt đối',
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
        <h1 class="hero-title">Chăm sóc sức khỏe của bạn là ưu tiên của chúng tôi</h1>
        <p class="hero-subtitle">
          Đặt lịch khám với các bác sĩ hàng đầu. Dễ dàng, nhanh chóng và an toàn.
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
          <va-button preset="primary" @click="navigateToBooking"> Tìm kiếm </va-button>
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

    <!-- Doctors Section -->
    <section class="doctors-section">
      <div class="container">
        <h2 class="section-title">Bác sĩ tiêu biểu</h2>
        <div class="doctors-grid">
          <div v-for="doctor in topRatedDoctors" :key="doctor.id" class="doctor-card">
            <img :src="doctor.user.avatar" :alt="doctor.user.name" class="doctor-image" />
            <div class="doctor-info">
              <h3 class="doctor-name">{{ doctor.user.name }}</h3>
              <p class="doctor-specialty">{{ doctor.departments.name }}</p>
              <div class="doctor-rating">
                <va-icon name="star" color="warning" />
                <span>{{ doctor.rating }}/5</span>
              </div>
              <va-button preset="primary" block @click="navigateToBooking">
                Đặt lịch khám
              </va-button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2 class="cta-title">Bắt đầu đặt lịch khám ngay hôm nay</h2>
          <p class="cta-description">
            Chăm sóc sức khỏe chưa bao giờ dễ dàng đến thế. Đặt lịch ngay!
          </p>
          <va-button preset="primary" size="large" @click="navigateToBooking">
            Đặt lịch khám
          </va-button>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  .hero-section {
    background: linear-gradient(rgba(93, 95, 239, 0.1), rgba(93, 95, 239, 0.05));
    padding: 4rem 1rem;
    text-align: center;

    .hero-content {
      max-width: 800px;
      margin: 0 auto;

      .hero-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: var(--va-primary);
        margin-bottom: 1rem;
      }

      .hero-subtitle {
        font-size: 1.25rem;
        color: var(--va-text-secondary);
        margin-bottom: 2rem;
      }

      .search-box {
        display: flex;
        gap: 1rem;
        max-width: 600px;
        margin: 0 auto;

        .search-input {
          flex: 1;
        }
      }
    }
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 4rem 1rem;
  }

  .section-title {
    font-size: 2rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 2rem;
    color: var(--va-text-primary);
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;

    .feature-card {
      text-align: center;
      padding: 2rem;
      background: var(--va-background-element);
      border-radius: 12px;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .feature-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 1rem 0;
      }

      .feature-description {
        color: var(--va-text-secondary);
      }
    }
  }

  .specialties-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;

    .specialty-card {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      cursor: pointer;

      &:hover .specialty-image {
        transform: scale(1.1);
      }

      .specialty-image {
        width: 100%;
        aspect-ratio: 4 / 3; /* Tỷ lệ cố định để xử lý hình dài/ngắn */
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .specialty-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
        color: white;

        .specialty-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .specialty-count {
          font-size: 0.875rem;
          opacity: 0.9;
        }
      }
    }
  }

  .doctors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;

    .doctor-card {
      background: var(--va-background-element);
      border-radius: 12px;
      overflow: hidden;
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .doctor-image {
        width: 100%;
        aspect-ratio: 1 / 1; /* Tỷ lệ vuông để hiển thị đồng đều */
        object-fit: cover;
      }

      .doctor-info {
        padding: 1.5rem;

        .doctor-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .doctor-specialty {
          color: var(--va-text-secondary);
          margin-bottom: 0.5rem;
        }

        .doctor-rating {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: var(--va-text-secondary);
        }
      }
    }
  }

  .cta-section {
    background: var(--va-primary);
    color: white;

    .cta-content {
      text-align: center;

      .cta-title {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .cta-description {
        font-size: 1.25rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }
    }
  }
}

@media (max-width: 768px) {
  .home-page {
    .hero-section {
      padding: 2rem 1rem;

      .hero-content {
        .hero-title {
          font-size: 2rem;
        }

        .hero-subtitle {
          font-size: 1rem;
        }

        .search-box {
          flex-direction: column;
        }
      }
    }

    .container {
      padding: 2rem 1rem;
    }

    .section-title {
      font-size: 1.5rem;
    }
  }
}

@media (max-width: 480px) {
  .home-page {
    .hero-section {
      .hero-content {
        .hero-title {
          font-size: 1.5rem;
        }
      }
    }

    .features-grid,
    .specialties-grid,
    .doctors-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
