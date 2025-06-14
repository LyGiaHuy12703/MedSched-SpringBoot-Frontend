import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const cloudinaryService = {
  async upload(file: FormData): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.post('/cloudinary/upload', file)
  },
}
export default cloudinaryService
