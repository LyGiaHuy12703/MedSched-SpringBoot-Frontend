import type { DoctorShift } from './doctorShift.interfaces'
import type { Invoice } from './invoice.interfaces'
import type { Service } from './service.interfaces'
import type { Staff } from './staff.interface'
import type { User } from './user.interface'

export type Appointment = {
  id: string
  date: string
  time: string
  name: string
  emailReceiveInfo: string
  phoneReceiveInfo: string
  dob: string
  gender: string
  invoice: Invoice
  services: Service[]
  staff: Staff
  user: User
  reason: string
  doctorShift: DoctorShift
  status: string
}
export type AppointmentRequest = {
  date: string
  time: string
  staffId: string
  doctorShiftId: string
  reason: string
  emailReceiveInfo: string
  phoneReceiveInfo: string
  dob: string
  gender: string
  name: string
  servicesId: string[]
}

export type AppointmentResponse = {
  id: string
  date: string
  time: string
  staff: Staff
  user: User
  reason: string
  name: string
  emailReceiveInfo: string
  phoneReceiveInfo: string
  dob: string
  gender: string
  doctorShift: DoctorShift
  status: string
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  updatedBy?: string
}


