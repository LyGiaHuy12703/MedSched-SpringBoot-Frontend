import { defineStore } from 'pinia'
import type { CreatePermissionRequest, Permission } from '@/interfaces/permission.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import permissionService from '../services/permission.service'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'

export const usePermissionStore = defineStore('usePermissionStore', {
  state: () => ({
    permissions: [] as Permission[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchPermissions(page: number, pageSize: number, search?: string) {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(apiPath ~ '${escapeSearch(search)}' or module ~ '${escapeSearch(search)}' or method ~ '${escapeSearch(search)}' or name ~ '${escapeSearch(search)}' or apiPath ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await permissionService.getPermissions(page, pageSize, filter)
        this.permissions = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách quyền.'
      } finally {
        this.loading = false
      }
    },
    async addPermission(
      request: CreatePermissionRequest,
    ): Promise<ClientResponse<APIResponse<Permission>>> {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.addPermission(request)
        if (res.success) {
          if (res?.data?.data) {
            this.permissions.push(res.data.data)
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
    async getPermissionById(id: string): Promise<ClientResponse<APIResponse<Permission>>> {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.getPermissionById(id)
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
    async updatePermission(id: string, request: Permission) {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.updatePermission(id, request)
        if (res.success) {
          const index = this.permissions.findIndex((permission) => permission.id === id)
          if (index !== -1) {
            this.permissions[index] = { ...this.permissions[index], ...request }
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
    async deletePermission(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.deletePermission(id)
        if (res.success) {
          this.permissions = this.permissions.filter((permission) => permission.id !== id)
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
    async fetchModuleInPermission(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.getModulePermissions()
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
    async fetchPermissionsWithModules(
      request: string[],
    ): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await permissionService.getPermissionsWithModules(request)
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
