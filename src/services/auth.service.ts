import type { APIResponse } from '@/interfaces/response.interface'
import type {
  Account,
  AuthResponse,
  ChangePassword,
  LoginRequest,
  RegisterRequest,
  RequestUpdateInfo,
  VerifyCode,
} from '../interfaces/auth.interfaces'
import apiClient from '@/utils/httpClient'
import { COOKIE_KEY } from '@/commons/const'
import axios from 'axios'

const authService = {
  async signIn(data: LoginRequest) {
    return await apiClient.post('auth/login', data)
  },
  async signUp(data: RegisterRequest) {
    return await axios.post('http://localhost:8080/api/auth/register', data)
  },
  async verifyCode(data: VerifyCode) {
    return await axios.post('http://localhost:8080/api/auth/register/verifyEmail', data)
  },
  async getInfo(): Promise<APIResponse<Account>> {
    return await apiClient.get('auth/account')
  },
  async updateInfo(data: RequestUpdateInfo) {
    return await apiClient.put('auth/updateInfo', data)
  },
  async updatePassword(data: ChangePassword) {
    return await apiClient.put('auth/changePassword', data)
  },
  async clearLocalStorage() {
    localStorage.removeItem(COOKIE_KEY.ACCESS_TOKEN)
    localStorage.removeItem(COOKIE_KEY.REFRESH_TOKEN)
  },
  async updateLocalStorage(data: AuthResponse) {
    localStorage.setItem(COOKIE_KEY.ACCESS_TOKEN, data.access_token)
    localStorage.setItem(COOKIE_KEY.REFRESH_TOKEN, data.refresh_token)
  },
  async updateCookies(data: AuthResponse) {
    document.cookie = `${COOKIE_KEY.ACCESS_TOKEN}=${data.access_token}; ${COOKIE_KEY.REFRESH_TOKEN}=${data.refresh_token}`
  },
  async clearCookies() {
    document.cookie = ''
  },
  // async changePassword(data: AuthChangePassword) {
  //   const toastStore = useToastStore()
  //   return await apiClient.put(API.CHANGE_PASSWORD, data).then((response: any) => {
  //     toastStore.fromApiResponse(response)
  //     return response
  //   })
  // },
}

export default authService
