export interface PrescriptionItem {
  medicationId: string
  medicationName?: string // Tên thuốc, optional khi gửi đi
  quantity: number
  dosage: string
  status: 'PENDING' | 'DISPENSED' | 'CANCELLED' // Trạng thái đơn thuốc
}

// Request DTO gửi lên server khi tạo hồ sơ
export interface RequestMedicalRecord {
  appointmentId: string
  diagnosis: string
  treatment: string
  notes: string
  prescriptions: PrescriptionItem[] // Danh sách các thuốc trong đơn
}

// DTO cho thông tin cơ bản của bệnh nhân/bác sĩ (dùng trong response)
export interface PersonInfo {
  id: string
  name: string
  email?: string
  gender?: string
  dob?: string
  department?: string
}

// Response DTO nhận về từ server
export interface MedicalRecord {
  id: string
  diagnosis: string
  treatment: string
  notes: string
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  patientInfo: PersonInfo
  doctorInfo: PersonInfo
  prescriptions: PrescriptionItem[]
  createdAt: string
  createdBy: string
}
