import apiClient from '@/utils/httpClient'
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '../interfaces/role.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
const roleService = {
  async fetchAll(page: number, size: number, filter?: string) {
    return await apiClient.get('admin/roles', {
      params: {
        page,
        size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async createRole(request: CreateRoleRequest): Promise<ClientResponse<APIResponse<Role>>> {
    return await apiClient.post('admin/roles', request)
  },
  async getRoleById(id: string): Promise<ClientResponse<APIResponse<Role>>> {
    return await apiClient.get(`admin/roles/${id}`)
  },
  async updateRoles(
    id: string,
    request: UpdateRoleRequest,
  ): Promise<ClientResponse<APIResponse<Role>>> {
    return await apiClient.put(`admin/roles/${id}`, request)
  },
  async deleteRole(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`admin/roles/${id}`)
  },
}
export default roleService
