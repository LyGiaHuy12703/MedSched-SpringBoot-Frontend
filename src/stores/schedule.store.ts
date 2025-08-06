import type {
  DoctorShift,
  DoctorShiftCreateRequest,
  StaffDoctorShift,
} from '@/interfaces/doctorShift.interfaces'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import scheduleService from '@/services/schedule.service'
import { defineStore } from 'pinia'

export const useScheduleStore = defineStore('useScheduleStore', {
  state: () => ({
    schedules: [] as DoctorShift[],
    schedule: null as DoctorShift | null,
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
    assignments: [] as StaffDoctorShift[],
  }),
  getters: {},
  actions: {
    async fetchAllSchedule(page: number, size: number, staffId?: string, futureOnly = false) {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.fetchAllSchedule(page, size, staffId, futureOnly)
        this.schedules = res.data.data.result
        this.meta = res.data.data.meta
      } catch (e) {
        this.error = e.message || 'Không thể tải danh sách lịch trực'
      } finally {
        this.loading = false
      }
    },
    async fetchSchedulesByStaff(
      page: number,
      size: number,
      status?: string,
    ): Promise<ClientResponse<APIResponse<DoctorShift[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.fetchSchedulesByStaff(page, size, status)
        if (res.success) {
          this.schedules = res.data.data.result
          this.meta = res.data.data.meta
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (e) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async createSchedule(
      request: DoctorShiftCreateRequest,
    ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.createSchedule(request)
        if (res.success) {
          if (res?.data?.data) {
            this.schedules.push(res.data.data)
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (e) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchBydId(id: string | string[]): Promise<ClientResponse<APIResponse<DoctorShift>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.fetchById(id)
        if (res.success) {
          if (res.data?.data) {
            this.schedule = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async updateById(
      id: string,
      request: DoctorShiftCreateRequest,
    ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.updateById(id, request)
        if (res.success) {
          const index = this.schedules.findIndex((sched) => sched.id === id)
          if (index !== -1 && res.data.data) {
            this.schedules[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async deleteById(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.deleteById(id)
        if (res.success) {
          this.schedules = this.schedules.filter((sched) => sched.id !== id)
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async updateStatusSchedule(
      id: string,
      request: string,
    ): Promise<ClientResponse<APIResponse<DoctorShift>>> {
      this.loading = true
      this.error = null
      try {
        const res = await scheduleService.updateStatusById(id, request)
        if (res.success) {
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    // --- CÁC ACTIONS MỚI CHO ASSIGNMENT ---

    /**
     * Lấy danh sách các phân công (StaffDoctorShift) đã được "làm phẳng" từ API.
     * Hỗ trợ phân trang và lọc theo pivotStatus.
     */
    async fetchAssignments(payload: {
      page: number
      size: number
      pivotStatus?: string
      staffId?: string
    }): Promise<ClientResponse<APIResponse<StaffDoctorShift[]>>> {
      this.loading = true
      this.error = null
      try {
        let res
        if (payload.staffId) {
          // Gọi hàm mới cho trang đặt lịch
          res = await scheduleService.fetchAssignmentsByStaffId(
            payload.staffId,
            payload.page,
            payload.size,
          )
        } else {
          // Gọi hàm cũ cho trang của nhân viên
          res = await scheduleService.fetchAssignments(
            payload.page,
            payload.size,
            payload.pivotStatus,
          )
        }

        if (res.success) {
          this.assignments = res.data.result
          this.meta = res.data.meta
        }
      } catch (e) {
        throw e
      } finally {
        this.loading = false
      }
    },

    /**
     * Cập nhật pivot_status của một phân công cụ thể.
     * @param assignmentId - ID của bản ghi staff_doctor_shift
     * @param newStatus - Trạng thái mới ('APPROVED' hoặc 'CANCELED')
     */
    async updateAssignmentStatus(
      assignmentId: string,
      newStatus: 'APPROVED' | 'CANCELED',
    ): Promise<ClientResponse<APIResponse<StaffDoctorShift>>> {
      // Không set loading = true để tránh làm giật toàn bộ bảng,
      // component có thể tự quản lý loading cho từng nút
      this.error = null
      try {
        const res = await scheduleService.updateAssignmentStatus(assignmentId, newStatus)
        if (res.success) {
          // Cập nhật lại bản ghi trong state hoặc đơn giản là fetch lại
          // Ở đây, ta chọn cách đơn giản và an toàn là không cần cập nhật state thủ công
          // Component sẽ gọi lại fetchAssignments để lấy dữ liệu mới nhất.
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error as string)
        }
      } catch (e) {
        throw e
      }
    },
  },
})
