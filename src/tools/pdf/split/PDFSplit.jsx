import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import { PLAN_LIMITS, formatFileSize, validateFile, validatePDFForSplit, validatePageSelection } from '../../../utils/constants.js'
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js'
import PDFPageRenderer from '../../../components/shared/PDFPageRenderer.jsx'

// SEO Head component
const SEOHead = () => {
  useEffect(() => {
    document.title = "Free PDF Split Tool - Extract Pages from PDF Online | DocEnclave"
    document.querySelector('meta[name="description"]')?.setAttribute('content', 
      "Split PDF files for free with page preview. Extract specific pages, split by ranges, or create separate files. 100% secure, no uploads required. Start splitting PDFs instantly."
    )
  }, [])
  return null
}

// Update the PDFPagePreview component
const PDFPagePreview = ({ pdfDoc, pageData, pageNumber, isSelected, onToggleSelect }) => {
  return (
    <div className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all cursor-pointer ${
      isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-dark-border hover:border-gray-500'
    }`}>
      <div onClick={onToggleSelect}>
        <PDFPageRenderer 
          pdfDoc={pdfDoc}
          pageNumber={pageNumber}
          width={80}
          height={112}
        />

        <div className="text-center mt-2">
          <div className="text-dark-text-primary text-xs font-medium mb-1">
            Page {pageNumber}
          </div>
          
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

      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
          ✓
        </div>
      )}
    </div>
  )
}

// Fixed Range Input Component
const RangeSelector = ({ totalPages, selectedPages, onRangeChange }) => {
  const [rangeInput, setRangeInput] = useState('')
  const [rangeError, setRangeError] = useState('')

  const applyRange = () => {
    setRangeError('')
    
    // Don't process empty input
    if (!rangeInput.trim()) {
      setRangeError('Please enter page numbers or ranges')
      return
    }

    const ranges = rangeInput.split(',').map(r => r.trim()).filter(r => r.length > 0)
    const newSelection = new Set()

    try {
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()))
          if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
            throw new Error(`Invalid range: ${range}. Use format like 1-5`)
          }
          for (let i = start; i <= end; i++) {
            newSelection.add(i - 1) // Convert to 0-indexed
          }
        } else {
          const page = parseInt(range.trim())
          if (isNaN(page) || page < 1 || page > totalPages) {
            throw new Error(`Invalid page: ${range}. Must be between 1 and ${totalPages}`)
          }
          newSelection.add(page - 1) // Convert to 0-indexed
        }
      }
      onRangeChange(Array.from(newSelection))
      setRangeInput('') // Clear input after successful application
    } catch (error) {
      setRangeError(error.message)
    }
  }

  return (
    <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border mb-6">
      <h4 className="text-dark-text-primary font-medium mb-3">Quick Range Selection</h4>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => onRangeChange([])}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => onRangeChange(Array.from({length: totalPages}, (_, i) => i))}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Select All
        </button>
        <button
          onClick={() => onRangeChange(Array.from({length: Math.ceil(totalPages/2)}, (_, i) => i * 2))}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Odd Pages
        </button>
        <button
          onClick={() => onRangeChange(Array.from({length: Math.floor(totalPages/2)}, (_, i) => i * 2 + 1))}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Even Pages
        </button>
        <button
          onClick={() => onRangeChange(Array.from({length: Math.min(5, totalPages)}, (_, i) => i))}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          First 5
        </button>
        <button
          onClick={() => onRangeChange(Array.from({length: Math.min(5, totalPages)}, (_, i) => totalPages - 5 + i).filter(i => i >= 0))}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Last 5
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
          placeholder="e.g., 1-5, 8, 10-12"
          className="flex-1 bg-dark-tertiary border border-dark-border rounded-lg px-3 py-2 text-dark-text-primary text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={applyRange}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
        >
          Apply
        </button>
      </div>
      
      {rangeError && (
        <p className="text-red-400 text-xs mt-2">{rangeError}</p>
      )}
      
      <p className="text-dark-text-muted text-xs mt-2">
        Use commas to separate pages/ranges (e.g., 1-5, 8, 10-12)
      </p>
    </div>
  )
}

const PDFSplit = () => {
  const [file, setFile] = useState(null)
  const [pages, setPages] = useState([])
  const [selectedPages, setSelectedPages] = useState([])
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [exportOption, setExportOption] = useState('separate') // 'separate' or 'combined'

  const limits = PLAN_LIMITS[currentPlan]

  useEffect(() => {
    trackToolUsage('pdf_split')
  }, [])

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('')
    
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted')
      return
    }

    if (acceptedFiles.length > 1) {
      setError('Please select only one PDF file to split')
      return
    }

    const droppedFile = acceptedFiles[0]
    const validation = validateFile(droppedFile, currentPlan)
    
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    try {
      const arrayBuffer = await droppedFile.arrayBuffer()
      const pdfDoc = await PDFDocument.load(arrayBuffer)
      const pageCount = pdfDoc.getPageCount()
      
      // Check page limit for free users
      const pageValidation = validatePDFForSplit(pageCount, currentPlan)
      if (!pageValidation.valid) {
        setShowUpgradeModal(true)
        return
      }

      const pagesArray = Array.from({ length: pageCount }, (_, index) => ({
        pageIndex: index,
        selected: false
      }))

      setFile({
        file: droppedFile,
        name: droppedFile.name,
        size: droppedFile.size,
        pdfDoc: pdfDoc
      })
      setPages(pagesArray)
      setSelectedPages([])
      setPreviewMode(true)

    } catch (err) {
      console.error('PDF load error:', err)
      setError(`Failed to load PDF: ${droppedFile.name}. Please ensure it's a valid PDF file.`)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxFiles: 1
  })

  const handlePageToggle = (pageIndex) => {
    setSelectedPages(prev => {
      if (prev.includes(pageIndex)) {
        return prev.filter(p => p !== pageIndex)
      } else {
        // Check free plan limits
        const selectionValidation = validatePageSelection(prev.length + 1, currentPlan)
        if (!selectionValidation.valid) {
          setShowUpgradeModal(true)
          return prev
        }
        return [...prev, pageIndex]
      }
    })
  }

  const handleRangeSelection = (newSelection) => {
    // Check free plan limits
    const selectionValidation = validatePageSelection(newSelection.length, currentPlan)
    if (!selectionValidation.valid) {
      setShowUpgradeModal(true)
      return
    }
    setSelectedPages(newSelection)
  }

  const splitPDF = async () => {
    if (selectedPages.length === 0) {
      setError('Please select at least one page to extract')
      return
    }

    // Validate selected pages are within bounds
    const validPages = selectedPages.filter(pageIndex => pageIndex >= 0 && pageIndex < pages.length)
    if (validPages.length === 0) {
      setError('No valid pages selected')
      return
    }

    if (validPages.length !== selectedPages.length) {
      setError('Some selected pages are invalid. Please reselect pages.')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError('')

    try {
      if (exportOption === 'separate') {
        // Create separate PDF for each selected page
        for (let i = 0; i < validPages.length; i++) {
          setProgress((i / validPages.length) * 90)
          
          const newPdf = await PDFDocument.create()
          const [copiedPage] = await newPdf.copyPages(file.pdfDoc, [validPages[i]])
          newPdf.addPage(copiedPage)
          
          const pdfBytes = await newPdf.save()
          const blob = new Blob([pdfBytes], { type: 'application/pdf' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${file.name.replace('.pdf', '')}_page_${validPages[i] + 1}.pdf`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
          
          // Small delay to prevent browser blocking multiple downloads
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } else if (exportOption === 'combined') {
        // Create single PDF with selected pages
        setProgress(50)
        
        const newPdf = await PDFDocument.create()
        const sortedPages = [...validPages].sort((a, b) => a - b)
        const copiedPages = await newPdf.copyPages(file.pdfDoc, sortedPages)
        copiedPages.forEach(page => newPdf.addPage(page))
        
        const pdfBytes = await newPdf.save()
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${file.name.replace('.pdf', '')}_extracted_pages.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }

      setProgress(100)
      await trackDownload('pdf_split')
      
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
      }, 1500)

    } catch (err) {
      console.error('PDF split error:', err)
      setError('Failed to split PDF. Please ensure all selected pages are valid.')
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const resetTool = () => {
    setFile(null)
    setPages([])
    setSelectedPages([])
    setPreviewMode(false)
    setError('')
  }
  return (
    <>
      <SEOHead />
      <div className="container mx-auto px-4 py-8">
        {/* Tool Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4">
            PDF Split Tool
          </h1>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            Extract specific pages from PDF files with advanced preview. Select page ranges, 
            split into separate files, or create custom extracts — all while keeping your files 100% private.
          </p>
        </div>

        {/* 4 USP Cards - 2 per row */}
        <div className="grid grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-lg p-4 shadow-lg shadow-blue-500/20">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">👁️</span>
              <h3 className="text-lg font-semibold text-blue-400">Page Preview</h3>
            </div>
            <p className="text-dark-text-secondary text-sm">
              See every page before extraction. Select specific pages with visual thumbnails.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/30 rounded-lg p-4 shadow-lg shadow-green-500/20">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">🔒</span>
              <h3 className="text-lg font-semibold text-green-400">100% Private</h3>
            </div>
            <p className="text-dark-text-secondary text-sm">
              Your PDFs never leave your device. All processing happens locally in your browser.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/30 rounded-lg p-4 shadow-lg shadow-purple-500/20">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📐</span>
              <h3 className="text-lg font-semibold text-purple-400">Range Selection</h3>
            </div>
            <p className="text-dark-text-secondary text-sm">
              Select pages by ranges (1-5, 8, 10-12) or use quick buttons for odd/even pages.
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/30 rounded-lg p-4 shadow-lg shadow-yellow-500/20">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📤</span>
              <h3 className="text-lg font-semibold text-yellow-400">Smart Export</h3>
            </div>
            <p className="text-dark-text-secondary text-sm">
              Export as separate files or combine selected pages into a single document.
            </p>
          </div>
        </div>

        {/* TOOL SECTION - Right after USP cards */}
        {/* Plan Limits Display */}
        <div className="bg-dark-secondary rounded-lg p-4 mb-6 border border-dark-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-dark-text-secondary text-sm">
                <span className="font-medium text-dark-text-primary">{currentPlan}</span> Plan
              </span>
              {file && (
                <>
                  <span className="text-dark-text-secondary text-sm">
                    Pages: <span className="text-dark-text-primary">{pages.length}</span>
                  </span>
                  <span className="text-dark-text-secondary text-sm">
                    Size: <span className="text-dark-text-primary">{formatFileSize(file.size)}</span>
                  </span>
                  <span className="text-dark-text-secondary text-sm">
                    Selected: <span className="text-dark-text-primary">{selectedPages.length}</span>
                    {currentPlan === 'FREE' && '/20'}
                  </span>
                </>
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

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* File Upload Zone - Show when no file */}
        {!file && (
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
              {isDragActive ? 'Drop your PDF file here' : 'Choose or drag PDF file here'}
            </h3>
            <p className="text-dark-text-secondary mb-4">
              Select a PDF file to extract pages from
            </p>
            <p className="text-dark-text-muted text-sm">
              Maximum {formatFileSize(limits.maxTotalSize)} • Extract up to {currentPlan === 'FREE' ? '20' : 'unlimited'} pages
            </p>
          </div>
        )}

        {/* File Info and Controls - Simple view */}
        {file && !previewMode && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">📄</span>
                <div>
                  <h4 className="text-dark-text-primary font-medium">{file.name}</h4>
                  <p className="text-dark-text-muted text-sm">
                    {formatFileSize(file.size)} • {pages.length} pages
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setPreviewMode(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Preview & Select Pages
                </button>
                <button
                  onClick={resetTool}
                  className="border border-dark-border text-dark-text-primary px-4 py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
                >
                  Choose Different File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Preview Mode */}
        {previewMode && file && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text-primary">
                Select Pages to Extract ({selectedPages.length} selected)
              </h3>
              <div className="flex space-x-3">
                <button
                  onClick={resetTool}
                  className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Choose Different File
                </button>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="border border-dark-border text-dark-text-primary px-4 py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
                >
                  Simple View
                </button>
              </div>
            </div>

            {/* Range Selector */}
            <RangeSelector 
              totalPages={pages.length}
              selectedPages={selectedPages}
              onRangeChange={handleRangeSelection}
            />

            {/* Export Options */}
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
              <h4 className="text-dark-text-primary font-medium mb-3">Export Options</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-3 bg-dark-tertiary rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    name="exportOption"
                    value="separate"
                    checked={exportOption === 'separate'}
                    onChange={(e) => setExportOption(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-dark-text-primary font-medium block">Separate Files</span>
                    <span className="text-dark-text-muted text-xs">One PDF per page</span>
                  </div>
                </label>
                <label className="flex items-center p-3 bg-dark-tertiary rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                  <input
                    type="radio"
                    name="exportOption"
                    value="combined"
                    checked={exportOption === 'combined'}
                    onChange={(e) => setExportOption(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <span className="text-dark-text-primary font-medium block">Combined File</span>
                    <span className="text-dark-text-muted text-xs">All pages in one PDF</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Page Grid */}
            <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-dark-text-primary font-medium">Pages ({pages.length} total)</h4>
                <div className="text-dark-text-muted text-sm">
                  Click pages to select/deselect
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {pages.map((page, pageIndex) => (
                  <PDFPagePreview
                    key={pageIndex}
                    pageData={page}
                    pageNumber={pageIndex + 1}
                    isSelected={selectedPages.includes(pageIndex)}
                    onToggleSelect={() => handlePageToggle(pageIndex)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Split Controls - Always show if file exists and pages selected */}
        {file && selectedPages.length > 0 && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mb-16">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-dark-text-primary font-medium">Ready to Extract</h4>
                <p className="text-dark-text-muted text-sm">
                  {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''} selected
                  {exportOption === 'separate' ? ` (${selectedPages.length} files will be downloaded)` : ' (1 file will be downloaded)'}
                </p>
              </div>
              {selectedPages.length > 5 && exportOption === 'separate' && (
                <div className="text-yellow-400 text-xs">
                  ⚠️ Multiple downloads - allow popups if blocked
                </div>
              )}
            </div>
            
            <button
              onClick={splitPDF}
              disabled={selectedPages.length === 0 || isProcessing}
              className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? `Processing... ${progress}%` : 
               exportOption === 'separate' ? `Extract ${selectedPages.length} Pages as Separate Files` :
               `Extract ${selectedPages.length} Pages as One PDF`}
            </button>
          </div>
        )}

        {/* Help message when no pages selected */}
        {file && selectedPages.length === 0 && previewMode && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-16 text-center">
            <div className="text-blue-400 text-4xl mb-4">👆</div>
            <h4 className="text-blue-400 font-medium mb-2">Select Pages to Extract</h4>
            <p className="text-blue-300 text-sm">
              Click on individual pages above or use the quick selection buttons to choose which pages to extract.
            </p>
          </div>
        )}
        {/* How to Use Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-dark-text-primary text-center mb-8">
            How to Use
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
              <h3 className="font-semibold text-dark-text-primary mb-2">Upload PDF</h3>
              <p className="text-dark-text-secondary text-sm">Drag & drop or browse to select a PDF file to split</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
              <h3 className="font-semibold text-dark-text-primary mb-2">Select Pages</h3>
              <p className="text-dark-text-secondary text-sm">Choose specific pages or ranges you want to extract</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
              <h3 className="font-semibold text-dark-text-primary mb-2">Download</h3>
              <p className="text-dark-text-secondary text-sm">Get your extracted pages as separate or combined files</p>
            </div>
          </div>
        </section>

        {/* SEO Blog Section */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-dark-text-primary mb-8">
              The Complete Guide to PDF Splitting
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Why Split PDF Files Instead of Sharing Entire Documents
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  PDF splitting is essential for document privacy and efficiency. Instead of sharing a 100-page report when you only need pages 15-20, 
                  extract exactly what's needed. This protects sensitive information in other sections, reduces file sizes for email attachments, 
                  and helps recipients focus on relevant content. Professional document management often requires surgical precision rather than 
                  broad sharing.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Common PDF Splitting Scenarios in Business
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Legal professionals extract specific contract clauses, HR departments isolate individual employee records from bulk files, 
                  researchers separate relevant chapters from lengthy publications, and students extract assignment pages from textbooks. 
                  Each scenario requires different splitting strategies — sometimes individual pages, sometimes page ranges, and often 
                  custom combinations based on content structure.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Security Advantages of Local PDF Processing
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Traditional PDF splitting tools require uploading your documents to unknown servers, creating security vulnerabilities. 
                  Confidential business plans, legal documents, medical records, and personal information should never be processed on 
                  external servers. Client-side processing ensures your sensitive documents remain completely private while still providing 
                  professional-grade splitting capabilities that rival expensive desktop software.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Advanced Page Selection Techniques
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Effective PDF splitting goes beyond simple page extraction. Use odd/even selection for double-sided document processing, 
                  range selection for chapter extraction, and visual preview to identify content boundaries. Understanding your document 
                  structure helps determine whether to create separate files for each page or combine related pages into logical sections. 
                  Professional users often develop splitting patterns based on their workflow requirements.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  File Organization After Splitting
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Proper file naming becomes crucial when splitting PDFs into multiple documents. Create descriptive filenames that reflect 
                  content rather than just page numbers. For legal documents, include case numbers and section names. For research papers, 
                  use chapter titles or topic descriptions. This organization strategy saves time later when searching for specific content 
                  and helps maintain professional document management standards.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Quality Considerations in PDF Extraction
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Not all PDF splitting tools maintain original document quality. Images can be compressed, fonts might be substituted, 
                  and formatting could shift during the extraction process. Professional-grade splitting preserves vector graphics, 
                  maintains font embedding, and keeps original resolution for images. This quality preservation is essential for legal 
                  documents, technical drawings, and any materials requiring precise formatting.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Workflow Integration and Automation Opportunities
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Regular PDF splitting tasks can benefit from systematic approaches. Develop consistent naming conventions, establish 
                  folder structures for different document types, and create templates for common splitting patterns. Many professionals 
                  find that documenting their splitting workflows helps team members maintain consistency and reduces time spent on 
                  repetitive document processing tasks.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-dark-text-primary mb-3">
                  Future Trends in Document Management
                </h3>
                <p className="text-dark-text-secondary leading-relaxed">
                  Document processing is evolving toward more intelligent, privacy-preserving solutions. Advanced splitting tools will 
                  likely incorporate content recognition to suggest optimal split points, automatic metadata preservation, and smart 
                  organization features. However, the fundamental need for secure, local processing will remain paramount as data 
                  privacy regulations continue to strengthen and users become more conscious of digital privacy rights.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-secondary rounded-xl p-8 max-w-md mx-4 border border-dark-border">
              <h3 className="text-xl font-bold text-dark-text-primary mb-4">
                Upgrade to Premium
              </h3>
              <p className="text-dark-text-secondary mb-6">
                Unlock more powerful features:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="text-dark-text-secondary">✅ Extract unlimited pages</li>
                <li className="text-dark-text-secondary">✅ 500MB file capacity</li>
                <li className="text-dark-text-secondary">✅ Process larger PDFs</li>
                <li className="text-dark-text-secondary">✅ Advanced export options</li>
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
    </>
  )
}

export default PDFSplit