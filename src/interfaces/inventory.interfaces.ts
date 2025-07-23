export interface InventoryUpdateResultDTO {
  medicationName: string
  quantityBefore: number
  quantityAfter: number
  status: string
}

export interface ImportReport {
  successCount: number
  failureCount: number
  errorSummary: string[]
  detailedResults: InventoryUpdateResultDTO[]
}
