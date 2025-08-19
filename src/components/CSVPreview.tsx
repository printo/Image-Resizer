"use client"
import { CheckCircle, AlertTriangle, XCircle, Download } from "lucide-react"
import type { CSVParseResult } from "../utils/csvParser"
import { downloadSampleCSV } from "../utils/csvParser"

interface CSVPreviewProps {
  parseResult: CSVParseResult | null
  isLoading: boolean
}

export function CSVPreview({ parseResult, isLoading }: CSVPreviewProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Parsing CSV...</span>
        </div>
      </div>
    )
  }

  if (!parseResult) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Need help with CSV format?</h4>
            <p className="text-sm text-blue-800">Download our sample CSV template to get started</p>
          </div>
          <button
            onClick={downloadSampleCSV}
            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-1" />
            Sample CSV
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <div className="flex items-center space-x-4">
        {parseResult.success ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">CSV parsed successfully</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <XCircle className="w-5 h-5 mr-2" />
            <span className="font-medium">CSV has errors</span>
          </div>
        )}

        <span className="text-sm text-gray-600">
          {parseResult.data.length} valid {parseResult.data.length === 1 ? "row" : "rows"}
        </span>
      </div>

      {/* Errors */}
      {parseResult.errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-semibold text-red-900 mb-2 flex items-center">
            <XCircle className="w-4 h-4 mr-2" />
            Errors ({parseResult.errors.length})
          </h4>
          <ul className="text-sm text-red-800 space-y-1">
            {parseResult.errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {parseResult.warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Warnings ({parseResult.warnings.length})
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {parseResult.warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Data Preview */}
      {parseResult.data.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Data Preview</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Filename</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Length (in)</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Width (in)</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Size (300 DPI)</th>
                </tr>
              </thead>
              <tbody>
                {parseResult.data.slice(0, 5).map((row, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-2 px-3 text-gray-900 font-mono text-xs">{row.filename}</td>
                    <td className="py-2 px-3 text-gray-700">{row.length}"</td>
                    <td className="py-2 px-3 text-gray-700">{row.width}"</td>
                    <td className="py-2 px-3 text-gray-600 text-xs">
                      {Math.round(row.length * 300)} × {Math.round(row.width * 300)} px
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parseResult.data.length > 5 && (
              <p className="text-xs text-gray-500 mt-2 text-center">... and {parseResult.data.length - 5} more rows</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
