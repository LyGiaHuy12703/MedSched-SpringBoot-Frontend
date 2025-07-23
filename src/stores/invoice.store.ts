import type { Invoice } from '@/interfaces/invoice.interfaces'
import type { StandardizedError } from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import invoiceService from '@/services/invoice.service'
import { defineStore } from 'pinia'

export const useInvoiceStore = defineStore('useInvoiceStore', {
  state: () => ({
    invoices: [] as Invoice[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchInvoicesByPatient(page: number, pageSize: number, filterStatus?: string) {
      this.loading = true
      this.error = null
      try {
        const res = await invoiceService.fetchInvoicesByPatient(page, pageSize, filterStatus)
        if (res.success) {
          this.invoices = res.data.data.result
          this.meta = res.data.data.meta
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách hóa đơn của bệnh nhân.'
      } finally {
        this.loading = false
      }
    },
    async changeStatus(id: string, status: string) {
      this.loading = true
      this.error = null
      try {
        const res = await invoiceService.changeStatus(id, status)
        if (res.success) {
          // Cập nhật lại danh sách hóa đơn sau khi thay đổi trạng thái
          await this.fetchInvoicesByPatient(1, 10) // Giả sử bạn muốn tải lại trang đầu tiên với 10 mục
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể cập nhật trạng thái hóa đơn.'
      } finally {
        this.loading = false
      }
    },
    async fetchById(id: string) {
      this.loading = true
      this.error = null
      try {
        const res = await invoiceService.fetchInvoiceById(id)
        if (res.success) {
          return res.data.data
        } else {
          this.error = res?.error?.details?.error
          throw new Error(this.error)
        }
      } catch (error) {
        this.error = error.message || 'Không thể tải thông tin hóa đơn.'
      } finally {
        this.loading = false
      }
    },
  },
})
