// UPDATED FILE: docenclave-main/src/tools/pdf/merge/PDFMerge.jsx

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js';
import SEOHead from '../../../components/shared/SEOHead.jsx';
import PDFFilePreview from '../../../components/shared/pdf/PDFFilePreview.jsx';

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

  useEffect(() => {
    trackToolUsage('pdf_merge');
  }, []);

  const detectDuplicates = (allFiles) => {
    const pageHashes = new Map();
    let globalPageIndex = 0;
    
    return allFiles.map(file => ({
      ...file,
      pages: file.pages.map((page, pageIndex) => {
        const pageHash = `${file.name}-${pageIndex}`;
        const isDuplicate = pageHashes.has(pageHash);
        pageHashes.set(pageHash, true);
        
        return {
          ...page,
          isDuplicate,
          globalIndex: globalPageIndex++
        };
      })
    }));
  };

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted');
      return;
    }

    if (files.length + acceptedFiles.length > limits.maxFiles) {
      setShowUpgradeModal(true);
      return;
    }

    const newFiles = [];
    let totalSize = files.reduce((sum, file) => sum + file.size, 0);

    for (const file of acceptedFiles) {
      const validation = validateFile(file, currentPlan);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      if (totalSize + file.size > limits.maxTotalSize) {
        setShowUpgradeModal(true);
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        const pages = Array.from({ length: pageCount }, (_, index) => ({
          pageIndex: index,
          selected: true,
          isDuplicate: false,
          globalIndex: 0
        }));

        newFiles.push({
          id: Math.random().toString(36).substring(7),
          file,
          name: file.name,
          size: file.size,
          pages
        });
        
        totalSize += file.size;
      } catch (err) {
        setError(`Failed to load PDF: ${file.name}. Please ensure it's a valid PDF file.`);
        return;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    const filesWithDuplicates = detectDuplicates(updatedFiles);
    setFiles(filesWithDuplicates);
    
    if (newFiles.length > 0) {
      setPreviewMode(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: true
  });

  const removeFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(detectDuplicates(updatedFiles));
  };

  const updatePagesForFile = (fileId, newPages) => {
    const updatedFiles = files.map(file => 
      file.id === fileId ? { ...file, pages: newPages } : file
    );
    setFiles(detectDuplicates(updatedFiles));
  };

  const handlePageToggle = (fileId, pageIndex) => {
    const fileToUpdate = files.find(f => f.id === fileId);
    if (!fileToUpdate) return;
    const updatedPages = fileToUpdate.pages.map((page, idx) => 
      idx === pageIndex ? { ...page, selected: !page.selected } : page
    );
    updatePagesForFile(fileId, updatedPages);
  };

  const handlePageDelete = (fileId, pageIndex) => {
    const fileToUpdate = files.find(f => f.id === fileId);
    if (!fileToUpdate) return;
    const updatedPages = fileToUpdate.pages.filter((_, idx) => idx !== pageIndex);
    updatePagesForFile(fileId, updatedPages);
  };
  
  const getTotalSelectedPages = () => {
    return files.reduce((total, file) => 
      total + file.pages.filter(page => page.selected).length, 0
    );
  };

  const moveFile = (id, direction) => {
    const index = files.findIndex(file => file.id === id);
    if (
      (direction === 'up' && index > 0) || 
      (direction === 'down' && index < files.length - 1)
    ) {
      const newFiles = [...files];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(detectDuplicates(newFiles));
    }
  };

  const mergePDFs = async () => {
    if (getTotalSelectedPages() < 1) {
      setError('Please select at least 1 page to merge');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');

    try {
      const mergedPdf = await PDFDocument.create();
      let processedFiles = 0;
      
      for (const file of files) {
        const selectedPagesInFile = file.pages.filter(page => page.selected);
        
        if (selectedPagesInFile.length > 0) {
          setProgress(Math.round((processedFiles / files.length) * 80));
          
          const fileArrayBuffer = await file.file.arrayBuffer();
          const pdf = await PDFDocument.load(fileArrayBuffer);
          
          const pageIndices = selectedPagesInFile.map(page => page.pageIndex);
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        processedFiles++;
      }

      setProgress(95);
      const pdfBytes = await mergedPdf.save();
      
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = outputFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setProgress(100);
      await trackDownload('pdf_merge');
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
        setFiles([]);
        setPreviewMode(false);
      }, 1500);

    } catch (err) {
      console.error('PDF merge error:', err);
      setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSelectedPages = getTotalSelectedPages();

  // Render prop for file-level action buttons
  const renderMergePageActions = (file) => {
    const allSelected = file.pages.every(p => p.selected);
    return (
      <>
        <button
          onClick={() => {
            const updatedPages = file.pages.map(page => ({ ...page, selected: !allSelected }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <button
          onClick={() => {
            const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 0 }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Odd Pages
        </button>
        <button
          onClick={() => {
            const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 1 }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Even Pages
        </button>
      </>
    );
  };

  return (
    <>
      <SEOHead 
        title="Free PDF Merge Tool - Combine PDF Files Online | DocEnclave"
        description="Merge PDF files for free with page preview. Combine, reorder, and select specific pages. 100% secure, no uploads required. Start merging PDFs instantly."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Tool Header and USP Cards... (unchanged) */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-dark-text-primary mb-4">
            PDF Merge Tool
          </h1>
          <p className="text-lg text-dark-text-secondary max-w-2xl mx-auto">
            Combine multiple PDF files with page-by-page preview. Select specific pages, 
            reorder content, and merge instantly — all while keeping your files 100% private.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-12 max-w-3xl mx-auto">
          {/* ... USP Cards JSX ... */}
        </div>

        {/* Plan Limits Display... (unchanged) */}
        <div className="bg-dark-secondary rounded-lg p-4 mb-6 border border-dark-border">
          {/* ... Plan Limits JSX ... */}
        </div>

        {/* Error Display... (unchanged) */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* File Upload Zone... (unchanged) */}
        {(!previewMode || files.length === 0) && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-dark-border hover:border-gray-500 bg-dark-secondary'}`}>
            {/* ... Dropzone JSX ... */}
          </div>
        )}

        {/* Simple File List View */}
        {!previewMode && files.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text-primary">
                Selected Files ({files.length})
              </h3>
              <div className="flex space-x-3">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <button className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Add More Files
                  </button>
                </div>
                <button
                  onClick={() => setPreviewMode(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Advanced Preview
                </button>
              </div>
            </div>
            
            <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between bg-dark-tertiary p-4 rounded-lg">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className="text-2xl">📄</span>
                      <div className="overflow-hidden">
                        <p className="text-dark-text-primary font-medium truncate">{file.name}</p>
                        <p className="text-dark-text-muted text-sm">
                          {formatFileSize(file.size)} • {file.pages.length} pages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => moveFile(file.id, 'up')} disabled={index === 0} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬆️</button>
                      <button onClick={() => moveFile(file.id, 'down')} disabled={index === files.length - 1} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬇️</button>
                      <button onClick={() => removeFile(file.id)} className="p-2 text-red-400 hover:text-red-300">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Advanced File Previews */}
        {previewMode && files.length > 0 && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text-primary">
                Page Preview & Selection
              </h3>
              <div className="flex space-x-3">
                <div {...getRootProps()}>
                  <input {...getInputProps()} />
                  <button className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Add More Files
                  </button>
                </div>
                <button onClick={() => setPreviewMode(false)} className="border border-dark-border text-dark-text-primary px-4 py-2 rounded-lg hover:bg-dark-tertiary transition-colors">
                  Simple View
                </button>
              </div>
            </div>
            
            {files.map((file, index) => (
              <PDFFilePreview
                key={file.id}
                file={file}
                pages={file.pages}
                onPageToggle={handlePageToggle}
                onPageDelete={handlePageDelete}
                onRemoveFile={removeFile}
                renderPageActions={() => renderMergePageActions(file)}
                renderReorderControls={() => (
                  <div className="flex items-center space-x-2">
                    <button onClick={() => moveFile(file.id, 'up')} disabled={index === 0} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬆️</button>
                    <button onClick={() => moveFile(file.id, 'down')} disabled={index === files.length - 1} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬇️</button>
                  </div>
                )}
              />
            ))}
          </div>
        )}

        {/* Merge Controls and other sections... (unchanged) */}
        {files.length > 0 && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mb-16">
            {/* ... Merge controls JSX ... */}
          </div>
        )}
        <section className="mb-16">
          {/* ... How To Use section JSX ... */}
        </section>
        <section className="mb-16">
          {/* ... SEO Blog section JSX ... */}
        </section>
        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            {/* ... Upgrade Modal JSX ... */}
          </div>
        )}
      </div>
    </>
  );
};

export default PDFMerge;