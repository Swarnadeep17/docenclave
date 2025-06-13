import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // File size limit for free users (50MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const MAX_FILES_FREE = 10;

  const handleFileSelect = (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => {
      // Validate file type
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 50MB for free users)`);
        return false;
      }
      
      return true;
    });

    // Check total file limit
    if (files.length + newFiles.length > MAX_FILES_FREE) {
      toast.error(`Maximum ${MAX_FILES_FREE} files allowed for free users`);
      return;
    }

    setFiles(prev => [...prev, ...newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      preview: null
    }))]);

    toast.success(`Added ${newFiles.length} file(s)`);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
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
    setFiles(prev => prev.filter(file => file.id !== id));
    toast.success('File removed');
  };

  const moveFile = (fromIndex, toIndex) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const fileData of files) {
        const arrayBuffer = await fileData.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      
      // Create download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged-document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('PDF merged successfully!');
      
      // Clear files after successful merge
      setFiles([]);
      
    } catch (error) {
      console.error('Error merging PDFs:', error);
      toast.error('Failed to merge PDFs. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container-padding mx-auto py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/tools/pdf"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">arrow_back</span>
            <span>Back to PDF Tools</span>
          </Link>
        </div>

        {/* Tool Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center">
              <span className="material-icons text-3xl text-red-400">merge</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black">PDF Merge</h1>
              <p className="text-gray-400 text-lg">Combine multiple PDF files into one document</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragOver 
                ? 'border-white bg-white/5' 
                : 'border-gray-700 hover:border-gray-600'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-6">
              <div className="w-20 h-20 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <span className="material-icons text-4xl text-gray-400">cloud_upload</span>
              </div>
              
              <div>
                <h3 className="text-2xl font-semibold mb-2">Drop PDF files here</h3>
                <p className="text-gray-400 mb-4">or click to browse your files</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  Select PDF Files
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
                <span>• Max {MAX_FILES_FREE} files (Free)</span>
                <span>• Max 50MB per file</span>
                <span>• PDF files only</span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,application/pdf"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Selected Files ({files.length})</h3>
                <div className="text-sm text-gray-400">
                  Drag files to reorder • Merge order: top to bottom
                </div>
              </div>

              <div className="space-y-3">
                {files.map((fileData, index) => (
                  <div
                    key={fileData.id}
                    className="flex items-center space-x-4 p-4 bg-gray-800 rounded-xl hover:bg-gray-750 transition-colors duration-200"
                  >
                    {/* Drag Handle */}
                    <div className="cursor-move text-gray-500 hover:text-gray-300">
                      <span className="material-icons">drag_indicator</span>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="material-icons text-red-400">picture_as_pdf</span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{fileData.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(fileData.size)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {index > 0 && (
                        <button
                          onClick={() => moveFile(index, index - 1)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Move up"
                        >
                          <span className="material-icons text-sm">keyboard_arrow_up</span>
                        </button>
                      )}
                      {index < files.length - 1 && (
                        <button
                          onClick={() => moveFile(index, index + 1)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors duration-200"
                          title="Move down"
                        >
                          <span className="material-icons text-sm">keyboard_arrow_down</span>
                        </button>
                      )}
                      <button
                        onClick={() => removeFile(fileData.id)}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200"
                        title="Remove file"
                      >
                        <span className="material-icons text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Merge Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={mergePDFs}
                  disabled={files.length < 2 || isProcessing}
                  className={`btn-primary px-8 py-4 text-lg ${
                    files.length < 2 || isProcessing 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                >
                  {isProcessing ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin"></div>
                      <span>Merging PDFs...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="material-icons">merge</span>
                      <span>Merge {files.length} PDFs</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Features Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">Why Choose Our PDF Merge Tool?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-green-400 mt-1">security</span>
                <div>
                  <h4 className="font-semibold mb-1">100% Secure</h4>
                  <p className="text-sm text-gray-400">All processing happens in your browser. No file uploads to servers.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-blue-400 mt-1">flash_on</span>
                <div>
                  <h4 className="font-semibold mb-1">Lightning Fast</h4>
                  <p className="text-sm text-gray-400">Instant processing with no waiting time or file size delays.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-purple-400 mt-1">high_quality</span>
                <div>
                  <h4 className="font-semibold mb-1">Original Quality</h4>
                  <p className="text-sm text-gray-400">Maintain the original quality and formatting of your PDFs.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="material-icons text-yellow-400 mt-1">devices</span>
                <div>
                  <h4 className="font-semibold mb-1">Works Anywhere</h4>
                  <p className="text-sm text-gray-400">Compatible with all devices and operating systems.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade Prompt */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-8">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <span className="material-icons text-yellow-400">star</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
                <p className="text-gray-400">Merge unlimited files, larger file sizes, and access advanced features.</p>
              </div>
              <Link to="/pricing" className="btn-primary bg-yellow-500 hover:bg-yellow-400 text-black">
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
