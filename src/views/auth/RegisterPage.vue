<template>
  <div class="d-flex justify-center align-center h-full">
    <va-form ref="form" @submit.prevent="handleSubmit" class="register-form">
      <div v-if="!showVerification">
        <h2 class="va-h2 mb-3">Đăng ký</h2>
        <p>
          Bạn đã có tài khoản?
          <router-link :to="{ name: 'Login' }" class="font-semibold text-primary link">
            Đăng nhập
          </router-link>
        </p>
        <div class="mt-3">
          <va-input
            v-model="data.name"
            label="NAME"
            type="text"
            class="mb-3 w-100"
            :rules="[(v) => !!v || 'Name is required']"
          />
        </div>
        <div>
          <va-input
            v-model="data.email"
            label="EMAIL"
            type="email"
            class="mb-3 w-100"
            :rules="[
              (v) => !!v || 'Email is required',
              (v) => /.+@.+\..+/.test(v) || 'Email must be valid',
            ]"
          />
        </div>
        <div>
          <va-input
            v-model="data.password"
            label="MẬT KHẨU"
            type="password"
            class="mb-3 w-100"
            :rules="[
              (v) => !!v || 'Password is required',
              (v) => v.length >= 6 || 'Password must be at least 6 characters',
            ]"
          />
        </div>
        <div class="d-flex justify-space-between align-center mt-2 mb-3">
          <va-checkbox v-model="agreeTerms" label="Tôi đồng ý với các điều khoản dịch vụ" />
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
            Đăng ký
          </va-button>
        </div>
      </div>
      <div v-else class="mt-3">
        <h3 class="va-h3 mb-3">Nhập mã xác thực</h3>
        <p class="mb-3">Vui lòng nhập mã 6 số đã được gửi đến email của bạn.</p>
        <div style="display: flex; flex-direction: row">
          <va-input
            v-model="verificationCode"
            label="MÃ XÁC THỰC"
            type="text"
            class="mb-3 w-100"
            :rules="[
              (v) => !!v || 'Code is required',
              (v) => v.length === 6 || 'Code must equals 6 characters',
            ]"
          >
          </va-input>
        </div>

        <va-button
          type="button"
          color="primary"
          block
          class="mt-4"
          :loading="loading"
          :disabled="loading || verificationCode.length !== 6"
          @click="handleVerifyCode"
        >
          Xác thực
        </va-button>
      </div>
    </va-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { toast } from 'vue3-toastify'
import authService from '../../services/auth.service'
import { useAuthStore } from '../../stores/auth.store'
import { useRouter } from 'vue-router'

const router = useRouter()
const data = reactive({
  name: '',
  email: '',
  password: '',
})
const agreeTerms = ref(false)
const form = ref()
const authStore = useAuthStore()
const loading = ref(false)
const showVerification = ref(false)
const verificationCode = ref('')
onMounted(async () => {
  await authStore.refresh()
  if (authStore.loggedIn) {
    router.push({ name: 'Home' })
  }
})
const handleSubmit = async () => {
  const isValid = await form.value.validate()
  if (!isValid) {
    toast.error('Thông tin không hợp lệ')
    return
  }

  if (!agreeTerms.value) {
    toast.error('Vui lòng đồng ý với điều khoản của chúng tôi')
    return
  }

  loading.value = true

  try {
    const response = await authService.signUp({
      name: data.name,
      email: data.email,
      password: data.password,
    })

    if (response.data?.code === 200) {
      showVerification.value = true
      toast.success(response.data?.message || 'Mã xác thực đã được gửi đến email của bạn!')
      verificationCode.value = ''
    } else {
      toast.error('Đăng ký thất bại. Vui lòng thử lại.')
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'Đã có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}
const handleVerifyCode = async () => {
  if (verificationCode.value.length !== 6) {
    toast.error('Vui lòng nhập mã xác thực 6 số')
    return
  }

  loading.value = true

  try {
    const response = await authService.verifyCode({
      email: data.email,
      code: verificationCode.value,
    })

    if (response.data?.access_token) {
      authService.updateLocalStorage(response.data)
      await authStore.getInfo() // Sử dụng getInfo thay vì setUserInfo
      authStore.loggedIn = true
      router.push({ name: 'Home' })
      setTimeout(() => {
        toast.success('Xác thực đăng ký thành công!')
      }, 1000)
    } else {
      toast.error('Mã xác thực không hợp lệ')
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Đã có lỗi xảy ra')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.register-form {
  max-width: 400px;
  width: 100%;
  padding: 2rem;
}

.otp-box {
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #1a1a1a;
  background-color: #fff;
  transition:
    border-color 0.3s,
    background-color 0.3s;
}

.otp-filled {
  border-color: #1e40af;
  background-color: #e0e7ff;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gap-2 {
  gap: 8px;
}

.link {
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}
</style>
