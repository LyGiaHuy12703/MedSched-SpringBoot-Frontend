<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useModal } from 'vuestic-ui'
import type { Account, ChangePassword, RequestUpdateInfo } from '@/interfaces/auth.interfaces'
import { useAuthStore } from '@/stores/auth.store'
import { useCloudinaryStore } from '@/stores/cloudinary.store'

// --- Stores and Hooks ---
const authStore = useAuthStore()
const cloudinaryStore = useCloudinaryStore()
const { confirm } = useModal()

// --- Component State ---
const isSubmitting = ref(false)
const activeTab = ref('profile')

// User data state
const userApi = ref<Account | null>(null)
const originalUserApi = ref<Account | null>(null)
const avatarFile = ref<File | null>(null)
const previewAvatarUrl = ref<string>('')

// Security form state
const securityForm = ref<ChangePassword & { confirmPassword: '' }>({
  password: '',
  newPassword: '',
  confirmPassword: '',
})

// Static options
const genderOptions = ref([
  { text: 'Nam', value: 'MALE' },
  { text: 'Nữ', value: 'FEMALE' },
  { text: 'Khác', value: 'OTHER' },
])

// --- Computed Properties ---
const userRole = computed(() => {
  const roleName = userApi.value?.user?.role?.[0]?.name
  return roleName ? roleName.replace(/_/g, ' ').toUpperCase() : 'THÀNH VIÊN'
})
const isFormChanged = computed(() => {
  // Nếu dữ liệu gốc hoặc dữ liệu hiện tại chưa có, coi như không thay đổi
  if (!originalUserApi.value || !userApi.value) {
    return false
  }

  // 1. Kiểm tra nếu có file avatar mới được chọn
  if (avatarFile.value) {
    return true
  }

  // 2. So sánh từng trường dữ liệu của user
  // Chuyển đổi đối tượng thành chuỗi JSON để so sánh là cách đơn giản và hiệu quả nhất
  const originalDataString = JSON.stringify(originalUserApi.value.user)
  const currentDataString = JSON.stringify(userApi.value.user)

  return originalDataString !== currentDataString
})
// --- Lifecycle Hooks ---
onMounted(async () => {
  isSubmitting.value = true
  try {
    const data = await authStore.getInfo()
    if (data && data.user) {
      // Deep copy to prevent direct mutation of store state
      userApi.value = JSON.parse(JSON.stringify(data))
      originalUserApi.value = JSON.parse(JSON.stringify(data))
      // Format date for input type="date"
      if (userApi.value.user.dob) {
        userApi.value.user.dob = new Date(userApi.value.user.dob).toISOString().split('T')[0]
      }
      // Set initial avatar for preview
      previewAvatarUrl.value = userApi.value.user.avatarUrl || ''
    } else {
      toast.error('Không thể tải thông tin người dùng.')
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
    toast.error('Có lỗi xảy ra khi tải thông tin cá nhân.')
  } finally {
    isSubmitting.value = false
  }
})

// --- Methods ---

/**
 * Handles image selection from the file uploader.
 */
const handleImageUpload = (files: File[] | null) => {
  const file = files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) return toast.error('Vui lòng chỉ chọn tệp hình ảnh.')
    if (file.size > 2 * 1024 * 1024) return toast.error('Kích thước ảnh phải nhỏ hơn 2MB.')

    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      previewAvatarUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    avatarFile.value = null
    // Revert to original avatar if selection is cancelled
    previewAvatarUrl.value = userApi.value?.user.avatarUrl || ''
  }
}

/**
 * Handles profile information update.
 */
const handleUpdateInfo = async () => {
  if (!userApi.value) return

  const ok = await confirm({
    title: 'Xác nhận cập nhật',
    message: 'Bạn có chắc chắn muốn lưu các thay đổi này?',
    okText: 'Đồng ý',
    cancelText: 'Hủy bỏ',
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    let finalAvatarUrl = userApi.value.user.avatarUrl

    // Step 1: If a new avatar is selected, upload it first
    if (avatarFile.value) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', avatarFile.value)
      finalAvatarUrl = await cloudinaryStore.upload(uploadFormData)
    }

    // Step 2: Prepare the final payload
    const requestApi: RequestUpdateInfo = {
      ...userApi.value.user,
      avatarUrl: finalAvatarUrl,
    }

    // Step 3: Call update API
    const updatedData = await authStore.updateInfo(requestApi)
    if (updatedData && updatedData.user) {
      userApi.value = updatedData // Update UI with fresh data from server
      previewAvatarUrl.value = updatedData.user.avatarUrl || '' // Sync preview
      avatarFile.value = null // Reset file input state
    }
    toast.success('Cập nhật thông tin thành công!')

    await authStore.getInfo() // Refresh store state
  } catch (error: any) {
    console.error('Error updating profile:', error)
    toast.error('Cập nhật thất bại: ' + (error.response?.data?.message || error.message))
  } finally {
    isSubmitting.value = false
  }
}

/**
 * Handles password change.
 */
const handleUpdatePassword = async () => {
  const { password, newPassword, confirmPassword } = securityForm.value

  if (!password || !newPassword || !confirmPassword)
    return toast.warn('Vui lòng điền đủ các trường.')
  if (newPassword.length < 5) return toast.error('Mật khẩu mới phải có ít nhất 5 ký tự.')
  if (newPassword !== confirmPassword) return toast.error('Mật khẩu mới không khớp.')

  const ok = await confirm({
    title: 'Xác nhận đổi mật khẩu',
    message: 'Bạn có chắc chắn muốn đổi mật khẩu?',
    okText: 'Đổi mật khẩu',
    cancelText: 'Hủy bỏ',
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    await authStore.updatePassword({ password, newPassword })
    toast.success('Đổi mật khẩu thành công!')
    securityForm.value = { password: '', newPassword: '', confirmPassword: '' } // Reset form
  } catch (error: any) {
    console.error('Error updating password:', error)
    toast.error(
      'Đổi mật khẩu thất bại: ' + (error.response?.data?.message || 'Vui lòng kiểm tra lại.'),
    )
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="profile-update-page">
    <va-inner-loading :loading="isSubmitting" :size="60">
      <h1 class="page-title">Thông tin tài khoản</h1>

      <va-tabs v-model="activeTab" grow class="mb-4">
        <va-tab name="profile"> <va-icon name="person" class="mr-2" /> Hồ sơ </va-tab>
        <va-tab name="security"> <va-icon name="lock" class="mr-2" /> Bảo mật </va-tab>
      </va-tabs>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile' && userApi">
        <form @submit.prevent="handleUpdateInfo">
          <va-card class="form-card">
            <va-card-title>Chi tiết hồ sơ</va-card-title>
            <va-card-content class="form-layout">
              <!-- Left Column: Personal Info -->
              <div class="form-grid">
                <va-input v-model="userApi.user.id" label="ID Người dùng" readonly />
                <va-input v-model="userApi.user.email" label="Email" readonly />
                <va-input
                  v-model="userApi.user.name"
                  label="Họ và tên"
                  placeholder="Nhập họ và tên"
                  :rules="[(v) => !!v || 'Họ và tên là bắt buộc']"
                />
                <va-input
                  v-model="userApi.user.phone"
                  label="Số điện thoại"
                  placeholder="Nhập số điện thoại"
                  :rules="[
                    (v: string) => !!v || 'Số điện thoại là bắt buộc',
                    (v: string) => /^0\d{9}$/.test(v) || 'Số điện thoại không hợp lệ',
                  ]"
                />
                <va-select
                  v-model="userApi.user.gender"
                  label="Giới tính"
                  :options="genderOptions"
                />
                <va-input
                  v-model="userApi.user.dob"
                  type="date"
                  label="Ngày sinh"
                  :rules="[(v) => !!v || 'Ngày sinh là bắt buộc']"
                />
                <va-input
                  v-model="userApi.user.address"
                  label="Địa chỉ"
                  class="full-width"
                  placeholder="Nhập địa chỉ"
                  :rules="[(v) => !!v || 'Địa chỉ là bắt buộc']"
                />
                <va-input :model-value="userRole" label="Vai trò" class="full-width" readonly />
              </div>
              <!-- Right Column: Avatar -->
              <div class="avatar-section">
                <p class="va-title">Ảnh đại diện</p>
                <va-avatar
                  :src="previewAvatarUrl || '/defaultAvatar.png'"
                  size="150px"
                  font-size="3rem"
                />
                <va-file-upload
                  @update:model-value="handleImageUpload"
                  accept="image/*"
                  dropzone
                  class="mt-4"
                >
                  {{ previewAvatarUrl ? 'Thay đổi ảnh' : 'Tải ảnh lên' }}
                </va-file-upload>
              </div>
            </va-card-content>
          </va-card>
          <div class="form-actions">
            <va-button
              :disabled="!isFormChanged || isSubmitting"
              preset="primary"
              type="submit"
              icon="save"
              :loading="isSubmitting"
            >
              Lưu thay đổi
            </va-button>
          </div>
        </form>
      </div>

      <!-- Security Tab -->
      <div v-if="activeTab === 'security'">
        <va-card class="form-card">
          <va-card-title>Đổi mật khẩu</va-card-title>
          <va-card-content>
            <form @submit.prevent="handleUpdatePassword" class="security-form-grid">
              <va-input
                v-model="securityForm.password"
                type="password"
                label="Mật khẩu hiện tại"
                :rules="[(v) => !!v || 'Mật khẩu hiện tại là bắt buộc']"
              />
              <va-input
                v-model="securityForm.newPassword"
                type="password"
                label="Mật khẩu mới"
                :rules="[(v) => (v && v.length >= 5) || 'Mật khẩu phải có ít nhất 5 ký tự']"
              />
              <va-input
                v-model="securityForm.confirmPassword"
                type="password"
                label="Xác nhận mật khẩu mới"
                :rules="[(v) => v === securityForm.newPassword || 'Mật khẩu xác nhận không khớp']"
              />
            </form>
          </va-card-content>
        </va-card>
        <div class="form-actions">
          <va-button
            type="submit"
            preset="primary"
            @click="handleUpdatePassword"
            icon="key"
            color="danger"
            :loading="isSubmitting"
          >
            Cập nhật mật khẩu
          </va-button>
        </div>
      </div>
    </va-inner-loading>
  </div>
</template>

<style lang="scss" scoped>
.profile-update-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: var(--va-text-primary);
}

.form-card {
  margin-bottom: 2rem;
  border-radius: 12px;
}

.form-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.security-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.full-width {
  grid-column: 1 / -1;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1rem;
  border-left: 1px solid var(--va-background-border);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}

// Responsive adjustments
@media (max-width: 992px) {
  .form-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .avatar-section {
    border-left: none;
    border-top: 1px solid var(--va-background-border);
    padding-top: 2rem;
  }
}
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
