import type {
  DoctorShift,
  DoctorShiftCreateRequest,
  StaffDoctorShift,
} from '@/interfaces/doctorShift.interfaces'
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
  async fetchAssignments(
    page: number,
    size: number,
    pivotStatus?: string,
  ): Promise<ClientResponse<APIResponse<StaffDoctorShift[]>>> {
    const params: Record<string, any> = {
      page,
      size,
      sort: 'doctorShift.dayWork,desc', // Sắp xếp mặc định
    }
    if (pivotStatus) {
      params.pivotStatus = pivotStatus
    }
    // Gọi đến API /api/v1/assignments
    return apiClient.get('assignments', { params })
  },

  /**
   * Cập nhật trạng thái của một phân công cụ thể.
   * @param assignmentId - ID của bản ghi staff_doctor_shift
   * @param newStatus - Trạng thái mới ('APPROVED' hoặc 'CANCELED')
   */
  async updateAssignmentStatus(
    assignmentId: string,
    newStatus: 'APPROVED' | 'CANCELED',
  ): Promise<ClientResponse<APIResponse<StaffDoctorShift>>> {
    // Gọi đến API /api/v1/assignments/{id}/status
    return apiClient.patch(`assignments/${assignmentId}/status`, { status: newStatus })
  },
  async fetchAssignmentsByStaffId(
    staffId: string,
    page: number = 0,
    size: number = 100, // Mặc định lấy nhiều
  ): Promise<ClientResponse<APIResponse<StaffDoctorShift[]>>> {
    const params = { page, size, sort: 'doctorShift.dayWork,asc' }
    // Gọi đến API mới: /api/v1/assignments/staff/{staffId}
    return apiClient.get(`assignments/staff/${staffId}`, { params })
  },
}
export default scheduleService
