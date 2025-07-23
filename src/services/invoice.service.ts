import type { Invoice } from '@/interfaces/invoice.interfaces'
import type { APIResponse, ClientResponse } from '@/interfaces/response.interface'
import apiClient from '@/utils/httpClient'

const invoiceService = {
  async fetchInvoicesByPatient(
    page: number,
    pageSize: number,
    status?: string,
  ): Promise<ClientResponse<APIResponse<Invoice[]>>> {
    return await apiClient.get('/invoices', {
      params: {
        page: page,
        size: pageSize,
        ...(status ? { filter: `status~'${status}'` } : {}),
      },
    })
  },
  async changeStatus(status: string, id: string): Promise<ClientResponse<APIResponse<Invoice>>> {
    return await apiClient.put(`/invoices/${id}/status`, { status: status })
  },
  async fetchInvoiceById(id: string): Promise<ClientResponse<APIResponse<Invoice>>> {
    return await apiClient.get(`/invoices/${id}`)
  },
}
export default invoiceService
