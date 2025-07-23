import { defineStore } from 'pinia'
import userService from '@/services/user.service'
import type { RequestUpdateStatusUser, User } from '@/interfaces/user.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import jwtDecode from 'jwt-decode'
import type { DecodedToken } from '@/interfaces/auth.interfaces'
type Role = 'ADMIN' | 'STAFF' | 'PATIENT'

export const useUserStore = defineStore('user', {
  persist: true,
  state: () => ({
    users: [] as User[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | string | null,
    role: '' as Role | '',
    token: null as string | null,
    Permissions: [] as string[],
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasPermission:
      (state) =>
      (permission: string): boolean => {
        if (!state.Permissions || state.Permissions.length === 0) return false
        return state.Permissions.includes(permission)
      },
  },
  actions: {
    async fetchUsers(page: number, size: number, search?: string) {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or email ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await userService.fetchUsers(page, size, filter)
        this.users = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error: any) {
        this.error = error?.message || 'Không thể tải danh sách tài khoản.'
      } finally {
        this.loading = false
      }
    },
    async updateStatusUser(
      id: string,
      request: RequestUpdateStatusUser,
    ): Promise<ClientResponse<APIResponse<User>>> {
      this.loading = true
      this.error = null
      try {
        const res = await userService.updateStatusUser(id, request)
        if (res.success) {
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error: any) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },

    setUser(userData: { role: Role; token: string }) {
      this.role = userData.role
      this.token = userData.token
      const data: DecodedToken = jwtDecode(userData.token)
      this.Permissions = data?.permission || []
    },

    clearUser() {
      this.role = ''
      this.token = null
    },
  },
})
