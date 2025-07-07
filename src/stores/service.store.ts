import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import type { Meta } from '@/interfaces/resultPagination.interface'
import type { Service, ServiceRequest } from '@/interfaces/service.interfaces'
import serviceService from '@/services/service.service'
import { defineStore } from 'pinia'

export const useServiceStore = defineStore('useServiceStore', {
  state: () => ({
    services: [] as Service[],
    meta: null as Meta | null,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async exportExcel(): Promise<void> {
      this.loading = true;
      this.error = null;

      try {
        const response = await serviceService.exportServices(); // Gọi qua serviceService
        console.log('Response data:', response);

        if (!response.success || !(response.data instanceof Blob)) {
          throw new Error(response.message || 'Dữ liệu trả về không hợp lệ.');
        }

        const url = window.URL.createObjectURL(
          new Blob([response.data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'exported_services.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error: any) {
        this.error = error.message || 'Xuất Excel thất bại.';
        throw new Error(this.error);
      } finally {
        this.loading = false;
      }
    },

    async importExcel(file: File): Promise<ClientResponse<APIResponse<Service[]>>> {
      this.loading = true
      this.error = null
      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await serviceService.importServices(formData)
        if (res.success) {
          if (res?.data?.data) {
            this.services = res.data.data // Cập nhật danh sách dịch vụ sau khi import
          }
          return res
        } else {
          this.error = res?.error?.details?.error
          throw new Error(res?.error?.details?.error)
        }
      } catch (error) {
        this.error = error.message || 'Import Excel thất bại.'
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
    async fetchServices(
      page: number = 0,
      pageSize: number = 100,
      departmentId?: string,
      search?: string,
    ): Promise<void> {
      const escapeSearch = (value: string): string => {
        return value.replace(/'/g, "\\'").replace(/\|/g, '\\|')
      }
      this.loading = true
      this.error = null
      try {
        const filter = search
          ? `(name ~ '${escapeSearch(search)}' or description ~ '${escapeSearch(search)}' or id ~ '${escapeSearch(search)}')`
          : undefined
        const effectiveDepartmentId = departmentId || undefined // Mặc định '1' nếu không có departmentId
        const res = await serviceService.getServices(page, pageSize, filter, effectiveDepartmentId)
        this.services = res.data.data.result
        this.meta = res.data.data.meta
      } catch (error) {
        this.error = error.message || 'Không thể tải danh sách dịch vụ.'
      } finally {
        this.loading = false
      }
    },
    async addService(request: ServiceRequest): Promise<ClientResponse<APIResponse<Service>>> {
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
      } catch (error) {
        throw new Error(this.error)
      } finally {
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
      } catch (error) {
        throw new Error(this.error)
      } finally {
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
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
