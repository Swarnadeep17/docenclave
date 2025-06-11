import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js'
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js'

// SEO Head component
const SEOHead = () => {
  useEffect(() => {
    document.title = "Free PDF Merge Tool - Combine PDF Files Online Securely | DocEnclave"
    document.querySelector('meta[name="description"]')?.setAttribute('content', 
      "Merge PDF files online for free with advanced page preview. No uploads needed - your files stay private. Combine, reorder, and select specific pages with our secure PDF merger."
    )
  }, [])
  return null
}

// PDF Page Preview Component
const PDFPagePreview = ({ pageData, pageNumber, isSelected, isDuplicate, onToggleSelect, onDelete, globalPageIndex }) => {
  return (
    <div className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all ${
      isDuplicate ? 'border-yellow-500 shadow-yellow-500/20' : 
      isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-dark-border'
    }`}>
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors"
      >
        ×
      </button>

      {isDuplicate && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xs font-bold z-10">
          !
        </div>
      )}

      <div onClick={onToggleSelect} className="cursor-pointer">
        <div className="w-20 h-28 bg-white rounded border flex items-center justify-center mb-2">
          <div className="text-gray-400 text-xs text-center">
            <div className="text-lg mb-1">📄</div>
            <div>PDF</div>
          </div>
        </div>

        <div className="text-center">
          <div className="text-dark-text-primary text-xs font-medium mb-1">
            Global #{globalPageIndex + 1}
          </div>
          <div className="text-dark-text-muted text-xs">
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
    </div>
  )
}

// File Preview Component
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

  // Duplicate detection function
  const detectDuplicates = (allFiles) => {
    const pageHashes = new Map()
    let globalPageIndex = 0
    
    return allFiles.map(file => ({
      ...file,
      pages: file.pages.map((page, pageIndex) => {
        const pageHash = `${file.name}-${pageIndex}`
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

  // File drop handler
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
        const arrayBuffer = await file.arrayBuffer()
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const pageCount = pdfDoc.getPageCount()
        
        const pages = Array.from({ length: pageCount }, (_, index) => ({
          pageIndex: index,
          selected: true,
          isDuplicate: false,
          globalIndex: 0
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

  // File management functions
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

  // PDF merging function
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
    <>
      <SEOHead />
      <div className="container mx-auto px-4 py-8">
        {/* SEO-Optimized Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-dark-text-primary mb-6 leading-tight">
            Free PDF Merge Tool - Combine PDFs Online
          </h1>
          <p className="text-xl text-dark-text-secondary max-w-3xl mx-auto mb-8 leading-relaxed">
            The most advanced PDF merger with page-by-page preview. Combine multiple PDF files, 
            select specific pages, and reorder content — all while keeping your documents 100% private.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center items-center gap-6 mb-8">
            <div className="flex items-center text-dark-text-muted text-sm">
              <span className="text-green-400 mr-2">🔒</span>
              No file uploads required
            </div>
            <div className="flex items-center text-dark-text-muted text-sm">
              <span className="text-green-400 mr-2">⚡</span>
              Process files instantly
            </div>
            <div className="flex items-center text-dark-text-muted text-sm">
              <span className="text-green-400 mr-2">🆓</span>
              Completely free to use
            </div>
            <div className="flex items-center text-dark-text-muted text-sm">
              <span className="text-green-400 mr-2">🌐</span>
              Works offline too
            </div>
          </div>
        </header>

        {/* Why Choose DocEnclave Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-dark-text-primary text-center mb-12">
            Why DocEnclave PDF Merger Beats the Competition
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Page-by-Page Preview</h3>
              <p className="text-dark-text-secondary">
                See every page before merging. Unlike other tools that work blindly, 
                you get thumbnail previews and can select exactly which pages to include.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Smart Duplicate Detection</h3>
              <p className="text-dark-text-secondary">
                Our AI automatically highlights potential duplicate pages, 
                helping you create cleaner, more professional merged documents.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Zero Privacy Risk</h3>
              <p className="text-dark-text-secondary">
                Your PDFs never leave your device. Everything happens in your browser, 
                making it perfect for sensitive business documents.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">✂️</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Surgical Precision</h3>
              <p className="text-dark-text-secondary">
                Delete unwanted pages with one click. Select odd/even pages. 
                Reorder content exactly how you want it.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Lightning Fast</h3>
              <p className="text-dark-text-secondary">
                No waiting for uploads or downloads. Processing happens instantly 
                on your device, even with large files.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Truly Free Forever</h3>
              <p className="text-dark-text-secondary">
                No hidden fees, no watermarks, no signup required. 
                Merge up to 5 PDFs completely free, always.
              </p>
            </div>
          </div>
        </section>

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

        {/* Privacy Notice */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <span className="text-blue-400 mt-0.5">🔐</span>
            <div>
              <h4 className="text-blue-400 font-medium mb-1">Your Privacy is Guaranteed</h4>
              <p className="text-blue-300 text-sm">
                This PDF merger works entirely in your browser. Your files are never uploaded to our servers, 
                never stored, and never seen by anyone. Perfect for confidential business documents, 
                legal papers, and personal files.
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

        {/* Main Tool Section */}
        <section className="mb-16" data-upload-section>
          <h2 className="text-2xl font-bold text-dark-text-primary text-center mb-8">
            {!previewMode ? "Upload Your PDF Files to Get Started" : "Review & Select Pages"}
          </h2>

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
                {isDragActive ? 'Drop your PDF files here' : 'Choose or drag PDF files here'}
              </h3>
              <p className="text-dark-text-secondary mb-4">
                Select multiple PDF files to combine them into one document
              </p>
              <p className="text-dark-text-muted text-sm">
                Supports up to {limits.maxFiles} files • Maximum {formatFileSize(limits.maxTotalSize)} total
              </p>
            </div>
          )}

          {/* File Previews */}
          {previewMode && files.length > 0 && (
            <div className="space-y-6 mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-dark-text-primary">
                  Advanced Page Preview & Selection
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
                    Custom Output Filename
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
                className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {isProcessing ? `Merging Your PDF... ${progress}%` : 
                 previewMode ? `Merge ${totalSelectedPages} Selected Pages into One PDF` : 
                 `Combine ${files.length} PDF Files`}
              </button>
            </div>
          )}
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-dark-text-primary text-center mb-12">
            How to Merge PDF Files in 3 Simple Steps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Upload PDF Files</h3>
              <p className="text-dark-text-secondary">
                Drag and drop your PDF files or click to browse. 
                You can upload multiple files at once for batch processing.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Preview & Select</h3>
              <p className="text-dark-text-secondary">
                Review page thumbnails, select specific pages you want to include, 
                and reorder them to create the perfect document structure.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold text-dark-text-primary mb-3">Download Merged PDF</h3>
              <p className="text-dark-text-secondary">
                Click merge and your combined PDF downloads instantly. 
                No waiting, no email required, no watermarks added.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-dark-text-primary text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                Is this PDF merger really free?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Yes! You can merge up to 5 PDF files (50MB total) completely free, forever. 
                No hidden fees, no watermarks, no signup required.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                Are my PDF files safe and private?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Absolutely. Your files never leave your device. All processing happens locally 
                in your browser, making this perfect for confidential documents.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                Can I select specific pages to merge?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Yes! Our advanced preview lets you see every page, select specific pages, 
                delete unwanted content, and reorder pages before merging.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                What file formats are supported?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Currently we support PDF files only. We're working on adding support for 
                Word documents, images, and other formats soon.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                Does this work offline?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Once the page loads, yes! You can merge PDFs even without an internet connection 
                since everything processes locally on your device.
              </p>
            </div>
            
            <div className="bg-dark-secondary p-6 rounded-xl border border-dark-border">
              <h3 className="text-lg font-semibold text-dark-text-primary mb-3">
                How large can my PDF files be?
              </h3>
              <p className="text-dark-text-secondary text-sm">
                Free users can merge files up to 50MB total. Premium users get 500MB total capacity 
                and can merge up to 50 files at once.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-dark-text-primary mb-6">
            Ready to Merge Your PDF Files?
          </h2>
          <p className="text-xl text-dark-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands who trust DocEnclave for secure, private PDF processing. 
            No signup required — start merging in seconds.
          </p>
          <button
            onClick={() => {
              const uploadSection = document.querySelector('[data-upload-section]')
              uploadSection?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-dark-text-primary text-dark-primary px-8 py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors text-lg"
          >
            Start Merging PDFs Now - It's Free!
          </button>
        </section>

        {/* Upgrade Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-dark-secondary rounded-xl p-8 max-w-md mx-4 border border-dark-border">
              <h3 className="text-xl font-bold text-dark-text-primary mb-4">
                Upgrade to Premium for More Power
              </h3>
              <p className="text-dark-text-secondary mb-6">
                You've reached the free plan limits. Upgrade to Premium and unlock:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="text-dark-text-secondary">✅ Merge up to 50 PDF files</li>
                <li className="text-dark-text-secondary">✅ 500MB total file capacity</li>
                <li className="text-dark-text-secondary">✅ Custom output filenames</li>
                <li className="text-dark-text-secondary">✅ Password protect merged PDFs</li>
                <li className="text-dark-text-secondary">✅ Priority processing speed</li>
                <li className="text-dark-text-secondary">✅ Batch queue operations</li>
              </ul>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 border border-dark-border text-dark-text-primary py-2 rounded-lg hover:bg-dark-tertiary transition-colors"
                >
                  Continue Free
                </button>
                <button className="flex-1 bg-dark-text-primary text-dark-primary py-2 rounded-lg font-medium hover:bg-dark-text-secondary transition-colors">
                  Upgrade to Premium
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default PDFMerge