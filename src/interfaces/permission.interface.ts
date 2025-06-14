import type { Meta } from './resultPagination.interface'

export type Permission = {
  id?: string
  name?: string
  apiPath?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string // Hoặc: string nếu bạn không chắc
  module?: string
  createdAt?: string
  updatedAt?: string | null
  createdBy?: string | null
  updatedBy?: string | null
}
export interface PermissionApiResponse {
  success: boolean
  message: string
  code: number
  data: {
    meta: Meta
    result: Permission[]
  }
}

export type CreatePermissionRequest = {
  name: string
  apiPath: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | ''
  module: string
}
