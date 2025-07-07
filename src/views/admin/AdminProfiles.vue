<script setup lang="ts">
import type { Account, ChangePassword } from '@/interfaces/auth.interfaces'
import { useAuthStore } from '@/stores/auth.store'
import { onMounted, ref } from 'vue'
import { toast } from 'vue3-toastify'
import { useModal } from 'vuestic-ui'

const authStore = useAuthStore()
const { confirm } = useModal()

const showConfirmChangeInfo = () => {
  confirm('Are you sure you want to change profile?').then((ok) => {
    if (ok) {
      changeInfo()
    }
  })
}

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

onMounted(async () => {
  const data = await authStore.getInfo()
  if (data) {
    userApi.value = data // Cập nhật userApi.value
  } else {
    console.error('Failed to fetch user info')
  }
})

const changeInfo = async () => {
  const data = await authStore.updateInfo({ user: userApi?.value?.user })
  if (data) {
    userApi.value = data // Cập nhật userApi.value
  } else {
    console.error('Failed to update user info')
  }
}
const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const notificationSettings = ref({
  emailNotifications: true,
  taskAssignments: true,
  teamUpdates: true,
  systemAlerts: false,
  weeklyDigest: true,
})

const genders = [
  { value: 'MALE', text: 'MALE' },
  { value: 'FEMALE', text: 'FEMALE' },
  { value: 'OTHERS', text: 'OTHERS' },
]

const activeTab = ref('profile')

const updatePassword = () => {
  confirm('Are you sure you want to change password?').then((ok) => {
    if (ok) {
      changePassword()
    }
  })
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
  const requestApi: ChangePassword = {
    password: securityForm.value.currentPassword,
    newPassword: securityForm.value.newPassword,
  }
  const data = await authStore.updatePassword(requestApi)
  if (data) {
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
}
const updateNotifications = () => {
  // Handle notification settings update
  console.log('Notifications updated:', notificationSettings.value)
}
</script>

<template>
  <div class="profile-page">
    <div class="profile-header">
      <div class="header-content">
        <div class="avatar-section">
          <va-avatar :src="userApi.user.avatarUrl || '/defaultAvatar.png'" size="large" />
          <va-button preset="secondary" size="small"> Change Photo </va-button>
        </div>
        <div class="profile-info">
          <h1 class="profile-name">{{ userApi?.user.name || 'ADMIN' }}</h1>
          <p class="profile-title">MEDSCHED • Administrator</p>
        </div>
      </div>
    </div>

    <div class="profile-tabs">
      <va-tabs v-model="activeTab">
        <va-tab name="profile">
          <va-icon name="person" />
          Profile
        </va-tab>
        <va-tab name="security">
          <va-icon name="security" />
          Security
        </va-tab>
        <va-tab name="notifications">
          <va-icon name="notifications" />
          Notifications
        </va-tab>
      </va-tabs>
    </div>

    <div class="tab-content">
      <!-- Profile Tab -->
      <div v-if="activeTab === 'profile'" class="profile-section">
        <va-card>
          <va-card-title>Personal Information</va-card-title>
          <va-card-content>
            <form @submit.prevent="showConfirmChangeInfo">
              <div class="form-row">
                <div class="form-group">
                  <va-input
                    v-model="userApi.user.email"
                    type="email"
                    label="Email"
                    :disabled="true"
                  />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <va-input v-model="userApi.user.name" label="Name" required />
                </div>
                <div class="form-group">
                  <va-input v-model="userApi.user.phone" label="Phone" />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <va-input v-model="userApi.user.address" label="Address" required />
                </div>
                <div class="form-group">
                  <va-input v-model="userApi.user.role" label="Role" :disabled="true" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <va-input v-model="userApi.user.age" type="textarea" label="Age" rows="4" />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <va-select
                    v-model="userApi.user.gender"
                    label="Gender"
                    :options="genders"
                    text-by="text"
                    value-by="value"
                  />
                </div>
                <div class="form-group">
                  <va-input
                    v-model="userApi.user.dob"
                    label="Date of birth"
                    type="date"
                    text-by="text"
                    value-by="value"
                  />
                </div>
              </div>

              <div class="form-actions">
                <va-button preset="primary" type="submit"> Save Changes </va-button>
              </div>
            </form>
          </va-card-content>
        </va-card>
      </div>

      <!-- Security Tab -->
      <div v-if="activeTab === 'security'" class="security-section">
        <va-card>
          <va-card-title>Change Password</va-card-title>
          <va-card-content>
            <form @submit.prevent="updatePassword">
              <div class="form-group">
                <va-input
                  v-model="securityForm.currentPassword"
                  type="password"
                  label="Current Password"
                  required
                />
              </div>

              <div class="form-group">
                <va-input
                  v-model="securityForm.newPassword"
                  type="password"
                  label="New Password"
                  required
                />
              </div>

              <div class="form-group">
                <va-input
                  v-model="securityForm.confirmPassword"
                  type="password"
                  label="Confirm New Password"
                  required
                />
              </div>

              <div class="form-actions">
                <va-button preset="primary" type="submit"> Update Password </va-button>
              </div>
            </form>
          </va-card-content>
        </va-card>
      </div>

      <!-- Notifications Tab -->
      <div v-if="activeTab === 'notifications'" class="notifications-section">
        <va-card>
          <va-card-title>Notification Preferences</va-card-title>
          <va-card-content>
            <div class="notification-settings">
              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-title">Email Notifications</h3>
                  <p class="setting-description">Receive notifications via email</p>
                </div>
                <va-switch v-model="notificationSettings.emailNotifications" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-title">Task Assignments</h3>
                  <p class="setting-description">Get notified when you're assigned to a task</p>
                </div>
                <va-switch v-model="notificationSettings.taskAssignments" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-title">Team Updates</h3>
                  <p class="setting-description">Receive updates about team activities</p>
                </div>
                <va-switch v-model="notificationSettings.teamUpdates" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-title">System Alerts</h3>
                  <p class="setting-description">Get important system notifications</p>
                </div>
                <va-switch v-model="notificationSettings.systemAlerts" />
              </div>

              <div class="setting-item">
                <div class="setting-info">
                  <h3 class="setting-title">Weekly Digest</h3>
                  <p class="setting-description">Receive a weekly summary of activities</p>
                </div>
                <va-switch v-model="notificationSettings.weeklyDigest" />
              </div>
            </div>

            <div class="form-actions">
              <va-button preset="primary" @click="updateNotifications">
                Save Preferences
              </va-button>
            </div>
          </va-card-content>
        </va-card>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.profile-page {
  .profile-header {
    background-color: var(--va-background-element);
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 1.5rem;

    .header-content {
      display: flex;
      align-items: center;
      gap: 2rem;
    }

    .avatar-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      .profile-avatar {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        object-fit: cover;
      }
    }

    .profile-info {
      .profile-name {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0 0 0.5rem;
      }

      .profile-title {
        color: var(--va-text-secondary);
        margin: 0;
      }
    }
  }

  .profile-tabs {
    margin-bottom: 1.5rem;
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

  .form-actions {
    margin-top: 1.5rem;
  }

  .skills-container {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .skill-chip {
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }
  }

  .notification-settings {
    .setting-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 0;
      border-bottom: 1px solid var(--va-border);

      &:last-child {
        border-bottom: none;
      }

      .setting-info {
        .setting-title {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 0.25rem;
        }

        .setting-description {
          font-size: 0.875rem;
          color: var(--va-text-secondary);
          margin: 0;
        }
      }
    }
  }

  .activity-timeline {
    .activity-item {
      display: flex;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--va-border);

      &:last-child {
        border-bottom: none;
      }

      .activity-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: var(--va-primary);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .activity-content {
        flex: 1;

        .activity-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;

          .activity-action {
            font-weight: 500;
          }

          .activity-date {
            font-size: 0.875rem;
            color: var(--va-text-secondary);
          }
        }

        .activity-description {
          font-size: 0.875rem;
          color: var(--va-text-secondary);
          margin: 0;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .profile-page {
    .profile-header {
      .header-content {
        flex-direction: column;
        text-align: center;
      }
    }

    .form-row {
      flex-direction: column;
    }
  }
}
</style>
