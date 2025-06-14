import type { Appointment } from './appointment.interfaces'
import type { Department } from './department.interface'
import type { MedicalRecord } from './medicalRecord.interface'
import type { Role } from './role.interface'

export type Staff = {
  id: string
  user: {
    id: string
    name: string
    email: string
    age: number
    gender: string
    dob: string
    phone: string
    address: string
    avatar: string
    active: boolean
  }
  position: string
  experienceYear: number
  rating: number
  departments: Department
  appointments: Appointment[]
  medicalRecords: MedicalRecord[]
  roles: Role[]
}

export type CreateStaffRequest = {
  email: string
  name: string
  password: string
  gender: string
  dob: string
  address: string
  phone: string
  experienceYear: number
  position: string
  departmentId: string
  roles: string[]
  avatar: File | string
}
export type UpdateStaffRequest = {
  name: string
  gender: string
  dob: string
  address: string
  phone: string
  experienceYear: number
  position: string
  departmentId: string
  roles: string[]
  avatar: string
}
