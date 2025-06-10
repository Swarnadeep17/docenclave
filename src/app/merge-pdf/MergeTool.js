// src/app/merge-pdf/MergeTool.js

'use client';

import { useState } from 'react'; // No longer need useEffect or useCallback
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ToolPageHeader from '@/components/ToolPageHeader';
import SparkMD5 from 'spark-md5';

// Required configuration for pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function MergeTool() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFiles, setOriginalFiles] = useState(new Map());
  const [mergedFile, setMergedFile] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(0);

  // We have REMOVED the useEffect hook that was causing the conflict.

  const handleFileChange = async (event) => {
    if (mergedFile) URL.revokeObjectURL(mergedFile.url);
    setMergedFile(null);
    setPages([]);
    setIsProcessing(true);
    setDuplicateCount(0);
    
    const selectedFiles = Array.from(event.target.files);
    event.target.value = null; 

    const newOriginalFiles = new Map();
    let tempPages = []; // Use a temporary array first
    const uploadId = Date.now();

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== "application/pdf") continue;

      const fileId = `${uploadId}-${file.name}`;
      newOriginalFiles.set(fileId, file);

      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: fileBuffer }).promise;
        for (let j = 1; j <= pdf.numPages; j++) {
          const page = await pdf.getPage(j);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data.toString();
          const hash = SparkMD5.hash(imageData);
          
          tempPages.push({
            id: `${fileId}-page-${j}`,
            fileId: fileId,
            originalPageNumber: j,
            imgSrc: canvas.toDataURL(),
            hash: hash,
            isDuplicate: false, // Default value
          });
        }
      } catch (error) {
        console.error("Could not process file:", file.name, error);
        alert(`Could not process ${file.name}. It might be corrupted or password-protected.`);
      }
    }

    // **THE FIX:** Perform duplicate detection here, once, and only once.
    if (tempPages.length > 0) {
        const hashes = new Map();
        tempPages.forEach(p => hashes.set(p.hash, (hashes.get(p.hash) || 0) + 1));
        
        tempPages = tempPages.map(p => ({
            ...p,
            isDuplicate: hashes.get(p.hash) > 1,
        }));
        
        const dupCount = tempPages.filter(p => p.isDuplicate).length;
        setDuplicateCount(dupCount);
    }
    
    setOriginalFiles(newOriginalFiles);
    setPages(tempPages); // Set the final, processed pages to state
    setIsProcessing(false);
  };
  
  const onDragEnd = (result) => {
    // This function now only handles reordering, which is safe.
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  // The rest of the file remains exactly the same.
  // I am including it all for a safe copy-paste.
  
  const handleMerge = async () => {
    if (pages.length === 0) {
      alert("There are no pages to merge.");
      return;
    }
    setIsProcessing(true);
    setMergedFile(null);

    try {
      const mergedPdf = await PDFDocument.create();
      for (const page of pages) {
        const sourceFile = originalFiles.get(page.fileId); 
        if (sourceFile) {
          const sourcePdfBytes = await sourceFile.arrayBuffer();
          const sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });
          const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.originalPageNumber - 1]);
          mergedPdf.addPage(copiedPage);
        }
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedFile({ url: url, name: 'docenclave-merged-pages.pdf' });
    } catch (error) {
      console.error("Error merging pages:", error);
      alert("A critical error occurred while merging. This can happen with very complex or non-standard PDF files.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeletePage = (pageIdToDelete) => {
    setPages(currentPages => currentPages.filter(page => page.id !== pageIdToDelete));
  };
  
  const handleStartOver = () => {
    if (mergedFile) URL.revokeObjectURL(mergedFile.url);
    setPages([]);
    setMergedFile(null);
    setOriginalFiles(new Map());
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const SuccessView = () => (
    <div className="text-center py-8">
      <h3 className="text-2xl font-semibold mb-4 text-green-400">Merge Successful!</h3>
      <p className="text-gray-400 mb-6">Your file with {pages.length} pages is ready.</p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a href={mergedFile.url} download={mergedFile.name} className="w-full sm:w-auto bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Download</a>
        <button onClick={handleStartOver} className="w-full sm:w-auto bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors">Merge More Files</button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader 
        title="Advanced PDF Merger"
        description="Drag & drop to reorder, delete, and even detect duplicate pages before you merge."
      />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        {!mergedFile && (
          <label htmlFor="file-upload" className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
              <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload files</span></p>
              <p className="text-xs text-gray-500">Select new files to start over</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
          </label>
        )}
        {isProcessing && <p className="text-center text-accent my-8">Analyzing pages, please wait...</p>}
        {mergedFile ? (
          <SuccessView />
        ) : !isProcessing && pages.length > <strong><