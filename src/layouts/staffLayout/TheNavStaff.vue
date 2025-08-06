<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()

// Bọc onMounted trong một hàm async
onMounted(async () => {
  try {
    // Dùng 'await' để chờ cho hàm getInfo() thực thi xong
    await authStore.getInfo()

    // Bây giờ, authStore.isAuthenticated đã được cập nhật chính xác
    if (!authStore.isAuthenticated) {
      router.push('/login')
    }
  } catch (error) {
    // Nếu getInfo() thất bại (ví dụ: token hết hạn), cũng nên chuyển về trang login
    console.error('Failed to get user info:', error)
    router.push('/login')
  }
})

const showNotifications = ref(false)
const showUserMenu = ref(false)

// Toggle menu người dùng
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  if (showUserMenu.value) showNotifications.value = false
}

// Đăng xuất
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}
</script>

<template>
  <header class="staff-header">
    <div class="header-content">
      <!-- BÊN TRÁI: Sidebar Toggle & Breadcrumbs -->
      <div class="header-left"></div>

      <!-- BÊN PHẢI: Actions, Notifications, Theme Toggle, User Menu -->
      <div class="header-right">
        <!-- Menu người dùng -->
        <div class="user-dropdown">
          <div class="user-profile" @click="toggleUserMenu">
            <va-avatar
              :src="authStore.account?.user.avatarUrl || '/defaultAvatar.png'"
              size="small"
            />
            <span class="username">{{ authStore.account?.user.name }}</span>
          </div>
          <div v-if="showUserMenu" class="dropdown-menu">
            <div class="dropdown-header">
              <div class="font-semibold">{{ authStore.account?.user.name || 'Admin User' }}</div>
              <div class="text-xs text-[var(--va-text-secondary)]">
                {{ authStore.account?.role.name || 'Administrator' }}
              </div>
            </div>
            <div class="dropdown-content">
              <div class="dropdown-item" @click="$router.push('/staff/profiles')">
                <va-icon name="person" />
                <span>Hồ sơ</span>
              </div>
              <div class="dropdown-item" @click="$router.push('/staff/schedules')">
                <va-icon name="schedule" />
                <span>Lịch làm việc</span>
              </div>
              <div class="dropdown-item" @click="$router.push('/staff/help')">
                <va-icon name="help" />
                <span>Trợ giúp</span>
              </div>
            </div>
            <div class="dropdown-footer">
              <va-button preset="secondary" size="small" icon="logout" block @click="handleLogout">
                Đăng xuất
              </va-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
.staff-header {
  height: 64px;
  background-color: var(--va-background-element);
  border-bottom: 1px solid var(--va-background-border);
  position: sticky;
  top: 0;
  z-index: 99;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 16px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  @media (min-width: 768px) {
    display: none;
  }
}

.breadcrumbs {
  display: none;
  align-items: center;
  gap: 8px;
  color: var(--va-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;

  @media (min-width: 768px) {
    display: flex;
  }
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;

  &.active {
    color: var(--va-text-primary);
    font-weight: 600;
  }
}

.search-container {
  display: none;

  @media (min-width: 768px) {
    display: flex;
    align-items: center;
  }

  .search-input {
    width: 240px;
  }
}

.header-action,
.context-action-btn {
  position: relative;
}

.context-action-btn {
  @media (max-width: 992px) {
    .action-text {
      display: none;
    }
    border-radius: 50%;
    width: 36px;
    height: 36px;
  }
}

.notification-dropdown,
.user-dropdown {
  position: relative;
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

  .username {
    margin-left: 8px;
    font-weight: 500;

    @media (max-width: 768px) {
      display: none;
    }
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
  border-bottom: 1px solid var(--va-background-border);
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
  gap: 12px;

  &:hover {
    background-color: var(--va-background);
  }

  .va-icon {
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
  border-top: 1px solid var(--va-background-border);
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 12px;
  }

  .header-left,
  .header-right {
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .context-action-btn,
  .header-action {
    width: 32px;
    height: 32px;
  }
}
</style>
