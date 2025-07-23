<script setup lang="ts">
import { useUserStore } from '@/stores/users.store'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isMinimized: {
    type: Boolean,
    default: false,
  },
  isVisible: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])
const userStore = useUserStore()
const router = useRouter()
const activeMenuItem = ref('dashboard')

const navigateTo = (path: string) => {
  activeMenuItem.value = path
  router.push(`/staff/${path}`)

  if (window.innerWidth < 768) {
    emit('close')
  }
}

const menuItems = [
  {
    name: 'Trang chủ',
    icon: 'dashboard',
    path: 'dashboard',
  },
  {
    name: 'Lịch trực',
    icon: 'calendar_month', // Icon rõ ràng hơn cho lịch trình
    path: 'schedules',
    requiresPermission: ['GET_DOCTOR_SHIFT'],
  },
  {
    name: 'Thông tin hóa đơn',
    icon: 'attach_money', // Icon rõ ràng hơn cho viện phí
    path: 'fees',
    // requiresPermission: ['GET_INVOICES'],
  },
  {
    name: 'Danh sách bệnh nhân',
    icon: 'people', // Icon rõ ràng hơn cho danh sách bệnh nhân
    path: 'patients',
    requiresPermission: ['GET_APPOINTMENT'],
  },
  {
    name: 'Lịch hẹn khám bệnh',
    icon: 'assignment_ind', // Icon rõ ràng hơn cho cuộc hẹn
    path: 'appointments',
    requiresPermission: ['GET_APPOINTMENT'],
  },
  {
    name: 'Cấp phát thuốc', // Tên mục mới
    icon: 'medication', // Icon phù hợp
    path: 'medicine-dispense', // path khớp với endpoint bạn cung cấp
    requiresPermission: ['POST_INVENTORY', 'POST_DISPENSE'],
  },
  {
    name: 'Cá nhân',
    icon: 'person',
    path: 'profiles',
    requiresPermission: ['GET_AUTH', 'PUT_AUTH'],
  },
]
const filteredMenuItems = computed(() => {
  return menuItems.filter((item) => {
    // Nếu mục không yêu cầu quyền, luôn hiển thị
    if (!item.requiresPermission || item.requiresPermission.length === 0) {
      return true
    }
    console.log(
      'Checking permissions for:',
      item.requiresPermission.some((permission) => userStore.hasPermission(permission)),
    )
    return item.requiresPermission.some((permission) => userStore.hasPermission(permission))
  })
})
const sidebarClass = computed(() => {
  return {
    'sidebar-minimized': props.isMinimized,
    'sidebar-visible': props.isVisible,
  }
})
</script>

<template>
  <aside class="staff-sidebar" :class="sidebarClass">
    <div v-if="isVisible" class="sidebar-overlay" @click="emit('close')"></div>

    <div class="sidebar-content">
      <div class="sidebar-header">
        <div class="logo-container">
          <img
            src="https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png"
            alt="Logo"
            class="logo-image"
            v-if="!isMinimized"
          />
          <img
            src="https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png"
            alt="Logo"
            class="logo-mini"
            v-else
          />
          <div class="mx-2">MedSched Staff</div>
        </div>
      </div>

      <div class="sidebar-menu">
        <div
          v-for="item in filteredMenuItems"
          :key="item.path"
          class="menu-item"
          :class="{ active: activeMenuItem === item.path }"
          @click="navigateTo(item.path)"
        >
          <va-icon :name="item.icon" />
          <span class="menu-item-text" v-if="!isMinimized">{{ item.name }}</span>
        </div>
      </div>

      <div class="sidebar-footer">
        <div class="menu-item" @click="navigateTo('logout')">
          <va-icon name="logout" />
          <span class="menu-item-text" v-if="!isMinimized">Đăng xuất</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.staff-sidebar {
  width: 250px;
  background-color: var(--va-background-element);
  border-right: 1px solid var(--va-border);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--va-border);
}

.logo-container {
  display: flex;
  align-items: center;

  .logo-image {
    height: 32px;
    width: auto;
  }

  .logo-mini {
    height: 32px;
    width: 32px;
  }
}

.sidebar-menu {
  flex: 1;
  padding: 16px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: var(--va-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 8px;
  margin: 4px 8px;

  &:hover {
    background-color: rgba(var(--va-primary-rgb), 0.1);
  }

  &.active {
    background-color: var(--va-primary);
    color: white;
  }

  .va-icon {
    margin-right: 16px;
    font-size: 1.25rem;
  }
}

.sidebar-footer {
  border-top: 1px solid var(--va-border);
  padding: 16px 0;
}

.sidebar-minimized {
  width: 64px;

  .menu-item {
    justify-content: center;
    padding: 12px;

    .va-icon {
      margin-right: 0;
    }
  }
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

@media (max-width: 767px) {
  .staff-sidebar {
    position: fixed;
    left: -250px;

    &.sidebar-visible {
      left: 0;

      .sidebar-overlay {
        display: block;
      }
    }
  }
}
</style>
