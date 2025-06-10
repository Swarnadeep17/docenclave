// src/app/merge-pdf/page.js

'use client';

import { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// Required configuration for pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function MergePdfPage() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false); // General processing state

  // Store original files to access their data later
  const [originalFiles, setOriginalFiles] = useState(new Map());

  const handleFileChange = async (event) => {
    setIsProcessing(true);
    setPages([]); // Clear previous pages
    const selectedFiles = Array.from(event.target.files);
    
    const newOriginalFiles = new Map();
    const newPages = [];

    // Unique ID for each file upload instance
    const uploadId = Date.now();

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = `${uploadId}-${file.name}`;
      
      const fileAsArrayBuffer = await file.arrayBuffer();
      newOriginalFiles.set(fileId, fileAsArrayBuffer);

      const pdf = await pdfjs.getDocument(fileAsArrayBuffer).promise;
      
      for (let j = 1; j <= pdf.numPages; j++) {
        const page = await pdf.getPage(j);
        const viewport = page.getViewport({ scale: 0.5 }); // Lower scale for smaller thumbnails
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        
        newPages.push({
          id: `${fileId}-page-${j}`, // Unique ID for each page
          fileId: fileId,
          originalPageNumber: j,
          imgSrc: canvas.toDataURL(),
        });
      }
    }

    setOriginalFiles(newOriginalFiles);
    setPages(newPages);
    setIsProcessing(false);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  const handleDeletePage = (pageIdToDelete) => {
    setPages(pages.filter(page => page.id !== pageIdToDelete));
  };
  
  // MERGE LOGIC IS TEMPORARILY A PLACEHOLDER - WE WILL RE-IMPLEMENT THIS NEXT
  const handleMerge = async () => {
    alert("Merge logic to be re-implemented in the next step!");
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Merge PDF Files</h1>
        <p className="text-lg text-gray-400">
          Drag and drop pages to reorder, delete unwanted pages, then merge.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8 mb-8">
        <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-gray-500">Select new files to start over</p>
          </div>
          <input id="file-upload" type="file" className="hidden" accept=".pdf" multiple onChange={handleFileChange} />
        </label>
      </div>

      {isProcessing && <p className="text-center text-accent">Processing files, please wait...</p>}
      
      {/* Interactive Staging Area */}
      {pages.length > 0 && (
        <>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="pages" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 bg-gray-900 rounded-lg"
              >
                {pages.map((page, index) => (
                  <Draggable key={page.id} draggableId={page.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="relative group"
                      >
                        <img src={page.imgSrc} alt={`Page ${index + 1}`} className="w-full h-auto border-2 border-gray-600 rounded-md" />
                        <button 
                            onClick={() => handleDeletePage(page.id)}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Delete page"
                        >
                          X
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Merge Button */}
        <div className="mt-8 text-center">
            <button 
              onClick={handleMerge}
              className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Merge {pages.length} Pages
            </button>
        </div>
        </>
      )}
    </div>
  );
}