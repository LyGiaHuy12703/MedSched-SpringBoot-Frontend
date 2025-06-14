import { defineStore } from 'pinia'
import roleService from '../services/role.service'
import type { CreateRoleRequest, Role, UpdateRoleRequest } from '../interfaces/role.interface'
import type { Meta } from '../interfaces/resultPagination.interface'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'

export const useRoleStore = defineStore('useRoleStore', {
  state: () => ({
    roles: [] as Role[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchAllRoles(page: number, pageSize: number, search?: string) {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or description ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await roleService.fetchAll(page, pageSize, filter)
        this.roles = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách vai trò'
      } finally {
        this.loading = false
      }
    },
    async createRole(request: CreateRoleRequest): Promise<ClientResponse<APIResponse<Role>>> {
      this.loading = true
      this.error = null
      try {
        const res = await roleService.createRole(request)
        if (res.success) {
          if (res?.data?.data) {
            this.roles.push(res.data.data)
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
    async fetchRoleById(id: string): Promise<ClientResponse<APIResponse<Role>>> {
      this.loading = true
      this.error = null
      try {
        const res = await roleService.getRoleById(id)
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
    async updateRole(
      id: string,
      request: UpdateRoleRequest,
    ): Promise<ClientResponse<APIResponse<Role>>> {
      this.loading = true
      this.error = null
      try {
        const res = await roleService.updateRoles(id, request)
        console.log({ res })
        if (res.success) {
          const index = this.roles.findIndex((role) => role.id === id)
          if (index !== -1) {
            this.roles[index] = { ...this.roles[index], ...request }
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
    async deleteRole(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await roleService.deleteRole(id)
        if (res.success) {
          this.roles = this.roles.filter((role) => role.id !== id)
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
