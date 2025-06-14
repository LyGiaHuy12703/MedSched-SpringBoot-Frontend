import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { RequestUpdateStatusUser, User } from '@/interfaces/user.interface'
import apiClient from '@/utils/httpClient'

const userService = {
  async fetchUsers(page: number, size: number, filter?: string) {
    return await apiClient.get('admin/users', {
      params: {
        page,
        size,
        ...(filter ? {filter : filter} : {}),
      },
    })
  },
  async updateStatusUser(
    id: string,
    request: RequestUpdateStatusUser,
  ): Promise<ClientResponse<APIResponse<User>>> {
    return await apiClient.put(`admin/users/${id}/status`, request)
  },
}
export default userService
