import type { MedicalRecord } from '@/interfaces/medicalRecord.interfaces'
import type { RequestMedicalRecord } from '@/interfaces/medicalRecord.interfaces'
import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import medicalRecordService from '@/services/medicalRecord.service'
import { defineStore } from 'pinia'

export const useMedicalRecordStore = defineStore('useMedicalRecordStore', {
  state: () => ({
    medicalRecords: [] as MedicalRecord[],
    medicalRecord: null as MedicalRecord | null,
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
    selectedMedicalRecord: null as MedicalRecord | null,
  }),
  getters: {},
  actions: {
    async fetchMedicalRecords(page: number, pageSize: number, search?: string): Promise<void> {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(diagnosis ~ '${escapeSearch(search)}' or treatment ~ '${escapeSearch(search)}' or notes ~ '${escapeSearch(search)}' or user.name ~ '${escapeSearch(search)}')`
          : undefined
        const res = await medicalRecordService.getMedicalRecords(page, pageSize, filter)
        this.medicalRecords = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách hồ sơ y tế.'
      } finally {
        this.loading = false
      }
    },
    async addMedicalRecord(
      request: RequestMedicalRecord,
    ): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicalRecordService.addMedicalRecord(request)
        if (res.success) {
          if (res?.data?.data) {
            this.medicalRecords.push(res.data.data)
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
    async updateMedicalRecord(
      id: string,
      request: RequestMedicalRecord,
    ): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicalRecordService.updateMedicalRecord(id, request)
        if (res.success) {
          const index = this.medicalRecords.findIndex((record) => record.id === id)
          if (index !== -1) {
            this.medicalRecords[index] = res.data.data
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
    async deleteMedicalRecord(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicalRecordService.deleteMedicalRecord(id)
        if (res.success) {
          this.medicalRecords = this.medicalRecords.filter((record) => record.id !== id)
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
    async getMedicalRecordById(id: string): Promise<ClientResponse<APIResponse<MedicalRecord>>> {
      this.loading = true
      this.error = null
      try {
        const res = await medicalRecordService.getMedicalRecordById(id)
        if (res.success) {
          this.selectedMedicalRecord = res.data.data
          this.medicalRecord = res.data.data
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
    clearSelectedMedicalRecord(): void {
      this.selectedMedicalRecord = null
    },
    resetStore(): void {
      this.medicalRecords = []
      this.meta = null
      this.loading = false
      this.error = null
      this.selectedMedicalRecord = null
    },
  },
})
