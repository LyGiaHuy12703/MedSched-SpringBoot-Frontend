import type { MedicalRecord } from '@/interfaces/medicalRecord.interfaces'
import type { RequestMedicalRecord } from '@/interfaces/medicalRecord.interfaces'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const medicalRecordService = {
  async getMedicalRecords(page: number, size: number) {
    return await apiClient.get('/medicalRecords', {
      params: {
        page: page,
        size: size,
      },
    })
  },
  async addMedicalRecord(
    request: RequestMedicalRecord,
  ): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
    return await apiClient.post('/medicalRecords', request)
  },
  async updateMedicalRecord(
    id: string,
    request: RequestMedicalRecord,
  ): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
    return await apiClient.put(`/medicalRecords/${id}`, request)
  },
  async updateMedicalRecordStatus(id: string): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
    return await apiClient.put(`/medicalRecords/${id}/status`)
  },
  async deleteMedicalRecord(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`/medicalRecords/${id}`)
  },
  async getMedicalRecordById(id: string): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
    return await apiClient.get(`/medicalRecords/${id}`)
  },
}
export default medicalRecordService
