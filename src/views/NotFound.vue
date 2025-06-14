<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex items-center justify-center h-[calc(100vh-60px)]">
      <va-card class="max-w-lg p-8 text-center">
        <va-card-title class="text-5xl font-bold text-gray-800 mb-4"> 404 </va-card-title>
        <va-card-content>
          <p class="text-lg text-gray-600 mb-6">
            Oops! Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <div class="flex justify-center gap-4">
            <va-button color="primary" @click="goHome"> Về trang chủ </va-button>
            <va-button v-if="!userStore.isAuthenticated" color="info" @click="goToLogin">
              Đăng nhập
            </va-button>
          </div>
        </va-card-content>
      </va-card>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUserStore } from '@/stores/users.store'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

const goHome = () => {
  router.push({ name: 'Home' })
}

const goToLogin = () => {
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.va-card {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  background: linear-gradient(145deg, #ffffff, #f1f7fe);
}

.va-button {
  transition: transform 0.2s ease;
}

.va-button:hover {
  transform: scale(1.05);
}
</style>
