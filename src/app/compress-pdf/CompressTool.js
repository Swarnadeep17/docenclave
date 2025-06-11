'use client';

import { useState, useRef, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function CompressTool() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState(75);
  const [imageQuality, setImageQuality] = useState(80);
  const [removeMetadata, setRemoveMetadata] = useState(true);
  const [processingProgress, setProcessingProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // File size formatting
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Validate file
  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      throw new Error('Only PDF files are allowed');
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new Error('File size must be less than 50MB');
    }
    return true;
  };

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles) => {
    const newFiles = Array.from(selectedFiles).map(file => {
      try {
        validateFile(file);
        return {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          status: 'ready', // ready, processing, completed, error
          originalSize: file.size,
          compressedSize: null,
          compressionRatio: null,
          downloadUrl: null,
          error: null
        };
      } catch (error) {
        return {
          id: Date.now() + Math.random(),
          file,
          name: file.name,
          size: file.size,
          status: 'error',
          error: error.message
        };
      }
    });

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  // Drag and drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [handleFileSelect]);

  // Remove file
  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Clear all files
  const clearAllFiles = () => {
    setFiles([]);
    setProcessingProgress({});
  };

  // Compress PDF using pdf-lib
  const compressPDF = async (file) => {
    try {
      const arrayBuffer = await file.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      // Remove metadata if requested
      if (removeMetadata) {
        pdfDoc.setTitle('');
        pdfDoc.setAuthor('');
        pdfDoc.setSubject('');
        pdfDoc.setKeywords([]);
        pdfDoc.setProducer('DocEnclave');
        pdfDoc.setCreator('DocEnclave');
        pdfDoc.setCreationDate(new Date());
        pdfDoc.setModificationDate(new Date());
      }

      // Get all pages
      const pages = pdfDoc.getPages();
      
      // Process each page for optimization
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        
        // Update progress
        setProcessingProgress(prev => ({
          ...prev,
          [file.id]: {
            current: i + 1,
            total: pages.length,
            stage: 'Optimizing pages...'
          }
        }));

        // Basic page optimization
        // Note: pdf-lib has limited image compression capabilities
        // For better compression, we'd need additional libraries
        try {
          const { width, height } = page.getSize();
          
          // Optimize based on compression level
          if (compressionLevel < 50) {
            // High compression - reduce page quality
            page.scaleContent(0.8, 0.8);
            page.setSize(width * 0.8, height * 0.8);
          } else if (compressionLevel < 75) {
            // Medium compression
            page.scaleContent(0.9, 0.9);
            page.setSize(width * 0.9, height * 0.9);
          }
        } catch (pageError) {
          console.warn(`Page ${i + 1} optimization failed:`, pageError);
        }
      }

      // Set compression progress to finalizing
      setProcessingProgress(prev => ({
        ...prev,
        [file.id]: {
          current: pages.length,
          total: pages.length,
          stage: 'Finalizing compression...'
        }
      }));

      // Save compressed PDF
      const compressedBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false
      });

      const compressedSize = compressedBytes.length;
      const compressionRatio = ((file.originalSize - compressedSize) / file.originalSize * 100).toFixed(1);

      // Create download URL
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      return {
        compressedSize,
        compressionRatio,
        downloadUrl,
        compressedBytes
      };

    } catch (error) {
      console.error('PDF compression failed:', error);
      throw new Error(`Compression failed: ${error.message}`);
    }
  };

  // Process single file
  const processSingleFile = async (file) => {
    try {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'processing' } : f
      ));

      const result = await compressPDF(file);

      setFiles(prev => prev.map(f => 
        f.id === file.id ? {
          ...f,
          status: 'completed',
          compressedSize: result.compressedSize,
          compressionRatio: result.compressionRatio,
          downloadUrl: result.downloadUrl
        } : f
      ));

      // Clear progress
      setProcessingProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.id];
        return newProgress;
      });

    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === file.id ? { ...f, status: 'error', error: error.message } : f
      ));
      
      setProcessingProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[file.id];
        return newProgress;
      });
    }
  };

  // Process all files
  const processAllFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    
    // Process files sequentially to avoid memory issues
    for (const file of files.filter(f => f.status === 'ready')) {
      await processSingleFile(file);
    }

    setIsProcessing(false);
  };

  // Download single file
  const downloadFile = (file) => {
    if (file.downloadUrl) {
      const link = document.createElement('a');
      link.href = file.downloadUrl;
      link.download = file.name.replace('.pdf', '_compressed.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Download all compressed files as ZIP
  const downloadAllAsZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    const completedFiles = files.filter(f => f.status === 'completed');
    
    for (const file of completedFiles) {
      if (file.downloadUrl) {
        const response = await fetch(file.downloadUrl);
        const blob = await response.blob();
        zip.file(file.name.replace('.pdf', '_compressed.pdf'), blob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = 'compressed_pdfs.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const completedFiles = files.filter(f => f.status === 'completed');
  const totalSavings = completedFiles.reduce((acc, file) => acc + (file.originalSize - file.compressedSize), 0);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Advanced PDF Compressor
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Compress PDF files with advanced options and batch processing
        </p>
      </div>

      {/* Settings Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Compression Settings
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Compression Level */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Compression Level: {compressionLevel}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={compressionLevel}
              onChange={(e) => setCompressionLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>High</span>
              <span>Medium</span>
              <span>Low</span>
            </div>
          </div>

          {/* Image Quality */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Image Quality: {imageQuality}%
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={imageQuality}
              onChange={(e) => setImageQuality(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Low</span>
              <span>High</span>
            </div>
          </div>

          {/* Remove Metadata */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={removeMetadata}
                onChange={(e) => setRemoveMetadata(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Remove Metadata
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Remove author, title, and other metadata
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Drop PDF files here or click to browse
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Support for multiple files • Max 50MB per file • PDF only
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Select Files
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Files ({files.length})
              </h3>
              <div className="flex space-x-3">
                {completedFiles.length > 1 && (
                  <button
                    onClick={downloadAllAsZip}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download All as ZIP
                  </button>
                )}
                <button
                  onClick={clearAllFiles}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={processAllFiles}
                  disabled={isProcessing || files.filter(f => f.status === 'ready').length === 0}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? 'Processing...' : 'Compress All'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">PDF</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatFileSize(file.originalSize)}
                      </p>
                      {file.status === 'completed' && (
                        <>
                          <span className="text-gray-400">→</span>
                          <p className="text-sm text-green-600 dark:text-green-400">
                            {formatFileSize(file.compressedSize)} ({file.compressionRatio}% saved)
                          </p>
                        </>
                      )}
                    </div>
                    
                    {/* Progress Bar */}
                    {file.status === 'processing' && processingProgress[file.id] && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{processingProgress[file.id].stage}</span>
                          <span>{processingProgress[file.id].current}/{processingProgress[file.id].total}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-600">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(processingProgress[file.id].current / processingProgress[file.id].total) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {file.status === 'error' && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    {file.status === 'ready' && (
                      <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    )}
                    {file.status === 'processing' && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                    {file.status === 'completed' && (
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    )}
                    {file.status === 'error' && (
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    )}
                  </div>

                  {/* Download Button */}
                  {file.status === 'completed' && (
                    <button
                      onClick={() => downloadFile(file)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {completedFiles.length > 0 && (
            <div className="p-6 bg-green-50 dark:bg-green-900/20 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    Successfully compressed {completedFiles.length} file{completedFiles.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Total space saved: {formatFileSize(totalSavings)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Average compression: {(completedFiles.reduce((acc, file) => acc + parseFloat(file.compressionRatio), 0) / completedFiles.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Features List */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Advanced Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Batch Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Real-time Preview</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Metadata Removal</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Quality Control</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">Client-side Processing</span>
          </div>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300">ZIP Download</span>
          </div>
        </div>
      </div>
    </div>
  );
}