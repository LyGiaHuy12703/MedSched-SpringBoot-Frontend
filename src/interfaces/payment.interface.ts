export type PaymentResponseInfo = {
  status: string
  message: string
  url: string
}
export type PaymentRequest = {
  amount: number
  appointmentId: string
}
