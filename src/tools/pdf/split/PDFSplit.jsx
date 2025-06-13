// UPDATED FILE: docenclave-main/src/tools/pdf/split/PDFSplit.jsx

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile, validatePDFForSplit, validatePageSelection } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/analytics.js';
import SEOHead from '../../../components/shared/SEOHead.jsx';
import PDFFilePreview from '../../../components/shared/pdf/PDFFilePreview.jsx';

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// RangeSelector Component (can stay here as it's specific to this tool)
const RangeSelector = ({ totalPages, onRangeChange }) => {
  const [rangeInput, setRangeInput] = useState('');
  const [rangeError, setRangeError] = useState('');

  const applyRange = () => {
    setRangeError('');
    if (!rangeInput.trim()) {
      setRangeError('Please enter page numbers or ranges');
      return;
    }
    const ranges = rangeInput.split(',').map(r => r.trim()).filter(r => r.length > 0);
    const newSelection = new Set();
    try {
      for (const range of ranges) {
        if (range.includes('-')) {
          const [start, end] = range.split('-').map(n => parseInt(n.trim()));
          if (isNaN(start) || isNaN(end) || start < 1 || end > totalPages || start > end) {
            throw new Error(`Invalid range: ${range}. Use format like 1-5`);
          }
          for (let i = start; i <= end; i++) {
            newSelection.add(i - 1);
          }
        } else {
          const page = parseInt(range.trim());
          if (isNaN(page) || page < 1 || page > totalPages) {
            throw new Error(`Invalid page: ${range}. Must be between 1 and ${totalPages}`);
          }
          newSelection.add(page - 1);
        }
      }
      onRangeChange(Array.from(newSelection));
      setRangeInput('');
    } catch (error) {
      setRangeError(error.message);
    }
  };

  return (
    <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border mb-6">
      <h4 className="text-dark-text-primary font-medium mb-3">Quick Range Selection</h4>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => onRangeChange([])} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Clear All</button>
        <button onClick={() => onRangeChange(Array.from({ length: totalPages }, (_, i) => i))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Select All</button>
        <button onClick={() => onRangeChange(Array.from({ length: Math.ceil(totalPages / 2) }, (_, i) => i * 2))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Odd Pages</button>
        <button onClick={() => onRangeChange(Array.from({ length: Math.floor(totalPages / 2) }, (_, i) => i * 2 + 1))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Even Pages</button>
      </div>
      <div className="flex gap-2">
        <input type="text" value={rangeInput} onChange={(e) => setRangeInput(e.target.value)} placeholder="e.g., 1-5, 8, 10-12" className="flex-1 bg-dark-tertiary border border-dark-border rounded-lg px-3 py-2 text-dark-text-primary text-sm focus:outline-none focus:border-blue-500"/>
        <button onClick={applyRange} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">Apply</button>
      </div>
      {rangeError && <p className="text-red-400 text-xs mt-2">{rangeError}</p>}
      <p className="text-dark-text-muted text-xs mt-2">Use commas to separate pages/ranges (e.g., 1-5, 8, 10-12)</p>
    </div>
  );
};


const PDFSplit = () => {
  const [file, setFile] = useState(null);
  const [pdfJsDoc, setPdfJsDoc] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState('');
  const [exportOption, setExportOption] = useState('separate');

  const limits = PLAN_LIMITS[currentPlan];

  useEffect(() => {
    trackToolUsage('pdf_split');
  }, []);

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Only PDF files are accepted');
      return;
    }
    if (acceptedFiles.length > 1) {
      setError('Please select only one PDF file to split');
      return;
    }

    const droppedFile = acceptedFiles[0];
    const validation = validateFile(droppedFile, currentPlan);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    try {
      const arrayBuffer = await droppedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer); // for processing
      const pageCount = pdfDoc.getPageCount();
      const pdfJsDocument = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise; // for rendering
      
      const pageValidation = validatePDFForSplit(pageCount, currentPlan);
      if (!pageValidation.valid) {
        setShowUpgradeModal(true);
        return;
      }

      const pagesArray = Array.from({ length: pageCount }, (_, index) => ({
        pageIndex: index,
        selected: false
      }));
      setPages(pagesArray);

      setFile({
        id: Math.random().toString(36).substring(7),
        file: droppedFile,
        name: droppedFile.name,
        size: droppedFile.size,
        pdfDoc // pdf-lib document
      });
      setPdfJsDoc(pdfJsDocument); // pdf.js document
    } catch (err) {
      console.error('PDF load error:', err);
      setError(`Failed to load PDF: ${droppedFile.name}. Please ensure it's a valid PDF file.`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    maxFiles: 1
  });

  const handleSetSelectedPages = (indices) => {
    const selectionValidation = validatePageSelection(indices.length, currentPlan);
    if (!selectionValidation.valid) {
      setShowUpgradeModal(true);
      return;
    }
    const newPages = pages.map((p, i) => ({ ...p, selected: indices.includes(i) }));
    setPages(newPages);
  };

  const handlePageToggle = (fileId, pageIndex) => {
    const selectedIndices = pages.filter(p => p.selected).map(p => p.pageIndex);
    let newSelectedIndices;

    if (selectedIndices.includes(pageIndex)) {
      newSelectedIndices = selectedIndices.filter(i => i !== pageIndex);
    } else {
      newSelectedIndices = [...selectedIndices, pageIndex];
    }
    handleSetSelectedPages(newSelectedIndices);
  };

  const splitPDF = async () => {
    const selectedPages = pages.filter(p => p.selected).map(p => p.pageIndex);
    if (selectedPages.length === 0) {
      setError('Please select at least one page to extract');
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setError('');

    try {
      if (exportOption === 'separate') {
        for (let i = 0; i < selectedPages.length; i++) {
          setProgress(Math.round((i / selectedPages.length) * 90));
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(file.pdfDoc, [selectedPages[i]]);
          newPdf.addPage(copiedPage);
          const pdfBytes = await newPdf.save();
          // ... (download logic unchanged)
        }
      } else if (exportOption === 'combined') {
        setProgress(50);
        const newPdf = await PDFDocument.create();
        const sortedPages = [...selectedPages].sort((a, b) => a - b);
        const copiedPages = await newPdf.copyPages(file.pdfDoc, sortedPages);
        copiedPages.forEach(page => newPdf.addPage(page));
        const pdfBytes = await newPdf.save();
        // ... (download logic unchanged)
      }
      
      setProgress(100);
      await trackDownload('pdf_split');
      
      setTimeout(() => {
        setIsProcessing(false);
        setProgress(0);
      }, 1500);

    } catch (err) {
      console.error('PDF split error:', err);
      setError('Failed to split PDF. Please ensure all selected pages are valid.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetTool = () => {
    setFile(null);
    setPdfJsDoc(null);
    setPages([]);
    setError('');
  };

  const selectedPagesCount = pages.filter(p => p.selected).length;

  return (
    <>
      <SEOHead
        title="Free PDF Split Tool - Extract Pages from PDF Online | DocEnclave"
        description="Split PDF files for free with page preview. Extract specific pages, split by ranges, or create separate files. 100% secure, no uploads required. Start splitting PDFs instantly."
      />
      <div className="container mx-auto px-4 py-8">
        {/* Tool Header and USP Cards... (unchanged) */}
        {/* Plan Limits Display and Error Display... (unchanged) */}
        
        {/* File Upload Zone - Show when no file */}
        {!file && (
          <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer mb-6 ${isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-dark-border hover:border-gray-500 bg-dark-secondary'}`}>
            {/* ... Dropzone JSX ... */}
          </div>
        )}

        {/* Page Preview Mode */}
        {file && (
          <div className="space-y-6 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-dark-text-primary">
                Select Pages to Extract ({selectedPagesCount} selected)
              </h3>
              <button onClick={resetTool} className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                Choose Different File
              </button>
            </div>

            <RangeSelector totalPages={pages.length} onRangeChange={handleSetSelectedPages} />

            {/* Export Options */}
            <div className="bg-dark-secondary rounded-lg p-4 border border-dark-border">
              {/* ... Export Options JSX ... */}
            </div>

            {/* Page Grid using the new shared component */}
            <PDFFilePreview
              file={file}
              pdfJSDoc={pdfJsDoc}
              pages={pages}
              onPageToggle={handlePageToggle}
            />
          </div>
        )}

        {/* Split Controls */}
        {file && selectedPagesCount > 0 && (
          <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mb-16">
            {/* ... Split Controls JSX ... */}
          </div>
        )}
        
        {/* Help message when no pages selected */}
        {file && selectedPagesCount === 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 mb-16 text-center">
            {/* ... Help message JSX ... */}
          </div>
        )}

        {/* How to Use and SEO sections... (unchanged) */}
        {/* Upgrade Modal... (unchanged) */}
      </div>
    </>
  );
};

export default PDFSplit;