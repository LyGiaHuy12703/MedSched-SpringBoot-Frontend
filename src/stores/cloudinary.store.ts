import type {
  APIResponse,
  ClientResponse,
  StandardizedError,
} from '@/interfaces/response.interface'
import cloudinaryService from '@/services/cloudinary.service'
import { defineStore } from 'pinia'

export const useCloudinaryStore = defineStore('cloudinary', {
  state: () => ({
    avatarUrl: String,
    loading: false,
    error: null as StandardizedError | null,
  }),
  getters: {},
  actions: {
    async upload(file: FormData): Promise<ClientResponse<APIResponse<string>>> {
      try {
        this.loading = true
        const response = await cloudinaryService.upload(file)
        if (response.success) {
          this.avatarUrl = response.data?.data
          return response.data?.data
        } else {
          throw new Error(response.error?.details?.error)
        }
      } catch (error) {
        throw new Error(this.error)
      } finally {
        this.loading = false
      }
    },
  },
})
