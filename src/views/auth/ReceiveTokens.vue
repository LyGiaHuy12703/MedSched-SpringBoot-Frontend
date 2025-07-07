<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  // Lấy token từ query parameters của URL
  const user = route.query.userResponse as any | undefined
  const accessToken = route.query.accessToken as string | undefined
  const refreshToken = route.query.refreshToken as string | undefined

  if (accessToken && refreshToken && user) {
    try {
      // Gọi một action trong store để lưu trữ token và thông tin người dùng
      // Đây là phần "hứng" dữ liệu
      authStore.handleOAuthCallback(user, accessToken, refreshToken)

      toast.success('Đăng nhập với Google thành công!')

      router.push({ name: 'Home' })
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi xử lý đăng nhập Google.')
      router.push({ name: 'Login' }) // Chuyển về trang đăng nhập nếu có lỗi
    }
  } else {
    // Nếu không có token trong URL, có thể đã có lỗi ở phía backend
    toast.error('Không nhận được thông tin xác thực từ server.')
    router.push({ name: 'Login' })
  }
})
</script>
