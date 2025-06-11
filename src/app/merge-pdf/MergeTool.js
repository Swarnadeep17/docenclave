'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist'; // Assuming you prefer this alias from your code
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ToolPageHeader from '@/components/ToolPageHeader';
import SparkMD5 from 'spark-md5';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function MergeTool() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFiles, setOriginalFiles] = useState(new Map());
  const [mergedFile, setMergedFile] = useState(null);
  const [duplicateCount, setDuplicateCount] = useState(0);

  const handleFileChange = async (event) => {
    if (mergedFile) URL.revokeObjectURL(mergedFile.url);
    setMergedFile(null);
    setPages([]);
    setIsProcessing(true);
    setDuplicateCount(0);
    
    const selectedFiles = Array.from(event.target.files);
    event.target.value = null;

    const newOriginalFiles = new Map();
    let tempPages = [];
    const uploadId = Date.now();

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.type !== "application/pdf") continue;

      const fileId = `${uploadId}-${file.name}`;
      newOriginalFiles.set(fileId, file);

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
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data.toString();
          const hash = SparkMD5.hash(imageData);
          
          tempPages.push({
            id: `${fileId}-page-${j}`,
            fileId: fileId,
            originalPageNumber: j,
            imgSrc: canvas.toDataURL(),
            hash: hash,
            isDuplicate: false,
          });
        }
      } catch (error) {
        console.error("Could not process file:", file.name, error);
        alert(`Could not process ${file.name}. It might be corrupted or password-protected.`);
      }
    }

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
    setPages(tempPages);
    setIsProcessing(false);
  };
  
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };
  
  const handleMerge = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    setMergedFile(null);

    const loadedDocsCache = new Map();

    try {
      const mergedPdf = await PDFDocument.create();
      for (const page of pages) {
        let sourcePdf;
        if (loadedDocsCache.has(page.fileId)) {
          sourcePdf = loadedDocsCache.get(page.fileId);
        } else {
          const sourceFile = originalFiles.get(page.fileId);
          if (sourceFile) {
            const sourcePdfBytes = await sourceFile.arrayBuffer();
            sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });
            loadedDocsCache.set(page.fileId, sourcePdf);
          }
        }
        if (sourcePdf) {
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
      alert("A critical error occurred while merging.");
    } finally {
      setIsProcessing(false);
      loadedDocsCache.clear();
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
    setDuplicateCount(0);
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  const handleDownloadClick = () => {
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statToIncrement: 'downloads' }),
    }).catch(err => console.error("Failed to increment download count:", err));
  };

  const SuccessView = () => (
    <div className="text-center py-8">
      <h3 className="text-2xl font-semibold mb-4 text-green-400">Merge Successful!</h3>
      <p className="text-gray-400 mb-6">Your file with {pages.length} pages is ready.</p>
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <a 
          href={mergedFile.url} 
          download={mergedFile.name} 
          onClick={handleDownloadClick}
          className="w-full sm:w-auto bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Download
        </a>
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
        ) : !isProcessing && pages.length > 0 && (
          <>
            {duplicateCount > 0 && (
              <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg relative mb-4 text-center" role="alert">
                <span className="block sm:inline">💡 We found {duplicateCount} duplicate pages. They've been highlighted for your review.</span>
              </div>
            )}
            <p className="text-sm text-center mb-4 text-gray-400">Tip: Drag pages to reorder them.</p>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="pages" direction="horizontal">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 bg-gray-900/50 rounded-lg overflow-x-auto min-h-[150px]">
                    {pages.map((page, index) => (
                      <Draggable key={page.id} draggableId={page.id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="relative group aspect-[7/10]">
                            <img src={page.imgSrc} alt={`Page ${index + 1}`} className={`w-full h-full object-contain border-2 rounded-md transition-colors ${page.isDuplicate ? 'border-yellow-500' : 'border-gray-600'}`} />
                            {page.isDuplicate && (
                                <div className="absolute top-0 left-0 bg-yellow-500 text-black text-xs font-bold px-1 rounded-br-md" title="This is a potential duplicate page" aria-label="This page is a potential duplicate">D</div>
                            )}
                            <button onClick={() => handleDeletePage(page.id)} className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10" aria-label={`Delete page ${index + 1}`}>X</button>
                            <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tr-md rounded-bl-md">{index + 1}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="mt-8 text-center">
                <button onClick={handleMerge} disabled={isProcessing} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">Merge {pages.length} Pages</button>
            </div>
          </>
        )}
      </div>
      <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
        <h2 className="text-3xl font-bold mb-6">A Smarter Way to Combine PDF Documents</h2><p>Tired of basic PDF mergers that just stitch files together? The DocEnclave PDF Merger is designed for precision and privacy. Unlike other online tools that force you to upload sensitive documents, our tool works entirely within your browser. This means your files stay on your device, secure and confidential.</p><p>But true innovation lies in control. We don't just let you combine files; we give you a complete visual workspace. See every single page, drag them into the perfect order, and delete unwanted pages with a single click before you merge. It's the power of a desktop application, with the convenience of a web tool, and the security of working offline.</p><h3 className="text-2xl font-bold mt-12 mb-4">Total Control Over Your Pages</h3><p>Don't just merge files—orchestrate your document. Our interactive preview lets you see every page from all your uploaded PDFs in one place. Drag a cover page from one file to the front, move an appendix from another to the back, and delete blank or incorrect pages on the fly. This is the level of detail that ensures your final document is perfect.</p><h3 className="text-2xl font-bold mt-12 mb-4">Unyielding Privacy and Security</h3><p>Security isn't a feature; it's our foundation. When you use DocEnclave, there are zero file uploads. The entire merging process, from file selection to the final creation of your new PDF, happens locally on your computer. Your contracts, reports, and personal documents never touch our servers, or anyone else's.</p><h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2><div className="space-y-8"><div><h4 className="text-xl font-semibold">How do I merge PDF files with this tool?</h4><p>It's simple. 1) Click the upload box and select all the PDF files you want to combine. 2) In the preview area, drag and drop individual pages to get the exact order you need. 3) Delete any pages you don't want. 4) Click the "Merge Pages" button to create and download your new, perfectly organized PDF.</p></div><div><h4 className="text-xl font-semibold">Is it truly free to combine PDFs here?</h4><p>Yes, completely. Our client-side tools, including the advanced PDF merger, are 100% free to use with no limits, watermarks, or registration required.</p></div><div><h4 className="text-xl font-semibold">Can I reorder pages from different PDF files?</h4><p>Absolutely! This is what makes our tool unique. You can take page 5 from your first PDF and place it after page 2 of your second PDF. The preview area shows all pages from all files as one single collection for you to arrange.</p></div><div><h4 className="text-xl font-semibold">Are my files safe when I merge them?</h4><p>Your files are as safe as they are on your own computer, because they never leave it. By processing everything in your browser, DocEnclave eliminates the risk associated with uploading documents to third-party servers, offering the highest level of privacy.</p></div></div>
      </div>
    </div>
  );
}