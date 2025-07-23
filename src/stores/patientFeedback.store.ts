import type {
  PatientFeedback,
  PatientFeedbackCreate,
} from '@/interfaces/patientFeedback.interfaces'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import patientFeedbackService from '@/services/patientFeedback.service'
import { defineStore } from 'pinia'

export const usePatientFeedbackStore = defineStore('usePatientFeedbackStore', {
  state: () => ({
    feedbacks: [] as PatientFeedback[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchPatientFeedbacks(page: number, pageSize: number, search?: string): Promise<void> {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(patientName ~ '${escapeSearch(search)}' or feedback ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await patientFeedbackService.getAllFeedbacks(page, pageSize, filter)
        this.feedbacks = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách phản hồi của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async addPatientFeedback(
      request: PatientFeedbackCreate,
    ): Promise<ClientResponse<APIResponse<PatientFeedback>>> {
      this.loading = true
      this.error = null
      try {
        const res = await patientFeedbackService.addFeedback(request)
        if (res.success) {
          if (res?.data?.data) {
            this.feedbacks.push(res.data.data)
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error) || 'Không thể thêm phản hồi của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async updatePatientFeedback(
      id: string,
      request: PatientFeedbackCreate,
    ): Promise<ClientResponse<APIResponse<PatientFeedback>>> {
      this.loading = true
      this.error = null
      try {
        const res = await patientFeedbackService.updateFeedback(id, request)
        if (res.success) {
          const index = this.feedbacks.findIndex((feedback) => feedback.id === id)
          if (index !== -1) {
            this.feedbacks[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error) || 'Không thể cập nhật phản hồi của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async deletePatientFeedback(id: string): Promise<ClientResponse<APIResponse<void>>> {
      this.loading = true
      this.error = null
      try {
        const res = await patientFeedbackService.deleteFeedback(id)
        if (res.success) {
          this.feedbacks = this.feedbacks.filter((feedback) => feedback.id !== id)
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error) || 'Không thể xóa phản hồi của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
  },
})
