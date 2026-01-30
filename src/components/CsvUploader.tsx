import * as React from 'react'
import { parseCsv, type CsvValidationResult, REQUIRED_COLUMNS } from '~/utils/oncall'

type CsvUploaderProps = {
  onUploadSuccess: (result: Extract<CsvValidationResult, { success: true }>) => void
}

export function CsvUploader({ onUploadSuccess }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFile = React.useCallback(
    async (file: File) => {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }

      setIsProcessing(true)
      setError(null)

      try {
        const text = await file.text()
        const result = parseCsv(text)

        if (result.success) {
          onUploadSuccess(result)
        } else {
          setError(result.error)
        }
      } catch {
        setError('Failed to read file')
      } finally {
        setIsProcessing(false)
      }
    },
    [onUploadSuccess],
  )

  const handleDragOver = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = React.useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleFileInput = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile],
  )

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragging ? 'border-[#0C45E1] bg-[#E2E9FB]' : 'border-gray-300 hover:border-gray-400'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />
        <div className="space-y-2">
          <div className="text-4xl">📁</div>
          <p className="text-lg font-medium text-gray-700">
            {isProcessing ? 'Processing...' : 'Drop CSV file here or click to upload'}
          </p>
          <p className="text-sm text-gray-500">
            Supports Jira export CSV format
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-medium">Upload Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      <div className="text-sm text-gray-500">
        <p className="font-medium mb-1">Required columns:</p>
        <div className="flex flex-wrap gap-1">
          {REQUIRED_COLUMNS.map((col) => (
            <span
              key={col}
              className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs"
            >
              {col}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
