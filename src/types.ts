export interface CSVRow {
  filename: string
  length: number
  width: number
}

export interface ProcessingStatus {
  stage: string
  progress: number
  message: string
}

export interface ImageProcessingResult {
  success: boolean
  processedCount: number
  errors: string[]
  downloadUrl?: string
}
