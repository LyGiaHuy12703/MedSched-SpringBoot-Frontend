export type Service = {
  id: string
  name: string
  description: string
  price: number
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}
export type ServiceRequest = {
  name: string
  description: string
  price: number
}
