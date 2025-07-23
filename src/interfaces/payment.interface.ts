export type PaymentResponseInfo = {
  message: string
  paymentUrl?: string
  action: 'REDIRECT' | 'SHOW_MESSAGE_AND_EMAIL'
  appointmentId: string
}
export type PaymentRequest = {
  amount: number
  appointmentId: string
}
