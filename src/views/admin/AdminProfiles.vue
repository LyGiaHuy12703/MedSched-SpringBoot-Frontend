<script setup lang="ts">
import type { Account, ChangePassword, RequestUpdateInfo } from '@/interfaces/auth.interfaces'
import { useAuthStore } from '@/stores/auth.store'
import { useCloudinaryStore } from '@/stores/cloudinary.store'
import { onMounted, ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useModal } from 'vuestic-ui'

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
const securityForm = ref<ChangePassword & { confirmPassword: string }>({
  password: '',
  newPassword: '',
  confirmPassword: '',
})

// Static options
const genderOptions = ref([
  { text: 'Nam', value: 'MALE' },
  { text: 'Nữ', value: 'FEMALE' },
  { text: 'Khác', value: 'OTHERS' },
])

// --- Computed Properties ---
const userRole = computed(() => {
  const roleName = userApi.value?.user?.role?.[0]?.name || userApi.value?.user?.role
  return roleName ? roleName.replace(/_/g, ' ').toUpperCase() : 'NHÂN VIÊN'
})

const isFormChanged = computed(() => {
  if (!originalUserApi.value || !userApi.value) {
    return false
  }
  if (avatarFile.value) {
    return true
  }
  const originalDataString = JSON.stringify(originalUserApi.value.user)
  const currentDataString = JSON.stringify(userApi.value.user)
  return originalDataString !== currentDataString
})

const avatarSrc = computed(
  () => previewAvatarUrl.value || userApi.value?.user?.avatarUrl || '/defaultAvatar.png',
)

// --- Lifecycle Hooks ---
onMounted(async () => {
  isSubmitting.value = true
  try {
    const data = await authStore.getInfo()
    if (data && data.user) {
      userApi.value = JSON.parse(JSON.stringify(data))
      originalUserApi.value = JSON.parse(JSON.stringify(data))
      if (userApi.value.user.dob) {
        userApi.value.user.dob = new Date(userApi.value.user.dob).toISOString().split('T')[0]
      }
      previewAvatarUrl.value = userApi.value.user.avatarUrl || ''
    } else {
      toast.error('Không thể tải thông tin người dùng.')
      userApi.value = {
        user: {
          id: '',
          name: '',
          email: '',
          role: '',
          avatarUrl: '',
          phone: '',
          address: '',
          dob: '',
          gender: '',
          age: 0,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching user info:', error)
    toast.error('Có lỗi xảy ra khi tải thông tin người dùng.')
  } finally {
    isSubmitting.value = false
  }
})

// --- Methods ---
const handleImageUpload = (files: File[] | null) => {
  const file = files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh!')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Kích thước hình ảnh phải nhỏ hơn 2MB!')
      return
    }
    avatarFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
      previewAvatarUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  } else {
    avatarFile.value = null
    previewAvatarUrl.value = userApi.value?.user.avatarUrl || ''
  }
}

const showConfirmChangeInfo = async () => {
  if (!userApi.value) return

  if (!userApi.value.user.name || !userApi.value.user.address || !userApi.value.user.dob) {
    toast.error('Họ và tên, địa chỉ và ngày sinh là bắt buộc!')
    return
  }
  if (userApi.value.user.age < 0) {
    toast.error('Tuổi phải là số dương!')
    return
  }

  const ok = await confirm({
    title: 'Xác nhận cập nhật thông tin',
    message: 'Bạn có chắc chắn muốn cập nhật thông tin cá nhân?',
    okText: 'Đồng ý',
    cancelText: 'Hủy bỏ',
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    let finalAvatarUrl = userApi.value.user.avatarUrl
    if (avatarFile.value) {
      const uploadFormData = new FormData()
      uploadFormData.append('file', avatarFile.value)
      const response = await cloudinaryStore.upload(uploadFormData)
      if (typeof response === 'string') {
        finalAvatarUrl = response
      } else {
        throw new Error('Invalid avatar upload response')
      }
    }

    const requestApi: RequestUpdateInfo = {
      name: userApi.value.user.name,
      email: userApi.value.user.email,
      phone: userApi.value.user.phone,
      address: userApi.value.user.address,
      gender: userApi.value.user.gender,
      dob: userApi.value.user.dob,
      age: userApi.value.user.age,
      avatarUrl: finalAvatarUrl,
    }

    const updatedData = await authStore.updateInfo(requestApi)
    if (updatedData && updatedData.user) {
      userApi.value = updatedData
      originalUserApi.value = JSON.parse(JSON.stringify(updatedData))
      previewAvatarUrl.value = updatedData.user.avatarUrl || ''
      avatarFile.value = null
      toast.success('Cập nhật thông tin thành công!')
    } else {
      toast.error('Cập nhật thông tin thất bại!')
    }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    toast.error('Có lỗi xảy ra khi cập nhật thông tin!')
    previewAvatarUrl.value = userApi.value?.user.avatarUrl || ''
  } finally {
    isSubmitting.value = false
  }
}

const updatePassword = async () => {
  const { password, newPassword, confirmPassword } = securityForm.value

  if (!password || !newPassword || !confirmPassword) {
    toast.error('Vui lòng điền đầy đủ các trường mật khẩu!')
    return
  }
  if (newPassword.length < 5) {
    toast.error('Mật khẩu mới phải có ít nhất 5 ký tự!')
    return
  }
  if (newPassword !== confirmPassword) {
    toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp!')
    return
  }

  const ok = await confirm({
    title: 'Xác nhận đổi mật khẩu',
    message: 'Bạn có chắc chắn muốn đổi mật khẩu?',
    okText: 'Đồng ý',
    cancelText: 'Hủy bỏ',
  })
  if (!ok) return

  isSubmitting.value = true
  try {
    const requestApi: ChangePassword = {
      password,
      newPassword,
    }
    const success = await authStore.updatePassword(requestApi)
    if (success) {
      toast.success('Cập nhật mật khẩu thành công!')
      securityForm.value = { password: '', newPassword: '', confirmPassword: '' }
    } else {
      toast.error('Cập nhật mật khẩu thất bại!')
    }
  } catch (error: any) {
    console.error('Error updating password:', error)
    toast.error('Có lỗi xảy ra khi cập nhật mật khẩu!')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <va-inner-loading :loading="isSubmitting" :size="60">
      <h1 class="page-title">Thông tin tài khoản</h1>
      <va-tabs v-model="activeTab" grow class="mb-4">
        <va-tab name="profile"> <va-icon name="person" class="mr-2" /> Hồ sơ </va-tab>
        <va-tab name="security"> <va-icon name="lock" class="mr-2" /> Bảo mật </va-tab>
      </va-tabs>

      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile' && userApi">
        <form @submit.prevent="showConfirmChangeInfo">
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
                  text-by="text"
                  value-by="value"
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
                <va-input
                  v-model.number="userApi.user.age"
                  type="number"
                  label="Tuổi"
                  class="full-width"
                  :rules="[(v) => v >= 0 || 'Tuổi phải là số dương']"
                />
              </div>
              <!-- Right Column: Avatar -->
              <div class="avatar-section">
                <p class="va-title">Ảnh đại diện</p>
                <va-avatar :src="avatarSrc" size="150px" font-size="3rem" />
                <va-file-upload
                  @update:model-value="handleImageUpload"
                  accept="image/*"
                  dropzone
                  class="mt-4"
                  :disabled="isSubmitting"
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
            <form @submit.prevent="updatePassword" class="security-form-grid">
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
            @click="updatePassword"
            icon="key"
            color="danger"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Cập nhật mật khẩu
          </va-button>
        </div>
      </div>
    </va-inner-loading>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  padding: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
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
