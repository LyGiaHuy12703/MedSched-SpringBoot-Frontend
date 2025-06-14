import type { RouteRecordRaw } from 'vue-router'

const userRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/users/HomePage.vue'),
    meta: {
      layout: 'Client',
      requiredAuth: false,
      // allowedRoles: ['PATIENT', null],
    },
  },
  {
    path: '/profiles',
    name: 'Profiles',
    component: () => import('@/views/users/UserProfile.vue'),
    meta: {
      layout: 'Client',
      allowedRoles: ['PATIENT', null],
    },
  },
  {
    path: '/find-doctor',
    name: 'FindDoctor',
    component: () => import('@/views/users/UserDoctor.vue'),
    meta: {
      layout: 'Client',
      requiredAuth: false,
      // allowedRoles: ['PATIENT', null],
    },
  },
  {
    path: '/bookings',
    name: 'Bookings',
    component: () => import('@/views/users/UserBooking.vue'),
    meta: {
      layout: 'Client',

      allowedRoles: ['PATIENT', null],
    },
  },
  {
    path: '/manage-bookings',
    name: 'ManageBookings',
    component: () => import('@/views/users/UserManagerBooking.vue'),
    meta: {
      layout: 'Client',
      allowedRoles: ['PATIENT', null],
    },
  },
  {
    path: '/medicines',
    name: 'Medicines',
    component: () => import('@/views/users/UserMedicines.vue'),
    meta: {
      layout: 'Client',
      requiredAuth: false,
      // allowedRoles: ['PATIENT', null],
    },
  },
]

export default userRoutes
