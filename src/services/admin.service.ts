import apiClient from '@/utils/httpClient'
import type { DataUserCreate, DataUserUpdate } from '../interfaces/admin.interfaces'

const adminService = {
  async getAllUsers() {
    return await apiClient.get('admin/users')
  },
  async getUserById(id: string) {
    return await apiClient.get(`admin/users/${id}`)
  },
  async createUser(data: DataUserCreate) {
    return await apiClient.post('admin/users', data)
  },
  async updateUser(id: string, data: DataUserUpdate) {
    return await apiClient.put(`admin/users/${id}`, data)
  },
  async deleteUser(id: string) {
    return await apiClient.delete(`admin/users/${id}`)
  },
}
export default adminService
