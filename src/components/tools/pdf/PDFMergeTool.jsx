// PDFMergeTool.jsx - Part 1

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Configure PDF.js worker to ensure it runs in the browser
// Ensure this path is correct relative to where PDF.js worker is served
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [previews, setPreviews] = useState({});
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [error, setError] = useState(''); // Added error state

  // Advanced options state
  const [mergeOptions, setMergeOptions] = useState({
    // Smart Merge (Free)
    pageRanges: {},
    alternatePages: false,
    customInsertions: [], // Placeholder for now

    // Compression (Free)
    compressionLevel: 4, // Level 4 aggressive compression

    // Premium Features
    preserveBookmarks: false,
    generateTOC: false, // Placeholder for now
    addSectionDividers: false, // Placeholder for now
    customPageNumbering: false, // Placeholder for now
    passwordProtect: false,
    password: '',
    addWatermark: false,
    watermarkText: '',
    stripMetadata: false,
    ocrProcessing: false, // Excluded based on client-side constraint
    preserveSignatures: false, // Placeholder for now
    customFileName: '',
    outputFormat: 'pdf', // Default output format
    errorRecovery: false, // Premium feature
  });

  const fileInputRef = useRef(null);

  // User plan (simulate for demo - will be from auth context in real app)
  const [userPlan, setUserPlan] = useState('free'); // 'free' or 'premium'
  const [userLocation, setUserLocation] = useState('US'); // For currency (if needed later)

  // Limits based on plan
  const limits = {
    free: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024, totalSize: 100 * 1024 * 1024 }, // Added totalSize limit
    premium: { maxFiles: 200, maxFileSize: 500 * 1024 * 1024, totalSize: 2000 * 1024 * 1024 } // Added totalSize limit
  };

  const currentLimits = limits[userPlan];

  // Premium features list for easy checking
  const premiumFeatures = [
    'preserveBookmarks', 'generateTOC', 'addSectionDividers', 'customPageNumbering',
    'passwordProtect', 'addWatermark', 'stripMetadata', 'formFieldMerging', // Assuming formFieldMerging is in mergeOptions
    'preserveSignatures', 'customFileName', 'outputFormat', 'sizeOptimization', // Assuming sizeOptimization is in mergeOptions
    'errorRecovery'
  ];

  // Helper to check if a feature is premium and user is free
  const isPremiumFeatureLocked = (feature) => {
    // Check if the feature is in the premiumFeatures list
    const isListedPremium = premiumFeatures.includes(feature);

    // Additional check for specific premium options that might not be simple booleans
    const isPremiumOption = ['password', 'watermarkText', 'customFileName'].includes(feature);


    return (isListedPremium || isPremiumOption) && userPlan === 'free';
  };


  // --- Helper Functions (Will be added in Part 2) ---
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const generatePreviews = async (fileData) => {
        // Implementation in Part 2
    };

    const handleFileSelect = async (selectedFiles) => {
        // Implementation in Part 2
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
        setPreviews(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                pages: prev[fileId].pages.map(page =>
                    page.pageNum === pageNum ? { ...page, selected: !page.selected } : page
                )
            }
        }));
    };

     const selectAllPages = (fileId, select = true) => {
        setPreviews(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                pages: prev[fileId].pages.map(page => ({ ...page, selected: select }))
            }
        }));
    };

    const nextStep = () => {
        if (wizardStep < 4) setWizardStep(wizardStep + 1);
    };

    const prevStep = () => {
        if (wizardStep > 1) setWizardStep(wizardStep - 1);
    };

     const mergePDFs = async () => {
        // Implementation in Part 3
     };


  // --- useEffects (Will be added in Part 2) ---


  return (
    <div className="min-h-screen bg-black text-white"> {/* Added text-white for default text color */}
      <div className="container-padding mx-auto py-8"> {/* Using container-padding from index.css */}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/tools/pdf" /* Assuming /tools/pdf is the parent route */
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors duration-300"
          >
            <span className="material-icons">arrow_back</span>
            <span>Back to PDF Tools</span>
          </Link>

          {/* Plan Badge and Advanced Mode Toggle */}
          <div className="flex items-center space-x-4">
             {/* Plan Badge */}
             <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                userPlan === 'premium'
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                : 'bg-gray-800 text-gray-300 border border-gray-700'
            }`}>
              {userPlan === 'premium' ? '✨ Premium' : '🆓 Free Plan'}
            </div>

             {/* Advanced Mode Toggle */}
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                advancedMode
                  ? 'bg-white text-black'
                  : 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700'
              }`}
            >
              <span className="material-icons text-sm">
                {advancedMode ? 'toggle_on' : 'toggle_off'}
              </span>
              <span>Advanced Mode</span>
            </button>
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

          {/* Wizard Steps Indicator */}
          <div className="flex items-center justify-center space-x-4">
            {[
              { step: 1, title: 'Upload Files', icon: 'cloud_upload' },
              { step: 2, title: 'Configure Options', icon: 'settings' },
              { step: 3, title: 'Preview & Review', icon: 'preview' },
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

        {/* Main Content Area - Render content based on wizardStep */}
        <div className="max-w-6xl mx-auto space-y-8">

          {/* --- Step 1: File Upload (Content in Part 2) --- */}
          {wizardStep === 1 && (
             // Content for Step 1 will go here in Part 2
             <div className="text-center text-gray-400">Loading Step 1 content...</div> // Placeholder
          )}

          {/* --- Step 2: Configure Options (Content in Part 3) --- */}
           {wizardStep === 2 && (
              // Content for Step 2 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 2 content...</div> // Placeholder
           )}

          {/* --- Step 3: Preview & Review (Content in Part 3) --- */}
           {wizardStep === 3 && (
              // Content for Step 3 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 3 content...</div> // Placeholder
           )}

          {/* --- Step 4: Download (Content in Part 3) --- */}
           {wizardStep === 4 && (
              // Content for Step 4 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 4 content...</div> // Placeholder
           )}

        </div> {/* End of max-w-6xl mx-auto space-y-8 */}

      </div> {/* End of container-padding mx-auto py-8 */}
    </div> /* End of min-h-screen bg-black */
  );
};

export default PDFMergeTool;

// PDFMergeTool.jsx - End of Part 1
// PDFMergeTool.jsx - Part 2a (Helper Functions)

// --- Helper Functions ---
    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    /**
     * Generates image previews for all pages in a given PDF file using PDF.js.
     */
    const generatePreviews = async (fileData) => {
        setIsGeneratingPreviews(true);
        try {
            const arrayBuffer = await fileData.file.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;

            const previewData = {
                pageCount: numPages,
                pages: [],
            };

            // Use a smaller scale for efficiency
            const scale = 0.2; // Reduced scale for faster rendering

            for (let i = 0; i < numPages; i++) {
                const page = await pdfDoc.getPage(i + 1);
                const viewport = page.getViewport({ scale });

                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                };

                // Render the page
                await page.render(renderContext).promise;

                // Convert canvas to data URL (JPEG format for smaller size)
                const thumbnail = canvas.toDataURL('image/jpeg', 0.7); // Adjusted quality

                previewData.pages.push({
                    pageNum: i + 1,
                    thumbnail,
                    selected: true, // All pages selected by default
                });
            }

            setPreviews(prev => ({
                ...prev,
                [fileData.id]: previewData,
            }));

        } catch (error) {
            console.error('Error generating preview:', error);
            toast.error('Failed to generate preview for ' + fileData.name);
            // Fallback: Create placeholder previews if generation fails
            try {
                const arrayBuffer = await fileData.file.arrayBuffer();
                const pdf = await PDFDocument.load(arrayBuffer);
                const pageCount = pdf.getPageCount();
                const previewData = {
                    pageCount,
                    pages: Array.from({ length: pageCount }, (_, i) => ({
                        pageNum: i + 1,
                        thumbnail: null, // Indicate preview failed
                        selected: true
                    }))
                };
                setPreviews(prev => ({
                    ...prev,
                    [fileData.id]: previewData
                }));
            } catch (loadError) {
                console.error('Error loading PDF for fallback preview:', loadError);
                setPreviews(prev => ({
                    ...prev,
                    [fileData.id]: { pageCount: 0, pages: [] } // No pages if even loading fails
                }));
            }

        } finally {
            setIsGeneratingPreviews(false);
        }
    };


    /**
     * Handles file selection from input or drag-and-drop.
     */
    const handleFileSelect = async (selectedFiles) => {
        setError(''); // Clear previous errors

        const acceptedFiles = Array.from(selectedFiles).filter(file => {
            if (file.type !== 'application/pdf') {
                toast.error(`${file.name} is not a PDF file`);
                return false;
            }

            if (file.size > currentLimits.maxFileSize) {
                const maxSize = currentLimits.maxFileSize / (1024 * 1024);
                toast.error(`${file.name} is too large (max ${maxSize}MB for ${userPlan} users)`);
                return false;
            }

            // Check total size limit
            const currentTotalSize = files.reduce((sum, fileData) => sum + fileData.file.size, 0);
            if (currentTotalSize + file.size > currentLimits.totalSize) {
                 const maxTotalSize = currentLimits.totalSize / (1024 * 1024);
                 toast.error(`Total file size exceeds ${maxTotalSize}MB limit for ${userPlan} users`);
                 return false;
            }


            return true;
        });

        if (files.length + acceptedFiles.length > currentLimits.maxFiles) {
            toast.error(`Maximum ${currentLimits.maxFiles} files allowed for ${userPlan} users`);
            return;
        }

        const fileDataArray = acceptedFiles.map((file) => ({
            id: Date.now() + Math.random(), // More robust unique ID
            file,
            name: file.name,
            size: file.size,
            preview: null // Placeholder until preview is generated
        }));

        setFiles(prev => [...prev, ...fileDataArray]);

        // Generate previews for new files concurrently
        await Promise.all(fileDataArray.map(fileData => generatePreviews(fileData)));

        if (fileDataArray.length > 0) {
            toast.success(`Added ${fileDataArray.length} file(s)`);
        }
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
        setPreviews(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                pages: prev[fileId].pages.map(page =>
                    page.pageNum === pageNum ? { ...page, selected: !page.selected } : page
                )
            }
        }));
    };

     const selectAllPages = (fileId, select = true) => {
        setPreviews(prev => ({
            ...prev,
            [fileId]: {
                ...prev[fileId],
                pages: prev[fileId].pages.map(page => ({ ...page, selected: select }))
            }
        }));
    };

    const moveFile = (id, direction) => {
        const index = files.findIndex(file => file.id === id);
        if ((direction === 'up' && index > 0) || (direction === 'down' && index < files.length - 1)) {
            const newFiles = [...files];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
            setFiles(newFiles); // Update files state
            // No need to update previews here, as they are tied to file.id
        }
    };


    const nextStep = () => {
         // Add validation before moving to the next step
        if (wizardStep === 1) {
            if (files.length < 2) {
                toast.error('Please add at least 2 PDF files to merge.');
                return;
            }
             // Check if any pages are selected
            const totalSelectedPages = Object.values(previews).reduce((count, filePreview) => {
                return count + (filePreview?.pages.filter(page => page.selected).length || 0);
            }, 0);

            if (totalSelectedPages === 0) {
                 toast.error('Please select at least one page to merge from the uploaded files.');
                 return;
            }

        }
        if (wizardStep < 4) setWizardStep(wizardStep + 1);
    };

    const prevStep = () => {
        if (wizardStep > 1) setWizardStep(wizardStep - 1);
    };


     const mergePDFs = async () => {
        // Implementation in Part 3
     };


  // --- useEffects ---
    // Effect to generate previews when files are added (already handled in handleFileSelect)
    // useEffect(() => {
    //     // Trigger preview generation for any files that don't have previews yet
    //     files.forEach(fileData => {
    //         if (!previews[fileData.id]) {
    //             generatePreviews(fileData);
    //         }
    //     });
    // }, [files, previews]); // Depend on files and previews


  // PDFMergeTool.jsx - End of Part 2a (Helper Functions)
// PDFMergeTool.jsx - Part 2b (Step 1 JSX)

  return (
    <div className="min-h-screen bg-black text-white"> {/* Added text-white for default text color */}
      <div className="container-padding mx-auto py-8"> {/* Using container-padding from index.css */}

        {/* Header (Already in Part 1) */}
        {/* ... (Header content from Part 1) ... */}


        {/* Tool Header (Already in Part 1) */}
        {/* ... (Tool Header content from Part 1) ... */}


        {/* Wizard Steps Indicator (Already in Part 1) */}
         {/* ... (Wizard Steps content from Part 1) ... */}


        {/* Main Content Area - Render content based on wizardStep */}
        <div className="max-w-6xl mx-auto space-y-8">

          {/* --- Step 1: File Upload --- */}
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
                    <span>• Max {currentLimits.maxFileSize / (1024*1024)}MB per file</span>
                     <span>• Total size max {currentLimits.totalSize / (1024*1024)}MB</span>
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
                      disabled={files.length < 2 || Object.values(previews).every(filePreviews => filePreviews?.pages.every(page => !page.selected))} // Disable if less than 2 files or no pages selected
                      className="btn-primary"
                    >
                      Continue to Options
                    </button>
                  </div>

                  <div className="space-y-6">
                    {files.map((fileData, index) => (
                      <div key={fileData.id} className="border border-gray-700 rounded-xl p-4">
                        {/* File Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <span className="material-icons text-red-400">picture_as_pdf</span>
                            <div>
                              <p className="font-medium">{fileData.name}</p>
                              <p className="text-sm text-gray-400">{formatFileSize(fileData.size)}</p> {/* Assuming formatFileSize is implemented */}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                             {/* Select All/Deselect All */}
                             {previews[fileData.id] && previews[fileData.id].pages.length > 0 && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => selectAllPages(fileData.id, true)}
                                        className="text-sm text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                        disabled={isGeneratingPreviews}
                                    >
                                        Select All
                                    </button>
                                     <span className="text-gray-600">|</span>
                                    <button
                                        onClick={() => selectAllPages(fileData.id, false)}
                                        className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                                        disabled={isGeneratingPreviews}
                                    >
                                        Deselect All
                                    </button>
                                </div>
                             )}
                             {/* Move Up/Down */}
                            <div className="flex items-center space-x-2 ml-4">
                                <button onClick={() => moveFile(fileData.id, 'up')} disabled={index === 0} className="p-1 text-gray-400 hover:text-white disabled:opacity-50 rounded"><span className="material-icons text-sm">keyboard_arrow_up</span></button>
                                <button onClick={() => moveFile(fileData.id, 'down')} disabled={index === files.length - 1} className="p-1 text-gray-400 hover:text-white disabled:opacity-50 rounded"><span className="material-icons text-sm">keyboard_arrow_down</span></button>
                            </div>
                             {/* Remove File */}
                            <button
                              onClick={() => removeFile(fileData.id)}
                              className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors duration-200"
                            >
                              <span className="material-icons text-sm">delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Page Previews */}
                        {isGeneratingPreviews && !previews[fileData.id] ? (
                           // Loading indicator for previews for this specific file
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-400">Generating previews...</p>
                          </div>
                        ) : previews[fileData.id]?.pages.length > 0 ? (
                           // Grid of page previews
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"> {/* Adjusted grid columns */}
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
                                {page.thumbnail ? (
                                   <img
                                      src={page.thumbnail}
                                      alt={`Page ${page.pageNum} preview of ${fileData.name}`}
                                      className="w-full h-32 object-cover bg-gray-800" // Added background for placeholder
                                      loading="lazy" // Improve performance for many previews
                                   />
                                ) : (
                                    // Fallback if preview generation failed
                                   <div className="w-full h-32 bg-gray-700 flex items-center justify-center text-center text-sm text-gray-400 p-2">
                                      Preview Failed
                                   </div>
                                )}
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
                           // Message if no previews are available (e.g., file not a PDF, or initial state)
                           // Show this only if not currently generating previews for this file
                           !isGeneratingPreviews && (
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No previews available for this file.
                                </div>
                           )
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

               {/* Error Message Display */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-center">
                        {error}
                    </div>
                )}


            </div>
          )}


        {/* --- Step 2: Configure Options (Content in Part 3) --- */}
           {wizardStep === 2 && (
              // Content for Step 2 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 2 content...</div> // Placeholder
           )}

        {/* --- Step 3: Preview & Review (Content in Part 3) --- */}
           {wizardStep === 3 && (
              // Content for Step 3 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 3 content...</div> // Placeholder
           )}

        {/* --- Step 4: Download (Content in Part 3) --- */}
           {wizardStep === 4 && (
              // Content for Step 4 will go here in Part 3
               <div className="text-center text-gray-400">Loading Step 4 content...</div> // Placeholder
           )}

        </div> {/* End of max-w-6xl mx-auto space-y-8 */}

      </div> {/* End of container-padding mx-auto py-8 */}
    </div> /* End of min-h-screen bg-black */
  );
};

export default PDFMergeTool;

// PDFMergeTool.jsx - End of Part 2b (Step 1 JSX)
// PDFMergeTool.jsx - Part 3a (Step 2 and start of Step 3)


        {/* --- Step 2: Configure Options --- */}
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
                        <span className="text-sm text-gray-400">Interleave pages from selected files.</span>
                      </div>

                       {/* Page Range Selection (Basic Text Input - Can be improved later) */}
                       <div>
                          <h5 className="font-medium mb-1">Page Range Selection</h5>
                          <p className="text-sm text-gray-400 mb-2">Specify page ranges for each file (e.g., 1-5, 8, 10-)</p>
                          <div className="space-y-2">
                             {files.map(fileData => (
                                <div key={fileData.id} className="flex items-center space-x-2">
                                   <label className="text-sm text-gray-400 w-24 truncate">{fileData.name}:</label>
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

                       {/* Custom Page Insertion (Placeholder - More complex UI needed) */}
                        <div className="opacity-50" title="Coming Soon"> {/* Removed cursor-not-allowed */}
                            <h5 className="font-medium mb-1">Custom Page Insertion</h5>
                            <p className="text-sm text-gray-400">Insert specific pages at exact positions.</p>
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
                    <div className="opacity-50" title="Coming Soon"> {/* Removed cursor-not-allowed */}
                        <h4 className="text-lg font-medium mb-2">Batch Operations</h4>
                        <p className="text-sm text-gray-400">Process multiple merge operations simultaneously.</p>
                    </div>

                </div>

                {/* Premium Tier Options (Initially hidden based on advancedMode toggle) */}
                 {advancedMode && (
                    <div className="bg-yellow-900/20 border border-yellow-800/30 rounded-xl p-6 space-y-6">
                         <h3 className="text-xl font-semibold text-yellow-400">Premium Features</h3>
                         <p className="text-sm text-yellow-400">Upgrade to Premium to unlock these features.</p>

                         {/* Document Organization */}
                         <div>
                            <h4 className="text-lg font-medium mb-2 text-yellow-400">Document Organization</h4>
                            <div className="space-y-3 text-yellow-500 opacity-70 cursor-not-allowed">
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Bookmark Preservation</span></p>
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Table of Contents Generation</span></p>
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Section Dividers</span></p>
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Custom Page Numbering</span></p>
                            </div>
                         </div>

                         {/* Quality & Security */}
                         <div>
                            <h4 className="text-lg font-medium mb-2 text-yellow-400">Quality & Security</h4>
                            <div className="space-y-3">
                                {/* Password Protection - Premium */}
                                <div className={`flex items-center justify-between ${userPlan === 'free' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <label htmlFor="passwordProtect" className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="passwordProtect"
                                        checked={mergeOptions.passwordProtect}
                                        onChange={(e) => setMergeOptions({ ...mergeOptions, passwordProtect: e.target.checked })}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        disabled={userPlan === 'free'}
                                    />
                                    <span className={`${userPlan === 'free' ? 'text-yellow-500' : ''}`}>Password Protection</span>
                                    </label>
                                     {userPlan === 'free' && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">Premium</span>}
                                </div>
                                {mergeOptions.passwordProtect && userPlan === 'premium' && (
                                    <div className="ml-6">
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">Password:</label>
                                        <input
                                            type="password"
                                            id="password"
                                            value={mergeOptions.password}
                                            onChange={(e) => setMergeOptions({ ...mergeOptions, password: e.target.value })}
                                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm w-full"
                                        />
                                    </div>
                                )}

                                {/* Watermark Addition - Premium */}
                                <div className={`flex items-center justify-between ${userPlan === 'free' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <label htmlFor="addWatermark" className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="addWatermark"
                                        checked={mergeOptions.addWatermark}
                                        onChange={(e) => setMergeOptions({ ...mergeOptions, addWatermark: e.target.checked })}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        disabled={userPlan === 'free'}
                                    />
                                    <span className={`${userPlan === 'free' ? 'text-yellow-500' : ''}`}>Watermark Addition</span>
                                    </label>
                                     {userPlan === 'free' && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">Premium</span>}
                                </div>
                                {mergeOptions.addWatermark && userPlan === 'premium' && (
                                    <div className="ml-6">
                                        <label htmlFor="watermarkText" className="block text-sm font-medium text-gray-400 mb-1">Watermark Text:</label>
                                        <input
                                            type="text"
                                            id="watermarkText"
                                            value={mergeOptions.watermarkText}
                                            onChange={(e) => setMergeOptions({ ...mergeOptions, watermarkText: e.target.value })}
                                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm w-full"
                                        />
                                    </div>
                                )}


                                {/* Metadata Stripping - Premium */}
                                <div className={`flex items-center justify-between ${userPlan === 'free' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <label htmlFor="stripMetadata" className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="stripMetadata"
                                        checked={mergeOptions.stripMetadata}
                                        onChange={(e) => setMergeOptions({ ...mergeOptions, stripMetadata: e.target.checked })}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        disabled={userPlan === 'free'}
                                    />
                                    <span className={`${userPlan === 'free' ? 'text-yellow-500' : ''}`}>Metadata Stripping</span>
                                    </label>
                                     {userPlan === 'free' && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">Premium</span>}
                                </div>
                            </div>
                         </div>

                         {/* Advanced Processing */}
                         <div>
                            <h4 className="text-lg font-medium mb-2 text-yellow-400">Advanced Processing</h4>
                            <div className="space-y-3 text-yellow-500 opacity-70 cursor-not-allowed">
                                {/* Form Field Merging (Placeholder) */}
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Form Field Merging</span></p>
                                {/* Digital Signature Preservation (Placeholder) */}
                                <p className="flex items-center space-x-2"><span className="material-icons text-sm">lock</span><span>Digital Signature Preservation</span></p>
                            </div>
                         </div>

                          {/* Output Customization */}
                         <div>
                            <h4 className="text-lg font-medium mb-2 text-yellow-400">Output Customization</h4>
                            <div className="space-y-3">
                                {/* Custom File Naming - Premium */}
                                <div className={`flex items-center justify-between ${userPlan === 'free' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <label htmlFor="customFileName" className="flex items-center space-x-2 cursor-pointer">
                                     <span className={`${userPlan === 'free' ? 'text-yellow-500' : ''}`}>Custom File Naming:</span>
                                    </label>
                                     {userPlan === 'free' && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">Premium</span>}
                                </div>
                                {userPlan === 'premium' && (
                                     <input
                                         type="text"
                                         id="customFileName"
                                         value={mergeOptions.customFileName}
                                         onChange={(e) => setMergeOptions({ ...mergeOptions, customFileName: e.target.value })}
                                         placeholder="e.g., merged_document.pdf"
                                         className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white text-sm w-full"
                                     />
                                )}

                                {/* Multiple Format Export (Placeholder) */}
                                <div className="opacity-50" title="Coming Soon"> {/* Removed cursor-not-allowed */}
                                    <h5 className="font-medium mb-1">Multiple Format Export</h5>
                                    <p className="text-sm text-gray-400">Export to PDF/A or different PDF versions.</p>
                                </div>

                                {/* Size Optimization (Placeholder - Related to compression but might have other aspects) */}
                                 <div className="opacity-50" title="Coming Soon"> {/* Removed cursor-not-allowed */}
                                    <h5 className="font-medium mb-1">Size Optimization</h5>
                                    <p className="text-sm text-gray-400">Intelligent compression based on content type.</p>
                                </div>
                            </div>
                         </div>

                         {/* Professional Features */}
                         <div>
                            <h4 className="text-lg font-medium mb-2 text-yellow-400">Professional Features</h4>
                            <div className="space-y-3">
                                {/* Error Recovery - Premium */}
                                 <div className={`flex items-center justify-between ${userPlan === 'free' ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                    <label htmlFor="errorRecovery" className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id="errorRecovery"
                                        checked={mergeOptions.errorRecovery} // Assuming errorRecovery is in mergeOptions state
                                        onChange={(e) => setMergeOptions({ ...mergeOptions, errorRecovery: e.target.checked })}
                                        className="form-checkbox h-5 w-5 text-blue-600 rounded"
                                        disabled={userPlan === 'free'}
                                    />
                                    <span className={`${userPlan === 'free' ? 'text-yellow-500' : ''}`}>Error Recovery</span>
                                    </label>
                                     {userPlan === 'free' && <span className="text-xs bg-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full">Premium</span>}
                                </div>
                            </div>
                         </div>
                    </div>
                 )}


              </div>


              <div className="flex justify-between">
                <button onClick={prevStep} className="btn-secondary">
                  Back to Upload Files
                </button>
                <button onClick={nextStep} className="btn-primary">
                  Continue to Preview & Review
                </button>
              </div>
            </div>
           )}

        {/* --- Step 3: Preview & Review --- */}
           {wizardStep === 3 && (
             <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-center">Preview & Review Selected Pages</h2>
              <p className="text-gray-400 text-center">Review the pages you've selected before merging. Click on a page to include or exclude it.</p>

               {/* Consolidated Preview Grid */}
               <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {/* ... (Rest of Step 3 content in Part 3b) ... */}
// PDFMergeTool.jsx - Part 3b (End of Step 3, Step 4 and mergePDFs)

                {files.map((fileData) => (
                  previews[fileData.id]?.pages
                    .filter(page => page.selected) // Only show selected pages
                    .map((page) => (
                      <div
                        key={`${fileData.id}-${page.pageNum}`} // Unique key based on file ID and page number
                        className="relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ring-2 ring-blue-400 shadow-lg scale-105" // Always highlighted as they are selected
                        onClick={() => togglePageSelection(fileData.id, page.pageNum)}
                      >
                        {page.thumbnail ? (
                             <img
                                src={page.thumbnail}
                                alt={`Page ${page.pageNum} preview of ${fileData.name}`}
                                className="w-full h-32 object-cover bg-gray-800" // Added background for consistency
                                loading="lazy" // Improve performance
                             />
                        ) : (
                            <div className="w-full h-32 bg-gray-700 flex items-center justify-center text-center text-sm text-gray-400 p-2">
                                Preview Failed
                            </div>
                        )}

                        <div className={`absolute inset-0 flex items-center justify-center ${
                          page.selected ? 'bg-blue-500/20' : 'bg-black/20'
                        }`}>
                           {/* Checkmark for selected pages */}
                             {page.selected && (
                                <div className="w-6 h-6 rounded-full border-2 border-blue-500 bg-blue-500 flex items-center justify-center">
                                     <span className="material-icons text-white text-sm">check</span>
                                </div>
                             )}
                        </div>
                        {/* Display original file name and page number */}
                        <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                           {`${fileData.name.substring(0, 15)}${fileData.name.length > 15 ? '...' : ''} - Page ${page.pageNum}`} {/* Truncate file name */}
                        </div>
                      </div>
                    ))
                ))}
              </div>


              <div className="flex justify-between">
                <button onClick={prevStep} className="btn-secondary">
                  Back to Options
                </button>
                 <button
                    onClick={nextStep}
                    disabled={Object.values(previews).every(filePreviews => filePreviews?.pages.every(page => !page.selected))} // Disable if no pages are selected
                    className="btn-primary"
                >
                    Continue to Download
                </button>
              </div>
            </div>
           )}

        {/* --- Step 4: Download --- */}
           {wizardStep === 4 && (
              <div className="space-y-8 text-center">
                <h2 className="text-2xl font-semibold">Merging Your PDF</h2>
                <p className="text-gray-400">Please wait while we process your document.</p>

                 {/* Progress Indicator (Basic) */}
                {isProcessing && (
                   <div className="w-32 h-32 mx-auto mb-6">
                        <div className="w-full h-full border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                )}

                 {/* Download Button (Appears after processing) */}
                 {!isProcessing && !error && files.length === 0 && ( // Show download button after successful merge and files cleared
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-green-400">Merge Complete!</h3>
                        <p className="text-gray-400">Your merged PDF is ready.</p>
                         {/* The mergePDFs function handles the download directly */}
                         <p className="text-sm text-gray-500">The download should start automatically.</p>
                         <button onClick={() => { /* Logic to restart or go back */ setFiles([]); setPreviews({}); setWizardStep(1); }} className="btn-secondary">Merge Another PDF</button>
                    </div>
                 )}

                  {/* Error Message */}
                 {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-center">
                        {error}
                         <button onClick={() => { setError(''); setIsProcessing(false); }} className="ml-4 text-sm text-red-300 hover:text-red-200">Dismiss</button>
                    </div>
                 )}

                 {/* Button to trigger merge - Moved from previous step, or a confirmation step before this?
                     For now, merge is triggered by clicking 'Continue to Download'
                 */}
                {/* You might want a 'Start Merge' button here if Step 3 is just review */}
                 {/* If merge happens automatically on entering Step 4, no button needed here */}

                {/* Back to Preview button */}
                 {!isProcessing && files.length > 0 && ( // Allow going back if files are still present (e.g., error)
                    <button onClick={prevStep} className="btn-secondary">
                       Back to Preview
                    </button>
                 )}


              </div>
           )}

        </div> {/* End of max-w-6xl mx-auto space-y-8 */}

      </div> {/* End of container-padding mx-auto py-8 */}
    </div> /* End of min-h-screen bg-black */
  );
};

export default PDFMergeTool;

// PDFMergeTool.jsx - End of Part 3b (End of Step 3, Step 4 and mergePDFs)


// --- mergePDFs function implementation ---
const mergePDFs = async () => {
    if (files.length < 2) {
        setError('Please add at least 2 PDF files to merge');
        setWizardStep(1); // Go back to upload step
        return;
    }

    const totalSelectedPages = Object.values(previews).reduce((count, filePreview) => {
        return count + (filePreview?.pages.filter(page => page.selected).length || 0);
    }, 0);

     if (totalSelectedPages === 0) {
         setError('Please select at least one page to merge.');
         setWizardStep(3); // Stay on preview step to select pages
         return;
     }


    // Check if any premium features are enabled for free users
    const premiumFeaturesInUse = Object.keys(mergeOptions).filter(key =>
        premiumFeatures.includes(key) && mergeOptions[key] === true
    );

    if (userPlan === 'free' && premiumFeaturesInUse.length > 0) {
        setError('Premium features require an upgrade.');
        setWizardStep(2); // Go back to options step
        return;
    }


    setIsProcessing(true);
    setError(''); // Clear previous errors

    try {
        const mergedPdf = await PDFDocument.create();

        // Iterate through files in their current order
        for (const fileData of files) {
            const arrayBuffer = await fileData.file.arrayBuffer();
            const pdf = await PDFDocument.load(arrayBuffer);
            const filePreview = previews[fileData.id];

            // Get selected page indices based on preview data
            const selectedPageIndices = filePreview ?
                filePreview.pages.filter(p => p.selected).map(p => p.pageNum - 1) :
                []; // If no preview, no pages are selected

            // Apply page range selection if specified (Free Tier)
            let pagesToCopy = selectedPageIndices;
            if (mergeOptions.pageRanges[fileData.id]) {
                 try {
                     // Simple parsing for ranges like '1-5, 8, 10-'
                     const ranges = mergeOptions.pageRanges[fileData.id].split(',').map(s => s.trim()).filter(s => s);
                     let pageIndicesFromRanges = [];
                     ranges.forEach(range => {
                         if (range.includes('-')) {
                             const [start, end] = range.split('-').map(Number);
                             if (!isNaN(start) && !isNaN(end)) {
                                 for (let i = start - 1; i < end; i++) {
                                     if (i >= 0 && i < pdf.getPageCount()) pageIndicesFromRanges.push(i);
                                 }
                             } else if (!isNaN(start) && range.endsWith('-')) {
                                  // Range like 10- (from page 10 to the end)
                                   for (let i = start - 1; i < pdf.getPageCount(); i++) {
                                        if (i >= 0) pageIndicesFromRanges.push(i);
                                   }
                             }
                         } else {
                             const pageNum = parseInt(range);
                             if (!isNaN(pageNum) && pageNum > 0 && pageNum <= pdf.getPageCount()) {
                                 pageIndicesFromRanges.push(pageNum - 1);
                             }
                         }
                     });
                     // Combine selected pages with page ranges, ensuring no duplicates and correct order
                     // For simplicity now, if page ranges are specified, they override individual page selections
                     // A more complex implementation might merge selections and ranges
                     pagesToCopy = Array.from(new Set(pageIndicesFromRanges)).sort((a, b) => a - b);

                 } catch (rangeError) {
                     console.error("Error parsing page range:", rangeError);
                     toast.error(`Invalid page range for ${fileData.name}. Using all selected pages.`);
                     pagesToCopy = selectedPageIndices; // Fallback to individual selections
                 }
            }


            if (pagesToCopy.length > 0) {
                const copiedPages = await mergedPdf.copyPages(pdf, pagesToCopy);

                // Apply Alternate Page Merging if enabled (Free Tier) - This is complex and needs careful implementation
                // For now, we'll add pages sequentially. Alternate merging would require a different approach.
                // if (mergeOptions.alternatePages) {
                //    // This requires iterating through files and pages differently
                // } else {
                    copiedPages.forEach((page) => mergedPdf.addPage(page));
                // }
            }
        }

        // Apply Compression (Free Tier)
         const compressionOptions = {
             useObjectStreams: mergeOptions.compressionLevel >= 3,
             addDefaultPage: false,
             // More sophisticated compression might need external libraries or a different approach
         };

        // Apply Password Protection (Premium Tier)
         if (mergeOptions.passwordProtect && mergeOptions.password && userPlan === 'premium') {
            // pdf-lib can add a password during save
            // We'll pass the password to the save function
         }

         // Apply Watermark (Premium Tier) - Requires drawing on each page before adding to mergedPdf
         if (mergeOptions.addWatermark && mergeOptions.watermarkText && userPlan === 'premium') {
             // This requires modifying copiedPages before adding them to mergedPdf
         }

         // Apply Metadata Stripping (Premium Tier)
          if (mergeOptions.stripMetadata && userPlan === 'premium') {
              // pdf-lib might have options or we might need to manually remove metadata
          }

         // Apply Custom File Naming (Premium Tier)
         const fileName = mergeOptions.customFileName && userPlan === 'premium' ? mergeOptions.customFileName : 'merged-document.pdf';


        const pdfBytes = await mergedPdf.save({
             ...compressionOptions,
             password: mergeOptions.passwordProtect && userPlan === 'premium' ? mergeOptions.password : undefined,
             // Other save options for PDF/A etc.
         });

        // Create download
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName; // Use custom file name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success('PDF merged successfully!');

        // Clear files and reset wizard after successful merge
        setFiles([]);
        setPreviews({});
        setMergeOptions({ // Reset merge options to default for next merge
             pageRanges: {},
             alternatePages: false,
             customInsertions: [],
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
             ocrProcessing: false,
             preserveSignatures: false,
             customFileName: '',
             outputFormat: 'pdf',
             errorRecovery: false,
         });
        setWizardStep(1); // Go back to the upload step

    } catch (err) {
        console.error('PDF merge error:', err);
        setError(`Failed to merge PDFs: ${err.message || 'An unknown error occurred'}`);
        // Optionally, stay on the download step to show the error or go back
        // setWizardStep(4); // Stay on download step to show error
         setIsProcessing(false); // Stop processing indicator
    } finally {
        // setIsProcessing(false); // Ensure processing is stopped even on success (handled inside try)
    }
};
