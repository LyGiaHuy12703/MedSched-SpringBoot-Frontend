import type { DoctorShift, DoctorShiftCreateRequest } from '@/interfaces/doctorShift.interfaces'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const scheduleService = {
  async fetchAllSchedule(page: number, size: number, staffId?: string, futureOnly = false) {
    return apiClient.get('admin/schedules', {
      params: {
        page: page,
        size: size,
        ...(staffId ? { staffId } : {}),
        ...(futureOnly && { futureOnly }),
      },
    })
  },
  async fetchSchedulesByStaff(
    page: number,
    size: number,
    status?: string,
  ): Promise<ClientResponse<APIResponse<DoctorShift[]>>> {
    return apiClient.get('schedules/staff', {
      params: {
        page: page,
        size: size,
        ...(status ? { filter: `status~'${status}'` } : {}),
      },
    })
  },
  async createSchedule(
    request: DoctorShiftCreateRequest,
  ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
    return apiClient.post('admin/schedules', request)
  },
  async fetchById(id: string | string[]): Promise<ClientResponse<APIResponse<DoctorShift>>> {
    return apiClient.get(`admin/schedules/${id}`)
  },
  async updateById(
    id: string,
    request: DoctorShiftCreateRequest,
  ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
    return apiClient.put(`admin/schedules/${id}`, request)
  },
  async deleteById(id: string): Promise<ClientResponse<APIResponse<string>>> {
    return apiClient.delete(`admin/schedules/${id}`)
  },
  async updateStatusById(
    id: string,
    request: string,
  ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
    return apiClient.patch(`schedules/${id}/status`, request)
  },
}
export default scheduleService
