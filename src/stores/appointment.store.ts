import type {
  Appointment,
  AppointmentRequest,
  AppointmentResponse,
} from '@/interfaces/appointment.interfaces'
import type { PaymentResponseInfo } from '@/interfaces/payment.interface'
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
    async fetchAppointmentsByDoctor(
      page: number,
      pageSize: number,
      filterStatus?: string,
      date?: string,
    ) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAppointmentsByDoctor(
          page,
          pageSize,
          filterStatus,
          date,
        )
        if (res.success) {
          this.appointments = res.data.data.result
          this.meta = res.data.data.meta
        } else {
          this.error = res?.error?.details?.error || 'Lỗi không xác định'
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn của bác sĩ.'
      } finally {
        this.loading = false
      }
    },
    async fetchAppointmentsByPatient(
      page: number,
      pageSize: number,
      sort: string[] = ['date,asc', 'time,asc'], // Tham số sort là một mảng chuỗi
    ) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAppointmentsByPatient(page, pageSize, sort)
        this.appointments = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async fetchAppointmentsByShiftIds(shiftIds: string[]) {
      if (!shiftIds || shiftIds.length === 0) {
        this.appointments = [] // Đảm bảo là mảng
        return
      }
      this.loading = true
      this.error = null
      try {
        // ... gọi API ...
        const res = await appointmentService.fetchByShiftId(shiftIds) // Giả sử hàm này tồn tại'
        // Giả sử cấu trúc trả về là res.data.data.result
        this.appointments = res.data.data
      } catch (error) {
        console.error('Lỗi trong store khi lấy lịch hẹn:', error)
        this.appointments = [] // **QUAN TRỌNG: Gán lại mảng rỗng khi có lỗi**
        this.error = error.message
      } finally {
        this.loading = false
      }
    },
    async fetchAllAppointments(page: number, pageSize: number, filterStatus?: string) {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.fetchAllAppointments(page, pageSize, filterStatus)
        if (res.success) {
          this.appointments = res.data.data.result
          this.meta = res.data.data.meta
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách cuộc hẹn của bác sĩ.'
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
      } finally {
        this.loading = false
      }
    },
    async changeStatus(
      status: string,
      id: string,
    ): Promise<ClientResponse<APIResponse<Appointment>>> {
      this.loading = true
      this.error = null
      try {
        const res = await appointmentService.changeStatus(status, id)
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
        this.error = error.message || 'Không thể thay đổi trạng thái cuộc hẹn.'
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
    async createAppointment(request: AppointmentRequest): Promise<PaymentResponseInfo> {
      this.loading = true
      this.error = null
      try {
        const response = await appointmentService.createAppointment(request)
        const paymentInfo = response
        if (paymentInfo?.data && paymentInfo.data.code === 200 && paymentInfo.data.data) {
          return {
            message: paymentInfo.data.message,
            paymentUrl: paymentInfo.data.data.paymentUrl,
            action: paymentInfo.data.data.action,
            appointmentId: paymentInfo.data.data.appointmentId,
          }
        } else {
          const errorMessage =
            paymentInfo.error?.details?.error || 'Không thể tạo yêu cầu thanh toán.'
          this.error = errorMessage
          throw new Error(errorMessage)
        }
      } catch (error: any) {
        console.error('Error in createAppointment:', error)
        const backendError = error.error?.details?.error || error || 'Không thể tạo cuộc hẹn.'
        this.error = backendError
        throw new Error(backendError)
      } finally {
        this.loading = false
      }
    },
  },
})
