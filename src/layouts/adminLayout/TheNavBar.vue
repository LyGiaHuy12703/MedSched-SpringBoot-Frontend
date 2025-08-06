```vue
<template>
  <header class="staff-header">
    <div class="header-left">
      <va-button
        preset="secondary"
        icon="menu"
        @click="$emit('toggle-sidebar')"
        aria-label="Toggle sidebar"
      />

      <va-input v-model="searchQuery" placeholder="Tìm kiếm..." class="search-input" clearable>
        <template #prependInner>
          <va-icon name="search" />
        </template>
      </va-input>
    </div>

    <div class="header-right">
      <va-dropdown placement="bottom-end">
        <template #anchor>
          <div class="user-profile">
            <va-avatar :src="user.avatarUrl" size="32px" />
            <span class="username">{{ user.name }}</span>
          </div>
        </template>
        <va-dropdown-content class="user-dropdown">
          <div class="user-info-full">
            <va-avatar :src="user.avatarUrl" size="large" />
            <div class="user-details">
              <div class="user-name-full">{{ user.name }}</div>
              <div class="user-email">{{ user.email }}</div>
            </div>
          </div>
          <va-list>
            <va-list-item @click="navigateToProfile">
              <va-list-item-section icon> <va-icon name="person" /> </va-list-item-section>
              <va-list-item-section>Hồ sơ của tôi</va-list-item-section>
            </va-list-item>
            <va-list-item @click="handleLogout">
              <va-list-item-section icon> <va-icon name="logout" /> </va-list-item-section>
              <va-list-item-section>Đăng xuất</va-list-item-section>
            </va-list-item>
          </va-list>
        </va-dropdown-content>
      </va-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

defineEmits(['toggle-sidebar'])

// --- STATE ---
const authStore = useAuthStore()
const router = useRouter()
const searchQuery = ref('')

// Dữ liệu giả lập cho thông báo
const notifications = ref([
  {
    id: 1,
    icon: 'task_alt',
    text: 'Công việc mới',
    time: '5 phút trước',
    color: 'success',
    unread: true,
  },
  {
    id: 2,
    icon: 'support_agent',
    text: 'Yêu cầu hỗ trợ',
    time: '2 giờ trước',
    color: 'info',
    unread: true,
  },
  {
    id: 3,
    icon: 'event_available',
    text: 'Họp team',
    time: 'Ngày mai',
    color: 'primary',
    unread: false,
  },
])

const unreadCount = computed(() => notifications.value.filter((n) => n.unread).length)

// Lấy thông tin người dùng từ store
const user = computed(
  () =>
    authStore.account?.user || {
      name: 'Admin',
      email: 'admin@medsched.com',
      avatarUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
)

// --- METHODS ---
const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const navigateToProfile = () => {
  router.push('/admin/profiles')
}

const markAllAsRead = () => {
  notifications.value.forEach((n) => (n.unread = false))
}
</script>

<style lang="scss" scoped>
.staff-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: var(--va-background-element);
  border-bottom: 1px solid var(--va-background-border);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 240px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;

  .username {
    font-weight: 500;
    color: var(--va-text-primary);
  }
}

.notification-dropdown,
.user-dropdown {
  background-color: var(--va-background-element);
  width: 300px;
  border-radius: 8px;
  box-shadow: var(--va-box-shadow);
  border: 1px solid var(--va-background-border);
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid var(--va-background-border);
}

.dropdown-content {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--va-background-border);

  &:last-child {
    border-bottom: none;
  }

  &.unread {
    background-color: rgba(var(--va-primary-rgb), 0.05);
  }

  .item-content {
    flex-grow: 1;
  }
  .item-text {
    font-size: 0.875rem;
  }
  .item-time {
    font-size: 0.75rem;
    color: var(--va-text-secondary);
  }
}

.user-info-full {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--va-background-border);

  .user-name-full {
    font-weight: 600;
  }
  .user-email {
    font-size: 0.875rem;
    color: var(--va-text-secondary);
  }
}

@media (max-width: 768px) {
  .staff-header {
    padding: 0 8px;
  }
  .search-input {
    display: none;
  }
}
</style>
```
