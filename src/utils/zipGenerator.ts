import JSZip from "jszip"
import type { ProcessingResult } from "./imageProcessor"

export interface ZipGenerationProgress {
  stage: string
  current: number
  total: number
  percentage: number
  message: string
}

export class ZipGenerator {
  private onProgress?: (progress: ZipGenerationProgress) => void

  constructor(onProgress?: (progress: ZipGenerationProgress) => void) {
    this.onProgress = onProgress
  }

  async generateZip(processingResult: ProcessingResult): Promise<Blob> {
    const zip = new JSZip()
    const successfulImages = processingResult.processedImages.filter((img) => img.success)

    if (successfulImages.length === 0) {
      throw new Error("No successfully processed images to download")
    }

    // Stage 1: Add images to ZIP
    this.updateProgress("Adding images to ZIP...", 0, successfulImages.length, 0)

    const resizedFolder = zip.folder("resized_images")
    if (!resizedFolder) {
      throw new Error("Failed to create resized_images folder")
    }

    for (let i = 0; i < successfulImages.length; i++) {
      const image = successfulImages[i]
      this.updateProgress(
        `Adding ${image.filename}...`,
        i + 1,
        successfulImages.length,
        Math.round(((i + 1) / successfulImages.length) * 70),
      )

      // Add image to ZIP with original filename
      resizedFolder.file(image.filename, image.blob)
    }

    // Stage 2: Generate processing report
    this.updateProgress("Generating processing report...", successfulImages.length, successfulImages.length, 75)
    const report = this.generateProcessingReport(processingResult)
    zip.file("processing_report.txt", report)

    // Stage 3: Generate ZIP blob
    this.updateProgress("Finalizing ZIP file...", successfulImages.length, successfulImages.length, 90)

    try {
      const zipBlob = await zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 6, // Good balance between size and speed
        },
      })

      this.updateProgress("ZIP file ready for download!", successfulImages.length, successfulImages.length, 100)
      return zipBlob
    } catch (error) {
      throw new Error(`Failed to generate ZIP file: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private generateProcessingReport(result: ProcessingResult): string {
    const timestamp = new Date().toLocaleString()
    const successCount = result.processedImages.filter((img) => img.success).length
    const failureCount = result.processedImages.filter((img) => !img.success).length

    let report = `Image Resizing Processing Report
Generated: ${timestamp}

SUMMARY:
========
Total Images Processed: ${result.processedImages.length}
Successfully Resized: ${successCount}
Failed: ${failureCount}
Skipped (Not Found): ${result.skippedFiles.length}

SUCCESSFULLY PROCESSED IMAGES:
==============================
`

    result.processedImages
      .filter((img) => img.success)
      .forEach((img) => {
        report += `✓ ${img.filename}
  Original Size: ${img.originalSize.width} × ${img.originalSize.height} px
  Resized To: ${img.targetSize.width} × ${img.targetSize.height} px (300 DPI)
  File Size: ${this.formatFileSize(img.blob.size)}

`
      })

    if (failureCount > 0) {
      report += `FAILED IMAGES:
==============
`
      result.processedImages
        .filter((img) => !img.success)
        .forEach((img) => {
          report += `✗ ${img.filename}
  Error: ${img.error || "Unknown error"}

`
        })
    }

    if (result.skippedFiles.length > 0) {
      report += `SKIPPED FILES (NOT FOUND IN ZIP):
==================================
`
      result.skippedFiles.forEach((filename) => {
        report += `- ${filename}
`
      })
    }

    if (result.errors.length > 0) {
      report += `
PROCESSING ERRORS:
==================
`
      result.errors.forEach((error, index) => {
        report += `${index + 1}. ${error}
`
      })
    }

    report += `
TECHNICAL DETAILS:
==================
- All images resized to 300 DPI
- Output format: JPEG (95% quality)
- Compression: High-quality image smoothing enabled
- Processing method: HTML5 Canvas with bicubic interpolation

For support or questions, please contact your system administrator.
`

    return report
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  private updateProgress(message: string, current: number, total: number, percentage: number) {
    if (this.onProgress) {
      this.onProgress({
        stage: "generating",
        current,
        total,
        percentage,
        message,
      })
    }
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export function generateDownloadFilename(): string {
  const now = new Date()
  const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, "-")
  return `resized_images_${timestamp}.zip`
}
