// src/app/merge-pdf/page.js

'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  // NEW STATE: Store the result of the merge
  const [mergedFile, setMergedFile] = useState(null); // { url: '...', name: '...' }

  const handleFileChange = (event) => {
    // When a new file is selected, reset any previous merge result
    setMergedFile(null);
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please select at least two PDF files to merge.');
      return;
    }
    setIsMerging(true);
    setMergedFile(null); // Clear previous results

    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const fileAsArrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(fileAsArrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // NEW: Instead of downloading automatically, we save the result to our state
      setMergedFile({ url: url, name: 'docenclave-merged.pdf' });
      
      // We no longer clear the original files immediately
      // setFiles([]); 

    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs. Please make sure all files are valid PDFs.');
    } finally {
      setIsMerging(false);
    }
  };

  // NEW: Function to handle starting over
  const handleStartOver = () => {
    // Revoke the old URL to prevent memory leaks
    if (mergedFile) {
      URL.revokeObjectURL(mergedFile.url);
    }
    setFiles([]);
    setMergedFile(null);
  };

  // Helper component for the success view
  const SuccessView = () => (
    <div className="mt-8 text-center">
        <h3 className="text-2xl font-semibold mb-4 text-green-400">Merge Successful!</h3>
        <p className="text-gray-400 mb-6">Your file is ready for download.</p>
        <div className="flex justify-center items-center space-x-4">
            <a 
              href={mergedFile.url} 
              download={mergedFile.name}
              className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Download Merged PDF
            </a>
            <button
                onClick={handleStartOver}
                className="bg-gray-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-500 transition-colors"
            >
                Start Over
            </button>
        </div>
    </div>
  );

  // Helper component for the file list and merge button view
  const MergeView = () => (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Selected Files:</h3>
      <ul className="space-y-2">
        {files.map((file, index) => (
          <li key={index} className="bg-gray-800 p-3 rounded-md flex justify-between items-center">
            <span className="text-gray-300">{file.name}</span>
            <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 text-center">
        <button 
          onClick={handleMerge}
          disabled={isMerging}
          className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isMerging ? 'Merging...' : `Merge ${files.length} Files`}
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Merge PDF Files</h1>
        <p className="text-lg text-gray-400">
          Combine multiple PDFs into a single file, right in your browser.
        </p>
      </div>

      {/* Tool UI Section */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        
        {/* We only show the upload box if no files are merged yet */}
        {!mergedFile && (
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">PDF files only</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
          </label>
        )}
        
        {/* Conditional Rendering: Show the correct view based on the state */}
        {mergedFile ? <SuccessView /> : (files.length > 0 && <MergeView />)}

      </div>

      {/* SEO Content Section */}
      <div className="mt-16 text-gray-300">
        <h2 className="text-2xl font-bold mb-4">About the Merge PDF Tool</h2>
        <p className="mb-4">
          Our Merge PDF tool allows you to quickly combine several PDF files into one document without ever uploading your files to a server. This ensures your sensitive information remains 100% private. Drag and drop your files, reorder them as you wish, and download your merged PDF instantly.
        </p>
      </div>
    </div>
  );
}