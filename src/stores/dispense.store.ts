import { defineStore } from 'pinia'
import dispenseService from '@/services/dispense.service' // Giả sử bạn có service này
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { DispenseResultDTO } from '@/interfaces/dispense.interfaces'

export const useDispenseStore = defineStore('useDispenseStore', {
  state: () => ({
    loading: false,
    error: null as StandardizedError | null,
    lastDispenseResult: null as DispenseResultDTO | null,
  }),
  actions: {
    /**
     * Executes the dispense process for a given medical record ID.
     * @param medicalRecordId The ID of the medical record to dispense.
     * @returns A client response containing the dispense result.
     */
    async dispenseByMedicalRecord(
      medicalRecordId: string,
    ): Promise<ClientResponse<APIResponse<DispenseResultDTO>>> {
      this.loading = true
      this.error = null
      try {
        const res = await dispenseService.dispenseByMedicalRecord(medicalRecordId)

        if (res.success && res.data?.data) {
          this.lastDispenseResult = res.data.data
          return res
        } else {
          // Gán lỗi từ response trước khi ném ra
          this.error = res.error?.details?.error || 'Dispense operation failed.'
          throw new Error(this.error as string)
        }
      } catch (error: any) {
        // Bắt các lỗi không lường trước và đảm bảo ném ra một Error object
        this.error = error.message || 'An unexpected error occurred during dispense.'
        throw new Error(this.error as string)
      } finally {
        this.loading = false
      }
    },

    resetStore(): void {
      this.loading = false
      this.error = null
      this.lastDispenseResult = null
    },
  },
})
