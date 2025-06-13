
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import toast from 'react-hot-toast';

const PDFMergeTool = () => {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [advancedMode, setAdvancedMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [previews, setPreviews] = useState({});
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  
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
    ocrProcessing: false,
    preserveSignatures: false,
    customFileName: '',
    outputFormat: 'pdf'
  });

  const fileInputRef = useRef(null);

  // User plan (simulate for demo - will be from auth context in real app)
  const [userPlan, setUserPlan] = useState('free'); // 'free' or 'premium'
  const [userLocation, setUserLocation] = useState('US'); // For currency

  // Limits based on plan
  const limits = {
    free: { maxFiles: 20, maxFileSize: 50 * 1024 * 1024, totalFiles: 20 },
    premium: { maxFiles: 200, maxFileSize: 500 * 1024 * 1024, totalFiles: 200 }
  };

  const currentLimits = limits[userPlan];

  // Premium features list
  const premiumFeatures = [
    'preserveBookmarks', 'generateTOC', 'addSectionDividers', 'customPageNumbering',
    'passwordProtect', 'addWatermark', 'stripMetadata', 'ocrProcessing', 'preserveSignatures'
  ];

  // Pricing by location
  const pricing = {
    US: { symbol: '$', amount: '9.99' },
    EU: { symbol: '€', amount: '8.99' },
    IN: { symbol: '₹', amount: '799' },
    GB: { symbol: '£', amount: '7.99' }
  };

  const currentPricing = pricing[userLocation] || pricing.US;

  // Generate PDF previews
  const generatePreviews = async (fileData) => {
    setIsGeneratingPreviews(true);
    try {
      const arrayBuffer = await fileData.file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      
      // For demo, we'll create placeholder previews
      // In production, you'd use PDF.js or similar to render actual thumbnails
      const previewData = {
        pageCount,
        pages: Array.from({ length: pageCount }, (_, i) => ({
          pageNum: i + 1,
          thumbnail: `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/1a074b68-0f93-448e-9d5c-de949b43aef1.png + 1}`,
          selected: true // All pages selected by default
        }))
      };
      
      setPreviews(prev => ({
        ...prev,
        [fileData.id]: previewData
      }));
      
    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('Failed to generate preview for ' + fileData.name);
    }
    setIsGeneratingPreviews(false);
  };

  const handleFileSelect = async (selectedFiles) => {
    const newFiles = Array.from(selectedFiles).filter(file => {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }
      
      if (file.size > currentLimits.maxFileSize) {
        const maxSize = currentLimits.maxFileSize / (1024 * 1024);
        toast.error(`${file.name} is too large (max ${maxSize}MB for ${userPlan} users)`);
        return false;
      }
      
      return true;
    });

    if (files.length + newFiles.length > currentLimits.maxFiles) {
      toast.error(`Maximum ${currentLimits.maxFiles} files allowed for ${userPlan} users`);
      return;
    }

    const fileDataArray = newFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      preview: null
    }));

    setFiles(prev => [...prev, ...fileDataArray]);

    // Generate previews for new files
    for (const fileData of fileDataArray) {
      await generatePreviews(fileData);
    }

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

  const moveFile = (fromIndex, toIndex) => {
    const newFiles = [...files];
    const [movedFile] = newFiles.splice(fromIndex, 1);
    newFiles.splice(toIndex, 0, movedFile);
    setFiles(newFiles);
  };

  const isPremiumFeature = (feature) => {
    return premiumFeatures.includes(feature) && userPlan === 'free';
  };

  const getAdvancedFeaturesCount = () => {
    return Object.entries(mergeOptions).filter(([key, value]) => 
      key !== 'compressionLevel' && value === true
    ).length;
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 PDF files to merge');
      return;
    }

    // Check if any premium features are enabled for free users
    const enabledPremiumFeatures = Object.entries(mergeOptions)
      .filter(([key, value]) => premiumFeatures.includes(key) && value === true);
    
    if (userPlan === 'free' && enabledPremiumFeatures.length > 0) {
      toast.error('Premium features require an upgrade');
      return;
    }

    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const fileData of files) {
        const arrayBuffer = await fileData.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const filePreview = previews[fileData.id];
        
        // Get selected pages
        const selectedPages = filePreview ? 
          filePreview.pages.filter(p => p.selected).map(p => p.pageNum - 1) :
          pdf.getPageIndices();
        
        if (selectedPages.length > 0) {
          const copiedPages = await mergedPdf.copyPages(pdf, selectedPages);
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
      }

      // Apply compression
      // Note: PDF-lib compression is limited, but we'll set optimization
      
      const pdfBytes = await mergedPdf.save({
        useObjectStreams: mergeOptions.compressionLevel >= 3,
        addDefaultPage: false
      });
      
      // Create filename
      const fileName = mergeOptions.customFileName || 'merged-document.pdf';
      
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
      
      // Clear files after successful merge
      setFiles([]);
      setPreviews({});
      setWizardStep(1);
      
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

  const nextStep = () => {
    if (wizardStep < 4) setWizardStep(wizardStep + 1);
  };

  const prevStep = () => {
    if (wizardStep > 1) setWizardStep(wizardStep - 1);
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container-padding mx-auto py-8">
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
              <span>Advanced Mode</span>
              {advancedMode && getAdvancedFeaturesCount() > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {getAdvancedFeaturesCount()}
                </span>
              )}
            </button>
          </div>

          {/* Wizard Steps */}
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

        {/* Main Content */}
        <div className="max-w-6xl mx-auto space-y-8">
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
                    <span>• Max {currentLimits.maxFileSize / (1024*1024)}MB per file</span>
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
                      disabled={files.length < 2}
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
                              <p className="text-sm text-gray-400">{formatFileSize(fileData.size)}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {previews[fileData.id] && (
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
                        {isGeneratingPreviews ? (
                          <div className="text-center py-8">
                            <div className="w-8 h-8 border-2 border-gray-600 border-t-white rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-sm text-gray-400">Generating previews...</p>
                          </div>
                        ) : previews[fileData.id] ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
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
                                  className="w-full h-32 object-cover"
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
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Advanced Options */}
          {wizardStep === 2 && advancedMode && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-semibold">Advanced Options</h3>
                <div className="flex space-x-3">
                  <button onClick={prevStep} className="btn-secondary">
                    Previous
                  </button>
                  <button onClick={nextStep} className="btn-primary">
                    Preview Merge
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Free Features */}
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-green-400">✅ Free Features</h4>
                  
                  {/* Compression */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium">Compression Level</label>
                    <div className="space-y-2">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        value={mergeOptions.compressionLevel}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, compressionLevel: parseInt(e.target.value) }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Light</span>
                        <span>Balanced (Level {mergeOptions.compressionLevel})</span>
                        <span>Aggressive</span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Merge Options */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Smart Merge Options</h5>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={mergeOptions.alternatePages}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, alternatePages: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>Alternate pages between documents</span>
                    </label>
                  </div>
                </div>

                {/* Premium Features */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-lg font-semibold text-yellow-400">⭐ Premium Features</h4>
                    {userPlan === 'free' && (
                      <Link to="/pricing" className="text-xs bg-yellow-500 text-black px-2 py-1 rounded-full hover:bg-yellow-400">
                        Upgrade
                      </Link>
                    )}
                  </div>

                  {/* Document Organization */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Document Organization</h5>
                    
                    {['preserveBookmarks', 'generateTOC', 'addSectionDividers', 'customPageNumbering'].map((feature) => (
                      <label key={feature} className={`flex items-center space-x-3 ${isPremiumFeature(feature) ? 'opacity-50' : ''}`}>
                        <input
                          type="checkbox"
                          checked={mergeOptions[feature]}
                          disabled={isPremiumFeature(feature)}
                          onChange={(e) => setMergeOptions(prev => ({ ...prev, [feature]: e.target.checked }))}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">
                          {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        {isPremiumFeature(feature) && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">PRO</span>
                        )}
                      </label>
                    ))}
                  </div>

                  {/* Security Options */}
                  <div className="space-y-4">
                    <h5 className="font-medium">Security & Quality</h5>
                    
                    <label className={`flex items-center space-x-3 ${isPremiumFeature('passwordProtect') ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={mergeOptions.passwordProtect}
                        disabled={isPremiumFeature('passwordProtect')}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, passwordProtect: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>Password Protection</span>
                      {isPremiumFeature('passwordProtect') && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">PRO</span>
                      )}
                    </label>

                    {mergeOptions.passwordProtect && !isPremiumFeature('passwordProtect') && (
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={mergeOptions.password}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, password: e.target.value }))}
                        className="input-dark"
                      />
                    )}

                    <label className={`flex items-center space-x-3 ${isPremiumFeature('addWatermark') ? 'opacity-50' : ''}`}>
                      <input
                        type="checkbox"
                        checked={mergeOptions.addWatermark}
                        disabled={isPremiumFeature('addWatermark')}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, addWatermark: e.target.checked }))}
                        className="w-4 h-4"
                      />
                      <span>Add Watermark</span>
                      {isPremiumFeature('addWatermark') && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded">PRO</span>
                      )}
                    </label>

                    {mergeOptions.addWatermark && !isPremiumFeature('addWatermark') && (
                      <input
                        type="text"
                        placeholder="Watermark text"
                        value={mergeOptions.watermarkText}
                        onChange={(e) => setMergeOptions(prev => ({ ...prev, watermarkText: e.target.value }))}
                        className="input-dark"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steps 2 (Simple Mode) / 3 (Advanced Mode): Preview & Merge */}
          {(wizardStep === 3 || (wizardStep === 2 && !advancedMode)) && (
            <div className="space-y-8">
              {/* Merge Preview */}
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-semibold">Merge Preview</h3>
                  <div className="flex space-x-3">
                    <button onClick={prevStep} className="btn-secondary">
                      Previous
                    </button>
                    <button
                      onClick={mergePDFs}
                      disabled={isProcessing}
                      className="btn-primary"
                    >
                      {isProcessing ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-5 h-5 border-2 border-gray-600 border-t-black rounded-full animate-spin"></div>
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="material-icons">merge</span>
                          <span>Merge & Download</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Selected options summary */}
                <div className="bg-gray-800 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Selected Options:</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">
                      Compression: Level {mergeOptions.compressionLevel}
                    </span>
                    {mergeOptions.alternatePages && (
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                        Alternate Pages
                      </span>
                    )}
                    {Object.entries(mergeOptions).map(([key, value]) => 
                      value === true && premiumFeatures.includes(key) && (
                        <span key={key} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())} (PRO)
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Final preview of selected pages */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Pages to be merged ({
                    Object.values(previews).reduce((total, preview) => 
                      total + preview.pages.filter(p => p.selected).length, 0
                    )} total):</h4>
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {files.map(fileData => 
                      previews[fileData.id]?.pages
                        .filter(page => page.selected)
                        .map(page => (
                          <div key={`${fileData.id}-${page.pageNum}`} className="text-center">
                            <img 
                              src={page.thumbnail} 
                              alt={`Final merge preview page ${page.pageNum}`}
                              className="w-full h-20 object-cover rounded border border-gray-600"
                            />
                            <p className="text-xs text-gray-400 mt-1">{fileData.name.slice(0, 8)}...p{page.pageNum}</p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Upgrade Prompt */}
          {userPlan === 'free' && (
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-2xl p-8">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
                  <span className="material-icons text-2xl text-yellow-400">star</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-2">Unlock Premium Features</h3>
                  <p className="text-gray-400 mb-4">
                    Advanced document organization, security features, OCR processing, and more.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Password Protection</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Watermarks</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">OCR Processing</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">200 Files</span>
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">500MB Limit</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-yellow-400 mb-1">
                    {currentPricing.symbol}{currentPricing.amount}
                  </div>
                  <div className="text-sm text-gray-400 mb-4">per month</div>
                  <Link to="/pricing" className="btn-primary bg-yellow-500 hover:bg-yellow-400 text-black">
                    Upgrade Now
                  </Link>
                  <p className="text-xs text-gray-400 mt-2">7-day free trial available</p>
                </div>
              </div>
            </div>
          )}

          {/* Features Comparison */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <h3 className="text-xl font-semibold mb-6">Why Choose DocEnclave PDF Merge?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons text-green-400">security</span>
                </div>
                <h4 className="font-semibold">100% Client-Side</h4>
                <p className="text-sm text-gray-400">No uploads, complete privacy</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons text-blue-400">flash_on</span>
                </div>
                <h4 className="font-semibold">Lightning Fast</h4>
                <p className="text-sm text-gray-400">Instant processing</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons text-purple-400">preview</span>
                </div>
                <h4 className="font-semibold">Visual Preview</h4>
                <p className="text-sm text-gray-400">See pages before merging</p>
              </div>
              <div className="text-center space-y-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
                  <span className="material-icons text-yellow-400">settings</span>
                </div>
                <h4 className="font-semibold">Advanced Options</h4>
                <p className="text-sm text-gray-400">Professional-grade features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFMergeTool;

