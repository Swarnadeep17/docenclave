'use client';

import { useState, useRef, useEffect } from 'react'; import { PDFDocument } from 'pdf-lib'; import * as pdfjs from 'pdfjs-dist'; import ToolPageHeader from '@/components/ToolPageHeader'; import { saveAs } from 'file-saver';

pdfjs.GlobalWorkerOptions.workerSrc = //cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js;

export default function CompressTool() { const [pages, setPages] = useState([]);                // Data URLs of pages for preview const [isProcessing, setIsProcessing] = useState(false); // Processing state const [fileData, setFileData] = useState(null);         // ArrayBuffer of uploaded PDF const [originalName, setOriginalName] = useState('');   // Original filename const [compressedUrl, setCompressedUrl] = useState(null); const [previewPages, setPreviewPages] = useState([]);    // Previews for each setting change const [currentPage, setCurrentPage] = useState(1); const [quality, setQuality] = useState(60); const [grayscale, setGrayscale] = useState(false); const [removeMetadata, setRemoveMetadata] = useState(false);

// Handle file upload and initial preview const handleFileChange = async (event) => { const file = event.target.files?.[0]; if (!file || file.type !== 'application/pdf') return; event.target.value = null; setIsProcessing(true); setOriginalName(file.name); const arrayBuffer = await file.arrayBuffer(); setFileData(arrayBuffer);

// Render previews for first load
await renderPreviews(arrayBuffer, quality, grayscale);
setIsProcessing(false);

};

// Render pages into data URLs with given settings const renderPreviews = async (data, qualityVal, gray, removeMeta) => { const pdf = await pdfjs.getDocument({ data }).promise; const total = Math.min(pdf.numPages, 50); const previews = []; for (let i = 1; i <= total; i++) { const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 1 }); const canvas = document.createElement('canvas'); const ctx = canvas.getContext('2d'); canvas.width = viewport.width; canvas.height = viewport.height; await page.render({ canvasContext: ctx, viewport }).promise; if (gray) { const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height); const d = imgData.data; for (let j = 0; j < d.length; j += 4) { const avg = (d[j] + d[j+1] + d[j+2]) / 3; d[j] = d[j+1] = d[j+2] = avg; } ctx.putImageData(imgData, 0, 0); } const dataUrl = canvas.toDataURL('image/jpeg', qualityVal/100); previews.push(dataUrl); } setPreviewPages(previews); setPages(previews); setCurrentPage(1); };

// Update preview when settings change useEffect(() => { if (!fileData) return; setIsProcessing(true); renderPreviews(fileData, quality, grayscale, removeMetadata) .then(() => setIsProcessing(false)); }, [quality, grayscale, removeMetadata]);

// Compress and download PDF const handleCompress = async () => { if (!fileData) return; setIsProcessing(true); const srcPdf = await pdfjs.getDocument({ data: fileData }).promise; const total = Math.min(srcPdf.numPages, 50); const newPdf = await PDFDocument.create();

for (let i = 1; i <= total; i++) {
  const page = await srcPdf.getPage(i);
  const viewport = page.getViewport({ scale: 1 });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;

  if (grayscale) {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = imgData.data;
    for (let j = 0; j < d.length; j += 4) {
      const avg = (d[j] + d[j+1] + d[j+2]) / 3;
      d[j] = d[j+1] = d[j+2] = avg;
    }
    ctx.putImageData(imgData, 0, 0);
  }

  const jpg = canvas.toDataURL('image/jpeg', quality/100);
  const img = await newPdf.embedJpg(jpg);
  const dims = img.scale(1);
  const pg = newPdf.addPage([dims.width, dims.height]);
  pg.drawImage(img, { x:0, y:0, width: dims.width, height: dims.height });
}

if (removeMetadata) {
  newPdf.setTitle(''); newPdf.setAuthor(''); newPdf.setSubject(''); newPdf.setProducer('');
}

const bytes = await newPdf.save();
const blob = new Blob([bytes], { type: 'application/pdf' });
const name = `compressed_${originalName}`;
saveAs(blob, name);
setIsProcessing(false);

};

return ( <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8"> <ToolPageHeader
title="Advanced PDF Compressor"
description="Upload, adjust quality, preview pages, and download your compressed PDF with full privacy."
/> <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8"> {!pages.length && !isProcessing && ( <label htmlFor="file-upload" className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors"> <div className="flex flex-col items-center justify-center pt-5 pb-6"> <svg className="w-8 h-8 mb-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16" aria-hidden="true"> <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/> </svg> <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload PDF</span></p> <p className="text-xs text-gray-500">Max 50 pages</p> </div> <input id="file-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} /> </label> )}

{isProcessing && <p className="text-center text-accent my-8">Processing, please wait...</p>}

    {!!pages.length && (
      <>
        {/* Slider & Toggles */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Quality: <span className="font-semibold">{quality}%</span></label>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={grayscale} onChange={() => setGrayscale(!grayscale)} />
            Grayscale
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={removeMetadata} onChange={() => setRemoveMetadata(!removeMetadata)} />
            Remove Metadata
          </label>
        </div>

        {/* Preview pagination */}
        <div className="mb-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 bg-gray-900/50 rounded-lg overflow-x-auto">
            {previewPages.map((src, idx) => (
              <div key={idx} className="relative group aspect-[7/10]">
                <img src={src} alt={`Page ${idx+1}`} className="w-full h-full object-contain border-2 rounded-md border-gray-600 transition-colors" />
                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tr-md rounded-bl-md">{idx+1}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-center items-center gap-4 mt-2">
            <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage===1} className="px-3 py-1 rounded bg-gray-200">Prev</button>
            <span className="text-sm text-gray-200">Page {currentPage} of {previewPages.length}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p+1, previewPages.length))} disabled={currentPage===previewPages.length} className="px-3 py-1 rounded bg-gray-200">Next</button>
          </div>
        </div>

        {/* Download Button */}
        <div className="text-center">
          <button onClick={handleCompress} disabled={isProcessing} className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">
            {isProcessing ? 'Compressing…' : 'Download Compressed PDF'}
          </button>
        </div>
      </>
    )}

  </div>
</div>

); }

