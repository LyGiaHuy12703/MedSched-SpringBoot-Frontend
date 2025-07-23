import { defineStore } from 'pinia'
import inventoryService from '@/services/inventory.service' // Giả sử bạn có service này
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { ImportReport } from '@/interfaces/inventory.interfaces' // Tạo interface này

export const useInventoryStore = defineStore('useInventoryStore', {
  state: () => ({
    loading: false,
    error: null as StandardizedError | null,
    lastImportReport: null as ImportReport | null,
  }),
  actions: {
    /**
     * Imports inventory data from an Excel file.
     * @param file The Excel file to be uploaded.
     * @returns A client response containing the import report.
     */
    async importFromExcel(file: File): Promise<ClientResponse<APIResponse<ImportReport>>> {
      this.loading = true
      this.error = null
      try {
        const res = await inventoryService.importFromExcel(file)

        if (res.success && res.data?.data) {
          this.lastImportReport = res.data.data
          return res
        } else {
          this.error = res.error?.details?.error || 'Excel import failed.'
          throw new Error(this.error as string)
        }
      } catch (error: any) {
        this.error = error.message || 'An unexpected error occurred during import.'
        throw new Error(this.error as string)
      } finally {
        this.loading = false
      }
    },

    resetStore(): void {
      this.loading = false
      this.error = null
      this.lastImportReport = null
    },
  },
})
