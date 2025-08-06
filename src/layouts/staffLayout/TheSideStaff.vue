<template>
  <aside class="staff-sidebar" :class="sidebarClass">
    <div v-if="isVisible" class="sidebar-overlay" @click="emit('close')"></div>
    <div class="sidebar-inner">
      <div class="sidebar-header">
        <img
          src="https://cdn.pixabay.com/photo/2017/01/31/13/14/animal-2023924_640.png"
          alt="Logo"
          class="logo"
        />
        <span class="logo-text">MedSched</span>
      </div>

      <nav class="sidebar-nav">
        <div v-for="group in filteredMenuGroups" :key="group.title" class="nav-group">
          <h3 class="group-title">{{ group.title }}</h3>
          <ul>
            <li
              v-for="item in group.items"
              :key="item.path"
              class="nav-item"
              :class="{ active: activeMenuItem === item.path, disabled: item.isDisabled }"
              @click="!item.isDisabled && navigateTo(item.path)"
              :title="isMinimized ? item.name : ''"
            >
              <va-icon :name="item.icon" class="nav-icon" />
              <span class="nav-text">{{ item.name }}</span>
            </li>
          </ul>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="nav-item" @click="navigateTo('logout')" :title="isMinimized ? 'Đăng xuất' : ''">
          <va-icon name="logout" class="nav-icon" />
          <span class="nav-text">Đăng xuất</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/users.store'
import { useScheduleStore } from '@/stores/schedule.store'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storeToRefs } from 'pinia' // <-- Import

const props = defineProps({
  isMinimized: { type: Boolean, default: false },
  isVisible: { type: Boolean, default: true },
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const scheduleStore = useScheduleStore()

// SỬ DỤNG storeToRefs ĐỂ LẤY STATE REACTIVE
const { assignments } = storeToRefs(scheduleStore)

// Đồng hồ reactive, cập nhật mỗi giây
const currentTime = ref(new Date())
let timerId: number | undefined

const activeMenuItem = ref(route.path.split('/').pop() || 'dashboard')

watch(
  () => route.path,
  (newPath) => {
    activeMenuItem.value = newPath.split('/').pop() || 'dashboard'
  },
)

const parseDateTime = (timeString: string, dayWork: string): Date => {
  if (!timeString || !dayWork) return new Date(NaN)
  const isoString = `${dayWork}T${timeString}` // Giả sử thời gian từ DB là giờ địa phương
  return new Date(isoString)
}

// LOGIC ĐÃ ĐƯỢC CẬP NHẬT ĐỂ DÙNG `assignments`
const isInCurrentSchedule = computed(() => {
  const now = currentTime.value // Phụ thuộc vào đồng hồ để tính toán lại
  if (!assignments.value || assignments.value.length === 0) {
    return false
  }

  // Chỉ cần tìm một phân công hợp lệ là đủ
  return assignments.value.some((assignment) => {
    const startTime = parseDateTime(
      assignment.doctorShift.startTime,
      assignment.doctorShift.dayWork,
    )
    const endTime = parseDateTime(assignment.doctorShift.endTime, assignment.doctorShift.dayWork)

    // Trạng thái IN_PROGRESS đã được backend tính toán
    // Logic của frontend chỉ cần kiểm tra trạng thái này là đủ và chính xác nhất
    if (
      assignment.status === 'IN_PROGRESS' &&
      !isNaN(startTime.getTime()) &&
      !isNaN(endTime.getTime())
    ) {
      // Thêm kiểm tra thời gian để chắc chắn (phòng trường hợp job backend bị trễ)
      return startTime <= now && now <= endTime
    }
    return false
  })
})

const navigateTo = (path: string) => {
  if (path === 'logout') {
    authStore.logout()
    router.push('/login')
    return
  }
  router.push(`/staff/${path}`)
  if (window.innerWidth < 768) {
    emit('close')
  }
}

// Phân nhóm menu items (giữ nguyên)
const menuGroups = [
  {
    title: 'CHÍNH',
    items: [
      { name: 'Trang chủ', icon: 'space_dashboard', path: 'dashboard' },
      {
        name: 'Lịch trực của tôi',
        icon: 'event_note',
        path: 'schedules',
        requiresPermission: ['GET_SCHEDULE_OF_STAFF'],
      },
    ],
  },
  {
    title: 'QUẢN LÝ',
    items: [
      {
        name: 'Lịch hẹn của tôi',
        icon: 'book_online',
        path: 'appointments',
        requiresPermission: ['GET_ALL_APPOINTMENTS_STAFF'],
      },
      {
        name: 'Bệnh nhân',
        icon: 'groups',
        path: 'patients',
        requiresPermission: ['GET_ALL_APPOINTMENTS'],
      },
      {
        name: 'Hóa đơn',
        icon: 'request_quote',
        path: 'fees',
        requiresPermission: ['GET_ALL_INVOICES'],
      },
      {
        name: 'Đơn thuốc',
        icon: 'vaccines',
        path: 'medicine-dispense',
        requiresPermission: ['GET_MEDICAL_RECORDS'],
      },
    ],
  },
  {
    title: 'TÀI KHOẢN',
    items: [
      {
        name: 'Cá nhân',
        icon: 'account_circle',
        path: 'profiles',
        requiresPermission: ['GET_AUTH', 'PUT_AUTH'],
      },
    ],
  },
]

const filteredMenuGroups = computed(() => {
  const isCurrentlyWorking = isInCurrentSchedule.value
  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => {
          if (!item.requiresPermission || item.requiresPermission.length === 0) return true
          return item.requiresPermission.some((p) => userStore.hasPermission(p))
        })
        .map((item) => ({
          ...item,
          isDisabled: group.title === 'QUẢN LÝ' && !isCurrentlyWorking,
        })),
    }))
    .filter((group) => group.items.length > 0)
})

const sidebarClass = computed(() => ({
  'is-minimized': props.isMinimized,
  'is-visible': props.isVisible,
}))

// --- LIFECYCLE HOOKS ---
onMounted(async () => {
  // Khởi động đồng hồ
  timerId = window.setInterval(() => {
    currentTime.value = new Date()
  }, 1000)

  try {
    // ** THAY ĐỔI QUAN TRỌNG: GỌI API assignments MỚI **
    // Chúng ta chỉ cần lấy các ca APPROVED và IN_PROGRESS để xác định trạng thái
    // Tuy nhiên, để đơn giản, có thể fetch tất cả và để logic computed xử lý.
    await scheduleStore.fetchAssignments({ page: 0, size: 1000 })
  } catch (error) {
    console.error('Lỗi khi tải danh sách phân công ban đầu:', error)
  }
})

onUnmounted(() => {
  if (timerId) {
    clearInterval(timerId)
  }
})
</script>
<style lang="scss" scoped>
.staff-sidebar {
  width: 250px;
  background-color: var(--va-background-element);
  height: 100vh;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 100;
  border-right: 1px solid var(--va-background-border);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 12px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 8px;
  flex-shrink: 0;
  .logo {
    height: 38px;
    width: 38px;
  }
  .logo-text {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--va-primary);
    white-space: nowrap;
    opacity: 1;
    transition:
      opacity 0.2s ease,
      transform 0.3s ease;
  }
}

.sidebar-nav {
  flex-grow: 1;
  overflow-y: auto;
  padding: 8px 0;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: var(--va-background-secondary);
    border-radius: 4px;
  }
}

.nav-group {
  margin-bottom: 16px;
}

.group-title {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--va-text-secondary);
  text-transform: uppercase;
  padding: 8px 8px;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s ease;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--va-text-primary);
  transition: all 0.2s ease;
  overflow: hidden;
  position: relative;

  &:hover:not(.disabled) {
    background-color: var(--va-background-border);
    color: var(--va-text-primary);
    .nav-icon {
      color: var(--va-text-secondary);
    }
  }

  &.active {
    background-color: var(--va-primary);
    color: var(--va-on-primary);
    font-weight: 500;
    .nav-icon {
      color: var(--va-on-primary);
    }
  }

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .nav-icon {
    font-size: 1.5rem;
    margin-right: 16px;
    transition: margin 0.3s ease;
    color: var(--va-text-secondary);
  }

  .nav-text {
    white-space: nowrap;
    opacity: 1;
    transition: opacity 0.2s 0.1s ease;
  }
}

.sidebar-footer {
  padding: 16px 0;
  margin-top: auto;
  border-top: 1px solid var(--va-background-border);
}

// Minimized State
.is-minimized {
  width: 80px;

  .logo-text,
  .group-title,
  .nav-text {
    opacity: 0;
    pointer-events: none;
    width: 0;
  }
  .sidebar-header {
    justify-content: center;
  }
  .nav-item {
    justify-content: center;
    padding: 12px;
  }
  .nav-icon {
    margin-right: 0;
  }
}

// Mobile Responsive
@media (max-width: 767px) {
  .staff-sidebar {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    &.is-visible {
      transform: translateX(0);
    }
  }
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
  }
}
</style>
