import React, { useState, useCallback } from 'react'
import { PDFDocument } from 'pdf-lib'

const PdfMerge = () => {
  const [files, setFiles] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files)
    handleFiles(selectedFiles)
  }

  const handleFiles = (newFiles) => {
    setError('')
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf')
    
    if (pdfFiles.length !== newFiles.length) {
      setError('Please select only PDF files')
      return
    }

    // Check file size limit (20MB for free users)
    const oversizedFiles = pdfFiles.filter(file => file.size > 20 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setError('File size must be less than 20MB for free users')
      return
    }

    // Check file count limit (3 for free users)
    if (files.length + pdfFiles.length > 3) {
      setError('Free users can merge up to 3 PDF files')
      return
    }

    setFiles(prev => [...prev, ...pdfFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size
    }))])
  }

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const moveFile = (fromIndex, toIndex) => {
    setFiles(prev => {
      const newFiles = [...prev]
      const [movedFile] = newFiles.splice(fromIndex, 1)
      newFiles.splice(toIndex, 0, movedFile)
      return newFiles
    })
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const mergedPdf = await PDFDocument.create()

      for (const fileData of files) {
        const arrayBuffer = await fileData.file.arrayBuffer()
        const pdf = await PDFDocument.load(arrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      const pdfBytes = await mergedPdf.save()
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'merged-document.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      // Reset form
      setFiles([])
    } catch (err) {
      setError('Error merging PDFs. Please try again.')
      console.error('PDF merge error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-object-group text-2xl text-primary-600"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Merge PDF Files</h1>
        <p className="text-gray-600">Combine multiple PDF files into a single document</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mb-4">
          <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop PDF files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Free users: Up to 3 files, 20MB each
          </p>
        </div>
        
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileInput}
          className="hidden"
          id="file-input"
        />
        <label
          htmlFor="file-input"
          className="btn-primary cursor-pointer inline-block"
        >
          <i className="fas fa-plus mr-2"></i>
          Select PDF Files
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((fileData, index) => (
              <div
                key={fileData.id}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => index > 0 && moveFile(index, index - 1)}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-up"></i>
                    </button>
                    <button
                      onClick={() => index < files.length - 1 && moveFile(index, index + 1)}
                      disabled={index === files.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-down"></i>
                    </button>
                  </div>
                  <i className="fas fa-file-pdf text-red-500 text-xl"></i>
                  <div>
                    <p className="font-medium text-gray-900">{fileData.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(fileData.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(fileData.id)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Merge Button */}
          <div className="mt-6 text-center">
            <button
              onClick={mergePDFs}
              disabled={files.length < 2 || isProcessing}
              className="btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Merging PDFs...
                </>
              ) : (
                <>
                  <i className="fas fa-object-group mr-2"></i>
                  Merge {files.length} PDFs
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-shield-alt text-green-600"></i>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Secure Processing</h4>
          <p className="text-sm text-gray-600">All processing happens in your browser. Files never leave your device.</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-bolt text-blue-600"></i>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
          <p className="text-sm text-gray-600">No uploads or downloads. Instant processing and results.</p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-heart text-purple-600"></i>
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">Always Free</h4>
          <p className="text-sm text-gray-600">Core features are completely free. No hidden costs or subscriptions.</p>
        </div>
      </div>
    </div>
  )
}

export default PdfMerge
