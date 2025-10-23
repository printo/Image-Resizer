import Papa from "papaparse"
import type { CSVRow } from "../types"

export interface CSVParseResult {
  success: boolean
  data: CSVRow[]
  errors: string[]
  warnings: string[]
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
}

export function parseCSV(file: File, mode?: "constrained" | "file" | "brand"): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parseResult = validateAndProcessCSV(results.data as string[][], mode)
        resolve(parseResult)
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          errors: [`Failed to parse CSV: ${error.message}`],
          warnings: [],
        })
      },
    })
  })
}

function validateAndProcessCSV(rawData: string[][], mode?: "constrained" | "file" | "brand"): CSVParseResult {
  const errors: string[] = []
  const warnings: string[] = []
  const validRows: CSVRow[] = []

  if (rawData.length === 0) {
    return {
      success: false,
      data: [],
      errors: ["CSV file is empty"],
      warnings: [],
    }
  }

  // Check if first row might be headers
  const firstRow = rawData[0]
  let startIndex = 0

  if (
    firstRow.length >= 3 &&
    (firstRow[0].toLowerCase().includes("filename") ||
      firstRow[0].toLowerCase().includes("name") ||
      firstRow[0].toLowerCase().includes("product") ||
      firstRow[1].toLowerCase().includes("length") ||
      firstRow[1].toLowerCase().includes("width"))
  ) {
    startIndex = 1
    warnings.push("Detected header row - skipping first row")
  }

  // Validate each data row
  for (let i = startIndex; i < rawData.length; i++) {
    const row = rawData[i]
    const rowNumber = i + 1

    const expectedColumns = mode === "brand" ? 4 : 3
    if (row.length < expectedColumns) {
      errors.push(
        `Row ${rowNumber}: Missing columns (expected ${expectedColumns}: ${mode === "brand" ? "product name, length, width, image variant" : "filename, length, width"})`,
      )
      continue
    }

    let filename: string
    let lengthStr: string
    let widthStr: string
    let productName: string | undefined
    let imageVariant: string | undefined

    if (mode === "brand") {
      ;[productName, lengthStr, widthStr, imageVariant] = row.map((cell) => cell.trim())
      filename = `${productName}_${imageVariant}`
    } else {
      // Standard format: filename, length, width
      ;[filename, lengthStr, widthStr] = row.map((cell) => cell.trim())
    }

    // Validate filename/product name
    if (!filename) {
      errors.push(`Row ${rowNumber}: ${mode === "brand" ? "Product name" : "Filename"} cannot be empty`)
      continue
    }

    if (mode === "brand") {
      const validVariants = ["Original", "Full Black", "Full White"]
      if (!imageVariant || !validVariants.includes(imageVariant)) {
        errors.push(
          `Row ${rowNumber}: Image variant must be one of: ${validVariants.join(", ")} (got "${imageVariant}")`,
        )
        continue
      }
    } else {
      // Check if filename has valid image extension
      const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"]
      const hasValidExtension = validExtensions.some((ext) => filename.toLowerCase().endsWith(ext))

      if (!hasValidExtension) {
        warnings.push(`Row ${rowNumber}: "${filename}" may not be a valid image file`)
      }
    }

    // Validate length
    const length = Number.parseFloat(lengthStr)
    if (isNaN(length) || length <= 0) {
      errors.push(`Row ${rowNumber}: Length must be a positive number (got "${lengthStr}")`)
      continue
    }

    if (length > 100) {
      warnings.push(`Row ${rowNumber}: Length ${length} inches is very large`)
    }

    // Validate width
    const width = Number.parseFloat(widthStr)
    if (isNaN(width) || width <= 0) {
      errors.push(`Row ${rowNumber}: Width must be a positive number (got "${widthStr}")`)
      continue
    }

    if (width > 100) {
      warnings.push(`Row ${rowNumber}: Width ${width} inches is very large`)
    }

    // Add valid row
    validRows.push({
      filename: mode === "brand" ? `${imageVariant}` : filename,
      length,
      width,
      ...(mode === "brand" && { productName, imageVariant }),
    })
  }

  // Check for duplicate filenames
  const filenameSet = new Set<string>()
  const duplicates = new Set<string>()

  validRows.forEach((row) => {
    if (filenameSet.has(row.filename)) {
      duplicates.add(row.filename)
    } else {
      filenameSet.add(row.filename)
    }
  })

  if (duplicates.size > 0) {
    warnings.push(`Duplicate filenames found: ${Array.from(duplicates).join(", ")}`)
  }

  return {
    success: errors.length === 0,
    data: validRows,
    errors,
    warnings,
  }
}

export function generateSampleCSV(): string {
  const sampleData = [
    ["filename", "height", "width"],
    ["photo1.jpg", "8.5", "11"],
    ["image2.png", "5", "7"],
    ["picture3.jpeg", "4", "6"],
  ]

  return Papa.unparse(sampleData)
}

export function downloadSampleCSV(): void {
  const csvContent = generateSampleCSV()
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "sample_resize_specs.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}
