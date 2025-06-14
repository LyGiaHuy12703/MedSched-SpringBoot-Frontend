<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])

const notifications = ref([
  { id: 1, text: 'New user registered', time: '5 min ago' },
  { id: 2, text: 'Server error reported', time: '2 hours ago' },
  { id: 3, text: 'New order received', time: 'Yesterday' },
])

const searchQuery = ref('')
const showNotifications = ref(false)
const showUserMenu = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) showNotifications.value = false
}

const isDarkTheme = ref(false)

const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  // In a real app, would toggle the Vuestic theme here
}
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <va-button
        preset="secondary"
        icon="menu"
        size="small"
        flat
        class="sidebar-toggle"
        @click="$emit('toggle-sidebar')"
      />

      <div class="search-container">
        <va-input v-model="searchQuery" placeholder="Search..." class="search-input" size="small">
          <template #prepend>
            <va-icon name="search" />
          </template>
        </va-input>
      </div>
    </div>

    <div class="header-right">
      <va-button
        preset="secondary"
        icon="brightness_6"
        size="small"
        flat
        class="header-action"
        @click="toggleTheme"
      />

      <div class="notification-dropdown">
        <va-button
          preset="secondary"
          icon="notifications"
          size="small"
          flat
          class="header-action"
          @click="toggleNotifications"
        />

        <div v-if="showNotifications" class="dropdown-menu">
          <div class="dropdown-header">Notifications</div>
          <div class="dropdown-content">
            <div v-for="notification in notifications" :key="notification.id" class="dropdown-item">
              <div class="item-content">
                <div class="item-text">{{ notification.text }}</div>
                <div class="item-time">{{ notification.time }}</div>
              </div>
            </div>
          </div>
          <div class="dropdown-footer">
            <va-button preset="primary" size="small" text block> View all notifications </va-button>
          </div>
        </div>
      </div>

      <div class="user-dropdown">
        <div class="user-profile" @click="toggleUserMenu">
          <va-avatar
            :src="authStore.account?.user.avatarUrl || '/defaultAvatar.png'"
            size="small"
          />
          <span class="username">{{ authStore?.account?.user.name }}</span>
        </div>

        <div v-if="showUserMenu" class="dropdown-menu">
          <div class="dropdown-header">User Menu</div>
          <div class="dropdown-content">
            <div class="dropdown-item">
              <va-icon name="person" />
              <span>My Profile</span>
            </div>
            <div class="dropdown-item">
              <va-icon name="settings" />
              <span>Account Settings</span>
            </div>
            <div class="dropdown-item">
              <va-icon name="help" />
              <span>Help Center</span>
            </div>
          </div>
          <div class="dropdown-footer">
            <va-button preset="secondary" size="small" icon="logout" @click="handleLogout" block>
              Logout
            </va-button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.app-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--va-background-element);
  border-bottom: 1px solid var(--va-border);
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  margin-right: 16px;
}

.search-container {
  display: flex;
  align-items: center;

  .search-input {
    width: 240px;
  }
}

.header-action {
  position: relative;
  margin-left: 8px;
}

.notification-dropdown,
.user-dropdown {
  position: relative;
  margin-left: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 24px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: var(--va-background);
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    object-fit: cover;
  }

  .username {
    margin-left: 8px;
    font-weight: 500;
  }
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background-color: var(--va-background-element);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
}

.dropdown-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--va-border);
  font-weight: 600;
}

.dropdown-content {
  max-height: 320px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;

  &:hover {
    background-color: var(--va-background);
  }

  .va-icon {
    margin-right: 12px;
    color: var(--va-primary);
  }

  .item-content {
    width: 100%;
  }

  .item-text {
    font-size: 0.875rem;
    margin-bottom: 4px;
  }

  .item-time {
    font-size: 0.75rem;
    color: var(--va-text-secondary);
  }
}

.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--va-border);
}

@media (max-width: 768px) {
  .search-container {
    display: none;
  }

  .user-profile {
    .username {
      display: none;
    }
  }
}
</style>
