"use client"
import { CheckCircle, XCircle, AlertTriangle, Download, ImageIcon } from "lucide-react"
import type { ProcessingResult } from "../utils/imageProcessor"
import { formatImageDimensions } from "../utils/imageProcessor"
import { formatFileSize } from "../utils/fileValidation"

interface ProcessingResultsProps {
  result: ProcessingResult | null
  onDownload: () => void
  isGeneratingZip: boolean
}

export function ProcessingResults({ result, onDownload, isGeneratingZip }: ProcessingResultsProps) {
  if (!result) return null

  const successCount = result.processedImages.filter((img) => img.success).length
  const failureCount = result.processedImages.filter((img) => !img.success).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Results</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{successCount}</div>
            <div className="text-sm text-green-700">Successfully Processed</div>
          </div>

          {failureCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">{failureCount}</div>
              <div className="text-sm text-red-700">Failed</div>
            </div>
          )}

          {result.skippedFiles.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{result.skippedFiles.length}</div>
              <div className="text-sm text-yellow-700">Not Found</div>
            </div>
          )}
        </div>

        {/* Download Button */}
        {successCount > 0 && (
          <div className="text-center mb-6">
            <button
              onClick={onDownload}
              disabled={isGeneratingZip}
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingZip ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating ZIP...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Resized Images
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Detailed Results */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4">Detailed Results</h4>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {result.processedImages.map((image, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                image.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                {image.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}

                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900 text-sm">{image.filename}</span>
                </div>
              </div>

              <div className="text-right text-sm">
                {image.success ? (
                  <div className="space-y-1">
                    <div className="text-gray-600">
                      {formatImageDimensions(image.originalSize.width, image.originalSize.height)} →{" "}
                      {formatImageDimensions(image.targetSize.width, image.targetSize.height)}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {image.originalFileSize && formatFileSize(image.originalFileSize)} →{" "}
                      {formatFileSize(image.blob.size)}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="text-red-700 text-xs max-w-48 truncate">{image.error}</div>
                    {image.originalFileSize && (
                      <div className="text-gray-500 text-xs">Original: {formatFileSize(image.originalFileSize)}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Errors */}
      {result.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            Errors ({result.errors.length})
          </h4>
          <ul className="text-sm text-red-800 space-y-1">
            {result.errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
