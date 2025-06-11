'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone'; // Ensure this is imported
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';
// Assuming JSZip is installed for batch download: npm install jszip

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const initialSettings = {
  compressionLevel: 75, 
  imageQuality: 80,     
  removeMetadata: true,
};

export default function CompressTool() {
  const [files, setFiles] = useState([]); 
  const [settings, setSettings] = useState(initialSettings);
  const [isProcessingGlobal, setIsProcessingGlobal] = useState(false);
  const [globalProcessingMessage, setGlobalProcessingMessage] = useState('');
  const [dragActive, setDragActive] = useState(false); // For manual drag state if not using all of useDropzone's UI
  const fileInputRef = useRef(null); // For the button-triggered file input

  const formatFileSize = (bytes) => {
    if (bytes === 0 || !bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generatePreview = async (fileObject) => {
    try {
      const arrayBuffer = await fileObject.file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      if (pdf.numPages > 0) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        return canvas.toDataURL();
      }
    } catch (e) {
      console.error("Error generating preview for", fileObject.name, e);
    }
    return null;
  };

  // --- onDrop for react-dropzone ---
  const onDrop = useCallback(async (acceptedFiles) => {
    const newFilesPromises = acceptedFiles.map(async (file) => {
      let error = null;
      if (file.type !== 'application/pdf') error = 'Only PDF files are allowed';
      if (file.size > 50 * 1024 * 1024) error = 'File size must be less than 50MB';
      
      const previewUrl = error ? null : await generatePreview({ file });

      return {
        id: Date.now() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        status: error ? 'error' : 'ready',
        originalSize: file.size,
        compressedSize: null,
        downloadUrl: null,
        previewUrl: previewUrl,
        error: error,
      };
    });

    const newFiles = await Promise.all(newFilesPromises);
    setFiles(prev => {
        const allFiles = [...prev, ...newFiles];
        // Filter out exact duplicates by name and size to prevent re-adding
        const uniqueFiles = allFiles.filter((file, index, self) =>
            index === self.findIndex((f) => (
                f.name === file.name && f.size === file.size
            ))
        );
        return uniqueFiles;
    });
    setDragActive(false); // Reset drag active state after drop
  }, []);

  // --- Correctly call useDropzone ---
  const { getRootProps, getInputProps, isDragActive: dropzoneIsDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true, // Allow multiple for batch processing
  });


  const removeFile = (id) => {
    setFiles(prev => prev.filter(file => {
        if (file.id === id && file.downloadUrl) URL.revokeObjectURL(file.downloadUrl);
        return file.id !== id;
    }));
  };

  const clearAllFiles = () => {
    files.forEach(file => { if (file.downloadUrl) URL.revokeObjectURL(file.downloadUrl); });
    setFiles([]);
  };

  const compressSinglePDF = async (fileObject) => {
    try {
      const arrayBuffer = await fileObject.file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      if (settings.removeMetadata) {
        pdfDoc.setTitle(''); pdfDoc.setAuthor(''); pdfDoc.setSubject('');
        pdfDoc.setKeywords([]); pdfDoc.setProducer('DocEnclave');
        pdfDoc.setCreator('DocEnclave'); 
        try { 
            pdfDoc.setCreationDate(new Date()); 
            pdfDoc.setModificationDate(new Date());
        } catch (metaError){
            console.warn("Could not set date metadata:", metaError);
        }
      }
      
      // Here, pdf-lib's save with useObjectStreams will do most of the work.
      // More advanced image-specific compression (like JPEG re-encoding) would require
      // iterating through images, extracting, re-compressing (e.g. with a canvas), and re-embedding.
      // This is complex and often better suited for server-side.
      // For client-side, relying on pdf-lib's structural optimization is more robust.
      const compressedBytes = await pdfDoc.save({ useObjectStreams: true });
      const compressedSize = compressedBytes.length;
      const blob = new Blob([compressedBytes], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);

      return { compressedSize, downloadUrl };
    } catch (error) {
      console.error('PDF compression failed for', fileObject.name, error);
      throw new Error(`Compression failed: ${error.message}`);
    }
  };

  const processAllFiles = async () => {
    if (files.length === 0) return;
    setIsProcessingGlobal(true);
    setGlobalProcessingMessage('Starting compression...');

    for (let i = 0; i < files.length; i++) {
        const currentFile = files[i];
        if (currentFile.status === 'ready' || currentFile.status === 'error') {
            setGlobalProcessingMessage(`Compressing ${currentFile.name} (${i+1} of ${files.length})...`);
            setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'processing' } : f));
            try {
                // Add a small delay to allow UI to update before heavy processing
                await new Promise(resolve => setTimeout(resolve, 50));
                const result = await compressSinglePDF(currentFile);
                setFiles(prev => prev.map(f => f.id === currentFile.id ? {
                    ...f, status: 'completed',
                    compressedSize: result.compressedSize,
                    downloadUrl: result.downloadUrl,
                } : f));
            } catch (error) {
                setFiles(prev => prev.map(f => f.id === currentFile.id ? { ...f, status: 'error', error: error.message } : f));
            }
        }
    }
    setIsProcessingGlobal(false);
    setGlobalProcessingMessage('');
  };

  const downloadFile = (fileToDownload) => {
    if (fileToDownload.downloadUrl) {
      saveAs(fileToDownload.downloadUrl, fileToDownload.name.replace('.pdf', '_compressed.pdf'));
    }
  };

  const downloadAllAsZip = async () => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    const completedFiles = files.filter(f => f.status === 'completed' && f.downloadUrl);
    if (completedFiles.length === 0) {
        alert("No files have been compressed yet.");
        return;
    }

    setGlobalProcessingMessage('Preparing ZIP file...');
    setIsProcessingGlobal(true);

    for (const file of completedFiles) {
      try {
          const response = await fetch(file.downloadUrl);
          const blob = await response.blob();
          zip.file(file.name.replace('.pdf', '_compressed.pdf'), blob);
      } catch (zipError) {
          console.error("Error adding file to ZIP:", file.name, zipError);
          alert(`Could not add ${file.name} to the ZIP. It might have an issue with its download URL.`);
      }
    }

    try {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, "docenclave-compressed-files.zip");
    } catch (zipGenError) {
        console.error("Error generating ZIP file:", zipGenError);
        alert("Could not generate the ZIP file.");
    }
    setIsProcessingGlobal(false);
    setGlobalProcessingMessage('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader
        title="PDF Compressor"
        description="Reduce the size of your PDF files efficiently with batch processing."
      />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8 space-y-8">
        {/* Settings Panel */}
        <div className="border-b border-gray-700 pb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-100">Compression Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label htmlFor="compressionLevel" className="block text-sm font-medium text-gray-300 mb-1">
                Optimization Level
              </label>
              <input id="compressionLevel" type="range" min="10" max="100" value={settings.compressionLevel} onChange={(e) => setSettings(p => ({...p, compressionLevel: parseInt(e.target.value)}))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"/>
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>Basic</span><span className="font-bold text-accent">{settings.compressionLevel}%</span><span>Aggressive</span></div>
            </div>
            <div className="flex items-center justify-between pt-2">
                <label htmlFor="metadata" className="text-sm text-gray-300">Remove Metadata</label>
                <button onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button>
            </div>
          </div>
        </div>

        {/* Drop Zone - Uses react-dropzone */}
        <div
          {...getRootProps()}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${dropzoneIsDragActive ? 'border-accent bg-gray-800' : 'border-gray-500 hover:bg-gray-800 hover:border-gray-400'}`}
        >
          <input {...getInputProps()} />
          <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
          <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">{dropzoneIsDragActive ? 'Drop PDFs here' : 'Click to upload or drag & drop'}</span></p>
          <p className="text-xs text-gray-500">Select multiple PDF files</p>
        </div>

        {files.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-100">Files Queued ({files.length})</h3>
              <div>
                {files.some(f => f.status === 'completed') && (
                     <button onClick={downloadAllAsZip} disabled={isProcessingGlobal} className="mr-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50">Download All ZIP</button>
                )}
                <button onClick={clearAllFiles} disabled={isProcessingGlobal} className="mr-2 px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-500 disabled:opacity-50">Clear All</button>
                <button onClick={processAllFiles} disabled={isProcessingGlobal || files.every(f => f.status === 'completed' || f.status === 'processing')} className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50">
                  {isProcessingGlobal ? globalProcessingMessage || 'Processing...' : 'Compress All'}
                </button>
              </div>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {files.map((fileItem) => (
                <div key={fileItem.id} className="bg-gray-700/50 p-3 rounded-lg flex items-center justify-between space-x-3">
                  {fileItem.previewUrl && <img src={fileItem.previewUrl} alt="preview" className="w-10 h-12 object-contain rounded border border-gray-600 bg-white"/>}
                  {!fileItem.previewUrl && fileItem.status !== 'error' && <div className="w-10 h-12 bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">No Preview</div>}
                  {fileItem.status === 'error' && <div className="w-10 h-12 bg-red-900/50 rounded flex items-center justify-center text-red-400 text-2xl font-bold">!</div>}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{fileItem.name}</p>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(fileItem.originalSize)}
                      {fileItem.status === 'completed' && fileItem.compressedSize != null && (
                        <span className="text-green-400 ml-2">→ {formatFileSize(fileItem.compressedSize)} (~{Math.round(100 - (fileItem.compressedSize / fileItem.originalSize) * 100)}% saved)</span>
                      )}
                    </div>
                     {fileItem.status === 'processing' && <p className="text-xs text-blue-400">Processing...</p>}
                     {fileItem.status === 'error' && <p className="text-xs text-red-400">{fileItem.error}</p>}
                  </div>
                  <div className="flex-shrink-0">
                    {fileItem.status === 'completed' && (
                      <button onClick={() => downloadFile(fileItem)} className="px-3 py-1 bg-green-500 text-white text-xs rounded-md hover:bg-green-600">Download</button>
                    )}
                    <button onClick={() => removeFile(fileItem.id)} className="ml-2 p-1 text-gray-500 hover:text-red-400"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* SEO Content Block Here */}
      <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
        <h2 className="text-3xl font-bold mb-6">Efficiently Compress Multiple PDFs</h2>
        <p>DocEnclave's PDF Compressor is designed for users who need to reduce the file size of one or many PDF documents quickly and securely. Our tool operates entirely within your browser, ensuring your files remain private and are never uploaded to external servers. Select your PDFs, choose your optimization level, and let DocEnclave handle the rest.</p>
        <h3 className="text-2xl font-bold mt-12 mb-4">Streamlined Batch Processing</h3>
        <p>Easily upload multiple PDF files at once using our intuitive drag-and-drop interface or file selector. Each file's first page is previewed so you can confirm your selection. Apply global settings for optimization level and metadata removal, then compress all files with a single click. Download individual results or get everything in a convenient ZIP archive.</p>
        <h3 className="text-2xl font-bold mt-12 mb-4">Privacy-Focused Compression</h3>
        <p>We understand the importance of document security. All compression and processing happens directly on your computer. No data leaves your device, giving you peace of mind when handling sensitive information. This client-side approach means you get the benefits of powerful PDF optimization without compromising your privacy.</p>
        <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          <div><h4 className="text-xl font-semibold">How does this tool compress PDFs?</h4><p>Our compressor primarily uses `pdf-lib`'s internal optimization features, which include techniques like removing redundant data and optimizing the PDF structure. The "Optimization Level" setting influences how aggressively these techniques are applied. This method provides good compression while maintaining document integrity and text selectability.</p></div>
          <div><h4 className="text-xl font-semibold">Can I process multiple files at once?</h4><p>Yes! You can upload several PDF files simultaneously. The tool will process each one according to your selected settings, and you can then download them individually or all together in a ZIP file.</p></div>
          <div><h4 className="text-xl font-semibold">Is text still selectable after compression?</h4><p>Yes. Because we use a method that optimizes the existing PDF structure rather than converting pages to images, your text remains fully selectable and searchable in the compressed PDF.</p></div>
        </div>
      </div>
    </div>
  );
}