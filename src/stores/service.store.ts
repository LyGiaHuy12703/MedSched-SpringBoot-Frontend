import type { APIResponse, ClientResponse, StandardizedError } from "@/interfaces/response.interface"
import type { Meta } from "@/interfaces/resultPagination.interface"
import type { Service, ServiceRequest } from "@/interfaces/service.interfaces"
import serviceService from "@/services/service.service"
import { defineStore } from "pinia"

export const useServiceStore = defineStore('useServiceStore', {
  state: () => ({
    services: [] as Service[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async fetchServices(page: number, pageSize: number, search?: string): Promise<void> {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or description ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const res = await serviceService.getServices(page, pageSize, filter)
        this.services = res.data.data.result
        this.meta = res.data.data.meta
      }
      catch (error) {
        this.error = error.message || 'Không thể tải danh sách dịch vụ.'
      }
      finally {
        this.loading = false
      }
    },
    async addService(
      request: ServiceRequest
    ): Promise<ClientResponse<APIResponse<Service>>> {
      this.loading = true
      this.error = null
      try {
        const res = await serviceService.addService(request)
        if (res.success) {
          if (res?.data?.data) {
            this.services.push(res.data.data)
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      }
      catch (error) {
        throw new Error(this.error)
      }
      finally {
        this.loading = false
      }
    },
    async updateService(
      id: string,
      request: ServiceRequest,
    ): Promise<ClientResponse<APIResponse<Service>>> {
      this.loading = true
      this.error = null
      try {
        const res = await serviceService.updateService(id, request)
        if (res.success) {
          const index = this.services.findIndex((service) => service.id === id)
          if (index !== -1) {
            this.services[index] = res.data.data
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      }
      catch (error) {
        throw new Error(this.error)
      }
      finally {
        this.loading = false
      }
    },
    async deleteService(id: string): Promise<ClientResponse<APIResponse<string>>> {
      this.loading = true
      this.error = null
      try {
        const res = await serviceService.deleteService(id)
        if (res.success) {
          this.services = this.services.filter((service) => service.id !== id)
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      }
      catch (error) {
        throw new Error(this.error)
      }
      finally {
        this.loading = false
      }
    },
  },
})

