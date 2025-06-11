import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js'
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js'
import FileUploadZone from './components/FileUploadZone.jsx'
import FileList from './components/FileList.jsx'
import MergeControls from './components/MergeControls.jsx'
import ProgressModal from './components/ProgressModal.jsx'
import PremiumUpgradeModal from './components/PremiumUpgradeModal.jsx'

const PDFMerge = () => {
  const [files, setFiles] = useState([])
  const [currentPlan, setCurrentPlan] = useState('FREE') // This would come from auth context
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState('')
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf')

  const limits = PLAN_LIMITS[currentPlan]

  useEffect(() => {
    // Track tool access
    trackToolUsage('pdf_merge')
  }, [])

  const onDrop = (acceptedFiles, rejectedFiles) => {
    setError('')
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted')
      return
    }

    // Check file count limits
    if (files.length + acceptedFiles.length > limits.maxFiles) {
      setShowUpgradeModal(true)
      return
    }

    // Validate each file
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

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size,
        pages: null // Will be populated when PDF is loaded
      })
      
      totalSize += file.size
    }

    setFiles(prev => [...prev, ...newFiles])
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  })

  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const reorderFiles = (dragIndex, hoverIndex) => {
    const draggedFile = files[dragIndex]
    const newFiles = [...files]
    newFiles.splice(dragIndex, 1)
    newFiles.splice(hoverIndex, 0, draggedFile)
    setFiles(newFiles)
  }

  const mergePDFs = async () => {
    if (files.length < 2) {
      setError('Please select at least 2 PDF files to merge')
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError('')

    try {
      const mergedPdf = await PDFDocument.create()
      
      for (let i = 0; i < files.length; i++) {
        setProgress((i / files.length) * 90) // 90% for processing files
        
        const fileArrayBuffer = await files[i].file.arrayBuffer()
        const pdf = await PDFDocument.load(fileArrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        copiedPages.forEach((page) => mergedPdf.addPage(page))
      }

      setProgress(95) // Final processing

      const pdfBytes = await mergedPdf.save()
      
      // Create download link
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
      
      // Track successful merge
      await trackDownload('pdf_merge')
      
      // Reset after successful merge
      setTimeout(() => {
        setIsProcessing(false)
        setProgress(0)
        setFiles([])
      }, 1500)

    } catch (err) {
      console.error('PDF merge error:', err)
      setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.')
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)
  const remainingFiles = limits.maxFiles - files.length
  const remainingSize = limits.maxTotalSize - totalSize

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4">
          PDF Merge Tool
        </h1>
        <p className="text-dark-text-secondary max-w-2xl mx-auto text-lg">
          Combine multiple PDF files into a single document. All processing happens in your browser for maximum privacy.
        </p>
      </div>

      {/* Plan Limits Display */}
      <div className="bg-dark-secondary rounded-lg p-4 mb-6 border border-dark-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-dark-text-secondary text-sm">
              <span className="font-medium text-dark-text-primary">{currentPlan}</span> Plan
            </span>
            <span className="text-dark-text-secondary text-sm">
              Files: <span className="text-dark-text-primary">{files.length}</span>/{limits.maxFiles}
            </span>
            <span className="text-dark-text-secondary text-sm">
              Size: <span className="text-dark-text-primary">{formatFileSize(totalSize)}</span>/{formatFileSize(limits.maxTotalSize)}
            </span>
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
            <h4 className="text-blue-400 font-medium mb-1">Privacy Notice</h4>
            <p className="text-blue-300 text-sm">
              All PDF processing happens locally in your browser. Your files are never uploaded to our servers or stored anywhere. 
              Please ensure your PDF files are not password-protected for proper processing.
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
      <FileUploadZone 
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        isDragActive={isDragActive}
        hasFiles={files.length > 0}
        remainingFiles={remainingFiles}
        remainingSize={remainingSize}
      />

      {/* File List */}
      {files.length > 0 && (
        <FileList 
          files={files}
          onRemove={removeFile}
          onReorder={reorderFiles}
          canReorder={limits.features.reorder}
        />
      )}

      {/* Merge Controls */}
      {files.length > 0 && (
        <MergeControls 
          files={files}
          onMerge={mergePDFs}
          isProcessing={isProcessing}
          currentPlan={currentPlan}
          outputFilename={outputFilename}
          setOutputFilename={setOutputFilename}
          canCustomFilename={limits.features.customFilename}
        />
      )}

      {/* Progress Modal */}
      {isProcessing && (
        <ProgressModal 
          progress={progress}
          isOpen={isProcessing}
        />
      )}

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <PremiumUpgradeModal 
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          currentPlan={currentPlan}
          feature="file limits"
        />
      )}
    </div>
  )
}

export default PDFMerge