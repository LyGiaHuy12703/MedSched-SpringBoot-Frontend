export type Invoice = {
  id: string
  totalAmount: number
  notes: string
  invoiceDate: string
  appointmentDTO: {
    id: string
    emailReceiveInfo: string
    phoneReceiveInfo: string
    name: string
  }
  method: string
  status: string
}
