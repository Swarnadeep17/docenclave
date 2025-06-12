import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile, validatePDFForSplit, validatePageSelection } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/firebase.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SEOHead = () => {
  useEffect(() => {
    document.title = "Free PDF Split Tool - Extract Pages from PDF Online | DocEnclave";
    document.querySelector('meta[name="description"]')?.setAttribute('content', 
      "Split PDF files for free with page preview. Extract specific pages, split by ranges, or create separate files. 100% secure, no uploads required. Start splitting PDFs instantly."
    );
  }, []);
  return null;
};

const PDFPageRenderer = ({ pdfDoc, pageNumber }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setLoading(true);
        setError(false);
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(80 / viewport.width, 112 / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        const renderContext = { canvasContext: context, viewport: scaledViewport };
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        setError(true);
        setLoading(false);
      }
    };
    renderPage();
  }, [pdfDoc, pageNumber]);

  if (error) {
    return (<div className="w-20 h-28 bg-white rounded border flex items-center justify-center"><div className="text-gray-400 text-xs text-center"><div className="text-lg mb-1">⚠️</div><div>Error</div></div></div>);
  }
  return (<div className="relative w-20 h-28"><canvas ref={canvasRef} className="w-full h-full bg-white rounded border" style={{ display: loading ? 'none' : 'block' }} /><div className="absolute inset-0 bg-white rounded border flex items-center justify-center" style={{ display: loading ? 'flex' : 'none' }}><div className="text-gray-400 text-xs text-center animate-pulse"><div className="text-lg mb-1">📄</div><div>Loading...</div></div></div></div>);
};

const PDFPagePreview = ({ pdfDoc, pageNumber, isSelected, onToggleSelect }) => {
  return (
    <div className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all cursor-pointer ${isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-dark-border hover:border-gray-500'}`}>
      <div onClick={onToggleSelect}>
        <PDFPageRenderer pdfDoc={pdfDoc} pageNumber={pageNumber} />
        <div className="text-center mt-2">
          <div className="text-dark-text-primary text-xs font-medium mb-1">Page {pageNumber}</div>
          <div className="mt-2"><input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="w-4 h-4 accent-blue-500" onClick={(e) => e.stopPropagation()} /></div>
        </div>
      </div>
      {isSelected && (<div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">✓</div>)}
    </div>
  );
};

const RangeSelector = ({ totalPages, onRangeChange }) => {
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState('');

  const applyRange = () => {
    setRangeError('');
    if (!rangeInput.trim()) { setRangeError('Please enter page numbers or ranges'); return; }
    const ranges = rangeInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    const newSelection = new Set();
    try {
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()));
          if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) { throw new Error(`Invalid range: ${range}.`); }
          for (let i = start; i <= end; i++) newSelection.add(i - 1);
        } else {
          const page = parseInt(range.trim());
          if (isNaN(page) || page < 1 || page > totalPages) { throw new Error(`Invalid page: ${range}.`); }
          newSelection.add(page - 1);
        }
      }
      onRangeChange(Array.from(newSelection));
      setRangeInput('');
    } catch (error) { setRangeError(error.message); }
  };

  return (
    <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border mb-4">
      <h4 className="text-dark-text-primary font-medium mb-3">Quick Range Selection</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => onRangeChange([])} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600">Clear All</button>
        <button onClick={() => onRangeChange(Array.from({length: totalPages}, (_, i) => i))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600">Select All</button>
        <button onClick={() => onRangeChange(Array.from({length: totalPages}, (_, i) => i).filter(i => (i + 1) % 2 !== 0))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600">Odd Pages</button>
        <button onClick={() => onRangeChange(Array.from({length: totalPages}, (_, i) => i).filter(i => (i + 1) % 2 === 0))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600">Even Pages</button>
      </div>
      <div className="flex gap-2"><input type="text" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} placeholder="e.g., 1-5, 8, 10-12" className="flex-1 bg-dark-tertiary border border-dark-border rounded-lg px-3 py-2 text-dark-text-primary text-sm focus:outline-none focus:border-blue-500" /><button onClick={applyRange} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">Apply</button></div>
      {rangeError && (<p className="text-red-400 text-xs mt-2">{rangeError}</p>)}
    </div>
  );
};

const USPBar = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mb-6">
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>👁️</span> <span className="text-dark-text-secondary">Page Preview</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>🔒</span> <span className="text-dark-text-secondary">100% Private</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>📐</span> <span className="text-dark-text-secondary">Range Selection</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>📤</span> <span className="text-dark-text-secondary">Smart Export</span></div>
    </div>
);

const PDFSplit = () => {
  const [fileInfo, setFileInfo] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [pdfJsDoc, setPdfJsDoc] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const pdfDocRef = useRef(null);
  const [currentPlan] = useState('FREE');
  const limits = PLAN_LIMITS[currentPlan];
  const [exportOption, setExportOption] = useState('separate');
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => { trackToolUsage('pdf_split'); }, []);

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0 || acceptedFiles.length === 0) return;

    const droppedFile = acceptedFiles[0];
    const validation = validateFile(droppedFile, currentPlan);
    if (!validation.valid) { setError(validation.error); return; }

    try {
      const arrayBuffer = await droppedFile.arrayBuffer();
      const pdfDocForProcessing = await PDFDocument.load(arrayBuffer);
      pdfDocRef.current = pdfDocForProcessing;
      
      const pdfJsDocumentForRendering = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      setPdfJsDoc(pdfJsDocumentForRendering);
      
      const pageCount = pdfDocForProcessing.getPageCount();
      const pageValidation = validatePDFForSplit(pageCount, currentPlan);
      if (!pageValidation.valid) { setError(pageValidation.error); return; }

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

  const splitPDF = async () => {
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
      } else { 
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
              await new Promise(resolve => setTimeout(resolve, 50));
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
    pdfDocRef.current = null;
  };

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

        <div className="max-w-5xl mx-auto">
            <section className="mt-16"><h2 className="text-2xl font-bold text-dark-text-primary text-center mb-8">How to Use</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div><h3 className="font-semibold text-dark-text-primary mb-2">Upload PDF</h3><p className="text-dark-text-secondary text-sm">Drag & drop or browse to select a PDF file to split</p></div><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div><h3 className="font-semibold text-dark-text-primary mb-2">Select Pages</h3><p className="text-dark-text-secondary text-sm">Choose specific pages or ranges you want to extract</p></div><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div><h3 className="font-semibold text-dark-text-primary mb-2">Download</h3><p className="text-dark-text-secondary text-sm">Get your extracted pages as separate or combined files</p></div></div></section>
            <section className="mt-16"><div className="max-w-4xl mx-auto"><h2 className="text-3xl font-bold text-dark-text-primary mb-8">The Complete Guide to PDF Splitting</h2><div className="space-y-8"><p className="text-dark-text-secondary leading-relaxed">PDF splitting is essential for document privacy and efficiency. Instead of sharing a 100-page report when you only need pages 15-20, extract exactly what's needed. This protects sensitive information in other sections, reduces file sizes for email attachments, and helps recipients focus on relevant content.</p></div></div></section>
        </div>

        {showUpgradeModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-dark-secondary rounded-xl p-8 max-w-md mx-4 border border-dark-border"><h3 className="text-xl font-bold text-dark-text-primary mb-4">Upgrade to Premium</h3><p className="text-dark-text-secondary mb-6">Unlock more powerful features:</p><ul className="space-y-2 mb-6"><li className="text-dark-text-secondary">✅ Extract unlimited pages</li><li className="text-dark-text-secondary">✅ 500MB file capacity</li><li className="text-dark-text-secondary">✅ Process larger PDFs</li><li className="text-dark-text-secondary">✅ Advanced export options</li></ul><div className="flex space-x-3"><button onClick={() => setShowUpgradeModal(false)} className="flex-1 border border-dark-border text-dark-text-primary py-2 rounded-lg hover:bg-dark-tertiary transition-colors">Continue Free</button><button className="flex-1 bg-dark-text-primary text-dark-primary py-2 rounded-lg font-medium hover:bg-dark-text-secondary transition-colors">Upgrade Now</button></div></div></div>)}
      </div>
    </>
  );
};

export default PDFSplit;