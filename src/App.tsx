"use client"

import { useState, useEffect } from "react"
import { LoginPage } from "./components/LoginPage"
import { useAuth } from "@/context/AuthContext"
import { Toaster } from "sonner"
import { FileImage, Download, AlertCircle, Archive, FileSpreadsheet, Clock, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "./components/FileUpload"
import { CSVPreview } from "./components/CSVPreview"
import { ProcessingResults } from "./components/ProcessingResults"
import { parseCSV, type CSVParseResult } from "./utils/csvParser"
import { ImageProcessor, type ProcessingProgress, type ProcessingResult } from "./utils/imageProcessor"
import { ZipGenerator, type ZipGenerationProgress, downloadBlob, generateDownloadFilename } from "./utils/zipGenerator"
import { formatTime } from "./utils/timeEstimator"
import { tabKeepAlive } from "./utils/tabKeepAlive"

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth()
  const [zipFile, setZipFile] = useState<File | null>(null)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvParseResult, setCsvParseResult] = useState<CSVParseResult | null>(null)
  const [isCsvParsing, setIsCsvParsing] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null)
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null)
  const [isGeneratingZip, setIsGeneratingZip] = useState(false)
  const [zipProgress, setZipProgress] = useState<ZipGenerationProgress | null>(null)
  const [error, setError] = useState<string>("")
  const [tabProtectionActive, setTabProtectionActive] = useState(false)
  const [resizeMode, setResizeMode] = useState<"constrained" | "file" | "brand">("brand")

  useEffect(() => {
    if (csvFile) {
      setIsCsvParsing(true)
      parseCSV(csvFile, resizeMode)
        .then((result) => {
          setCsvParseResult(result)
          setIsCsvParsing(false)
        })
        .catch((err) => {
          console.error("CSV parsing error:", err)
          setCsvParseResult({
            success: false,
            data: [],
            errors: ["Failed to parse CSV file"],
            warnings: [],
          })
          setIsCsvParsing(false)
        })
    } else {
      setCsvParseResult(null)
    }
  }, [csvFile, resizeMode])

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={login} />
  }

  const handleProcessImages = async () => {
    if (!zipFile || !csvFile) {
      setError("Please select both ZIP and CSV files")
      return
    }

    if (!csvParseResult || !csvParseResult.success) {
      setError("Please fix CSV errors before processing")
      return
    }

    setIsProcessing(true)
    setError("")
    setProcessingProgress(null)
    setProcessingResult(null)

    try {
      await tabKeepAlive.start()
      setTabProtectionActive(true)

      const processor = new ImageProcessor((progress) => {
        setProcessingProgress(progress)
      })

      const result = await processor.processImages(zipFile, csvParseResult.data, { mode: resizeMode }) // Process images with selected mode
      setProcessingResult(result)

      if (!result.success && result.errors.length > 0) {
        setError("Some images failed to process. Check the detailed results below.")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during processing")
    } finally {
      setIsProcessing(false)
      setProcessingProgress(null)
      await tabKeepAlive.stop()
      setTabProtectionActive(false)
    }
  }

  const handleDownloadResults = async () => {
    if (!processingResult) return

    setIsGeneratingZip(true)
    setZipProgress(null)
    setError("")

    try {
      await tabKeepAlive.start()
      setTabProtectionActive(true)

      const zipGenerator = new ZipGenerator((progress) => {
        setZipProgress(progress)
      })

      const zipBlob = await zipGenerator.generateZip(processingResult)
      const filename = generateDownloadFilename()

      downloadBlob(zipBlob, filename)

      setZipProgress({
        stage: "complete",
        current: processingResult.processedImages.filter((img) => img.success).length,
        total: processingResult.processedImages.filter((img) => img.success).length,
        percentage: 100,
        message: "Download started successfully!",
      })

      setTimeout(() => setZipProgress(null), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate download ZIP")
    } finally {
      setIsGeneratingZip(false)
      await tabKeepAlive.stop()
      setTabProtectionActive(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1 flex items-center justify-center">
                <FileImage className="w-12 h-12 text-blue-600 mr-3" />
                <h1 className="text-4xl font-bold text-blue-600">Image Resizer</h1>
                {tabProtectionActive && (
                  <div className="ml-3 flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    <Shield className="w-3 h-3 mr-1" />
                    Protected
                  </div>
                )}
              </div>
              <Button
                onClick={logout}
                variant="outline"
                className="bg-red-600 text-white hover:bg-red-700 border-red-600 hover:border-red-700 hover:text-white"
              >
                Sign out
              </Button>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto text-center">
              Upload a ZIP file containing images and a CSV file with resize specifications. We'll resize your images to
              the exact dimensions at 300 DPI.
            </p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* ZIP File Upload */}
              <FileUpload
                accept=".zip"
                onFileSelect={setZipFile}
                selectedFile={zipFile}
                title="Upload ZIP File"
                description={
                  resizeMode === "brand"
                    ? "Select a ZIP file with 3 images: Original, Full Black, Full White"
                    : "Select a ZIP file containing your images"
                }
                icon={<Archive className="w-12 h-12 text-gray-400" />}
                color="blue"
              />

              {/* CSV File Upload */}
              <FileUpload
                accept=".csv"
                onFileSelect={setCsvFile}
                selectedFile={csvFile}
                title="Upload CSV File"
                description={
                  resizeMode === "brand"
                    ? "CSV with: product name, length (in), width (in), image variant"
                    : "CSV with: filename, length (in), width (in)"
                }
                icon={<FileSpreadsheet className="w-12 h-12 text-gray-400" />}
                color="green"
              />
            </div>

            <div className="mb-8">
              <CSVPreview parseResult={csvParseResult} isLoading={isCsvParsing} />
            </div>

            {/* Process Button */}
            <div className="text-center mb-6">
              <div className="flex flex-col items-center gap-3">
                {/* Segmented Control / Choice Chips */}
                <div className="inline-flex bg-gray-100 rounded-lg p-1 shadow-inner">
                  <button
                    onClick={() => setResizeMode("brand")}
                    className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      resizeMode === "brand"
                        ? "bg-white text-indigo-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Brand Store Files
                  </button>
                  <button
                    onClick={() => setResizeMode("constrained")}
                    className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      resizeMode === "constrained"
                        ? "bg-white text-indigo-600 shadow-md"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Constrained Proportion
                  </button>
                  <button
                    onClick={() => setResizeMode("file")}
                    className={`px-5 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      resizeMode === "file" ? "bg-white text-indigo-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    As Per CSV File
                  </button>
                </div>

                {/* Compact Description */}
                <p className="text-xs text-gray-600 max-w-lg px-4">
                  {resizeMode === "constrained" ? (
                    <>
                      <span className="text-blue-600 font-medium">📐 Proportional:</span> Scales based on smallest
                      dimension from csv in "Height or Width", maintains aspect ratio
                    </>
                  ) : resizeMode === "brand" ? (
                    <>
                      <span className="text-blue-600 font-medium">📐 Brand Mode:</span> Upload 3 image variants
                      (Original, Full Black, Full White). CSV specifies which variant to use for each product. Maintains
                      aspect ratio and saves with product name.
                    </>
                  ) : (
                    <>
                      <span className="text-amber-600 font-medium">⚠️ Exact size:</span> Uses actual "Height or Width"
                      from CSV dimensions - may stretch or squish images
                    </>
                  )}
                </p>

                {/* Process Button */}
                <button
                  onClick={handleProcessImages}
                  disabled={!zipFile || !csvFile || !csvParseResult?.success || isProcessing}
                  className="inline-flex items-center px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Resize Images
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CSV Format Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-900 mb-2">Requirements:</h4>
              <div className="text-sm text-blue-800">
                {resizeMode === "brand" ? (
                  <>
                    <p className="mb-1">• Column 1: Product name (e.g., "Supreme Laptop Bag")</p>
                    <p className="mb-1">• Column 2: Length in inches (e.g., "4")</p>
                    <p className="mb-1">• Column 3: Width in inches (e.g., "3")</p>
                    <p className="mb-1">
                      • Column 4: Image variant - must be one of: "Original", "Full Black", "Full White"
                    </p>
                    <p className="mb-1">
                      • ZIP file must contain exactly 3 images named: "Original", "Full Black", "Full White" (with image
                      extensions)
                    </p>
                    <p className="text-xs text-blue-600 mt-2">
                      Output files will be named with product names • All images resized to 300 DPI • Maintains aspect
                      ratio
                    </p>
                  </>
                ) : (
                  <>
                    <p className="mb-1">
                      • Column 1: Image filename with extension (e.g., "photo1.jpg") - case sensitive
                    </p>
                    <p className="mb-1">• Column 2: Height in inches (e.g., "8.5")</p>
                    <p className="mb-1">• Column 3: Width in inches (e.g., "11")</p>
                    <p className="mb-1">• ZIP file must contain exact filenames as listed in Column 1</p>
                    <p className="text-xs text-blue-600 mt-2">
                      All images will be resized to 300 DPI • Max 5MB per image
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Tab Protection Info */}
            {(isProcessing || isGeneratingZip) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <div className="flex items-center text-sm text-green-800">
                  <Shield className="w-4 h-4 mr-2" />
                  <span>Tab protection active - preventing browser suspension during processing</span>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Progress Section */}
            {isProcessing && processingProgress && (
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{processingProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-gray-700 text-center">{processingProgress.message}</p>
                {processingProgress.total > 0 && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {processingProgress.current} of {processingProgress.total} images
                  </p>
                )}
                {/* Time estimation display */}
                {processingProgress.timeEstimate && (
                  <div className="flex items-center justify-center space-x-4 mt-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Elapsed: {formatTime(processingProgress.timeEstimate.elapsedTime)}</span>
                    </div>
                    {processingProgress.timeEstimate.estimatedRemainingTime > 0 && (
                      <div className="flex items-center">
                        <span>Remaining: {formatTime(processingProgress.timeEstimate.estimatedRemainingTime)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ZIP Generation Progress Display */}
            {isGeneratingZip && zipProgress && (
              <div className="bg-green-50 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-green-600 mb-2">
                    <span>Generating ZIP</span>
                    <span>{zipProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${zipProgress.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-sm text-green-700 text-center">{zipProgress.message}</p>
                {zipProgress.total > 0 && (
                  <p className="text-xs text-green-500 text-center mt-1">
                    {zipProgress.current} of {zipProgress.total} images
                  </p>
                )}
              </div>
            )}

            {/* Processing Results */}
            {processingResult && (
              <ProcessingResults
                result={processingResult}
                onDownload={handleDownloadResults}
                isGeneratingZip={isGeneratingZip}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <>
      <AppContent />
      <Toaster />
    </>
  )
}

export default App
