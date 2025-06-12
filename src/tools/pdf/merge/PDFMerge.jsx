import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// SEO Head and inner components remain the same, as their logic is sound.
// We are only changing the layout and structure of the main component.
const SEOHead = () => { /* ... existing code ... */ };
const PDFPageRenderer = ({ pdfData, pageNumber }) => { /* ... existing code ... */ };
const PDFPagePreview = ({ file, pageData, pageNumber, isSelected, isDuplicate, onToggleSelect, onDelete, globalPageIndex }) => { /* ... existing code ... */ };
const FilePreview = ({ file, pages, onPagesUpdate, onRemoveFile }) => { /* ... existing code ... */ };

// New Compact USP Bar component
const USPBar = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mb-6">
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg">
        <span>👁️</span> <span className="text-dark-text-secondary">Page Preview</span>
      </div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg">
        <span>🔒</span> <span className="text-dark-text-secondary">100% Private</span>
      </div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg">
        <span>⚡</span> <span className="text-dark-text-secondary">Instant Processing</span>
      </div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg">
        <span>🎯</span> <span className="text-dark-text-secondary">Smart Detection</span>
      </div>
    </div>
  );


const PDFMerge = () => {
  const [files, setFiles] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState('');
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf');
  const [previewMode, setPreviewMode] = useState(false);

  const limits = PLAN_LIMITS[currentPlan];

  // All the existing logic functions (useEffect, onDrop, removeFile, etc.) remain unchanged.
  // --- Start of existing logic ---
  useEffect(() => { trackToolUsage('pdf_merge'); }, []);
  const detectDuplicates = (allFiles) => { /* ... existing code ... */ };
  const onDrop = async (acceptedFiles, rejectedFiles) => { /* ... existing code ... */ };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: true });
  const removeFile = (id) => { /* ... existing code ... */ };
  const updatePages = (fileId, newPages) => { /* ... existing code ... */ };
  const getTotalSelectedPages = () => { /* ... existing code ... */ };
  const moveFile = (id, direction) => { /* ... existing code ... */ };
  const mergePDFs = async () => { /* ... existing code ... */ };
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSelectedPages = getTotalSelectedPages();
  // --- End of existing logic ---


  return (
    <>
      <SEOHead />
      <div className="container mx-auto px-4 py-8 md:py-12">

        {/* --- The New Tool Workbench --- */}
        <div className="max-w-5xl mx-auto rounded-xl p-px bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500">
            <div className="bg-dark-secondary rounded-[11px] p-6 md:p-8">
                {/* Tool Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-3">
                        PDF Merge Tool
                    </h1>
                    <p className="text-base text-dark-text-secondary max-w-2xl mx-auto">
                        Combine multiple PDFs with page-by-page preview and reordering, all 100% private.
                    </p>
                </div>

                {/* Compact USP Bar */}
                <USPBar />

                {/* Tool Body - Contains plan limits, errors, and the core tool UI */}
                <div className="bg-dark-primary rounded-lg p-4 border border-dark-border">
                    {/* Plan Limits Display */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-text-secondary">
                            <span><span className="font-medium text-dark-text-primary">{currentPlan}</span> PLAN</span>
                            <span>Files: <span className="text-dark-text-primary">{files.length}</span>/{limits.maxFiles}</span>
                            <span>Size: <span className="text-dark-text-primary">{formatFileSize(totalSize)}</span>/{formatFileSize(limits.maxTotalSize)}</span>
                            {previewMode && (
                                <span>Selected Pages: <span className="text-dark-text-primary">{totalSelectedPages}</span></span>
                            )}
                        </div>
                        {currentPlan === 'FREE' && (
                        <button 
                            onClick={() => setShowUpgradeModal(true)}
                            className="bg-dark-tertiary text-dark-text-primary px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-700 transition-colors w-full sm:w-auto"
                        >
                            Upgrade
                        </button>
                        )}
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400">
                           <span className="font-bold mr-2">⚠️</span>{error}
                        </div>
                    )}

                    {/* --- CORE TOOL UI --- */}
                    {(!previewMode || files.length === 0) && ( /* ... existing dropzone jsx ... */ )}
                    {!previewMode && files.length > 0 && ( /* ... existing simple file list jsx ... */ )}
                    {previewMode && files.length > 0 && ( /* ... existing advanced file preview jsx ... */ )}
                    {files.length > 0 && ( /* ... existing merge controls jsx ... */ )}
                    {/* --- END CORE TOOL UI --- */}
                </div>
            </div>
        </div>
        {/* --- End of the New Tool Workbench --- */}

        {/* --- Ancillary Content Below --- */}
        <div className="max-w-5xl mx-auto">
            {/* How to Use Section */}
            <section className="mt-16"> {/* ... existing code ... */} </section>

            {/* SEO Blog Section */}
            <section className="mt-16"> {/* ... existing code ... */} </section>
        </div>

        {/* Upgrade Modal */}
        {showUpgradeModal && ( /* ... existing code ... */ )}
      </div>
    </>
  );
};


// Paste the original, unchanged component code here
const SEOHead_original = () => {
  useEffect(() => {
    document.title = "Free PDF Merge Tool - Combine PDF Files Online | DocEnclave"
    document.querySelector('meta[name="description"]')?.setAttribute('content', 
      "Merge PDF files for free with page preview. Combine, reorder, and select specific pages. 100% secure, no uploads required. Start merging PDFs instantly."
    )
  }, [])
  return null
}
const PDFPageRenderer_original = ({ pdfData, pageNumber }) => {
  const canvasRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfData || !canvasRef.current) return

      try {
        setLoading(true)
        setError(false)

        // Load PDF document for this specific file
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise
        const page = await pdfDoc.getPage(pageNumber)
        const viewport = page.getViewport({ scale: 1 })
        
        // Calculate scale to fit within 80x112 dimensions
        const scale = Math.min(80 / viewport.width, 112 / viewport.height)
        const scaledViewport = page.getViewport({ scale })
        
        const canvas = canvasRef.current
        const context = canvas.getContext('2d')
        canvas.height = scaledViewport.height
        canvas.width = scaledViewport.width

        const renderContext = {
          canvasContext: context,
          viewport: scaledViewport
        }

        await page.render(renderContext).promise
        setLoading(false)
      } catch (err) {
        console.error('Error rendering PDF page:', err)
        setError(true)
        setLoading(false)
      }
    }

    renderPage()
  }, [pdfData, pageNumber])

  if (error) {
    return (
      <div className="w-20 h-28 bg-white rounded border flex items-center justify-center">
        <div className="text-gray-400 text-xs text-center">
          <div className="text-lg mb-1">⚠️</div>
          <div>Error</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-20 h-28">
      <canvas 
        ref={canvasRef}
        className="w-full h-full bg-white rounded border"
        style={{ display: loading ? 'none' : 'block' }}
      />
      {loading && (
        <div className="absolute inset-0 bg-white rounded border flex items-center justify-center">
          <div className="text-gray-400 text-xs text-center animate-pulse">
            <div className="text-lg mb-1">📄</div>
            <div>Loading...</div>
          </div>
        </div>
      )}
    </div>
  )
}
const PDFPagePreview_original = ({ file, pageData, pageNumber, isSelected, isDuplicate, onToggleSelect, onDelete, globalPageIndex }) => {
  const [pdfData, setPdfData] = useState(null)

  useEffect(() => {
    const loadPdfData = async () => {
      try {
        const arrayBuffer = await file.file.arrayBuffer()
        setPdfData(arrayBuffer)
      } catch (err) {
        console.error('Error loading PDF data:', err)
      }
    }
    loadPdfData()
  }, [file])

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
        <PDFPageRenderer 
          pdfData={pdfData}
          pageNumber={pageNumber}
        />

        <div className="text-center mt-2">
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
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
const FilePreview_original = ({ file, pages, onPagesUpdate, onRemoveFile }) => {
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
            file={file}
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

// Just copy the original content of the functions and components that I have abstracted with `/* ... existing code ... */`
// E.g. replace `SEOHead` with `SEOHead_original`'s code.
// The same applies to logic functions like `detectDuplicates`, `onDrop` etc.

export default PDFMerge;