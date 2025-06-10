'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import ToolPageHeader from '@/components/ToolPageHeader';

// Required configuration for pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function SplitTool() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [outputFile, setOutputFile] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());

  const handleFileChange = async (event) => {
    if (outputFile) URL.revokeObjectURL(outputFile.url);
    setOutputFile(null);
    setPages([]);
    setSelectedPages(new Set());
    setIsProcessing(true);
    
    const file = event.target.files[0];
    event.target.value = null;

    if (file && file.type === "application/pdf") {
      setOriginalFile(file);
      let tempPages = [];

      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: fileBuffer.slice(0) }).promise;
        
        for (let j = 1; j <= pdf.numPages; j++) {
          const page = await pdf.getPage(j);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          
          tempPages.push({
            id: `page-${j}`,
            originalPageNumber: j,
            imgSrc: canvas.toDataURL(),
          });
        }
        setPages(tempPages);
      } catch (error) {
        console.error("Could not process file:", file.name, error);
        alert(`Could not process ${file.name}. It might be corrupted or password-protected.`);
      }
    }
    setIsProcessing(false);
  };

  const handlePageSelect = (pageId) => {
    setSelectedPages(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return newSelected;
    });
  };

  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set()); // Deselect all
    } else {
      setSelectedPages(new Set(pages.map(p => p.id))); // Select all
    }
  };

  // Logic to create a single PDF from selected pages
  const handleExtractSingle = async () => {
    if (selectedPages.size === 0) return;
    setIsProcessing(true);
    setOutputFile(null);

    try {
      const sourcePdfBytes = await originalFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });
      const newPdf = await PDFDocument.create();

      const pageIndices = pages
        .filter(p => selectedPages.has(p.id))
        .map(p => p.originalPageNumber - 1);

      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setOutputFile({ url, name: 'docenclave-extracted.pdf' });
    } catch (error) {
      console.error("Error extracting pages:", error);
      alert("A critical error occurred while extracting pages.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Logic to create a ZIP of separate PDFs
  const handleDownloadZip = async () => {
    if (selectedPages.size === 0) return;
    setIsProcessing(true);

    try {
        const zip = new JSZip();
        const sourcePdfBytes = await originalFile.arrayBuffer();
        const sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });

        const selectedPageNumbers = pages
            .filter(p => selectedPages.has(p.id))
            .map(p => p.originalPageNumber);

        for (const pageNum of selectedPageNumbers) {
            const newPdf = await PDFDocument.create();
            const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNum - 1]);
            newPdf.addPage(copiedPage);
            const newPdfBytes = await newPdf.save();
            zip.file(`page-${pageNum}.pdf`, newPdfBytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        setOutputFile({ url, name: 'docenclave-split-pages.zip' });
    } catch (error) {
        console.error("Error creating ZIP:", error);
        alert("A critical error occurred while creating the ZIP file.");
    } finally {
        setIsProcessing(false);
    }
  };
  
  const handleStartOver = () => {
    if (outputFile) URL.revokeObjectURL(outputFile.url);
    setPages([]);
    setOutputFile(null);
    setOriginalFile(null);
    setSelectedPages(new Set());
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };
  
  // A new SuccessView that handles both PDF and ZIP downloads
  const SuccessView = () => (
    <div className="text-center py-8">
      <h3 className="text-2xl font-semibold mb-4 text-green-400">Processing Complete!</h3>
      <p className="text-gray-400 mb-6">Your file is ready for download.</p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a href={outputFile.url} download={outputFile.name} className="w-full sm:w-auto bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Download File</a>
        <button onClick={handleStartOver} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors">Split Another File</button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader 
        title="Advanced PDF Splitter"
        description="Visually select pages to extract into a single PDF or download as separate files."
      />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        {!pages.length && !isProcessing && (
          <label htmlFor="file-upload" className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload a PDF</span></p>
                <p className="text-xs text-gray-500">Select a file to begin</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        )}
        {isProcessing && <p className="text-center text-accent my-8">Analyzing pages, please wait...</p>}
        {outputFile ? (
          <SuccessView />
        ) : !isProcessing && pages.length > 0 && (
          <>
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-400">
                    Selected <span className="font-bold text-accent">{selectedPages.size}</span> of {pages.length} pages.
                </p>
                <button onClick={handleSelectAll} className="text-sm font-semibold text-accent hover:underline">
                    {selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}
                </button>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 bg-gray-900/50 rounded-lg overflow-x-auto min-h-[150px]">
              {pages.map((page, index) => (
                <div 
                    key={page.id} 
                    onClick={() => handlePageSelect(page.id)}
                    className={`relative group aspect-[7/10] cursor-pointer border-2 rounded-md transition-all duration-200 ${selectedPages.has(page.id) ? 'border-accent shadow-lg scale-105' : 'border-gray-600'}`}
                >
                    <img src={page.imgSrc} alt={`Page ${index + 1}`} className="w-full h-full object-contain rounded-md" />
                    {selectedPages.has(page.id) && (
                        <div className="absolute top-1 right-1 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs" aria-label="Selected">✓</div>
                    )}
                    <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tr-md rounded-bl-md">{index + 1}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button onClick={handleExtractSingle} disabled={isProcessing || selectedPages.size === 0} className="w-full sm:w-auto bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                    Extract ({selectedPages.size}) as Single File
                </button>
                <button onClick={handleDownloadZip} disabled={isProcessing || selectedPages.size === 0} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors disabled:bg-gray-700 disabled:cursor-not-allowed">
                    Download ({selectedPages.size}) as ZIP
                </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}