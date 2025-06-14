import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
} from '@/interfaces/appointment.interfaces'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import appointmentService from '@/services/appointment.service'
import { defineStore } from 'pinia'

export const useAppointmentStore = defineStore('useAppointmentStore', {
  state: () => ({
    appointments: [] as Appointment[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchAppointmentsByDoctor(page: number, pageSize: number) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAppointmentsByDoctor(page, pageSize)
        this.appointments = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn của bác sĩ.'
      } finally {
        this.loading = false
      }
    },
    async fetchAppointmentsByPatient(page: number, pageSize: number) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAppointmentsByPatient(page, pageSize)
        this.appointments = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async fetchAllAppointments(page: number, pageSize: number) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAllAppointments(page, pageSize)
        this.appointments = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn.'
      } finally {
        this.loading = false
      }
    },
    async getAppointmentById(
      id: string,
    ): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.getAppointmentById(id)
        return res
      } catch (error) {
        this.error = error.message || 'Không thể tải thông tin cuộc hẹn.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async updateAppointment(
      id: string,
      request: AppointmentRequest,
    ): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.updateAppointment(id, request)
        if (res.success) {
          const index = this.appointments.findIndex((appointment) => appointment.id === id)
          if (index !== -1 && res.data.data) {
            this.appointments[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể cập nhật cuộc hẹn.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async deleteAppointment(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.deleteAppointment(id)
        if (res.success) {
          this.appointments = this.appointments.filter((appointment) => appointment.id !== id)
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể xóa cuộc hẹn.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async createAppointment(
      request: AppointmentRequest,
    ): Promise<ClientResponse<APIResponse<AppointmentResponse>>> {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.createAppointment(request)
        if (res.success) {
          if (res.data.data) {
            this.appointments.push(res.data.data)
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể tạo cuộc hẹn.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
