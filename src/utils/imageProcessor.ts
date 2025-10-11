import JSZip from "jszip"
import type { CSVRow } from "../types"
import { validateImageSize } from "./fileValidation"
import { TimeEstimator, type TimeEstimate } from "./timeEstimator"

export interface ProcessingProgress {
  stage: string
  current: number
  total: number
  percentage: number
  message: string
  timeEstimate?: TimeEstimate
}

export interface ProcessedImage {
  filename: string
  originalSize: { width: number; height: number }
  targetSize: { width: number; height: number }
  blob: Blob
  success: boolean
  error?: string
  originalFileSize?: number
  processedFileSize?: number
}

export interface ProcessingResult {
  success: boolean
  processedImages: ProcessedImage[]
  errors: string[]
  skippedFiles: string[]
}

export class ImageProcessor {
  private onProgress?: (progress: ProcessingProgress) => void
  private timeEstimator: TimeEstimator

  constructor(onProgress?: (progress: ProcessingProgress) => void) {
    this.onProgress = onProgress
    this.timeEstimator = new TimeEstimator()
  }

  async processImages(
    zipFile: File,
    csvData: CSVRow[],
    options?: { mode: "constrained" | "file" },
  ): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      processedImages: [],
      errors: [],
      skippedFiles: [],
    }

    try {
      this.timeEstimator.start()

      // Stage 1: Extract ZIP file
      this.updateProgress("Extracting ZIP file...", 0, csvData.length, 0)
      const zip = await JSZip.loadAsync(zipFile)

      // Get all image files from ZIP
      const imageFiles = new Map<string, JSZip.JSZipObject>()
      zip.forEach((relativePath, file) => {
        if (!file.dir && this.isImageFile(relativePath)) {
          // Use just the filename, not the full path
          const filename = relativePath.split("/").pop() || relativePath
          imageFiles.set(filename.toLowerCase(), file)
        }
      })

      this.updateProgress("Found images in ZIP", 0, csvData.length, 5)

      // Stage 2: Process each image according to CSV specifications
      for (let i = 0; i < csvData.length; i++) {
        const csvRow = csvData[i]
        const progress = Math.round(((i + 1) / csvData.length) * 90) + 5 // 5-95%

        const timeEstimate = this.timeEstimator.getEstimate(i, csvData.length)
        this.updateProgress(`Processing ${csvRow.filename}...`, i + 1, csvData.length, progress, timeEstimate)

        try {
          const imageFile = imageFiles.get(csvRow.filename.toLowerCase())

          if (!imageFile) {
            result.skippedFiles.push(csvRow.filename)
            result.errors.push(`Image not found in ZIP: ${csvRow.filename}`)
            this.timeEstimator.recordItemCompletion()
            continue
          }

          // Load image data
          const imageBlob = await imageFile.async("blob")

          const sizeValidation = validateImageSize(imageBlob, csvRow.filename)
          if (!sizeValidation.isValid) {
            result.errors.push(sizeValidation.error!)
            result.processedImages.push({
              filename: csvRow.filename,
              originalSize: { width: 0, height: 0 },
              targetSize: { width: Math.round(csvRow.width * 300), height: Math.round(csvRow.length * 300) },
              blob: new Blob(),
              success: false,
              error: sizeValidation.error,
              originalFileSize: imageBlob.size,
            })
            this.timeEstimator.recordItemCompletion()
            continue
          }

          const processedImage = await this.resizeImage(imageBlob, csvRow, options)
          result.processedImages.push(processedImage)

          this.timeEstimator.recordItemCompletion()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          result.errors.push(`Failed to process ${csvRow.filename}: ${errorMessage}`)
          result.processedImages.push({
            filename: csvRow.filename,
            originalSize: { width: 0, height: 0 },
            targetSize: { width: Math.round(csvRow.width * 300), height: Math.round(csvRow.length * 300) },
            blob: new Blob(),
            success: false,
            error: errorMessage,
          })
          this.timeEstimator.recordItemCompletion()
        }
      }

      const finalTimeEstimate = this.timeEstimator.getEstimate(csvData.length, csvData.length)
      this.updateProgress("Processing complete!", csvData.length, csvData.length, 100, finalTimeEstimate)
      result.success = result.processedImages.some((img) => img.success)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      result.errors.push(`Failed to process ZIP file: ${errorMessage}`)
    }

    return result
  }

  private async resizeImage(
    imageBlob: Blob,
    csvRow: CSVRow,
    options?: { mode: "constrained" | "file" },
  ): Promise<ProcessedImage> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        try {
          const dpi = 300
          const requestedWidth = Math.round(csvRow.width * dpi)
          const requestedHeight = Math.round(csvRow.length * dpi)

          let targetWidth = requestedWidth
          let targetHeight = requestedHeight

          if (options?.mode === "constrained") {
            // Use the smaller of the requested dimensions as the base
            const base = Math.max(1, Math.min(requestedWidth, requestedHeight))
            const aspect = img.width / img.height

            if (aspect >= 1) {
              // Landscape or square: width >= height -> set width to base
              targetWidth = base
              targetHeight = Math.max(1, Math.round(base / aspect))
            } else {
              // Portrait: height > width -> set height to base
              targetHeight = base
              targetWidth = Math.max(1, Math.round(base * aspect))
            }
          }
          // else 'file' -> keep direct CSV W×H

          // Create canvas for resizing
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }

          canvas.width = targetWidth
          canvas.height = targetHeight

          // Set high-quality rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Draw resized image
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create resized image blob"))
                return
              }

              resolve({
                filename: csvRow.filename,
                originalSize: { width: img.width, height: img.height },
                targetSize: { width: targetWidth, height: targetHeight },
                blob,
                success: true,
                originalFileSize: imageBlob.size,
                processedFileSize: blob.size,
              })
            },
            "image/jpeg",
            0.95,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(imageBlob)
    })
  }

  private isImageFile(filename: string): boolean {
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"]
    const lowerFilename = filename.toLowerCase()
    return imageExtensions.some((ext) => lowerFilename.endsWith(ext))
  }

  private updateProgress(
    message: string,
    current: number,
    total: number,
    percentage: number,
    timeEstimate?: TimeEstimate,
  ) {
    if (this.onProgress) {
      this.onProgress({
        stage: "processing",
        current,
        total,
        percentage,
        message,
        timeEstimate,
      })
    }
  }
}

export function calculateImageDimensions(lengthInches: number, widthInches: number, dpi = 300) {
  return {
    width: Math.round(widthInches * dpi),
    height: Math.round(lengthInches * dpi),
    dpi,
  }
}

export function formatImageDimensions(width: number, height: number): string {
  return `${width} × ${height} px`
}
