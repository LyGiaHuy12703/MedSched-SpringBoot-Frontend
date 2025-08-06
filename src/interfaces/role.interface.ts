import type { Permission } from './permission.interface'
import type { Meta } from './resultPagination.interface'
import type { User } from './user.interface'

export type Role = {
  id: string
  name: string
  description?: string
  active?: boolean
  permissions?: Permission[]
  users?: User[]
}

export type RoleApiResponse = {
  success: boolean
  message: string
  code: number
  data: {
    meta: Meta
    result: Role[]
  }
}
export type CreateRoleRequest = {
  name: string
  description: string
  permissions: string[]
}
export type UpdateRoleRequest = {
  name: string
  description: string
  permissions: string[]
}
