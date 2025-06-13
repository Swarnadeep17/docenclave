import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf');

  // Advanced options state
  const [mergeOptions, setMergeOptions] = useState({
    alternatePages: false,
    compressionLevel: 4,
    preserveBookmarks: false,
    generateTOC: false,
    addSectionDividers: false,
    customPageNumbering: false,
    passwordProtect: false,
    password: '',
    addWatermark: false,
    watermarkText: '',
    stripMetadata: false,
    customFileName: 'merged-document.pdf'
  });

  const fileInputRef = useRef(null);
  const [userPlan] = useState('free');
  const [userLocation] = useState('US');

  const limits = {
    free: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024, maxTotalSize: 100 * 1024 * 1024 },
    premium: { maxFiles: 200, maxFileSize: 500 * 1024 * 1024, maxTotalSize: 2000 * 1024 * 1024 }
  };

  const currentLimits = limits[userPlan];
  const pricing = {
    US: { symbol: '$', amount: '9.99' },
    EU: { symbol: '€', amount: '8.99' },
    IN: { symbol: '₹', amount: '799' },
    GB: { symbol: '£', amount: '7.99' }
  };
  const currentPricing = pricing[userLocation] || pricing.US;

  // FIXED: Detect duplicates like in your working version
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

  // FIXED: File validation like your working version
  const validateFile = (file, currentPlan) => {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are accepted' };
    }
    
    if (file.size > currentLimits.maxFileSize) {
      const maxSize = currentLimits.maxFileSize / (1024 * 1024);
      return { valid: false, error: `File too large (max ${maxSize}MB for ${currentPlan} users)` };
    }
    
    return { valid: true };
  };

  // FIXED: Handle file drop like your working version
  const handleFileSelect = async (selectedFiles) => {
    setError('');
    
    const acceptedFiles = Array.from(selectedFiles).filter(file => file.type === 'application/pdf');
    const rejectedFiles = Array.from(selectedFiles).filter(file => file.type !== 'application/pdf');
    
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted');
      return;
    }

    if (files.length + acceptedFiles.length > currentLimits.maxFiles) {
      setError(`Maximum ${currentLimits.maxFiles} files allowed for ${userPlan} users`);
      return;
    }

    const newFiles = [];
    let totalSize = files.reduce((sum, file) => sum + file.size, 0);

    for (const file of acceptedFiles) {
      const validation = validateFile(file, userPlan);
      
      if (!validation.valid) {
        setError(validation.error);
        return;
      }

      if (totalSize + file.size > currentLimits.maxTotalSize) {
        setError(`Total file size exceeds ${currentLimits.maxTotalSize / (1024 * 1024)}MB limit`);
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        // CRITICAL FIX: Use a copy of the buffer to prevent mutation
        const bufferCopy = arrayBuffer.slice(0);
        const pdfDoc = await PDFDocument.load(bufferCopy);
        const pageCount = pdfDoc.getPageCount();
        
        // FIXED: Use pageIndex structure like your working version
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
        console.error("Error loading PDF:", err);
        setError(`Failed to load PDF: ${file.name}. Please ensure it's a valid PDF file.`);
        return;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    const filesWithDuplicates = detectDuplicates(updatedFiles);
    setFiles(filesWithDuplicates);
    
    if (newFiles.length > 0) {
      setPreviewMode(true);
      toast.success(`Added ${newFiles.length} file(s)`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (id) => {
    const updatedFiles = files.filter(file => file.id !== id);
    setFiles(detectDuplicates(updatedFiles));
    toast.success('File removed');
  };

  // FIXED: Update pages for file like your working version
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

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  // FIXED: Merge PDFs like your working version
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
      toast.success('PDF merged successfully!');
      
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

  // FIXED: Page actions like your working version
  const renderMergePageActions = (file) => {
    const allSelected = file.pages.every(p => p.selected);
    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            const updatedPages = file.pages.map(page => ({ ...page, selected: !allSelected }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
        <button
          onClick={() => {
            const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 0 }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Odd Pages
        </button>
        <button
          onClick={() => {
            const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 1 }));
            updatePagesForFile(file.id, updatedPages);
          }}
          className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
        >
          Even Pages
        </button>
      </div>
    );
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSelectedPages = getTotalSelectedPages();

  return (
    <div className="min-h-screen bg-black">
      <div className="container-padding mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/tools/pdf" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300">
            <span className="material-icons">arrow_back</span>
            <span>Back to PDF Tools</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-800 text-gray-300 border border-gray-700">
              🆓 Free Plan
            </div>
          </div>
        </div>

        {/* Tool Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">PDF Merge Tool</h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Combine multiple PDF files with page-by-page preview. Select specific pages, 
            reorder content, and merge instantly — all while keeping your files 100% private.
          </p>
        </div>

        {/* Plan Limits Display */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6 border border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6">
              <span className="text-gray-400 text-sm">
                <span className="font-medium text-white">{userPlan.toUpperCase()}</span> Plan
              </span>
              <span className="text-gray-400 text-sm">
                Files: <span className="text-white">{files.length}</span>/{currentLimits.maxFiles}
              </span>
              <span className="text-gray-400 text-sm">
                Size: <span className="text-white">{formatFileSize(totalSize)}</span>/{formatFileSize(currentLimits.maxTotalSize)}
              </span>
              {previewMode && (
                <span className="text-gray-400 text-sm">
                  Selected Pages: <span className="text-white">{totalSelectedPages}</span>
                </span>
              )}
            </div>
            {userPlan === 'free' && (
              <Link to="/pricing" className="bg-white text-black px-4 py-2 rounded text-sm font-medium hover:bg-gray-200 transition-colors">
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-red-400 material-icons">warning</span>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* File Upload Area */}
        {(!previewMode || files.length === 0) && (
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${
              dragOver ? 'border-blue-400 bg-blue-500/5' : 'border-gray-700 hover:border-gray-500 bg-gray-900'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <div className="text-6xl mb-4">📄</div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {dragOver ? 'Drop your PDF files here' : 'Choose or drag PDF files here'}
            </h3>
            <p className="text-gray-400 mb-4">Select multiple PDF files to combine them into one document</p>
            <p className="text-gray-500 text-sm">
              Supports up to {currentLimits.maxFiles} files • Maximum {formatFileSize(currentLimits.maxTotalSize)} total
            </p>
          </div>
        )}

        {/* Simple File List */}
        {!previewMode && files.length > 0 && (
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Selected Files ({files.length})</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add More Files
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Advanced Preview
                </button>
              </div>
            </div>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={file.id} className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span className="text-2xl">📄</span>
                      <div className="overflow-hidden">
                        <p className="text-white font-medium truncate" title={file.name}>{file.name}</p>
                        <p className="text-gray-400 text-sm">
                          {formatFileSize(file.size)} • {file.pages.length} pages
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move file up"
                      >
                        <span className="material-icons">keyboard_arrow_up</span>
                      </button>
                      <button
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === files.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Move file down"
                      >
                        <span className="material-icons">keyboard_arrow_down</span>
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                        aria-label="Remove file"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIXED: Preview Mode with Page Previews - like your working version */}
        {previewMode && files.length > 0 && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Page Preview & Selection</h3>
              <div className="flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Add More Files
                </button>
                <button
                  onClick={() => setPreviewMode(false)}
                  className="border border-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Simple View
                </button>
              </div>
            </div>
            {files.map((file, index) => (
              <div key={file.id} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                {/* File Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="material-icons text-red-400 text-2xl">picture_as_pdf</span>
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderMergePageActions(file)}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => moveFile(file.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <span className="material-icons">keyboard_arrow_up</span>
                      </button>
                      <button
                        onClick={() => moveFile(file.id, 'down')}
                        disabled={index === files.length - 1}
                        className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                      >
                        <span className="material-icons">keyboard_arrow_down</span>
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <span className="material-icons">delete</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* FIXED: Page Preview Grid - This creates the preview like your working version */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mt-4">
                  {file.pages.map((page, pageIdx) => (
                    <div
                      key={pageIdx}
                      className={`relative cursor-pointer rounded-lg border-2 transition-all duration-300 ${
                        page.selected 
                          ? 'border-blue-400 shadow-lg shadow-blue-400/25' 
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                      onClick={() => handlePageToggle(file.id, pageIdx)}
                    >
                      <img
                        src={`https://placehold.co/200x280/1f2937/ffffff?text=Page%20${page.pageIndex + 1}`}
                        alt={`Page ${page.pageIndex + 1} preview of ${file.name}`}
                        className="w-full h-24 md:h-32 object-cover rounded bg-gray-700"
                      />
                      <div className={`absolute inset-0 flex items-center justify-center ${
                        page.selected ? 'bg-blue-500/20' : 'bg-black/20'
                      }`}>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                          page.selected 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-white bg-black/50'
                        }`}>
                          {page.selected && (
                            <span className="material-icons text-white text-sm">check</span>
                          )}
                        </div>
                      </div>
                      <div className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-2 py-1 rounded">
                        {page.pageIndex + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Merge Button */}
        {files.length > 0 && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-16">
            <button
              onClick={mergePDFs}
              disabled={totalSelectedPages < 1 || isProcessing}
              className="w-full bg-white text-black py-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin"></div>
                  <span>Merging... {progress}%</span>
                </div>
              ) : (
                `Merge ${totalSelectedPages} Selected Pages`
              )}
            </button>
          </div>
        )}

        {/* Premium Upgrade Prompt */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <span className="material-icons text-2xl text-yellow-400">star</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl md:text-2xl font-semibold mb-2 text-white">Unlock Premium Features</h3>
              <p className="text-gray-400 mb-4">Advanced document organization, security features, and more.</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{currentPricing.symbol}{currentPricing.amount}</div>
              <div className="text-sm text-gray-400 mb-4">per month</div>
              <Link to="/pricing" className="btn-primary bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold">
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFMergeTool;
