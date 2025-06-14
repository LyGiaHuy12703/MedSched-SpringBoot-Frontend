import type { RouteRecordRaw } from 'vue-router'

const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('@/views/admin/AdminDashboard.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/users',
    name: 'AdminUsers',
    component: () => import('@/views/admin/AdminUsers.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/users/addStaff',
    name: 'AdminUsersAddStaff',
    component: () => import('@/components/staff/AddStaffPage.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/users/editStaff/:id',
    name: 'AdminUsersEditStaff',
    component: () => import('@/components/staff/EditStaffPage.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/departments',
    name: 'AdminDepartments',
    component: () => import('@/views/admin/AdminDepartment.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/medicines',
    name: 'AdminMedicines',
    component: () => import('@/views/admin/AdminMedicine.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/permissions',
    name: 'AdminPermissions',
    component: () => import('@admin/AdminPermissions.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/roles',
    name: 'AdminRoles',
    component: () => import('@admin/AdminRoles.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/tasks',
    name: 'AdminTasks',
    component: () => import('@admin/AdminTasks.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/services',
    name: 'AdminServices',
    component: () => import('@admin/AdminService.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
  {
    path: '/admin/profiles',
    name: 'AdminProfiles',
    component: () => import('@/views/admin/AdminProfiles.vue'),
    meta: {
      layout: 'Admin',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
]

export default adminRoutes
