import type { PatientFeedback } from '@/interfaces/patientFeedback.interfaces'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const patientFeedbackService = {
  async getAllFeedbacks(page: number, size: number, filter?: string) {
    return await apiClient.get('/patientFeedback', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async addFeedback(request: {
    feedback: string
    rating: number
    appointmentId: string
  }): Promise<ClientResponse<APIResponse<PatientFeedback>>> {
    return await apiClient.post('/patientFeedback', request)
  },
  async updateFeedback(
    id: string,
    request: { feedback: string; rating: number },
  ): Promise<ClientResponse<APIResponse<PatientFeedback>>> {
    return await apiClient.put(`/patientFeedback/${id}`, request)
  },
  async deleteFeedback(id: string): Promise<ClientResponse<APIResponse<PatientFeedback>>> {
    return await apiClient.delete(`/patientFeedback/${id}`)
  },
}

export default patientFeedbackService
