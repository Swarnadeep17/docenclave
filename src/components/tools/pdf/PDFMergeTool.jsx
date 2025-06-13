import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Configure PDF.js worker to ensure it runs in the browser
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [previews, setPreviews] = useState({});
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [error, setError] = useState('');

  // Advanced options state
  const [mergeOptions, setMergeOptions] = useState({
    // Smart Merge (Free)
    pageRanges: {},
    alternatePages: false,
    customInsertions: [],

    // Compression (Free)
    compressionLevel: 4,

    // Premium Features
    preserveBookmarks: false,
    generateTOC: false,
    addSectionDividers: false,
    customPageNumbering: false,
    passwordProtect: false,
    password: '',
    addWatermark: false,
    watermarkText: '',
    stripMetadata: false,
    ocrProcessing: false, // Excluded based on client-side constraint
    preserveSignatures: false, // Excluded based on client-side constraint
    customFileName: '',
    outputFormat: 'pdf', // Only PDF export in this version
    errorRecovery: false, // Premium Feature
  });

  const fileInputRef = useRef(null);

  // User plan (simulate for demo - will be from auth context in real app)
  const [userPlan, setUserPlan] = useState('free'); // 'free' or 'premium'
  const [userLocation, setUserLocation] = useState('US'); // Placeholder

  // Limits based on plan
  const limits = {
    free: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024, totalSize: 50 * 1024 * 1024 }, // Assuming total size limit for free tier
    premium: { maxFiles: 200, maxFileSize: 500 * 1024 * 1024, totalSize: 500 * 1024 * 1024 } // Assuming total size limit for premium tier
  };
  const currentLimits = limits[userPlan];


  // Premium features list (matching state keys)
  const premiumFeatures = [
      'preserveBookmarks', 'generateTOC', 'addSectionDividers', 'customPageNumbering',
      'passwordProtect', 'addWatermark', 'stripMetadata', 'customFileName', 'errorRecovery'
  ];


  // Placeholder functions
  const generatePreviews = async (fileData) => {
      setIsGeneratingPreviews(true);
      try {
          const arrayBuffer = await fileData.file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          const numPages = pdf.numPages;

          const pagePreviews = [];
          for (let i = 0; i < numPages; i++) {
              const page = await pdf.getPage(i + 1);
              const viewport = page.getViewport({ scale: 0.5 }); // Smaller scale for thumbnail
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderContext = {
                  canvasContext: context,
                  viewport: viewport
              };

              await page.render(renderContext).promise;
              const thumbnail = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality if needed

              pagePreviews.push({
                  pageNum: i + 1,
                  thumbnail,
                  selected: true // All pages selected by default
              });
          }

          setPreviews(prev => ({
              ...prev,
              [fileData.id]: {
                  pageCount: numPages,
                  pages: pagePreviews
              }
          }));

      } catch (error) {
          console.error('Error generating preview:', error);
          toast.error('Failed to generate preview for ' + fileData.name);
          // Create placeholder with no thumbnail on error
           setPreviews(prev => ({
              ...prev,
              [fileData.id]: {
                  pageCount: 0, // Indicate preview failed
                  pages: []
              }
          }));

      } finally {
          setIsGeneratingPreviews(false);
      }
  };


   const handleFileSelect = async (selectedFiles) => {
    setError('');
    const acceptedFiles = Array.from(selectedFiles).filter(file => {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }

      if (file.size > currentLimits.maxFileSize) {
        const maxSize = currentLimits.maxFileSize / (1024 * 1024);
        toast.error(`${file.name} is too large (max ${maxSize}MB per file for ${userPlan} users)`);
        return false;
      }

      return true;
    });

    if (files.length + acceptedFiles.length > currentLimits.maxFiles) {
      toast.error(`Maximum ${currentLimits.maxFiles} files allowed for ${userPlan} users`);
      return;
    }

     let totalSize = files.reduce((sum, fileData) => sum + fileData.size, 0);
     for(const file of acceptedFiles) {
         totalSize += file.size;
     }

     if (totalSize > currentLimits.totalSize) {
         const totalSizeMB = currentLimits.totalSize / (1024 * 1024);
         toast.error(`Total file size exceeds ${totalSizeMB.toFixed(2)}MB limit for ${userPlan} users.`);
         return;
     }


    const fileDataArray = acceptedFiles.map((file, index) => ({
      id: Date.now() + index + Math.random(), // More unique ID
      file,
      name: file.name,
      size: file.size,
    }));

    setFiles(prev => [...prev, ...fileDataArray]);

    // Trigger preview generation for newly added files
    fileDataArray.forEach(fileData => generatePreviews(fileData));

    if (fileDataArray.length > 0) {
         toast.success(`Added ${fileDataArray.length} file(s).`);
    }

     // Automatically move to next step if threshold is met or user clicks button
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
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[id];
      return newPreviews;
    });
    toast.success('File removed');
  };

   const togglePageSelection = (fileId, pageNum) => {
    setPreviews(prev => {
      const filePreview = prev[fileId];
      if (!filePreview) return prev;

      return {
        ...prev,
        [fileId]: {
          ...filePreview,
          pages: filePreview.pages.map(page =>
            page.pageNum === pageNum ? { ...page, selected: !page.selected } : page
          )
        }
      };
    });
  };

   const selectAllPages = (fileId, select = true) => {
      setPreviews(prev => {
        const filePreview = prev[fileId];
        if (!filePreview) return prev;
         return {
             ...prev,
             [fileId]: {
                ...filePreview,
                pages: filePreview.pages.map(page => ({...page, selected: select}))
             }
         };
      });
   };


   const moveFile = (fromIndex, toIndex) => {
       const newFiles = [...files];
       const [movedFile] = newFiles.splice(fromIndex, 1);
       newFiles.splice(toIndex, 0, movedFile);
       setFiles(newFiles); // State update will trigger re-render
   };


   const getTotalSelectedPages = () => {
       return files.reduce((total, fileData) => {
           const filePreview = previews[fileData.id];
           if (!filePreview) return total;
           return total + filePreview.pages.filter(page => page.selected).length;
       }, 0);
   };


  const mergePDFs = async () => {
       setError('');
       if (getTotalSelectedPages() === 0) {
           setError('Please select at least one page to merge.');
           toast.error('No pages selected for merging.');
           return;
       }
       if (files.length < 1) { // Allow merging a single multi-page PDF
            setError('Please upload at least one PDF file.');
            toast.error('No files uploaded.');
            return;
       }


       setIsProcessing(true);

       try {
            const mergedPdf = await PDFDocument.create();

            for (const fileData of files) {
                const arrayBuffer = await fileData.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer, {
                    // Consider options like ignoreEncryption, throwOnInvalidObject
                    ignoreEncryption: mergeOptions.errorRecovery && userPlan === 'premium', // Error recovery
                });

                const filePreview = previews[fileData.id];
                const selectedPagesIndices = filePreview
                    ? filePreview.pages.filter(p => p.selected).map(p => p.pageNum - 1)
                    : Array.from({ length: pdf.getPageCount() }, (_, i) => i); // Select all if no preview

                if (selectedPagesIndices.length > 0) {
                    const copiedPages = await mergedPdf.copyPages(pdf, selectedPagesIndices);
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                }
            }

            // --- Apply Merge Options ---

            // Apply Compression Level (Level 4)
            // PDF-lib doesn't have explicit compression levels like 1-5, but save options control quality.
            // Use `useObjectStreams` for potentially better compression.
            // Aggressive compression might involve image re-encoding or downsampling, which pdf-lib doesn't do natively.
            // For Level 4, we'll use useObjectStreams and mention that truly aggressive compression might need other libraries/techniques.
             const pdfBytes = await mergedPdf.save({
                 useObjectStreams: mergeOptions.compressionLevel >= 3, // Use streams for higher levels
                 addDefaultPage: false, // Prevent adding a blank page if no pages were added
                 // compression: // pdf-lib's compression option is experimental and for object streams.
             });


            // Apply Password Protection (Premium)
            if (mergeOptions.passwordProtect && mergeOptions.password && userPlan === 'premium') {
                 // Note: pdf-lib v1.x doesn't support adding passwords directly during save.
                 // This would typically require a server-side library or a different client-side library like pdfmake (which has different capabilities).
                 // For now, this feature is marked as Premium but requires further research/implementation outside of pdf-lib's current capabilities.
                 // I will leave the option in the UI but add a note about implementation requirement.
                 console.warn("Password Protection requires a library that supports adding passwords (pdf-lib v1.x does not).");
                 toast.error("Password Protection is not yet fully implemented with the current library.");
            }


            // Apply Watermark Addition (Premium)
             if (mergeOptions.addWatermark && mergeOptions.watermarkText && userPlan === 'premium') {
                 // Watermark implementation requires drawing text or images on each page.
                 // This involves iterating through mergedPdf pages and using pdf-lib drawing functions.
                 // This is a more complex implementation task. Placeholder for now.
                  console.warn("Watermark Addition implementation is pending.");
                  toast.error("Watermark Addition is not yet implemented.");
             }

             // Metadata Stripping (Premium)
              if (mergeOptions.stripMetadata && userPlan === 'premium') {
                  // Stripping metadata involves modifying the PDF document's info dictionary.
                  // pdf-lib allows reading and writing the info dictionary.
                   const info = mergedPdf.getInfoDict();
                   if (info) {
                       // Common keys to remove - adjust as needed
                       const keysToRemove = ['Author', 'Creator', 'Producer', 'CreationDate', 'ModDate'];
                       keysToRemove.forEach(key => {
                            if (info.has(key)) {
                                // pdf-lib uses PDFName objects for keys
                                const name = PDFDocument.getPDFName(key);
                                info.delete(name);
                                // console.log(`Removed metadata key: ${key}`); // For debugging
                            }
                       });
                       // Note: More advanced metadata stripping might involve inspecting and removing
                       // XMP metadata streams, which is more complex.
                   }
              }

            // Apply Custom File Naming (Premium)
            const fileName = (mergeOptions.customFileName && userPlan === 'premium') ? mergeOptions.customFileName : 'merged-document.pdf';


            // Create download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('PDF merged successfully!');

            // Clear files and reset wizard on successful merge
            setFiles([]);
            setPreviews({});
            setWizardStep(1);

        } catch (error) {
            console.error('PDF merge error:', error);
            setError('Failed to merge PDFs. Please check files and options.');
            toast.error('PDF merge failed.');
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

  const nextStep = () => {
    // Basic validation before moving to next steps
    if (wizardStep === 1 && files.length === 0) {
        setError('Please upload at least one PDF file.');
        toast.error('Please upload files.');
        return;
    }
     if (wizardStep === 1 && isGeneratingPreviews) {
         setError('Please wait for previews to finish generating.');
         toast.error('Previews are still generating.');
         return;
     }
     if (wizardStep === 3 && getTotalSelectedPages() === 0) {
         setError('Please select at least one page to merge.');
         toast.error('No pages selected.');
         return;
     }


    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };

  const prevStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  // Helper to check if a feature is premium and if user is free
  const isPremiumLocked = (featureKey) => premiumFeatures.includes(featureKey) && userPlan === 'free';


  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container-padding mx-auto py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/tools/pdf"
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">arrow_back</span>
            <span>Back to PDF Tools</span>
          </Link>

          {/* Plan Badge */}
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              userPlan === 'premium'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}>
              {userPlan === 'premium' ? '✨ Premium' : '🆓 Free Plan'}
            </div>
          </div>
        </div>

        {/* Tool Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="flex items-center justify-center space-x-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-xl flex items-center justify-center">
              <span className="material-icons text-3xl text-red-400">merge</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black">Advanced PDF Merge</h1>
              <p className="text-gray-400 text-lg">Professional PDF merging with advanced options</p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                advancedMode
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700'
              }`}
            >
              <span className="material-icons text-sm">
                {advancedMode ? 'toggle_on' : 'toggle_off'}
              </span>
              <span>Advanced Options</span>
               {/* Optional: Indicate number of advanced options enabled */}
               {/* {advancedMode && getAdvancedFeaturesCount() > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {getAdvancedFeaturesCount()}
                </span>
              )} */}
            </button>
          </div>

          {/* Wizard Steps */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            {[
              { step: 1, title: 'Upload', icon: 'cloud_upload' },
              { step: 2, title: 'Options', icon: 'settings' },
              { step: 3, title: 'Preview', icon: 'preview' },
              { step: 4, title: 'Download', icon: 'download' }
            ].map(({ step, title, icon }) => (
              <div
                key={step}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  wizardStep >= step
                    ? 'bg-white/10 text-white'
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                <span className="material-icons text-sm">{icon}</span>
                <span className="text-sm font-medium">{title}</span>
                {wizardStep === step && (
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">

            {/* Error Display */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 my-4 text-red-400 text-sm">
                    {error}
                </div>
            )}


          {/* Step 1: File Upload */}
          {wizardStep === 1 && (
            <div className="space-y-8">
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
                    <span>• Max {currentLimits.maxFiles} files ({userPlan})</span>
                    <span>• Max {(currentLimits.maxFileSize / (1024*1024)).toFixed(0)}MB per file</span>
                     <span>• Total size: {(currentLimits.totalSize / (1024*1024)).toFixed(0)}MB ({userPlan})</span>
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

              {/* File List with Previews */}
              {files.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold">Selected Files ({files.length})</h3>
                    <button
                      onClick={nextStep}
                      disabled={files.length === 0 || isGeneratingPreviews}
                      className="btn-primary"
                    >
                      Continue to Options
                    </button>
                  </div>

                  {isGeneratingPreviews && (
                       <div className="text-center py-4">
                           <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                           <p className="text-sm text-gray-400">Generating previews...</p>
                       </div>
                  )}


                  <div className="space-y-6">
                    {files.map((fileData, index) => (
                      <div key={fileData.id} className="border border-gray-700 rounded-xl p-4">
                        {/* File Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="material-icons text-red-400">picture_as_pdf</span>
                            <div>
                              <p className="font-medium">{fileData.name}</p>
                              <p className="text-sm text-gray-400">{formatFileSize(fileData.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                              {/* Reorder buttons */}
                                <button onClick={() => moveFile(index, index - 1)} disabled={index === 0} className="p-1 hover:bg-gray-700 rounded-md disabled:opacity-30"><span className="material-icons text-gray-400 text-sm">arrow_upward</span></button>
                                <button onClick={() => moveFile(index, index + 1)} disabled={index === files.length - 1} className="p-1 hover:bg-gray-700 rounded-md disabled:opacity-30"><span className="material-icons text-gray-400 text-sm">arrow_downward</span></button>

                            {previews[fileData.id]?.pages.length > 0 && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => selectAllPages(fileData.id, true)}
                                  className="text-sm text-blue-400 hover:text-blue-300"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={() => selectAllPages(fileData.id, false)}
                                  className="text-sm text-red-400 hover:text-red-300"
                                >
                                  Deselect All
                                </button>
                              </div>
                            )}
                            <button
                              onClick={() => removeFile(fileData.id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Page Previews */}
                        {previews[fileData.id] && previews[fileData.id].pages.length > 0 ? (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 mt-4">
                            {previews[fileData.id].pages.map((page) => (
                              <div
                                key={page.pageNum}
                                className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                                  page.selected
                                    ? 'ring-2 ring-blue-400 shadow-lg scale-105'
                                    : 'ring-1 ring-gray-600 hover:ring-gray-500'
                                }`}
                                onClick={() => togglePageSelection(fileData.id, page.pageNum)}
                              >
                                <img
                                  src={page.thumbnail}
                                  alt={`Page ${page.pageNum} preview of ${fileData.name}`}
                                  className="w-full h-32 object-cover bg-gray-800" // Add bg-gray-800 as fallback background
                                  onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/200x280/1f2937/ffffff?text=Error%20Loading%20Page%20${page.pageNum}`; e.target.className += ' object-contain'; }} // Basic error fallback
                                />
                                <div className={`absolute inset-0 flex items-center justify-center ${
                                  page.selected ? 'bg-blue-500/20' : 'bg-black/20'
                                }`}>
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    page.selected
                                      ? 'bg-blue-500 border-blue-500'
                                      : 'border-white bg-transparent'
                                  }`}>
                                    {page.selected && (
                                      <span className="material-icons text-white text-sm">check</span>
                                    )}
                                  </div>
                                </div>
                                <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                                  {page.pageNum}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                            // Placeholder if preview generation failed or not started
                            !isGeneratingPreviews && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                   {previews[fileData.id] && previews[fileData.id].pages.length === 0 ? (
                                        'Failed to generate previews for this file.'
                                   ) : (
                                       'Upload files to see previews.' // Should not happen in this step if files exist
                                   )}
                                </div>
                            )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Configure Options */}
          {wizardStep === 2 && (
            <div className="space-y-8">
               <h2 className="text-2xl font-semibold text-center">Configure Merge Options</h2>
              <p className="text-gray-400 text-center">Customize how your PDF files will be merged.</p>

              <div className="max-w-3xl mx-auto space-y-6">
                {/* Free Tier Options */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6">
                  <h3 className="text-xl font-semibold">Free Features</h3>

                  {/* Smart Merge Options */}
                  <div>
                    <h4 className="text-lg font-medium mb-2">Smart Merge</h4>
                    <div className="space-y-3">
                      {/* Alternate Page Merging */}
                      <div className="flex items-center justify-between">
                        <label htmlFor="alternatePages" className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            id="alternatePages"
                            checked={mergeOptions.alternatePages}
                            onChange={(e) => setMergeOptions({ ...mergeOptions, alternatePages: e.target.checked })}
                            className="form-checkbox h-5 w-5 text-blue-600 rounded"
                          />
                          <span>Alternate Page Merging</span>
                        </label>
                        <span className="text-sm text-gray-400">Interleave pages (e.g., P1-File1, P1-File2, P2-File1...).</span>
                      </div>

                       {/* Page Range Selection (Basic Text Input per file) */}
                       <div>
                          <h5 className="font-medium mb-1">Page Range Selection</h5>
                          <p className="text-sm text-gray-400 mb-2">Override selected pages for each file (e.g., 1-5, 8, 10-).</p>
                          <div className="space-y-2">
                             {files.map(fileData => (
                                <div key={fileData.id} className="flex items-center space-x-2">
                                   <label className="text-sm text-gray-400 w-32 truncate">{fileData.name}:</label>
                                   <input
                                      type="text"
                                      value={mergeOptions.pageRanges[fileData.id] || ''}
                                      onChange={(e) => setMergeOptions({
                                         ...mergeOptions,
                                         pageRanges: {
                                            ...mergeOptions.pageRanges,
                                            [fileData.id]: e.target.value
                                         }
                                      })}
                                      placeholder="e.g., 1-5, 8, 10-"
                                      className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                                   />
                                </div>
                             ))}
                          </div>
                       </div>

                       {/* Custom Page Insertion (Placeholder) */}
                        <div className="opacity-50" >
                            <h5 className="font-medium mb-1 text-gray-400">Custom Page Insertion</h5>
                            <p className="text-sm text-gray-500">Insert specific pages at exact positions (Advanced UI needed).</p>
                        </div>

                    </div>
                  </div>

                  {/* Compression */}
                  <div>
                    <h4 className="text-lg font-medium mb-2">Compression</h4>
                     <div className="flex items-center space-x-4">
                        <label htmlFor="compressionLevel" className="text-sm text-gray-400">Level:</label>
                        <select
                            id="compressionLevel"
                            value={mergeOptions.compressionLevel}
                            onChange={(e) => setMergeOptions({ ...mergeOptions, compressionLevel: parseInt(e.target.value) })}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm"
                        >
                            {[1, 2, 3, 4, 5].map(level => (
                                <option key={level} value={level}>Level {level}{level === 4 && ' (Aggressive)'}</option>
                            ))}
                        </select>
                     </div>
                  </div>

                   {/* Batch Operations (Placeholder) */}
                    <div className="opacity-50">
                        <h4 className="text-lg font-medium mb-2 text-gray-400">Batch Operations</h4>
                        <p className="text-sm text-gray-500">Process multiple merge operations simultaneously.</p>
                    </div>

                </div>

                {/* Premium Tier Options (Visible based on advancedMode toggle) */}
                 {advancedMode && (
                    <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-6 space-y-6">
                         <h3 className="text-xl font-semibold text-yellow-400">Premium Features</h3>
                         {userPlan === 'free' && <p className="text-sm text