<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { CreateStaffRequest } from '@/interfaces/staff.interface'
import { useDepartmentStore } from '@/stores/department.store'
import { useRoleStore } from '@/stores/role.store'
import type { Department } from '@/interfaces/department.interface'
import type { Role } from '@/interfaces/role.interface'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useCloudinaryStore } from '@/stores/cloudinary.store'
import { useStaffStore } from '@/stores/staff.store'

const formData = ref<CreateStaffRequest>({
  email: '',
  name: '',
  password: '',
  gender: '',
  dob: '',
  address: '',
  phone: '',
  experienceYear: 0,
  position: '',
  departmentId: '',
  roles: [],
  avatar: '',
})
const router = useRouter()
const departmentStore = useDepartmentStore()
const departments = ref<Department[]>([])
const roleStore = useRoleStore()
const roles = ref<Role[]>([])
const cloudinaryStore = useCloudinaryStore()
const staffStore = useStaffStore()
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const genderOptions = ref([
  { text: 'Nam', value: 'MALE' },
  { text: 'Nữ', value: 'FEMALE' },
  { text: 'Khác', value: 'OTHER' },
])
const previewAvatar = ref<string>('')
onMounted(async () => {
  resetFormData()
  await departmentStore.fetchDepartments(0, 1000)
  await roleStore.fetchAllRoles(0, 1000)
  departments.value = departmentStore.departments
  roles.value = roleStore.roles
})

const handleSubmit = async () => {
  if (!formRef.value) return
  const isValid = await formRef.value.validate()

  if (!formData.value.avatar || typeof formData.value.avatar === 'string') {
    toast.error('Vui lòng chọn hình ảnh!')
    return
  }

  if (isValid) {
    try {
      const requestUploadAvatar = new FormData()
      requestUploadAvatar.append('file', formData.value.avatar)

      await cloudinaryStore.upload(requestUploadAvatar)
      formData.value.avatar = String(cloudinaryStore.avatarUrl)

      await staffStore.createStaff(formData.value)

      toast.success('Thêm nhân viên thành công!')
      router.back()
    } catch (error: any) {
      previewAvatar.value = ''
      toast.error(
        'Có lỗi xảy ra khi thêm nhân viên: ' + (error.response?.data?.message || error.message),
      )
    }
  }
}

const handleCancel = () => {
  router.back()
}
const handleImageUpload = (files: File[]) => {
  if (files.length > 0) {
    formData.value.avatar = files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      previewAvatar.value = e.target?.result as string
    }
    reader.readAsDataURL(files[0])
  } else {
    formData.value.avatar = ''
    previewAvatar.value = ''
  }
}
const resetFormData = () => {
  formData.value = {
    email: '',
    name: '',
    password: '',
    gender: '',
    dob: '',
    address: '',
    phone: '',
    experienceYear: 0,
    position: '',
    departmentId: '',
    roles: [],
    avatar: '',
  }
  previewAvatar.value = ''
}
</script>

<template>
  <va-inner-loading
    :loading="staffStore.loading || cloudinaryStore.loading"
    class="create-staff-page"
  >
    <va-card>
      <va-card-content>
        <va-form ref="formRef" @submit.prevent="handleSubmit" class="create-staff-form">
          <div class="form-section">
            <h3 class="section-title">Thông tin cá nhân</h3>

            <div class="form-row">
              <div class="form-group">
                <div class="label"><va-icon name="people" class="mr-1" />Họ và tên</div>
                <va-input
                  v-model="formData.name"
                  placeholder="Nhập họ và tên"
                  :rules="[(v) => !!v || 'Tên là bắt buộc']"
                  required-mark
                />
              </div>

              <div class="form-group">
                <div class="label">
                  <va-icon name="email" size="small" class="mr-1" />
                  Email
                </div>
                <va-input
                  v-model="formData.email"
                  type="email"
                  placeholder="Nhập email"
                  :rules="[
                    (v: string) => !!v || 'Email là bắt buộc',
                    (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Email không hợp lệ',
                  ]"
                  required-mark
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <div class="label">
                  <va-icon name="key" size="small" class="mr-1" />
                  Password
                </div>
                <va-input
                  v-model="formData.password"
                  placeholder="Nhập password"
                  :rules="[(v) => !!v || 'Password là bắt buộc']"
                  required-mark
                />
              </div>

              <div class="form-group">
                <div class="label">
                  <va-icon name="phone" size="small" class="mr-1" />
                  Số điện thoại
                </div>
                <va-input
                  v-model="formData.phone"
                  placeholder="Nhập số điện thoại"
                  :rules="[
                    (v: string) => !!v || 'Số điện thoại là bắt buộc',
                    (v: string) => /^0\d{9}$/.test(v) || 'Số điện thoại không hợp lệ',
                  ]"
                  required-mark
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <div class="label">
                  <va-icon name="description" size="small" class="mr-1" />
                  Giới tính
                </div>
                <va-select
                  v-model="formData.gender"
                  :options="genderOptions"
                  placeholder="Chọn giới tính"
                  :rules="[(v) => !!v || 'Giới tính là bắt buộc']"
                  required-mark
                  value-by="value"
                  text-by="text"
                />
              </div>

              <div class="form-group">
                <div class="label">
                  <va-icon name="description" size="small" class="mr-1" />
                  Ngày sinh
                </div>
                <va-input
                  v-model="formData.dob"
                  type="date"
                  placeholder="Chọn ngày sinh"
                  :rules="[(v) => !!v || 'Ngày sinh là bắt buộc']"
                  required-mark
                />
              </div>
            </div>

            <div class="form-group">
              <div class="label">
                <va-icon name="badge" size="small" class="mr-1" />
                Địa chỉ
              </div>
              <va-input
                v-model="formData.address"
                placeholder="Nhập địa chỉ"
                :rules="[(v) => !!v || 'Địa chỉ là bắt buộc']"
                required-mark
              />
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Thông tin công việc</h3>

            <div class="form-row">
              <div class="form-group">
                <div class="label">
                  <va-icon name="badge" size="small" class="mr-1" />
                  Vị trí
                </div>
                <va-input
                  v-model="formData.position"
                  placeholder="Nhập Vị trí"
                  :rules="[(v) => !!v || 'Vị trí là bắt buộc']"
                  required-mark
                />
              </div>

              <div class="form-group">
                <div class="label">
                  <va-icon name="badge" size="small" class="mr-1" />
                  Kinh nghiệm
                </div>
                <va-input
                  v-model="formData.experienceYear"
                  type="number"
                  min="0"
                  placeholder="Nhập kinh nghiệm"
                  :rules="[(v) => !!v || 'kinh nghiệm là bắt buộc']"
                  required-mark
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <div class="label">
                  <va-icon name="badge" size="small" class="mr-1" />
                  Khoa/Phòng ban
                </div>
                <va-select
                  v-model="formData.departmentId"
                  placeholder="Chọn bộ phận"
                  :rules="[(v) => !!v || 'Bộ phận là bắt buộc']"
                  :options="departments.map((dep) => ({ value: dep.id, text: dep.name }))"
                  clearable
                  class="filter-select"
                  value-by="value"
                  text-by="text"
                />
              </div>

              <div class="form-group">
                <div class="label">
                  <va-icon name="shield" color="primary" size="small" />
                  Vai trò
                </div>
                <va-select
                  v-model="formData.roles"
                  :options="
                    roles
                      .filter((role) => role.name !== 'PATIENT' && role.name !== 'ADMIN')
                      .map((role) => ({ text: role.name, value: role.id }))
                  "
                  :rules="[(v) => !!v || 'Vai trò là bắt buộc']"
                  clearable
                  placeholder="Chọn vai trò"
                  multiple
                  class="filter-select"
                  value-by="value"
                  text-by="text"
                />
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3 class="section-title">Ảnh đại diện</h3>

            <div class="avatar-upload">
              <div class="avatar-preview" v-if="previewAvatar">
                <img :src="previewAvatar" alt="Avatar preview" />
              </div>
              <va-file-upload
                @update:model-value="handleImageUpload"
                accept="image/*"
                :multiple="false"
              >
                <va-button preset="secondary">
                  {{ previewAvatar ? 'Thay đổi ảnh' : 'Tải ảnh lên' }}
                </va-button>
              </va-file-upload>
            </div>
          </div>

          <div class="form-actions">
            <va-button preset="secondary" @click="handleCancel"> Hủy </va-button>

            <va-button type="submit" preset="primary"> Thêm nhân viên </va-button>
          </div>
        </va-form>
      </va-card-content>
    </va-card>
  </va-inner-loading>
</template>

<style lang="scss" scoped>
.label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--va-primary);
  margin-bottom: 0.5rem;
}
.create-staff-page {
  .create-staff-form {
    .form-section {
      margin-bottom: 2rem;

      .section-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
        color: var(--va-text-primary);
      }
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .form-group {
        flex: 1;
      }
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .avatar-upload {
      display: flex;
      align-items: center;
      gap: 1rem;

      .avatar-preview {
        width: 100px;
        height: 100px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--va-primary);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid var(--va-border);
    }
  }
}

@media (max-width: 768px) {
  .create-staff-page {
    padding: 1rem;

    .create-staff-form {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  }
}
</style>
