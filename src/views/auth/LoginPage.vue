<template>
  <div class="d-flex justify-center align-center h-full">
    <va-form ref="form" @submit.prevent="handleSubmit" class="login-form">
      <h2 class="va-h2 mb-3">Log in</h2>
      <p>
        Bạn chưa có tài khoản?
        <router-link :to="{ name: 'Register' }" class="font-semibold text-primary link">
          Đăng ký
        </router-link>
      </p>

      <div class="mt-3">
        <va-input
          v-model="data.email"
          label="EMAIL"
          type="email"
          class="mb-3 w-100"
          :rules="[(v) => !!v || 'Email is required']"
        />
      </div>

      <div>
        <va-input
          v-model="data.password"
          label="MẬT KHẨU"
          type="password"
          class="mb-3 w-100"
          :rules="[(v) => !!v || 'Password is required']"
        />
      </div>

      <div class="d-flex justify-space-between align-center mt-2 mb-3">
        <router-link :to="{ name: 'Register' }" class="text-primary font-semibold link">
          Quên mật khẩu?
        </router-link>
      </div>

      <div class="mb-3">
        <va-button
          type="submit"
          color="primary"
          block
          class="mt-4"
          :loading="loading"
          :disabled="loading"
        >
          Đăng nhập
        </va-button>
      </div>

      <!-- Google Login Button -->
      <div class="mb-3">
        <va-button preset="danger" color="danger" block :loading="loading" :disabled="loading">
          Đăng nhập với google
        </va-button>
      </div>
    </va-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginRequest } from '@/interfaces/auth.interfaces'
import { toast } from 'vue3-toastify'

const router = useRouter()
const authStore = useAuthStore()

const data: LoginRequest = reactive({
  email: '',
  password: '',
})
const form = ref()
const loading = ref(false)

onMounted(async () => {
  await authStore.refresh()
  if (authStore.loggedIn) {
    router.push({ name: 'Home' })
  }
})
const redirectByRole = () => {
  const role = authStore.getAuth?.data?.user?.role
  switch (role) {
    case 'ADMIN':
      router.push({ name: 'AdminDashboard' })
      break
    case 'STAFF':
      router.push({ name: 'StaffDashboard' })
      break
    case 'PATIENT':
    default:
      router.push({ name: 'Home' })
      break
  }
}
const handleSubmit = async () => {
  // Validate form
  const isValid = await form.value.validate()
  if (!isValid) {
    return
  }
  try {
    await authStore.login(data)
    redirectByRole()
    toast.success('Đăng nhập thành công')
  } catch (error: any) {
    toast.error(error.message || 'Lỗi không xác định')
  }
}
</script>

<style scoped lang="scss">
.login-form {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
}

.link {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

:deep(.va-input-wrapper__label) {
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
  display: block;
  color: var(--va-secondary);
}

:deep(.va-input .va-input-wrapper__field) {
  margin-top: 0 !important;
}

:deep(.va-checkbox__label) {
  font-size: 0.875rem;
}

.va-button {
  font-weight: bold;
}

.h-full {
  min-height: 80vh;
}
</style>
