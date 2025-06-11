import React, { useState, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { useDropzone } from 'react-dropzone'
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js'
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js'

const PDFMerge = () => {
  const [files, setFiles] = useState([])
  const [currentPlan, setCurrentPlan] = useState('FREE')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [error, setError] = useState('')
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf')

  const limits = PLAN_LIMITS[currentPlan]

  useEffect(() => {
    trackToolUsage('pdf_merge')
  }, [])

  const onDrop = (acceptedFiles, rejectedFiles) => {
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

      newFiles.push({
        id: Math.random().toString(36).substring(7),
        file,
        name: file.name,
        size: file.size
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

  const moveFile = (id, direction) => {
    const index = files.findIndex(file => file.id === id)
    if (
      (direction === 'up' && index > 0) || 
      (direction === 'down' && index < files.length - 1)
    ) {
      const newFiles = [...files]
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      ;[newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]]
      setFiles(newFiles)
    }
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
        setProgress((i / files.length) * 90)
        
        const fileArrayBuffer = await files[i].file.arrayBuffer()
        const pdf = await PDFDocument.load(fileArrayBuffer)
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        
        copiedPages.forEach((page) => mergedPdf.addPage(page))
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
      }, 1500)

    } catch (err) {
      console.error('PDF merge error:', err)
      setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.')
      setIsProcessing(false)
      setProgress(0)
    }
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

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

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-dark-secondary rounded-xl p-6 mb-6 border border-dark-border">
          <h3 className="text-lg font-semibold text-dark-text-primary mb-4">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-3">
            {files.map((file, index) => (
              <div key={file.id} className="flex items-center justify-between bg-dark-tertiary p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="text-dark-text-primary font-medium">{file.name}</p>
                    <p className="text-dark-text-muted text-sm">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => moveFile(file.id, 'up')}
                    disabled={index === 0}
                    className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⬆️
                  </button>
                  <button
                    onClick={() => moveFile(file.id, 'down')}
                    disabled={index === files.length - 1}
                    className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ⬇️
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 text-red-400 hover:text-red-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
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
            disabled={files.length < 2 || isProcessing}
            className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? `Merging... ${progress}%` : `Merge ${files.length} Files`}
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
              <li className="text-dark-text-secondary">• Custom output filenames</li>
              <li className="text-dark-text-secondary">• Password protection</li>
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