import type { PaymentRequest, PaymentResponseInfo } from '@/interfaces/payment.interface'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const paymentService = {
  async PaymentVNPay(
    request: PaymentRequest,
  ): Promise<ClientResponse<APIResponse<PaymentResponseInfo>>> {
    return await apiClient.post('/payment/vn-pay', request)
  },
}
export default paymentService
