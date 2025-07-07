import { defineStore } from 'pinia'
import type { StandardizedError } from '@/interfaces/response.interface'
import type {
  Account,
  AuthResponse,
  ChangePassword,
  LoginRequest,
  RequestUpdateInfo,
} from '@/interfaces/auth.interfaces'
import { useUserStore } from './users.store'
import authService from '@/services/auth.service'
import { toast } from 'vue3-toastify'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    loggedIn: false,
    account: null as Account | null,
    loading: false,
    error: null as StandardizedError | null,
  }),

  getters: {
    getAuth: (state) => state.account,
    isAuthenticated: (state) => state.loggedIn,
  },

  actions: {
    async login(payload: LoginRequest): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const res = await authService.signIn(payload)
        const { access_token } = res.data.data || {}

        if (access_token) {
          authService.updateLocalStorage(res.data.data)
          this.loggedIn = true
          await this.getInfo()
        } else {
          this.loggedIn = false
          throw new Error('Không nhận được access token')
        }
      } catch (err: any) {
        this.resetAuth()

        // Nếu là lỗi từ backend (axios)
        if (err?.response?.data?.message) {
          throw new Error(err.response.data.message)
        }
        // Lỗi khác (lỗi mạng, v.v.)
        throw new Error('Đăng nhập thất bại. Vui lòng thử lại.')
      } finally {
      }
    },
    async getInfo(): Promise<Account | null> {
      const token = localStorage.getItem('auth.access_token')
      const userStore = useUserStore()

      if (!token) return this.resetAuth()

      try {
        const res = await authService.getInfo()
        this.account = res?.data.data || null
        this.loggedIn = !!this.account

        if (this.account?.user?.role) {
          userStore.setUser({
            role: this.account.user.role,
            token,
          })
        }

        return this.account
      } catch (err) {
        console.error('Get info failed:', err)
        return this.resetAuth()
      }
    },

    async updateInfo(payload: RequestUpdateInfo): Promise<Account | null> {
      const token = localStorage.getItem('auth.access_token')
      const userStore = useUserStore()

      if (!token) return this.resetAuth()

      try {
        const res = await authService.updateInfo(payload)
        this.account = res?.data || null
        this.loggedIn = !!this.account

        if (this.account?.user?.role) {
          userStore.setUser({
            role: this.account.user.role,
            token,
          })
        }

        return this.account
      } catch (err) {
        console.error('Update info failed:', err)
        return this.resetAuth()
      }
    },

    async updatePassword(data: ChangePassword): Promise<boolean> {
      const token = localStorage.getItem('auth.access_token')
      if (!token) return !!this.resetAuth()

      try {
        const res = await authService.updatePassword(data)
        return !!res?.data
      } catch (err) {
        console.error('Update password failed:', err)
        this.resetAuth()
        return false
      }
    },

    async refresh(): Promise<boolean> {
      const token = localStorage.getItem('auth.access_token')
      if (!token) return !!this.resetAuth()

      try {
        const res = await authService.getInfo()
        this.account = res?.data || null
        this.loggedIn = !!this.account

        const userStore = useUserStore()
        if (this.account?.user?.role && token) {
          userStore.setUser({
            role: this.account.user.role,
            token,
          })
        } else {
          userStore.clearUser()
        }

        return this.loggedIn
      } catch (err) {
        console.error('Refresh failed:', err)
        return !!this.resetAuth()
      }
    },

    logout() {
      authService.clearLocalStorage()
      this.resetAuth()
      toast.success('Đăng xuất thành công')
    },
    handleOAuthCallback(user: any, accessToken: string, refreshToken: string) {
      try {
        const authData: AuthResponse = {
          user: user,
          access_token: accessToken,
          refresh_token: refreshToken,
        }
        console.log({ authData })

        authService.updateLocalStorage(authData)
      } catch (error) {
        console.error('Lỗi khi giải mã token hoặc lưu trữ:', error)
        // Ném lỗi để component callback có thể bắt và xử lý
        throw new Error('Token không hợp lệ hoặc đã hết hạn.')
      }
    },
    resetAuth(): null {
      const userStore = useUserStore()
      this.loggedIn = false
      this.account = null
      this.error = null
      userStore.clearUser()
      return null
    },
  },
})
