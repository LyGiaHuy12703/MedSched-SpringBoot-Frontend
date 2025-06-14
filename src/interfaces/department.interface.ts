import type { Service } from './service.interfaces'

export type Department = {
  id: string
  name: string
  description: string
  services: Service[]
  icon?: string
  createdAt?: string
  updatedAt?: string
  deletedAt?: string
}
export type DepartmentRequest = {
  name: string
  description: string
  serviceId: string[]
}
