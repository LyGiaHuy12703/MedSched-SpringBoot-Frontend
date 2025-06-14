import type { Department, DepartmentRequest } from '@/interfaces/department.interface'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import departmentService from '@/services/departmnet.service'
import { defineStore } from 'pinia'

export const useDepartmentStore = defineStore('useDepartmentStore', {
  state: () => ({
    departments: [] as Department[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchDepartments(page: number, pageSize: number, search?: string): Promise<void> {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or description ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await departmentService.getDepartments(page, pageSize, filter)
        this.departments = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách phòng ban.'
      } finally {
        this.loading = false
      }
    },
    async addDepartment(
      request: DepartmentRequest,
    ): Promise<ClientResponse<APIResponse<Department>>> {
      this.loading = true
      this.error = null
      try {
        const res = await departmentService.addDepartment(request)
        if (res.success) {
          if (res?.data?.data) {
            this.departments.push(res.data.data)
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
    async updateDepartment(
      id: string,
      request: DepartmentRequest,
    ): Promise<ClientResponse<APIResponse<Department>>> {
      this.loading = true
      this.error = null
      try {
        const res = await departmentService.updateDepartment(id, request)
        if (res.success) {
          const index = this.departments.findIndex((dept) => dept.id === id)
          if (index !== -1 && res.data.data) {
            this.departments[index] = res.data.data
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
    async deleteDepartment(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await departmentService.deleteDepartment(id)
        if (res.success) {
          this.departments = this.departments.filter((dept) => dept.id !== id)
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
