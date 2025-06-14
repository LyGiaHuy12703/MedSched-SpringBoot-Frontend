import apiClient from '@/utils/httpClient'
import type { CreatePermissionRequest, Permission } from '../interfaces/permission.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'

const permissionService = {
  async getPermissions(page: number, size: number, filter?: string) {
    return await apiClient.get('admin/permissions', {
      params: {
        page,
        size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async addPermission(
    request: CreatePermissionRequest,
  ): Promise<ClientResponse<APIResponse<Permission>>> {
    return await apiClient.post('admin/permissions', request)
  },
  async getPermissionById(id: string): Promise<ClientResponse<APIResponse<Permission>>> {
    return await apiClient.get(`admin/permissions/${id}`)
  },
  async updatePermission(id: string, request: Permission) {
    return await apiClient.put(`admin/permissions/${id}`, request)
  },
  async deletePermission(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`admin/permissions/${id}`)
  },
  async getModulePermissions(): Promise<ClientResponse<APIResponse<string[]>>> {
    return await apiClient.get('admin/permissions/module')
  },
  async getPermissionsWithModules(
    modules: string[],
  ): Promise<ClientResponse<APIResponse<string[]>>> {
    return await apiClient.post('admin/permissions/modules', {
      modules,
    })
  },
}
export default permissionService
