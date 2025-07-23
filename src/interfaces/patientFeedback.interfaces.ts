import type { Appointment } from './appointment.interfaces'
import type { User } from './user.interface'

export type PatientFeedback = {
  id: string
  feedback: string
  rating: number
  user: User
  appointment: Appointment
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
export type PatientFeedbackCreate = {
  feedback: string
  rating: number
  appointmentId: string
}
