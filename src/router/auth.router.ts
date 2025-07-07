import type { RouteRecordRaw } from 'vue-router'

const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginPage.vue'),
    meta: {
      layout: 'Auth',
      requiresAuth: false,
    },
  },
  {
    path: '/auth/receive-tokens',
    name: 'ReceiveToken',
    component: () => import('@/views/auth/ReceiveTokens.vue'),
    meta: {
      layout: 'Auth',
      requiresAuth: false,
    },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/auth/RegisterPage.vue'),
    meta: {
      layout: 'Auth',
      requiresAuth: false,
    },
  },
]

export default authRoutes
