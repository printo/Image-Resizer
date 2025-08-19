"use client"

import type React from "react"
import { useCallback, useState } from "react"
import { Upload, X, FileImage, FileText, AlertCircle, CheckCircle } from "lucide-react"

interface FileUploadProps {
  accept: string
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
  title: string
  description: string
  icon: React.ReactNode
  color: "blue" | "green"
}

export function FileUpload({ accept, onFileSelect, selectedFile, title, description, icon, color }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState<string>("")

  const validateFile = (file: File): string | null => {
    const maxSize = 100 * 1024 * 1024 // 100MB

    if (file.size > maxSize) {
      return "File size must be less than 100MB"
    }

    if (accept === ".zip" && !file.name.toLowerCase().endsWith(".zip")) {
      return "Please select a valid ZIP file"
    }

    if (accept === ".csv" && !file.name.toLowerCase().endsWith(".csv")) {
      return "Please select a valid CSV file"
    }

    return null
  }

  const handleFileSelect = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        onFileSelect(null)
        return
      }

      setError("")
      onFileSelect(file)
    },
    [onFileSelect],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [handleFileSelect],
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFileSelect(file)
      }
    },
    [handleFileSelect],
  )

  const removeFile = useCallback(() => {
    onFileSelect(null)
    setError("")
  }, [onFileSelect])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const colorClasses = {
    blue: {
      border: isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300",
      button: "bg-blue-600 hover:bg-blue-700",
      text: "text-blue-600",
    },
    green: {
      border: isDragOver ? "border-green-400 bg-green-50" : "border-gray-300",
      button: "bg-green-600 hover:bg-green-700",
      text: "text-green-600",
    },
  }

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${colorClasses[color].border} hover:border-${color}-400`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <CheckCircle className={`w-12 h-12 ${colorClasses[color].text}`} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {accept === ".zip" ? (
                    <FileImage className="w-8 h-8 text-gray-600" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-600" />
                  )}
                  <div className="text-left">
                    <p className="font-medium text-gray-900 truncate max-w-48">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-center mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-600 mb-4">{description}</p>
            <input
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              id={`file-upload-${color}`}
            />
            <label
              htmlFor={`file-upload-${color}`}
              className={`inline-flex items-center px-4 py-2 text-white rounded-lg cursor-pointer transition-colors ${colorClasses[color].button}`}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </label>
            <p className="text-xs text-gray-500 mt-2">or drag and drop your file here</p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}
    </div>
  )
}
