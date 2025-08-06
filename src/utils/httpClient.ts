import axios from 'axios'
import type {
  AxiosRequestHeaders,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { useToastStore } from '@/stores/toast.store'
import type { ClientResponse } from '@/interfaces/response.interface'

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  // headers: {
  //   'Content-Type': 'application/json',
  // },
})

const onRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const token = localStorage.getItem('auth.access_token')
  const authHeader: AxiosRequestHeaders = {} // Chỉ chứa header Authorization
  if (token) {
    authHeader.Authorization = `Bearer ${token}`
  }

  // Tạo một đối tượng headers mới, kết hợp headers hiện tại của config (nếu có)
  // với authHeader. Axios sẽ tự thêm Content-Type phù hợp nếu cần.
  const newHeaders = {
    ...config.headers, // Giữ lại các header khác có thể đã được đặt cho request cụ thể
    ...authHeader, // Thêm/ghi đè Authorization
  }

  // Quan trọng: Nếu config.data là FormData, không được tự ý đặt Content-Type
  // Axios sẽ tự động xử lý việc này.
  if (config.data instanceof FormData) {
    // Xóa Content-Type nếu nó đã vô tình được đặt trước đó (ví dụ: từ config.headers)
    // để Axios có thể tự do đặt Content-Type multipart/form-data với boundary chính xác.
    // Tuy nhiên, nếu bạn không đặt Content-Type mặc định, dòng này có thể không cần.
    delete newHeaders['Content-Type']
    // Hoặc nếu bạn không muốn dùng delete:
    // newHeaders['Content-Type'] = undefined; // Gán undefined cũng có thể hoạt động
  } else if (
    !config.headers?.['Content-Type'] &&
    config.method?.toLowerCase() !== 'get' &&
    config.data
  ) {
    // Nếu không phải FormData, không phải GET, có data và chưa có Content-Type,
    // bạn có thể mặc định là application/json
    newHeaders['Content-Type'] = 'application/json'
  }

  const requestConfig: AxiosRequestConfig = {
    ...config,
    headers: newHeaders,
  }

  return requestConfig
}

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error('[Request Error]', error)
  return Promise.reject(error)
}

const onResponse = <T = any>(response: AxiosResponse<T>): Promise<ClientResponse<T>> => {
  const clientResponse: ClientResponse<T> = {
    success: true,
    data: response.data,
    error: null,
    statusCode: response.status,
  }
  return Promise.resolve(clientResponse)
}

const onResponseError = (error: AxiosError<any>): Promise<ClientResponse<null>> => {
  const toastStore = useToastStore()
  let errorMessage = 'An unexpected error occurred.'
  let errorDetails: any = null
  let statusCode = error.response?.status

  if (error.response) {
    const responseData = error.response.data
    errorMessage =
      responseData?.message || (typeof responseData === 'string' && responseData) || error.message
    errorDetails = responseData
    statusCode = error.response.status
  } else if (error.request) {
    errorMessage = 'No response from server. Please check your network connection.'
  } else {
    errorMessage = error.message
  }

  toastStore.push({
    type: 'error',
    message: errorMessage,
  })

  const clientResponse: ClientResponse<null> = {
    success: false,
    data: null,
    error: {
      message: errorMessage,
      statusCode: statusCode,
      details: errorDetails,
      originalError: error,
    },
    statusCode: statusCode,
  }
  return Promise.resolve(clientResponse)
}

const setupInterceptorsTo = (axiosInstance: AxiosInstance): AxiosInstance => {
  axiosInstance.interceptors.request.use(onRequest, onRequestError)
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => onResponse(response),
    (error: AxiosError) => onResponseError(error),
  )
  return axiosInstance
}

setupInterceptorsTo(apiClient)

export default apiClient
