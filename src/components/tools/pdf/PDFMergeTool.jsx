import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Configure PDF.js worker to ensure it runs in the browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [error, setError] = useState('');
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf');
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  // Advanced options state (remains for future use)
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
  const [userPlan] = useState('free'); // Placeholder for user plan
  const [userLocation] = useState('US'); // Placeholder for user location

  const limits = {
    free: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024, maxTotalSize: 100 * 1024 * 1024 },
    premium: { maxFiles: 200, maxFileSize: 500 * 1024 * 1024, maxTotalSize: 2000 * 1024 * 1024 }
  };
  const currentLimits = limits[userPlan];

  /**
   * Renders a single PDF page to a canvas and returns it as a Data URL (image).
   * This is the core function for creating a visual preview.
   */
  const renderPagePreview = async (pdfDoc, pageIndex, scale = 0.5) => {
    try {
      console.log(`renderPagePreview: Starting to render page ${pageIndex + 1}`);
      const page = await pdfDoc.getPage(pageIndex + 1);
      const viewport = page.getViewport({ scale });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      console.log(`renderPagePreview: Before page.render for page ${pageIndex + 1}`);
      await page.render(renderContext).promise;
      console.log(`renderPagePreview: After page.render for page ${pageIndex + 1}. Generating data URL.`);
      return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Error rendering page preview:', error);
      return null; // Return null if a preview can't be generated
    }
  };

  /**
   * Generates image previews for all pages in a given PDF file.
   * It uses pdfjs-dist to load the document and then calls renderPagePreview for each page.
   */
  const generatePreviews = async (file, arrayBuffer) => {
    try {
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      const numPages = pdfDoc.numPages;
      
      const pages = [];
      for (let i = 0; i < numPages; i++) {
        const previewImage = await renderPagePreview(pdfDoc, i);
        pages.push({
          pageIndex: i,
          selected: true,
          isDuplicate: false, // Will be calculated later
          globalIndex: 0, // Will be calculated later
          preview: previewImage
        });
      }
      
      return pages;
    } catch (error) {
      console.error('Error generating previews:', error);
      // Fallback: If preview generation fails, create page objects without a preview image.
      const pdfLibDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfLibDoc.getPageCount();
      return Array.from({ length: pageCount }, (_, index) => ({
        pageIndex: index,
        selected: true,
        isDuplicate: false,
        globalIndex: 0,
        preview: null
      }));
    }
  };

  // Detects if a page has been uploaded more than once across all files.
  const detectDuplicates = (allFiles) => {
    const pageHashes = new Map();
    let globalPageIndex = 0;
    
    return allFiles.map(file => ({
      ...file,
      pages: file.pages.map((page, pageIndex) => {
        const pageHash = `${file.name}-${pageIndex}`;
        const isDuplicate = pageHashes.has(pageHash);
        if (!isDuplicate) pageHashes.set(pageHash, true);
        
        return {
          ...page,
          isDuplicate,
          globalIndex: globalPageIndex++
        };
      })
    }));
  };

  // Validates a single file based on type and size.
  const validateFile = (file) => {
    if (file.type !== 'application/pdf') {
      return { valid: false, error: 'Only PDF files are accepted' };
    }
    
    if (file.size > currentLimits.maxFileSize) {
      const maxSize = currentLimits.maxFileSize / (1024 * 1024);
      return { valid: false, error: `File too large (max ${maxSize}MB for ${userPlan} users)` };
    }
    
    return { valid: true };
  };

  /**
   * Handles file selection from input or drag-and-drop.
   * This function now orchestrates the preview generation process.
   */
  const handleFileSelect = async (selectedFiles) => {
    setError('');
    setLoadingPreviews(true); // Start loading indicator
    
    const acceptedFiles = Array.from(selectedFiles);
    
    if (files.length + acceptedFiles.length > currentLimits.maxFiles) {
      setError(`Maximum ${currentLimits.maxFiles} files allowed for ${userPlan} users.`);
      setLoadingPreviews(false);
      return;
    }

    const newFiles = [];
    let totalSize = files.reduce((sum, file) => sum + file.size, 0);

    for (const file of acceptedFiles) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error);
        setLoadingPreviews(false);
        return;
      }
      if (totalSize + file.size > currentLimits.maxTotalSize) {
        setError(`Total file size exceeds ${currentLimits.maxTotalSize / (1024 * 1024)}MB limit.`);
        setLoadingPreviews(false);
        return;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        // Generate the visual previews for the uploaded file
        const pages = await generatePreviews(file, arrayBuffer.slice(0));

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
        setError(`Failed to load PDF: ${file.name}. It might be corrupted or protected.`);
        setLoadingPreviews(false);
        return;
      }
    }

    const updatedFiles = [...files, ...newFiles];
    const filesWithDuplicates = detectDuplicates(updatedFiles);
    setFiles(filesWithDuplicates);
    setLoadingPreviews(false); // Stop loading indicator
    
    if (newFiles.length > 0) {
      setPreviewMode(true);
      toast.success(`Added ${newFiles.length} file(s).`);
    }
  };
  
  // --- Other functions (handleDrop, removeFile, mergePDFs, etc.) remain unchanged ---
  // --- as they were already correct. For brevity, I will omit them here but they are ---
  // --- assumed to be present as in the original file provided. Let's include the key ones. ---

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

  const getTotalSelectedPages = () => {
    return files.reduce((total, file) => 
      total + file.pages.filter(page => page.selected).length, 0
    );
  };

  const moveFile = (id, direction) => {
    const index = files.findIndex(file => file.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < files.length - 1)) {
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

  const mergePDFs = async () => {
    // This function's logic is correct and remains unchanged.
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

  const renderMergePageActions = (file) => {
    // This function's logic is correct and remains unchanged.
    const allSelected = file.pages.every(p => p.selected);
    return (
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { const updatedPages = file.pages.map(page => ({ ...page, selected: !allSelected })); updatePagesForFile(file.id, updatedPages);}} className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors">{allSelected ? 'Deselect All' : 'Select All'}</button>
        <button onClick={() => { const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 0 })); updatePagesForFile(file.id, updatedPages);}} className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors">Odd Pages</button>
        <button onClick={() => { const updatedPages = file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 1 })); updatePagesForFile(file.id, updatedPages);}} className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors">Even Pages</button>
      </div>
    );
  };


  return (
    // The main return with JSX. The key change is pointed out below.
    <div className="min-h-screen bg-black">
      <div className="container-padding mx-auto py-8">
        {/* ... (Header, Dropzone, etc. - remains the same) ... */}

        {/* Dropzone */}
        {!previewMode && !loadingPreviews && (
           <div
            className={`border-2 border-dashed ${
              dragOver ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-900'
            } rounded-lg p-8 text-center cursor-pointer transition-colors duration-200`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current.click()}
          >
            <span className="material-icons text-gray-400 text-5xl mb-2">cloud_upload</span>
            <p className="text-white text-lg font-medium">Drag & Drop PDF files here</p>
            <p className="text-gray-400 text-sm">or click to select files</p>
          </div>
        )}

        {/* Loading Previews Indicator */}
        {loadingPreviews && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 my-6">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-400 text-sm">Generating page previews, please wait...</p>
            </div>
          </div>
        )}

        {/* Preview Mode */}
        {previewMode && files.length > 0 && (
          <div className="space-y-6 mb-6">
            {/* ... (File list header remains the same) ... */}
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
                      <button onClick={() => moveFile(file.id, 'up')} disabled={index === 0} className="p-2 text-gray-400 hover:text-white disabled:opacity-50"><span className="material-icons">keyboard_arrow_up</span></button>
                      <button onClick={() => moveFile(file.id, 'down')} disabled={index === files.length - 1} className="p-2 text-gray-400 hover:text-white disabled:opacity-50"><span className="material-icons">keyboard_arrow_down</span></button>
                      <button onClick={() => removeFile(file.id)} className="p-2 text-red-400 hover:text-red-300"><span className="material-icons">delete</span></button>
                    </div>
                  </div>
                </div>

                {/* Page Preview Grid - THIS IS THE VISUAL FIX */}
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
                      {/* This part now renders the generated image or a fallback */}
                      {page.preview ? (
                        <img
                          src={page.preview}
                          alt={`Page ${page.pageIndex + 1} of ${file.name}`}
                          className="w-full h-24 md:h-32 object-contain bg-gray-800 rounded"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-24 md:h-32 bg-gray-700 rounded flex flex-col items-center justify-center text-center p-2">
                           <span className="material-icons text-gray-400">error_outline</span>
                          <span className="text-gray-400 text-xs mt-1">Preview failed</span>
                        </div>
                      )}
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
        
        {/* ... (Rest of the component remains the same) ... */}
         <input
          type="file"
          accept="application/pdf"
          multiple
          ref={fileInputRef}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PDFMergeTool;