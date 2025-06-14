import type { Department, DepartmentRequest } from '@/interfaces/department.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const departmentService = {
  async getDepartments(page: number, size: number, filter?: string) {
    return await apiClient.get('departments', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async addDepartment(
    request: DepartmentRequest,
  ): Promise<ClientResponse<APIResponse<Department>>> {
    return await apiClient.post('admin/departments', request)
  },
  async updateDepartment(
    id: string,
    request: DepartmentRequest,
  ): Promise<ClientResponse<APIResponse<Department>>> {
    return await apiClient.put(`admin/departments/${id}`, request)
  },
  async deleteDepartment(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`admin/departments/${id}`)
  },
}
export default departmentService
