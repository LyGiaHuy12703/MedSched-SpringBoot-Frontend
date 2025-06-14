import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { Service, ServiceRequest } from '@/interfaces/service.interfaces'
import apiClient from '@/utils/httpClient'

const serviceService = {
  async getServices(page: number, size: number, filter?: string) {
    return await apiClient.get('services', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async addService(request: ServiceRequest): Promise<ClientResponse<APIResponse<Service>>> {
    return await apiClient.post('admin/services', request)
  },
  async updateService(
    id: string,
    request: ServiceRequest,
  ): Promise<ClientResponse<APIResponse<Service>>> {
    return await apiClient.put(`admin/services/${id}`, request)
  },
  async deleteService(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`admin/services/${id}`)
  },
}
export default serviceService
