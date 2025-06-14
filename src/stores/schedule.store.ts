import type { DoctorShift, DoctorShiftCreateRequest } from '@/interfaces/doctorShift.interfaces'
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
          console.log({ res })
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
        console.log('staff', this.staff)
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
  },
})
