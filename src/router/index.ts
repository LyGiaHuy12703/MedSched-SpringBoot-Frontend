import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Import từng module
import adminRoutes from '@/router/admin.router'
import userRoutes from '@/router/users.router'
import staffRoutes from '@/router/staff.router'
import authRoutes from '@/router/auth.router'
import { useUserStore } from '@/stores/users.store'
import 'vue3-toastify/dist/index.css'
import { useModalStore } from '@/stores/modal.store'

const routes: RouteRecordRaw[] = [
  ...authRoutes,
  ...userRoutes,
  ...adminRoutes,
  ...staffRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  const modalStore = useModalStore()
  const userRole = userStore.role
  const isAuthenticated = userStore.isAuthenticated
  const allowedRoles = to.meta.allowedRoles as string[] | undefined

  // Kiểm tra các route bắt đầu bằng /admin
  if (to.path.startsWith('/admin')) {
    if (userRole === 'ADMIN') {
      return next() // Cho phép ADMIN truy cập
    }
    modalStore.showModal('Vui lòng đăng nhập với vai trò ADMIN để truy cập!')
    return next(false) // Hủy điều hướng
  }

  // Kiểm tra các route bắt đầu bằng /staff
  if (to.path.startsWith('/staff')) {
    if (userRole === 'STAFF') {
      return next() // Cho phép STAFF truy cập
    }
    modalStore.showModal('Vui lòng đăng nhập với vai trò STAFF để truy cập!')
    return next(false) // Hủy điều hướng
  }
  // Kiểm tra allowedRoles nếu có
  if (allowedRoles) {
    if (userRole && allowedRoles.includes(userRole)) {
      return next() // Cho phép truy cập nếu role hợp lệ
    } else {
      if (isAuthenticated) {
        if (userRole === 'ADMIN') {
          return next({ name: 'AdminDashboard' }) // Chuyển hướng đến AdminDashboard
        } else if (userRole === 'STAFF') {
          return next({ name: 'StaffDashboard' }) // Chuyển hướng đến StaffDashboard
        } else {
          modalStore.showModal('Vai trò của bạn không được phép truy cập trang này!')
          return next(false) // Hủy điều hướng
        }
      } else if (!isAuthenticated && !to.meta.requiresAuth) {
        return next()
      } else {
        // Người dùng chưa đăng nhập
        modalStore.showModal('Vui lòng đăng nhập để truy cập trang này!')
        return next(false) // Hủy điều hướng
      }
    }
  } else {
    next()
  }
})

export default router
