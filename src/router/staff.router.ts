import type { RouteRecordRaw } from 'vue-router'

const staffRoutes: RouteRecordRaw[] = [
  {
    path: '/staff',
    name: 'StaffDashboard',
    component: () => import('@/views/staff/Dashboard.vue'),
    meta: {
      layout: 'Staff',
      requiresAuth: true,
      allowedRoles: ['STAFF'],
    },
  },
  {
    path: '/staff/dashboard',
    name: 'StaffDashboard',
    component: () => import('@/views/staff/Dashboard.vue'),
    meta: {
      layout: 'Staff',
      requiresAuth: true,
      allowedRoles: ['STAFF'],
    },
  },
  {
    path: '/staff/schedules',
    name: 'StaffSchedule',
    component: () => import('@/views/staff/StaffSchedule.vue'),
    meta: {
      layout: 'Staff',
      requiresAuth: true,
      allowedRoles: ['STAFF'],
    },
  },
  {
    path: '/staff/appointments',
    name: 'StaffAppointments',
    component: () => import('@/views/staff/StaffAppointmentManage.vue'),
    meta: {
      layout: 'Staff',
      requiresAuth: true,
      allowedRoles: ['STAFF'],
    },
  },
  {
    path: '/staff/profiles',
    name: 'StaffProfiles',
    component: () => import('@/views/staff/StaffProfile.vue'),
    meta: {
      layout: 'Staff',
      requiresAuth: true,
      allowedRoles: ['STAFF'],
    },
  },
  // {
  //   path: '/staff',
  //   name: 'StaffDashboard',
  //   component: () => import('@/views/staff/Dashboard.vue'),
  //   meta: {
  //     layout: 'Staff',
  //     requiresAuth: true,
  //     allowedRoles: ['STAFF'],
  //   },
  // },
]

export default staffRoutes
