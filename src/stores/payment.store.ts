import type { PaymentRequest } from '@/interfaces/payment.interface'
import type { StandardizedError } from '@/interfaces/response.interface'
import paymentService from '@/services/payment.service'
import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('usePaymentStore', {
  state: () => ({
    loading: false,
    error: null as StandardizedError | null,
  }),
  actions: {
    async createPaymentVNPay(request: PaymentRequest): Promise<string> {
      this.loading = false
      this.error = null
      try {
        const response = await paymentService.PaymentVNPay(request)
        const paymentInfo = response // Giả sử API trả về trong `data`
        if (paymentInfo && paymentInfo.data?.status === 'OK' && paymentInfo.data?.url) {
          // THAY ĐỔI 2: Trả về URL thanh toán nếu thành công
          return paymentInfo.data.url
        } else {
          // Nếu backend trả về lỗi có cấu trúc
          const errorMessage = paymentInfo?.message || 'Không thể tạo yêu cầu thanh toán.'
          this.error = errorMessage
          throw new Error(errorMessage)
        }
      } catch (error: any) {
        // THAY ĐỔI 3: Xử lý lỗi từ axios/fetch
        // Lỗi từ backend (ví dụ 400 Bad Request) thường nằm trong error.response.data
        const backendError =
          error.response?.data?.message || error.response?.data?.error || 'Không thể tạo cuộc hẹn.'
        this.error = backendError
        throw new Error(backendError)
      } finally {
        this.loading = false
      }
    },
  },
})
