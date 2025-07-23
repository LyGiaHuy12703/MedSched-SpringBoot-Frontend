import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
} from '@/interfaces/appointment.interfaces'
import type { PaymentResponseInfo } from '@/interfaces/payment.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const appointmentService = {
  async fetchAppointmentsByDoctor(
    page: number,
    size: number,
    status?: string,
  ): Promise<ClientResponse<APIResponse<Appointment[]>>> {
    return await apiClient.get('appointments/staff', {
      params: {
        page: page,
        size: size,
        ...(status ? { filter: `status~'${status}'` } : {}),
      },
    })
  },
  async changeStatus(
    status: string,
    id: string,
  ): Promise<ClientResponse<APIResponse<Appointment>>> {
    return await apiClient.put(`appointments/${id}/status`, { status: status })
  },
  async fetchAppointmentsByPatient(
    page: number,
    size: number,
    sort: string[] = ['date,asc', 'time,asc'],
  ) {
    return await apiClient.get('appointments/user', {
      params: {
        page: page,
        size: size,
        sort: sort, // Truyền thẳng mảng `sort` vào đây
      },
      // Quan trọng: Cấu hình cách Axios serialize tham số mảng
      paramsSerializer: (params) => {
        // Dùng qs library hoặc URLSearchParams để serialize
        // Ví dụ với URLSearchParams (đơn giản hơn)
        const searchParams = new URLSearchParams()
        for (const key in params) {
          const value = params[key]
          if (Array.isArray(value)) {
            value.forEach((v) => searchParams.append(key, v))
          } else {
            searchParams.append(key, value)
          }
        }
        return searchParams.toString()
      },
    })
  },
  async fetchAllAppointments(page: number, size: number, filter?: string) {
    return await apiClient.get('appointments', {
      params: {
        page: page,
        size: size,
        ...(filter ? { filter: filter } : {}),
      },
    })
  },
  async fetchByShiftId(shiftIds: string[]): Promise<ClientResponse<APIResponse<Appointment[]>>> {
    // Sửa hàm này
    return await apiClient.get(`appointments/shift`, {
      params: {
        shiftIds: shiftIds,
      },
      // *** THÊM PHẦN NÀY VÀO ***
      paramsSerializer: {
        // Axios 1.x.x dùng `serialize`. Các phiên bản cũ hơn có thể dùng `encode` hoặc một hàm trực tiếp.
        // Cú pháp này hoạt động với các phiên bản Axios hiện đại.
        serialize: (params) => {
          const searchParams = new URLSearchParams()
          // Lặp qua mảng `shiftIds` và thêm từng cái vào searchParams
          for (const id of params.shiftIds) {
            searchParams.append('shiftIds', id)
          }
          return searchParams.toString()
        },
      },
    })
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
  ): Promise<ClientResponse<APIResponse<PaymentResponseInfo>>> {
    return await apiClient.post('appointments', request)
  },
}
export default appointmentService
