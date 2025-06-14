import type { AppointmentRequest, AppointmentResponse } from '@/interfaces/appointment.interfaces'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const appointmentService = {
  async fetchAppointmentsByDoctor(page: number, size: number) {
    return await apiClient.get('appointments/staff', {
      params: {
        page: page,
        size: size,
      },
    })
  },
  async fetchAppointmentsByPatient(page: number, size: number) {
    return await apiClient.get('appointments/user', {
      params: {
        page: page,
        size: size,
      },
    })
  },
  async fetchAllAppointments(page: number, size: number) {
    return await apiClient.get('appointments', {
      params: {
        page: page,
        size: size,
      },
    })
  },
  async getAppointmentById(id: string): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
    return await apiClient.get(`appointments/${id}`)
  },
  async updateAppointment(
    id: string,
    request: AppointmentRequest,
  ): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
    return await apiClient.put(`appointments/${id}`, request)
  },
  async deleteAppointment(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return await apiClient.delete(`appointments/${id}`)
  },
  async createAppointment(
    request: AppointmentRequest,
  ): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
    return await apiClient.post('appointments', request)
  },
}
export default appointmentService
