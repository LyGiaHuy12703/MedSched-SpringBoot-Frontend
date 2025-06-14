import type { CreateMedicineRequest, Medicine } from '@/interfaces/medicine.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const medicineService = {
  async fetchMedicines(page: number, size: number, filter?: string) {
    return await apiClient.get('/medications', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async addMedicine(
    request: CreateMedicineRequest,
  ): Promise<ClientResponse<APIResponse<Medicine>>> {
    return await apiClient.post('/medications', request)
  },
  async updateMedicine(
    id: string,
    request: CreateMedicineRequest,
  ): Promise<ClientResponse<APIResponse<Medicine>>> {
    return await apiClient.put(`/medications/${id}`, request)
  },
  async deleteMedicine(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`/medications/${id}`)
  },
}
export default medicineService
