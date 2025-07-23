import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import type { DispenseResultDTO } from '@/interfaces/dispense.interfaces'
import apiClient from '@/utils/httpClient'

const dispenseService = {
  async dispenseByMedicalRecord(
    medicalRecordId: string,
  ): Promise<ClientResponse<APIResponse<DispenseResultDTO>>> {
    return await apiClient.post(`/dispense/${medicalRecordId}`)
  },
}

export default dispenseService
