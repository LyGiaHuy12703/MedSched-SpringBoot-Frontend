import type { CreateMedicineRequest, Medicine } from '@/interfaces/medicine.interface'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import medicineService from '@/services/medicine.service'
import { defineStore } from 'pinia'

export const useMedicineStore = defineStore('useMedicineStore', {
  state: () => ({
    medicines: [] as Medicine[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchMedicines(page: number, pageSize: number, search?: string) {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or description ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await medicineService.fetchMedicines(page, pageSize, filter)
        this.medicines = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách thuốc.'
      } finally {
        this.loading = false
      }
    },
    async addMedicine(
      request: CreateMedicineRequest,
    ): Promise<ClientResponse<APIResponse<Medicine>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.addMedicine(request)
        if (res.success) {
          if (res?.data?.data) {
            this.medicines.push(res.data.data)
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async updateMedicine(
      id: string,
      request: CreateMedicineRequest,
    ): Promise<ClientResponse<APIResponse<Medicine>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.updateMedicine(id, request)
        if (res.success) {
          const index = this.medicines.findIndex((med) => med.id === id)
          if (index !== -1 && res.data.data) {
            this.medicines[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async deleteMedicine(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.deleteMedicine(id)
        if (res.success) {
          this.medicines = this.medicines.filter((med) => med.id !== id)
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchCautions(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.fetchCautions()
        if (res.success) {
          return res.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchIndications(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.fetchIndications()
        if (res.success) {
          return res.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchContraindications(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.fetchContraindications()
        if (res.success) {
          return res.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchDosage(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.fetchDosage()
        if (res.success) {
          return res.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchSideEffect(): Promise<ClientResponse<APIResponse<string[]>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicineService.fetchSideEffect()
        if (res.success) {
          return res.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
