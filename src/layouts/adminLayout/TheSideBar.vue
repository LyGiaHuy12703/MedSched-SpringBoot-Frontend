```vue
<template>
  <aside class="staff-sidebar" :class="sidebarClass">
    <div v-if="isVisible" class="sidebar-overlay" @click="emit('close')"></div>

    <div class="sidebar-content">
      <!-- Header -->
      <div class="sidebar-header">
        <div class="logo-container">
          <img
            src="https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png"
            alt="Logo"
            class="logo-image"
          />
          <span v-if="!isMinimized" class="brand-name">MEDSCHED</span>
        </div>
      </div>

      <!-- Menu -->
      <div class="sidebar-menu">
        <template v-for="(group, index) in menuItems" :key="index">
          <!-- Tiêu đề nhóm với nút thu gọn/mở rộng -->
          <div
            v-if="!isMinimized && group.title"
            class="menu-group-title"
            @click="toggleGroup(group.title)"
            :class="{ expanded: expandedGroups[group.title] }"
          >
            {{ group.title }}
            <va-icon
              :name="expandedGroups[group.title] ? 'expand_less' : 'expand_more'"
              class="expand-icon"
            />
          </div>

          <!-- Các mục trong nhóm với hiệu ứng thu gọn -->
          <transition name="slide">
            <div v-show="expandedGroups[group.title]" class="menu-group-items">
              <div v-for="item in group.items" :key="item.path">
                <va-tooltip :disabled="!isMinimized" :label="item.name" placement="right">
                  <div
                    class="menu-item"
                    :class="{ active: activeMenuItem === item.path }"
                    @click="navigateTo(item.path)"
                  >
                    <va-icon :name="item.icon" />
                    <span class="menu-item-text" v-if="!isMinimized">{{ item.name }}</span>
                  </div>
                </va-tooltip>
              </div>
            </div>
          </transition>
        </template>
      </div>

      <!-- Footer - User Profile -->
      <div class="sidebar-footer">
        <div class="nav-item" @click="handleLogout" :title="isMinimized ? 'Đăng xuất' : ''">
          <va-icon name="logout" class="nav-icon" />
          <span class="nav-text">Đăng xuất</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  isMinimized: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const router = useRouter()
// Giả sử path ban đầu được lấy từ router để active đúng item khi reload trang
const initialPath = router.currentRoute.value.path.split('/admin/')[1] || ''
const activeMenuItem = ref(initialPath)
const expandedGroups = ref<Record<string, boolean>>({
  'Tổng quan': true,
  'Quản lý': false,
  'Hệ thống': false,
  'Tài khoản': false,
})

const auth = useAuthStore()
// Lấy thông tin user từ store, giả sử có các trường name, role, avatar
const user = computed(
  () =>
    auth.user || {
      name: 'Admin',
      role: 'Quản trị viên',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    },
)

const handleLogout = async () => {
  await auth.logout()
  router.push('/login')
}

const navigateTo = (path: string) => {
  activeMenuItem.value = path
  router.push(`/admin/${path}`)

  // Tự động đóng sidebar trên mobile khi click
  if (window.innerWidth < 768) {
    emit('close')
  }
}

const toggleGroup = (groupTitle: string) => {
  expandedGroups.value[groupTitle] = !expandedGroups.value[groupTitle]
}

// Cấu trúc lại menu để hỗ trợ phân nhóm
const menuItems = [
  {
    title: 'Tổng quan',
    items: [{ name: 'Dashboard', icon: 'dashboard', path: '' }],
  },
  {
    title: 'Quản lý',
    items: [
      { name: 'Bệnh nhân & Nhân viên', icon: 'people', path: 'users' },
      { name: 'Khoa/Phòng', icon: 'business', path: 'departments' },
      { name: 'Dịch vụ', icon: 'medical_services', path: 'services' },
      { name: 'Danh mục thuốc', icon: 'local_pharmacy', path: 'medicines' },
    ],
  },
  {
    title: 'Hệ thống',
    items: [
      { name: 'Vai trò (Roles)', icon: 'shield', path: 'roles' },
      { name: 'Quyền hạn (Permissions)', icon: 'key', path: 'permissions' },
      { name: 'Công việc', icon: 'assignment', path: 'tasks' },
    ],
  },
  {
    title: 'Tài khoản',
    items: [{ name: 'Hồ sơ cá nhân', icon: 'person', path: 'profiles' }],
  },
]

const sidebarClass = computed(() => ({
  'sidebar-minimized': props.isMinimized,
  'sidebar-visible': props.isVisible,
}))
</script>

<style lang="scss" scoped>
// Biến màu và kích thước để dễ quản lý
$sidebar-width: 260px;
$sidebar-width-minimized: 72px;
$sidebar-header-height: 64px;
$primary-color: var(--va-primary);
$text-color: var(--va-text-primary);
$text-color-secondary: var(--va-text-secondary);
$border-color: var(--va-background-border);
$hover-bg-color: rgba(var(--va-primary-rgb), 0.1);

.staff-sidebar {
  width: $sidebar-width;
  background-color: var(--va-background-element);
  border-right: 1px solid $border-color;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1000;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
}

.sidebar-header {
  height: $sidebar-header-height;
  display: flex;
  align-items: center;
  padding: 0 20px;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;

  .logo-image {
    height: 36px;
    width: auto;
    transition: all 0.3s ease;
  }

  .brand-name {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-color;
    white-space: nowrap;
  }
}

.sidebar-menu {
  flex-grow: 1;
  padding: 8px 0;
}

.menu-group-title {
  padding: 12px 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $text-color-secondary;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $hover-bg-color;
  }

  &.expanded {
    background-color: $hover-bg-color;
  }

  .expand-icon {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }
}

.menu-group-items {
  margin-left: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: $text-color;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  margin: 4px 12px;
  border-radius: 8px;
  position: relative;
  white-space: nowrap;

  .va-icon {
    margin-right: 16px;
    font-size: 1.3rem;
    transition: margin 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    background-color: $hover-bg-color;
  }

  &.active {
    background-color: $hover-bg-color;
    color: $primary-color;
    font-weight: 600;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 70%;
      width: 4px;
      background-color: $primary-color;
      border-radius: 0 4px 4px 0;
    }
  }
}

.sidebar-footer {
  padding: 16px;
  margin-top: auto;
  flex-shrink: 0;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 8px;

  .user-info {
    flex-grow: 1;
    overflow: hidden;

    .user-name {
      font-weight: 600;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
    .user-role {
      font-size: 0.8rem;
      color: $text-color-secondary;
      white-space: nowrap;
    }
  }

  .logout-button {
    margin-left: auto;
  }
}

.logout-minimized {
  justify-content: center;
}

// Chế độ thu gọn
.sidebar-minimized {
  width: $sidebar-width-minimized;

  .brand-name {
    display: none;
  }

  .menu-item {
    justify-content: center;
    padding: 12px;

    .va-icon {
      margin-right: 0;
    }
  }

  .sidebar-user {
    justify-content: center;
    padding: 12px 0;
  }

  .menu-group-title {
    justify-content: center;
    .expand-icon {
      display: none;
    }
  }
}

// Transition cho accordion
.slide-enter-active,
.slide-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 300px; // Có thể điều chỉnh theo số lượng item
  opacity: 1;
}

// Responsive cho mobile
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}
.nav-item {
  cursor: pointer;
}
.nav-item:hover {
  background-color: $hover-bg-color;
}
@media (max-width: 767px) {
  .staff-sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: -($sidebar-width + 10px);
    transition: left 0.3s ease;
    z-index: 1;

    &.sidebar-visible {
      left: 0;

      .sidebar-overlay {
        display: block;
      }
    }
  }
}
</style>
