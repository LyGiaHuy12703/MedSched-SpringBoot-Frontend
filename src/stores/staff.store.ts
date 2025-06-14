import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import type { CreateStaffRequest, Staff, UpdateStaffRequest } from '@/interfaces/staff.interface'
import staffService from '@/services/staff.service'
import { defineStore } from 'pinia'

export const useStaffStore = defineStore('staff', {
  persist: true,
  state: () => ({
    staff: null as unknown as Staff,
    staffs: [] as Staff[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | string | null,
    lastUpdated: null as number | null,
  }),
  getters: {},
  actions: {
    setSelectedStaff(staff: Staff) {
      this.staff = staff
      this.lastUpdated = Date.now()
    },
    clearSelectedStaff() {
      this.staff = null
      this.lastUpdated = null
    },
    async fetchAllStaffs(page: number, size: number, departmentId?: string, search?: string) {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(user.name ~ '${escapeSearch(search)}' or user.email ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await staffService.fetchAll(page, size, departmentId, filter)
        this.staffs = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error: any) {
        this.error = error?.message || 'Không thể tải danh sách tài khoản nhân viên.'
      } finally {
        this.loading = false
      }
    },
    async fetchStaffById(id: string | string[]): Promise<ClientResponse<APIResponse<Staff>>> {
      this.loading = true
      this.error = null
      try {
        const res = await staffService.fetchStaffById(id)
        if (res.success) {
          if (res.data?.data) {
            this.staff = res.data.data
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
    async createStaff(staff: CreateStaffRequest): Promise<ClientResponse<APIResponse<Staff>>> {
      this.loading = true
      this.error = null
      try {
        const res = await staffService.createStaff(staff)
        if (res.success) {
          if (res?.data?.data) {
            this.staffs.push(res.data.data)
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
    async updateStaff(
      id: string | string[],
      staff: UpdateStaffRequest,
    ): Promise<ClientResponse<APIResponse<Staff>>> {
      this.loading = true
      this.error = null
      console.log({ staff })

      try {
        const res = await staffService.updateData(id, staff)
        if (res.success) {
          const index = this.staffs.findIndex((s) => s.id === id)
          if (index !== -1 && res.data && res.data.data !== null) {
            this.staffs[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error || 'Không thể cập nhật thông tin nhân viên.'
          throw new Error(this.error)
        }
      } catch (error: any) {
        this.error = error?.message || 'Không thể cập nhật thông tin nhân viên.'
        // Return a rejected promise with the error to satisfy the return type
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
  },
})
