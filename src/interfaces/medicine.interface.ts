import type { Prescription } from './prescriptions.interface'

export type Medicine = {
  id: string
  name: string
  description: string
  formulation?: string // Dạng bào chế
  therapeuticGroup?: string // Nhóm điều trị
  indications?: string // Chỉ định
  contraindications?: string // Chống chỉ định
  cautions?: string // Thận trọng
  dosage?: string // Liều lượng
  sideEffects?: string // Tác dụng phụ
  notes?: string // Ghi chú
  referenceDocuments?: string // Tài liệu tham khảo
  price?: number
  prescriptions?: Prescription[] // Nếu cần, bạn nên tạo PrescriptionDTO tương ứng
  createdAt?: string // Instant trong Java thường map sang string ISO trong TS
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}

export type CreateMedicineRequest = {
  name: string
  price: number
  formulation: string
  therapeuticGroup: string
  description: string
  dosage: string[]
  indications: string[]
  contraindications: string[]
  cautions: string[]
  sideEffects: string[]
  notes: string
  referenceDocuments: string
}
