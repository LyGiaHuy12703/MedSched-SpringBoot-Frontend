import { defineStore } from 'pinia'
import adminService from '../services/admin.service'
import type { DataUser, DataUserCreate, DataUserUpdate } from '../interfaces/admin.interfaces'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    users: [] as DataUser[],
    user: null,
  }),
  getters: {
    getUsers: (state) => state.users,
    getUser: (state) => state.user,
    getUserById: (state) => (id: string) => state.users.find((user) => user.id === id),
    getUserByEmail: (state) => (email: string) => state.users.find((user) => user.email === email),
  },
  actions: {
    async fetchUsers() {
      try {
        const response = await adminService.getAllUsers()
        this.users = response.data.result
      } catch (error) {
        console.error('Error fetching users:', error)
      }
    },
    async fetchUserById(id: string) {
      try {
        const response = await adminService.getUserById(id)
        this.user = response.data
      } catch (error) {
        console.error('Error fetching user by ID:', error)
      }
    },
    async createUser(data: DataUserCreate) {
      try {
        const response = await adminService.createUser(data)
        this.users.push(response.data)
      } catch (error) {
        console.error('Error creating user:', error)
      }
    },
    async updateUser(id: string, data: DataUserUpdate) {
      try {
        const response = await adminService.updateUser(id, data)
        const index = this.users.findIndex((user) => user.id === id)
        if (index !== -1) {
          this.users[index] = response.data
        }
      } catch (error) {
        console.error('Error updating user:', error)
      }
    },
    async deleteUser(id: string) {
      try {
        await adminService.deleteUser(id)
        this.users = this.users.filter((user) => user.id !== id)
      } catch (error) {
        console.error('Error deleting user:', error)
      }
    },
    async clearUser() {
      this.user = null
    },
    async clearUsers() {
      this.users = []
    },
    async clearStore() {
      this.clearUser()
      this.clearUsers()
    },
    async refresh() {
      try {
        const response = await adminService.getAllUsers()
        this.users = response.data
      } catch (error) {
        console.error('Error refreshing users:', error)
      }
    },
    async refreshUser(id: string) {
      try {
        const response = await adminService.getUserById(id)
        this.user = response.data
      } catch (error) {
        console.error('Error refreshing user:', error)
      }
    },

    async refreshUserById(id: string) {
      try {
        const response = await adminService.getUserById(id)
        this.user = response.data
      } catch (error) {
        console.error('Error refreshing user by ID:', error)
      }
    },
  },
})
