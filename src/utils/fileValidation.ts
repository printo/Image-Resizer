export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB per image

export function validateZipFile(file: File): FileValidationResult {
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (!file.name.toLowerCase().endsWith(".zip")) {
    return { isValid: false, error: "File must be a ZIP archive" }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: "ZIP file must be smaller than 100MB" }
  }

  if (file.size === 0) {
    return { isValid: false, error: "ZIP file cannot be empty" }
  }

  return { isValid: true }
}

export function validateCsvFile(file: File): FileValidationResult {
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return { isValid: false, error: "File must be a CSV file" }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: "CSV file must be smaller than 10MB" }
  }

  if (file.size === 0) {
    return { isValid: false, error: "CSV file cannot be empty" }
  }

  return { isValid: true }
}

export function validateImageSize(imageBlob: Blob, filename: string): FileValidationResult {
  if (imageBlob.size > MAX_IMAGE_SIZE) {
    return {
      isValid: false,
      error: `Image "${filename}" is ${formatFileSize(imageBlob.size)} (max: ${formatFileSize(MAX_IMAGE_SIZE)})`,
    }
  }
  return { isValid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
