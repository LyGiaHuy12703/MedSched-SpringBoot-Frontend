import type { Appointment } from './appointment.interfaces'
import type { Staff } from './staff.interface'

export type DoctorShift = {
  id: string
  startTime: string
  endTime: string
  dayWork: string
  dayOfWeek: string
  status: string
  departmentDTO: {
    id: string
    name: string
  }
  staff: Staff
  appointments: Appointment[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

export type DoctorShiftCreateRequest = {
  startTime: string
  endTime: string
  dayWork: string
  staffId: string[]
}
export type DoctorShiftStatusUpdateRequest = {
  status: string
}
export type ScheduleBinding = {
  id: string
  start: string
  end: string
  date: string
}
export interface UserInfo {
  id: string
  name: string
  avatar?: string
}

// Interface rút gọn cho thông tin Staff
export interface StaffInfo {
  id: string
  position: string
  user: UserInfo
}

// Interface rút gọn cho thông tin DoctorShift
export interface ShiftInfo {
  id: string
  dayWork: string
  startTime: string
  endTime: string
}

export interface StaffDoctorShift {
  id: string
  status: 'PENDING' | 'APPROVED' | 'CANCELED' | 'COMPLETED' | 'IN_PROGRESS'
  staff: StaffInfo
  doctorShift: ShiftInfo
}
