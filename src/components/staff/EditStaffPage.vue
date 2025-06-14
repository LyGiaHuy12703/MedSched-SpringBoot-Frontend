<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Staff, UpdateStaffRequest } from '@/interfaces/staff.interface'
import { useDepartmentStore } from '@/stores/department.store'
import { useRoleStore } from '@/stores/role.store'
import type { Department } from '@/interfaces/department.interface'
import type { Role } from '@/interfaces/role.interface'
import { useRouter, useRoute } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useCloudinaryStore } from '@/stores/cloudinary.store'
import { useStaffStore } from '@/stores/staff.store'

const formData = ref<UpdateStaffRequest>({
  name: '',
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
const route = useRoute()
const staffId = route.params.id

const departmentStore = useDepartmentStore()
const departments = ref<Department[]>([])
const roleStore = useRoleStore()
const roles = ref<Role[]>([])
const cloudinaryStore = useCloudinaryStore()
const staffStore = useStaffStore()
const formRef = ref<{ validate: () => Promise<boolean> } | null>(null)
const staffDetails = ref<Staff>()

const genderOptions = ref([
  { text: 'Nam', value: 'MALE' },
  { text: 'Nữ', value: 'FEMALE' },
  { text: 'Khác', value: 'OTHER' },
])

const previewAvatar = ref<string>('')

onMounted(async () => {
  try {
    await departmentStore.fetchDepartments(0, 1000)
    await roleStore.fetchAllRoles(0, 1000)
    departments.value = departmentStore.departments
    roles.value = roleStore.roles

    await staffStore.fetchStaffById(staffId)
    staffDetails.value = staffStore.staff
    if (staffDetails.value) {
      formData.value = {
        name: staffDetails.value.user.name,
        address: staffDetails.value.user.address,
        phone: staffDetails.value.user.phone,
        gender: staffDetails.value.user.gender,
        dob: staffDetails.value.user.dob,
        experienceYear: staffDetails.value.experienceYear,
        position: staffDetails.value.position,
        departmentId: staffDetails.value.departments.id,
        roles: staffDetails.value.roles
          .map((role: Role) => role.id)
          .filter((id): id is string => typeof id === 'string'),
        avatar: staffDetails.value.user.avatar,
      }
      previewAvatar.value = staffDetails.value.user.avatar
    }
  } catch (error: any) {
    toast.error('Lỗi khi tải thông tin nhân viên: ' + error.message)
  }
})

const staffEmail = computed({
  get() {
    return staffDetails.value?.user.email || ''
  },
  set(val: string) {
    if (staffDetails.value && staffDetails.value.user) {
      staffDetails.value.user.email = val
    }
  },
})
const handleSubmit = async () => {
  if (!formRef.value) {
    toast.error('Form không hợp lệ!')
    return
  }

  const isValid = await formRef.value.validate()
  if (!isValid) {
    toast.error('Vui lòng kiểm tra lại thông tin!')
    return
  }
  if (!formData.value.avatar && !staffDetails.value?.user?.avatar) {
    toast.error('Vui lòng chọn hình ảnh!')
    return
  }

  try {
    if (formData.value.avatar instanceof File) {
      const requestUploadAvatar = new FormData()
      requestUploadAvatar.append('file', formData.value.avatar)
      await cloudinaryStore.upload(requestUploadAvatar)
      if (!cloudinaryStore.avatarUrl) {
        toast.error('Lỗi khi tải lên hình ảnh!')
        return
      }
      formData.value.avatar = String(cloudinaryStore.avatarUrl)
    } else {
      // Nếu không có file mới, giữ nguyên avatar hiện tại (nếu có)
      formData.value.avatar = staffDetails.value?.user?.avatar || ''
    }

    // Kiểm tra các trường bắt buộc trước khi gửi
    if (!formData.value.name || !formData.value.departmentId) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }
    await staffStore.updateStaff(staffId, formData.value)
    router.back()
    setTimeout(() => {
      toast.success('Cập nhật nhân viên thành công!')
    }, 300)
  } catch (error) {
    console.error('Lỗi chi tiết:', error.response?.data || error.message)
    const errorMessage =
      error.response?.data?.message || error.message || 'Không thể cập nhật nhân viên'
    toast.error(`Có lỗi xảy ra khi cập nhật nhân viên: ${errorMessage}`)
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
</script>

<template>
  <va-inner-loading
    :loading="cloudinaryStore.loading || staffStore.loading"
    class="edit-staff-page"
  >
    <va-card>
      <va-card-content>
        <va-form
          ref="formRef"
          @submit.prevent="handleSubmit"
          class="edit-staff-form"
          v-if="formData && staffDetails"
        >
          <div class="form-section">
            <h3 class="section-title">Thông tin cá nhân</h3>

            <div class="form-row">
              <div class="form-group">
                <div class="label"><va-icon name="people" class="mr-1" />Họ và tên</div>
                <va-input
                  v-model="formData.name"
                  placeholder="Nhập họ và tên"
                  :rules="[(v: string) => !!v || 'Họ và tên là bắt buộc']"
                  required-mark
                />
              </div>
              <div class="form-group">
                <div class="label">
                  <va-icon name="email" size="small" class="mr-1" />
                  Email
                </div>
                <va-input
                  v-model="staffEmail"
                  type="email"
                  placeholder="Nhập email"
                  :disabled="true"
                  required-mark
                />
              </div>
            </div>

            <div class="form-row">
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

            <va-button type="submit" preset="primary"> Cập nhật </va-button>
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
.edit-staff-page {
  .edit-staff-form {
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
  .edit-staff-page {
    padding: 1rem;

    .edit-staff-form {
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  }
}
</style>
