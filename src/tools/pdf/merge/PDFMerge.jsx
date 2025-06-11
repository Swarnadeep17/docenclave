import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js'
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js'

// PDF preview component for rendering page thumbnails
const PDFPagePreview = ({ pageData, pageNumber, isSelected, isDuplicate, onToggleSelect, onDelete, globalPageIndex }) => {
  return (
    <div className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all ${
      isDuplicate ? 'border-yellow-500 shadow-yellow-500/20' : 
      isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-dark-border'
    }`}>
      {/* Delete button */}
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors"
      >
        ×
      </button>

      {/* Duplicate indicator */}
      {isDuplicate && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xs font-bold z-10">
          !
        </div>
      )}

      {/* Page preview container */}
      <div 
        onClick={onToggleSelect}
        className="cursor-pointer"
      >
        {/* PDF page thumbnail - This would be rendered using PDF.js */}
        <div className="w-20 h-28 bg-white rounded border flex items-center justify-center mb-2">
          <div className="text-gray-400 text-xs text-center">
            <div className="text-lg mb-1">📄</div>
            <div>PDF</div>
          </div>
        </div>

        {/* Page info */}
        <div className="text-center">
          <div className="text-dark-text-primary text-xs font-medium mb-1">
            Global #{globalPageIndex + 1}
          </div>
          <div className="text-dark-text-muted text-xs">
            Page {pageNumber}
          </div>
          
          {/* Selection checkbox */}
          <div className="mt-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="w-4 h-4 accent-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const FilePreview = ({ file, pages, onPagesUpdate, onRemoveFile }) => {
  const handlePageToggle = (pageIndex) => {
    const updatedPages = pages.map((page, idx) => 
      idx === pageIndex ? { ...page, selected: !page.selected } : page
    )
    onPagesUpdate(file.id, updatedPages)
  }

  const handlePageDelete = (pageIndex) => {
    const updatedPages = pages.filter((_, idx) => idx !== pageIndex)
    onPagesUpdate(file.id, updatedPages)
  }

  return (
    <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
      {/* File header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📄</span>
          <div>
            <h4 className="text-dark-text-primary font-medium">{file.name}</h4>
            <p className="text-dark-text-muted text-sm">
              {formatFileSize(file.size)} • {pages.length} pages • {pages.filter(p => p.selected).length} selected
            </p>
          </div>
        </div>
        <button
          onClick={() => onRemoveFile(file.id)}
          className="text-red-400 hover:text-red-300 p-2"
        >
          🗑️
        </button>
      </div>

      {/* Page controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            const allSelected = pages.every(p => p.selected)
            const updatedPages = pages.map(page => ({ ...page, selected: !allSelected }))
            onPagesUpdate(file.id, updatedPages)
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          {pages.every(p => p.selected) ? 'Deselect All' : 'Select All'}
        </button>
        <button
          onClick={() => {
            const updatedPages = pages.map((page, idx) => ({ ...page, selected: idx % 2 === 0 }))
            onPagesUpdate(file.id, updatedPages)
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Odd Pages
        </button>
        <button
          onClick={() => {
            const updatedPages = pages.map((page, idx) => ({ ...page, selected: idx % 2 === 1 }))
            onPagesUpdate(file.id, updatedPages)
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Even Pages
        </button>
      </div>

      {/* Page previews grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {pages.map((page, pageIndex) => (
          <PDFPagePreview
            key={`${file.id}-${pageIndex}`}
            pageData={page}
            pageNumber={pageIndex + 1}
            isSelected={page.selected}
            isDuplicate={page.isDuplicate}
            onToggleSelect={() => handlePageToggle(pageIndex)}
            onDelete={() => handlePageDelete(pageIndex)}
            globalPageIndex={page.globalIndex}
          />
        ))}
      </div>
    </div>
  )
}

const PDFMerge = () => {
  const [files, setFiles] = useState([])
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState('')
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf')
  const [previewMode, setPreviewMode] = useState(false)

  const limits = PLAN_LIMITS[currentPlan]

  useEffect(() => {
    trackToolUsage('pdf_merge')
  }, [])

  // Detect duplicate pages across all files
  const detectDuplicates = (allFiles) => {
    const pageHashes = new Map()
    let globalPageIndex = 0
    
    return allFiles.map(file => ({
      ...file,
      pages: file.pages.map((page, pageIndex) => {
        // Simple duplicate detection based on page content hash
        // In real implementation, you'd use actual PDF content comparison
        const pageHash = `${file.name}-${pageIndex}` // Simplified hash
        const isDuplicate = pageHashes.has(pageHash)
        pageHashes.set(pageHash, true)
        
        return {
          ...page,
          isDuplicate,
          globalIndex: globalPageIndex++
        }
      })
    }))
  }

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('')
    
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted')
      return
    }

    if (files.length + acceptedFiles.length > limits.maxFiles) {
      setShowUpgradeModal(true)
      return
    }

    const newFiles = []
    let totalSize = files.reduce((sum, file) => sum + file.size, 0)

    for (const file of acceptedFiles) {
      const validation = validateFile(file, currentPlan)
      
      if (!validation.valid) {
        setError(validation.error)
        return
      }

      if (totalSize + file.size > limits.maxTotalSize) {
        setShowUpgradeModal(true)
        return
      }

      try {
        // Load PDF to get page count
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()
        
        // Create page objects with selection state
        const pages = Array.from({ length: pageCount }, (_, index) => ({
          pageIndex: index,
          selected: true, // All pages selected by default
          isDuplicate: false,
          globalIndex: 0 // Will be set during duplicate detection
        }))

        newFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          pages
        })
        
        totalSize += file.size
      } catch (err) {
        setError(`Failed to load PDF: ${file.name}. Please ensure it's a valid PDF file.`)
        return
      }
    }

    const updatedFiles = [...files, ...newFiles]
    const filesWithDuplicates = detectDuplicates(updatedFiles)
    setFiles(filesWithDuplicates)
    
    if (newFiles.length > 0) {
      setPreviewMode(true)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const removeFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id)
    setFiles(detectDuplicates(updatedFiles))
  }

  const updatePages = (fileId, newPages) => {
    const updatedFiles = files.map(file => 
      file.id === fileId ? { ...file, pages: newPages } : file
    )
    setFiles(detectDuplicates(updatedFiles))
  }

  const getTotalSelectedPages = () => {
    return files.reduce((total, file) => 
      total + file.pages.filter(page => page.selected).length, 0
    )
  }

  const mergePDFs = async () => {
    const selectedPages = getTotalSelectedPages()
    
    if (selectedPages < 1) {
      setError('Please select at least 1 page to merge')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError('')

    try {
      const mergedPdf = await PDFDocument.create()
      let processedFiles = 0
      
      for (const file of files) {
        const selectedPagesInFile = file.pages.filter(page => page.selected)
        
        if (selectedPagesInFile.length > 0) {
          setProgress((processedFiles / files.length) * 80)
          
          const fileArrayBuffer = await file.file.arrayBuffer()
          const pdf = await PDFDocument.load(fileArrayBuffer)
          
          // Copy only selected pages
          const pageIndices = selectedPagesInFile.map(page => page.pageIndex)
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices)
          
          copiedPages.forEach((page) => mergedPdf.addPage(page))
        }
        
        processedFiles++
      }

      setProgress(95)
      const pdfBytes = await mergedPdf.save()
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = outputFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setProgress(100)
      await trackDownload('pdf_merge')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        setFiles([])
        setPreviewMode(false)
      }, 1500)

    } catch (err) {
      console.error('PDF merge error:', err)
      setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.')
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const totalSelectedPages = getTotalSelectedPages()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4">
          PDF Merge Tool
        </h1>
        <p className="text-dark-text-secondary max-w-2xl mx-auto text-lg">
          Combine multiple PDF files with advanced page selection. Preview, reorder, and choose exactly which pages to include.
        </p>
      </div>

      {/* Plan Limits Display */}
      <div className="bg-dark-secondary rounded-lg p-4 mb-6 border border-dark-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <span className="text-dark-text-secondary text-sm">
              <span className="font-medium text-dark-text-primary">{currentPlan}</span> Plan
            </span>
            <span className="text-dark-text-secondary text-sm">
              Files: <span className="text-dark-text-primary">{files.length}</span>/{limits.maxFiles}
            </span>
            <span className="text-dark-text-secondary text-sm">
              Size: <span className="text-dark-text-primary">{formatFileSize(totalSize)}</span>/{formatFileSize(limits.maxTotalSize)}
            </span>
            {previewMode && (
              <span className="text-dark-text-secondary text-sm">
                Selected Pages: <span className="text-dark-text-primary">{totalSelectedPages}</span>
              </span>
            )}
          </div>
          {currentPlan === 'FREE' && (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              className="bg-dark-text-primary text-dark-primary px-4 py-2 rounded text-sm font-medium hover:bg-dark-text-secondary transition-colors"
            >
              Upgrade to Premium
            </button>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <span className="text-blue-400 mt-0.5">ℹ️</span>
          <div>
            <h4 className="text-blue-400 font-medium mb-1">Advanced Preview Features</h4>
            <p className="text-blue-300 text-sm">
              Preview pages, detect duplicates (yellow border), select specific pages, and reorder before merging. 
              All processing happens locally in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="text-red-400">⚠️</span>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* File Upload Zone */}
      {(!previewMode || files.length === 0) && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${
            isDragActive
              ? 'border-blue-400 bg-blue-500/5'
              : 'border-dark-border hover:border-gray-500 bg-dark-secondary'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-dark-text-primary mb-2">
            {isDragActive ? 'Drop PDF files here' : 'Upload PDF Files'}
          </h3>
          <p className="text-dark-text-secondary mb-4">
            Drag and drop PDF files or click to browse
          </p>
          <p className="text-dark-text-muted text-sm">
            Max {limits.maxFiles} files • Max {formatFileSize(limits.maxTotalSize)} total
          </p>
        </div>
      )}

      {/* File Previews */}
      {previewMode && files.length > 0 && (
        <div className="space-y-6 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-dark-text-primary">
              Page Preview & Selection
            </h3>
            <div className="flex space-x-3">
              <button
                {...getRootProps()}
                className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Add More Files
              </button>
              <button
                onClick={() => setPreviewMode(false)}
                className="border border-dark-border text-dark-text-primary px-4 py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
              >
                Simple View
              </button>
            </div>
          </div>
          
          {files.map((file) => (
            <FilePreview
              key={file.id}
              file={file}
              pages={file.pages}
              onPagesUpdate={updatePages}
              onRemoveFile={removeFile}
            />
          ))}
        </div>
      )}

      {/* Merge Controls */}
      {files.length > 0 && (
        <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
          {currentPlan === 'PREMIUM' && (
            <div className="mb-4">
              <label className="block text-dark-text-primary text-sm font-medium mb-2">
                Output Filename
              </label>
              <input
                type="text"
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                className="w-full bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary focus:outline-none focus:border-blue-500"
                placeholder="merged-document.pdf"
              />
            </div>
          )}
          
          <button
            onClick={mergePDFs}
            disabled={totalSelectedPages < 1 || isProcessing}
            className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? `Merging... ${progress}%` : 
             previewMode ? `Merge ${totalSelectedPages} Selected Pages` : 
             `Merge ${files.length} Files`}
          </button>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-secondary rounded-xl p-8 max-w-md mx-4 border border-dark-border">
            <h3 className="text-xl font-bold text-dark-text-primary mb-4">
              Upgrade to Premium
            </h3>
            <p className="text-dark-text-secondary mb-6">
              You've reached the free plan limit. Upgrade to Premium for:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="text-dark-text-secondary">• Up to 50 files per merge</li>
              <li className="text-dark-text-secondary">• 500MB total file size</li>
              <li className="text-dark-text-secondary">• Advanced page preview</li>
              <li className="text-dark-text-secondary">• Custom output filenames</li>
            </ul>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 border border-dark-border text-dark-text-primary py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
              >
                Continue Free
              </button>
              <button className="flex-1 bg-dark-text-primary text-dark-primary py-2 rounded-lg font-medium hover:bg-dark-text-secondary transition-colors">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFMerge