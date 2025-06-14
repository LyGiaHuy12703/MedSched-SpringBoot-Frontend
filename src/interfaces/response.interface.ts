// interfaces/client.response.interface.ts (hoặc đặt chung với APIResponse)
import type { AxiosError } from 'axios'

export interface StandardizedError {
  message: string
  statusCode?: number
  details?: {
    error: string
  }
  originalError?: AxiosError // Giữ lại lỗi gốc nếu cần debug sâu
}
export interface APIResponse<T = unknown> {
  success: boolean
  data: T | null
  message: string
  code?: number
}
export interface ClientResponse<T = unknown> {
  success: boolean
  data: T | null
  error: StandardizedError | null
  statusCode?: number
}
