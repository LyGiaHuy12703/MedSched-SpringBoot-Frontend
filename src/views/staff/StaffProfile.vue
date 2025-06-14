<script setup lang="ts">
import type { Account, ChangePassword, RequestUpdateInfo } from '@/interfaces/auth.interfaces'
import { useAuthStore } from '@/stores/auth.store'
import { onMounted, ref, computed } from 'vue'
import { toast } from 'vue3-toastify'
import { useModal } from 'vuestic-ui'

const authStore = useAuthStore()
const { confirm } = useModal()

// User profile data
const userApi = ref<Account>({
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
})

// Form for password change
const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Gender options for select
const genders = [
  { value: 'MALE', text: 'Male' },
  { value: 'FEMALE', text: 'Female' },
  { value: 'OTHERS', text: 'Others' },
]

// Active tab
const activeTab = ref('profile')

// Fetch user info on mount
onMounted(async () => {
  try {
    const data = await authStore.getInfo()
    console.log('API response:', JSON.stringify(data, null, 2))
    if (data && data.user) {
      userApi.value = data
    } else {
      console.error('Invalid user data:', data)
      toast.error('Failed to fetch user info')
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
    toast.error('An error occurred while fetching user info')
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
})

// Handle profile update
const showConfirmChangeInfo = async () => {
  const ok = await confirm({
    title: 'Confirm Profile Update',
    message: 'Are you sure you want to update your profile?',
  })
  if (ok) {
    await changeInfo()
  }
}

const changeInfo = async () => {
  if (!userApi.value.user.name || !userApi.value.user.address) {
    toast.error('Name and address are required')
    return
  }
  if (userApi.value.user.age < 0) {
    toast.error('Age must be a positive number')
    return
  }

  const requestApi: RequestUpdateInfo = {
    name: userApi.value.user.name,
    email: userApi.value.user.email,
    phone: userApi.value.user.phone,
    address: userApi.value.user.address,
    gender: userApi.value.user.gender,
    dob: userApi.value.user.dob,
    age: userApi.value.user.age,
  }

  try {
    const data = await authStore.updateInfo(requestApi)
    if (data) {
      userApi.value = data
      toast.success('Profile updated successfully')
    } else {
      toast.error('Failed to update profile')
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.error('An error occurred while updating profile')
  }
}

// Handle password change
const updatePassword = async () => {
  const ok = await confirm({
    title: 'Confirm Password Change',
    message: 'Are you sure you want to change your password?',
  })
  if (ok) {
    await changePassword()
  }
}

const changePassword = async () => {
  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    toast.error('New password and confirm password do not match')
    return
  }
  if (securityForm.value.newPassword.length < 5) {
    toast.error('New password must be at least 5 characters long')
    return
  }
  try {
    const requestApi: ChangePassword = {
      password: securityForm.value.currentPassword,
      newPassword: securityForm.value.newPassword,
    }
    const success = await authStore.updatePassword(requestApi)
    if (success) {
      toast.success('Password updated successfully')
      securityForm.value.currentPassword = ''
      securityForm.value.newPassword = ''
      securityForm.value.confirmPassword = ''
    } else {
      toast.error('Failed to update password')
      securityForm.value.currentPassword = ''
      securityForm.value.newPassword = ''
      securityForm.value.confirmPassword = ''
    }
  } catch (error) {
    console.error('Error updating password:', error)
    toast.error('An error occurred while updating password')
  }
}

// Computed property for avatar fallback
const avatarSrc = computed(() => userApi.value.user?.avatarUrl || '/defaultAvatar.png')
</script>

<template>
  <div class="profile-page">
    <!-- Profile Header -->
    <div class="profile-header">
      <div class="header-content">
        <div class="avatar-section">
          <va-avatar v-if="userApi.user" :src="avatarSrc" size="large" class="avatar" />
          <va-button
            preset="secondary"
            size="small"
            @click="toast.info('Avatar upload coming soon!')"
          >
            Change Photo
          </va-button>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ userApi.user?.name || 'User' }}</h1>
          <p class="profile-title">MEDSCHED • {{ userApi.user?.role || 'Patient' }}</p>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="profile-tabs">
      <va-tabs v-model="activeTab" grow>
        <va-tab name="profile" class="tab">
          <va-icon name="person" class="tab-icon" />
          Profile
        </va-tab>
        <va-tab name="security" class="tab">
          <va-icon name="security" class="tab-icon" />
          Security
        </va-tab>
      </va-tabs>
    </div>

    <!-- Tab Content -->
    <div class="tab-content">
      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <va-card stripe stripe-color="primary">
          <va-card-title>Personal Information</va-card-title>
          <va-card-content>
            <form @submit.prevent="showConfirmChangeInfo" class="form">
              <div class="form-row">
                <va-input v-model="userApi.user.id" label="ID" disabled class="form-group" />
                <va-input
                  v-model="userApi.user.email"
                  type="email"
                  label="Email"
                  disabled
                  class="form-group"
                />
              </div>
              <div class="form-row">
                <va-input
                  v-model="userApi.user.name"
                  label="Name"
                  required
                  class="form-group"
                  :error-messages="userApi.user.name ? [] : ['Name is required']"
                />
                <va-input v-model="userApi.user.phone" label="Phone" class="form-group" />
              </div>
              <div class="form-row">
                <va-input
                  v-model="userApi.user.address"
                  label="Address"
                  required
                  class="form-group"
                  :error-messages="userApi.user.address ? [] : ['Address is required']"
                />
                <va-input v-model="userApi.user.role" label="Role" disabled class="form-group" />
              </div>
              <div class="form-row">
                <va-input
                  v-model.number="userApi.user.age"
                  type="number"
                  label="Age"
                  class="form-group"
                  :error-messages="userApi.user.age >= 0 ? [] : ['Age must be a positive number']"
                />
                <va-select
                  v-model="userApi.user.gender"
                  label="Gender"
                  :options="genders"
                  text-by="text"
                  value-by="value"
                  class="form-group"
                />
              </div>
              <div class="form-row">
                <va-input
                  v-model="userApi.user.dob"
                  label="Date of Birth"
                  type="date"
                  class="form-group"
                />
              </div>
              <div class="form-actions">
                <va-button preset="primary" type="submit">Save Changes</va-button>
              </div>
            </form>
          </va-card-content>
        </va-card>
      </div>

      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="security-section">
        <va-card stripe stripe-color="primary">
          <va-card-title>Change Password</va-card-title>
          <va-card-content>
            <form @submit.prevent="updatePassword" class="form">
              <va-input
                v-model="securityForm.currentPassword"
                type="password"
                label="Current Password"
                required
                class="form-group"
                :error-messages="
                  securityForm.currentPassword ? [] : ['Current password is required']
                "
              />
              <va-input
                v-model="securityForm.newPassword"
                type="password"
                label="New Password"
                required
                class="form-group"
                :error-messages="
                  securityForm.newPassword.length >= 5
                    ? []
                    : ['Password must be at least 5 characters']
                "
              />
              <va-input
                v-model="securityForm.confirmPassword"
                type="password"
                label="Confirm New Password"
                required
                class="form-group"
                :error-messages="
                  securityForm.confirmPassword === securityForm.newPassword
                    ? []
                    : ['Passwords do not match']
                "
              />
              <div class="form-actions">
                <va-button preset="primary" type="submit">Update Password</va-button>
              </div>
            </form>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;

  .profile-header {
    background: var(--va-background-element);
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    .header-content {
      display: flex;
      align-items: center;
      gap: 2rem;

      .avatar-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;

        .avatar {
          border: 2px solid var(--va-primary);
        }
      }

      .profile-info {
        .profile-name {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0;
          color: var(--va-text-primary);
        }

        .profile-title {
          font-size: 1rem;
          color: var(--va-text-secondary);
          margin: 0.25rem 0 0;
        }
      }
    }
  }

  .profile-tabs {
    margin-bottom: 2rem;

    .tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;

      .tab-icon {
        font-size: 1.25rem;
      }
    }
  }

  .tab-content {
    .form {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .form-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
      }

      .form-group {
        min-width: 0;
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
      }
    }
  }

  .profile-section,
  .security-section {
    .va-card {
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;

    .profile-header {
      .header-content {
        flex-direction: column;
        text-align: center;
      }
    }

    .tab-content {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
```
