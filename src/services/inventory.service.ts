import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { ImportReport } from '@/interfaces/inventory.interfaces' // Import interface bạn đã tạo
import apiClient from '@/utils/httpClient' // Sử dụng lại instance apiClient đã cấu hình

const inventoryService = {
  async importFromExcel(file: File): Promise<ClientResponse<APIResponse<ImportReport>>> {
    const formData = new FormData()
    formData.append('file', file)

    return await apiClient.post('/inventory/import', formData)
  },
}

export default inventoryService
