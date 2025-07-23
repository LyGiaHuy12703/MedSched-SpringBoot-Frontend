export interface DispensedItemDTO {
  medicationName: string
  quantity: number
  unitPrice: number
  itemTotalPrice: number
}

export interface DispenseResultDTO {
  medicalRecordId: string
  message: string
  totalPrice: number
  dispensedItems: DispensedItemDTO[]
}
