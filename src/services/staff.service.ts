import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { CreateStaffRequest, Staff, UpdateStaffRequest } from '@/interfaces/staff.interface'
import apiClient from '@/utils/httpClient'

const staffService = {
  async fetchAll(page: number, size: number, departmentId?: string, search?: string) {
    return await apiClient.get('admin/staff', {
      params: {
        page,
        size,
        ...(departmentId ? { departmentId } : {}),
        ...(search ? { filter: search } : {}),
      },
    })
  },
  async updateData(
    id: string | string[],
    staff: UpdateStaffRequest,
  ): Promise<ClientResponse<APIResponse<Staff>>> {
    return await apiClient.put(`admin/staff/${id}`, staff)
  },
  async createStaff(formData: CreateStaffRequest): Promise<ClientResponse<APIResponse<Staff>>> {
    return await apiClient.post('admin/staff', formData)
  },
  async fetchStaffById(id: string | string[]): Promise<ClientResponse<APIResponse<Staff>>> {
    return await apiClient.get(`admin/staff/${id}`)
  },
  async deleteStaff(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`admin/staff/${id}`)
  },
}
export default staffService
