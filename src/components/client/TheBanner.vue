<template>
  <section class="relative bg-blue-50 py-16 px-6 text-center overflow-hidden">
    <VaCarousel
      :items="carouselItems"
      :autoplay="autoplay"
      :interval="interval"
      class="carousel-container"
    >
      <template #prev>
        <i class="fas fa-chevron-left"></i>
      </template>
      <template #next>
        <i class="fas fa-chevron-right"></i>
      </template>
    </VaCarousel>

    <!-- Content -->
    <div class="relative z-10 max-w-3xl mx-auto my-5">
      <h1 class="text-4xl md:text-6xl font-bold text-primary mb-6 my-3">
        Đặt lịch khám dễ dàng cùng MEDSCHED
      </h1>
      <p class="text-lg md:text-xl text-gray-700 mb-8 my-3">
        Sắp xếp thời gian - cải thiện sức khỏe của bạn ngay hôm nay
      </p>
      <router-link to="/booking">
        <va-button class="bg-primary py-3 px-6 rounded-full text-lg"> Đặt lịch ngay </va-button>
      </router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VaCarousel } from 'vuestic-ui'

// Định nghĩa items cho carousel
const carouselItems = ref([
  { src: '/banner.png', alt: 'Healthcare Background' },
  { src: '/banner2.png', alt: 'Healthcare Background' },
  { src: '/banner.png', alt: 'Healthcare Background' },
])

const autoplay = ref(true)
const interval = ref(3000)
</script>

<style scoped>
.bg-primary {
  background-color: #1e40af;
}

.carousel-container {
  width: 100%;
  max-height: 80vh; /* Giới hạn chiều cao tối đa dựa trên viewport */
}

/* Responsive styles cho carousel */
.va-carousel {
  width: 100%;
  height: 400px; /* Chiều cao mặc định cho màn hình nhỏ */
  object-fit: cover; /* Đảm bảo hình ảnh không bị méo */
}

/* Media queries cho các kích thước màn hình khác nhau */
@media (min-width: 640px) {
  .va-carousel {
    height: 500px !important; /* Tăng chiều cao cho màn hình trung bình */
  }
}

@media (min-width: 1024px) {
  .va-carousel {
    height: 600px !important; /* Chiều cao lớn hơn cho màn hình lớn */
  }
}

@media (max-width: 640px) {
  .va-carousel {
    height: 300px; /* Giảm chiều cao cho màn hình rất nhỏ */
  }
}

/* Đảm bảo hình ảnh trong carousel responsive */
.va-carousel img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Hình ảnh bao phủ toàn bộ carousel mà không bị méo */
}

/* Tùy chỉnh nút điều hướng */
.va-carousel__arrow {
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 10px;
  border-radius: 50%;
}
</style>
