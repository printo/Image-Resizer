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

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const parseResult = validateAndProcessCSV(results.data as string[][])
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

function validateAndProcessCSV(rawData: string[][]): CSVParseResult {
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

    // Check column count
    if (row.length < 3) {
      errors.push(`Row ${rowNumber}: Missing columns (expected 3: filename, length, width)`)
      continue
    }

    const [filename, lengthStr, widthStr] = row.map((cell) => cell.trim())

    // Validate filename
    if (!filename) {
      errors.push(`Row ${rowNumber}: Filename cannot be empty`)
      continue
    }

    // Check if filename has valid image extension
    const validExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"]
    const hasValidExtension = validExtensions.some((ext) => filename.toLowerCase().endsWith(ext))

    if (!hasValidExtension) {
      warnings.push(`Row ${rowNumber}: "${filename}" may not be a valid image file`)
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
      filename,
      length,
      width,
    })
  }

  // Check for duplicate filenames
  const filenameSet = new Set<string>()
  const duplicates = new Set<string>()

  validRows.forEach((row, index) => {
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
    ["filename", "length", "width"],
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
