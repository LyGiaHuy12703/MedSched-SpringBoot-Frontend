import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { Service, ServiceRequest } from '@/interfaces/service.interfaces'
import apiClient from '@/utils/httpClient'

const serviceService = {
  async importServices(formData: FormData): Promise<ClientResponse<APIResponse<Service[]>>> {
    return await apiClient.post('/admin/service/import/excel', formData)
  },
  async exportServices(): Promise<Blob> {
    return await apiClient.get('/admin/service/export/excel', {
      responseType: 'blob', // Quan trọng để xử lý file nhị phân
    })
  },
  async getServices(page: number, size: number, filter?: string, departmentId?: string) {
    return await apiClient.get('services', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
        ...(departmentId ? { departmentId } : {}),
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
