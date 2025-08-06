import { defineStore } from 'pinia'
import axios from 'axios'
import { ref, computed } from 'vue'
import type { APIResponse } from '@/interfaces/response.interface'

// Định nghĩa một kiểu dữ liệu cho state để code rõ ràng hơn
interface StatsState {
  patients: number | null
  staff: number | null
  services: number | null
  appointments: number | null
  feedbackPoint: number | null
  departments: number | null
  appointmentsStatus: number | null
  successRate: number | null
}

export const useCountStore = defineStore('count', () => {
  // Khởi tạo state với kiểu dữ liệu đã định nghĩa
  const stats = ref<StatsState>({
    patients: 0,
    staff: 0,
    services: 0,
    appointments: 0,
    feedbackPoint: 0,
    departments: 0,
    appointmentsStatus: 0,
    successRate: 0,
  })

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Tính phần trăm thành công
  const successRate = computed(() => {
    const totalAppointments = stats.value.appointments || 0
    const successfulAppointments = stats.value.appointmentsStatus || 0
    return totalAppointments > 0
      ? Math.round((successfulAppointments / totalAppointments) * 100)
      : 0
  })

  const fetchCounts = async () => {
    // Chỉ fetch nếu chưa có dữ liệu, tránh gọi lại không cần thiết
    if (stats.value.patients > 0 && !isLoading.value) {
      return
    }

    isLoading.value = true
    error.value = null
    try {
      const [
        patientsResponse,
        staffResponse,
        servicesResponse,
        appointmentsResponse,
        feedbackResponse,
        departmentResponse,
        appointmentStatusResponse,
      ] = await Promise.all([
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/patients'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/staffs'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/services'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/appointments'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/avg/feedback'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/departments'),
        axios.get<APIResponse<number>>('http://localhost:8080/api/users/count/appointments/status'),
      ])

      stats.value = {
        patients: patientsResponse.data.data,
        staff: staffResponse.data.data,
        services: servicesResponse.data.data,
        appointments: appointmentsResponse.data.data,
        appointmentsStatus: appointmentStatusResponse.data.data,
        departments: departmentResponse.data.data,
        feedbackPoint: feedbackResponse.data.data || 0,
      }
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        error.value = err.response?.data?.message || 'Lỗi khi lấy số liệu thống kê từ server.'
      } else {
        error.value = 'Đã có lỗi không xác định xảy ra.'
      }
      console.error('Error fetching counts:', err)
    } finally {
      isLoading.value = false
    }
  }

  return { stats, isLoading, error, fetchCounts, successRate }
})
