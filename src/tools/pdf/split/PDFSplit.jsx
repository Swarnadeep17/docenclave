import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile, validatePDFForSplit, validatePageSelection } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/firebase.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- INNER COMPONENTS (No changes needed in these) ---
const SEOHead = () => { /* ... (same as before) ... */ };
const PDFPageRenderer = ({ pdfDoc, pageNumber }) => { /* ... (same as before) ... */ };
const PDFPagePreview = ({ pdfDoc, pageNumber, isSelected, onToggleSelect }) => { /* ... (same as before) ... */ };
const RangeSelector = ({ totalPages, onRangeChange }) => { /* ... (same as before) ... */ };
const USPBar = () => { /* ... (same as before) ... */ };

const PDFSplit = () => {
  // State for simple, serializable data that triggers re-renders
  const [fileInfo, setFileInfo] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfJsDoc, setPdfJsDoc] = useState(null); // For pdf.js rendering, this is fine
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  
  // THE FIX: Use useRef to hold the complex, non-serializable pdf-lib document object
  const pdfDocRef = useRef(null);

  const [currentPlan] = useState('FREE'); // Simplified, can be expanded later
  const limits = PLAN_LIMITS[currentPlan];
  
  useEffect(() => { trackToolUsage('pdf_split'); }, []);

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0 || acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    const validation = validateFile(droppedFile, currentPlan);
    if (!validation.valid) { setError(validation.error); return; }

    try {
      const arrayBuffer = await droppedFile.arrayBuffer();
      
      // Load with pdf-lib for processing and store in ref
      const pdfDocForProcessing = await PDFDocument.load(arrayBuffer);
      pdfDocRef.current = pdfDocForProcessing; // <-- Store in ref, not state
      
      // Load with pdf.js for rendering and store in state (this is okay)
      const pdfJsDocumentForRendering = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdfJsDoc(pdfJsDocumentForRendering);
      
      const pageCount = pdfDocForProcessing.getPageCount();
      const pageValidation = validatePDFForSplit(pageCount, currentPlan);
      if (!pageValidation.valid) { setError(pageValidation.error); return; }

      // Update state with ONLY serializable data to trigger UI update
      setFileInfo({ name: droppedFile.name, size: droppedFile.size });
      setPages(Array.from({ length: pageCount }, (_, i) => ({ pageIndex: i })));
      setSelectedPages([]);

    } catch (err) {
      console.error('PDF load error:', err);
      setError(`Failed to load PDF: ${droppedFile.name}. It may be corrupt.`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false, maxFiles: 1 });

  const handlePageToggle = (pageIndex) => {
    setSelectedPages(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(pageIndex)) {
        newSelection.delete(pageIndex);
      } else {
        if (newSelection.size >= limits.maxExtractPages) {
          setError(`You can select a maximum of ${limits.maxExtractPages} pages on the FREE plan.`);
          return prev;
        }
        newSelection.add(pageIndex);
      }
      return Array.from(newSelection);
    });
  };

  const handleRangeSelection = (newSelection) => {
    if (newSelection.length > limits.maxExtractPages) {
      setError(`The selected range exceeds the maximum of ${limits.maxExtractPages} pages for the FREE plan.`);
      return;
    }
    setSelectedPages(newSelection);
  };
  
  const [exportOption, setExportOption] = useState('separate');
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const splitPDF = async () => {
    // THE FIX: Access the complex object from the ref's .current property
    if (!pdfDocRef.current || selectedPages.length === 0) {
      setError('Please select at least one page to extract.');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');

    try {
      const sortedPages = [...selectedPages].sort((a, b) => a - b);

      if (exportOption === 'combined') {
          const newPdf = await PDFDocument.create();
          const copiedPages = await newPdf.copyPages(pdfDocRef.current, sortedPages);
          copiedPages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = `${fileInfo.name.replace('.pdf', '')}_extracted.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(link.href);
      } else { // 'separate'
          for (let i = 0; i < sortedPages.length; i++) {
              setProgress(Math.round(((i + 1) / sortedPages.length) * 100));
              const newPdf = await PDFDocument.create();
              const [copiedPage] = await newPdf.copyPages(pdfDocRef.current, [sortedPages[i]]);
              newPdf.addPage(copiedPage);
              const pdfBytes = await newPdf.save();
              
              const blob = new Blob([pdfBytes], { type: 'application/pdf' });
              const link = document.createElement('a');
              link.href = URL.createObjectURL(blob);
              link.download = `${fileInfo.name.replace('.pdf', '')}_page_${sortedPages[i] + 1}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(link.href);
              await new Promise(resolve => setTimeout(resolve, 50)); // Small delay
          }
      }
      
      await trackDownload('pdf_split');
      setTimeout(() => { setIsProcessing(false); }, 1500);

    } catch (err) {
      console.error('PDF split error:', err);
      setError('An error occurred while splitting the PDF.');
      setIsProcessing(false);
    }
  };

  const resetTool = () => {
    setFileInfo(null);
    setPdfJsDoc(null);
    setPages([]);
    setSelectedPages([]);
    setError('');
    pdfDocRef.current = null; // Also clear the ref
  };

  // --- JSX Rendering ---
  return (
    <>
      <SEOHead />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto rounded-xl p-px bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500">
          <div className="bg-dark-secondary rounded-[11px] p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-3">PDF Split Tool</h1>
              <p className="text-base text-dark-text-secondary max-w-2xl mx-auto">Extract specific pages or ranges from any PDF, securely in your browser.</p>
            </div>
            <USPBar />
            <div className="bg-dark-primary rounded-lg p-4 border border-dark-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-text-secondary">
                  <span className="font-medium text-dark-text-primary">{currentPlan}</span> PLAN
                  {fileInfo && (<>
                    <span>Pages: <span className="text-dark-text-primary">{pages.length}</span></span>
                    <span>Size: <span className="text-dark-text-primary">{formatFileSize(fileInfo.size)}</span></span>
                    <span>Selected: <span className="text-dark-text-primary">{selectedPages.length}</span>{currentPlan === 'FREE' && `/${limits.maxExtractPages}`}</span>
                  </>)}
                </div>
                {currentPlan === 'FREE' && (<button onClick={() => setShowUpgradeModal(true)} className="bg-dark-tertiary text-dark-text-primary px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-700 w-full sm:w-auto">Upgrade</button>)}
              </div>
              {error && (<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400"><span className="font-bold mr-2">⚠️</span>{error}</div>)}
              
              {!fileInfo ? (
                <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-dark-border hover:border-gray-500'}`}>
                  <input {...getInputProps()} />
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-dark-text-primary mb-2">{isDragActive ? 'Drop your PDF file here' : 'Choose or drag PDF file here'}</h3>
                  <p className="text-dark-text-secondary">Select a PDF to extract pages from.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-end"><button onClick={resetTool} className="text-xs text-dark-text-secondary hover:text-white transition-colors">Choose Different File →</button></div>
                  <RangeSelector totalPages={pages.length} onRangeChange={handleRangeSelection} />
                  <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
                    <h4 className="text-dark-text-primary font-medium mb-3">Export Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center p-3 bg-dark-tertiary rounded-lg cursor-pointer"><input type="radio" name="exportOption" value="separate" checked={exportOption === 'separate'} onChange={(e) => setExportOption(e.target.value)} className="mr-3" /><div><span className="text-dark-text-primary font-medium block">Separate Files</span><span className="text-dark-text-muted text-xs">One PDF per selected page</span></div></label>
                      <label className="flex items-center p-3 bg-dark-tertiary rounded-lg cursor-pointer"><input type="radio" name="exportOption" value="combined" checked={exportOption === 'combined'} onChange={(e) => setExportOption(e.target.value)} className="mr-3" /><div><span className="text-dark-text-primary font-medium block">Combined File</span><span className="text-dark-text-muted text-xs">All selected pages in one PDF</span></div></label>
                    </div>
                  </div>
                  <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                      {pages.map((page) => (<PDFPagePreview key={page.pageIndex} pdfDoc={pdfJsDoc} pageNumber={page.pageIndex + 1} isSelected={selectedPages.includes(page.pageIndex)} onToggleSelect={() => handlePageToggle(page.pageIndex)} />))}
                    </div>
                  </div>
                  {selectedPages.length > 0 && (
                    <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mt-6">
                      <button onClick={splitPDF} disabled={isProcessing} className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 text-lg">{isProcessing ? `Processing... ${progress}%` : `Extract ${selectedPages.length} Page(s)`}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ... (How to Use and SEO sections remain the same) ... */}
        {showUpgradeModal && (/* ... (Modal JSX remains the same) ... */)}
      </div>
    </>
  );
};


// Paste the original, unchanged component code here for SEOHead, PDFPageRenderer, PDFPagePreview, etc. to complete the file.
// For brevity in this response, I am omitting the full code for these sub-components, but you should have them in your file.
// If you need them, I can provide them again.

export default PDFSplit;