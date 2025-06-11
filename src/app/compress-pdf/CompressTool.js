'use client';

import { useState, useEffect, useRef, useCallback } from 'react'; import { PDFDocument } from 'pdf-lib'; import * as pdfjsLib from 'pdfjs-dist/build/pdf'; import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'; import { useDropzone } from 'react-dropzone'; import { saveAs } from 'file-saver'; import ToolPageHeader from '@/components/ToolPageHeader';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const qualityPresets = [ { name: 'Recommended', value: 75, description: 'Good balance of size and quality.' }, { name: 'Strong Compression', value: 50, description: 'Smaller file, noticeable quality reduction.' }, { name: 'Extreme Compression', value: 25, description: 'Smallest file, significant quality reduction.' }, ];

const initialSettings = { quality: 75, isGrayscale: false, removeMetadata: true, };

export default function CompressTool() { const [file, setFile] = useState(null); const [settings, setSettings] = useState(initialSettings); const [isProcessing, setIsProcessing] = useState(false); const [processingMessage, setProcessingMessage] = useState(''); const [previewPages, setPreviewPages] = useState([]); // array of data URLs const [metadata, setMetadata] = useState(null); const canvasRefs = useRef([]);

// --- Generate Multi-Page Preview & Extract Metadata --- useEffect(() => { if (!file) { setPreviewPages([]); setMetadata(null); return; }

const generatePreviewsAndMetadata = async () => {
  setIsProcessing(true);
  setProcessingMessage('Loading PDF...');

  // Load metadata via pdf-lib
  const arrayBuffer = await file.arrayBuffer();
  const metaDoc = await PDFDocument.load(arrayBuffer);
  setMetadata({
    title: metaDoc.getTitle(),
    author: metaDoc.getAuthor(),
    subject: metaDoc.getSubject(),
    keywords: metaDoc.getKeywords(),
    creator: metaDoc.getCreator(),
    producer: metaDoc.getProducer(),
    creationDate: metaDoc.getCreationDate(),
    modificationDate: metaDoc.getModificationDate(),
  });

  // Render pages via pdfjs
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const previews = [];

  for (let i = 1; i <= pageCount; i++) {
    setProcessingMessage(`Rendering page ${i}/${pageCount}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.0 });
    
    // Use offscreen canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Apply grayscale if needed
    if (settings.isGrayscale) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let j = 0; j < imgData.data.length; j += 4) {
        const avg = (imgData.data[j] + imgData.data[j+1] + imgData.data[j+2]) / 3;
        imgData.data[j] = imgData.data[j+1] = imgData.data[j+2] = avg;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    previews.push(canvas.toDataURL('image/png'));
  }

  setPreviewPages(previews);
  setIsProcessing(false);
  setProcessingMessage('');
};

generatePreviewsAndMetadata();

}, [file, settings.isGrayscale]);

// --- Compression via Page Rasterization --- const handleCompress = async () => { if (!file) return; setIsProcessing(true);

try {
  const arrayBuffer = await file.arrayBuffer();
  // Load original via pdfjs
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const newPdf = await PDFDocument.create();
  const pageCount = pdf.numPages;

  for (let i = 1; i <= pageCount; i++) {
    setProcessingMessage(`Compressing page ${i}/${pageCount}...`);
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Grayscale again if required
    if (settings.isGrayscale) {
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let j = 0; j < imgData.data.length; j += 4) {
        const avg = (imgData.data[j] + imgData.data[j+1] + imgData.data[j+2]) / 3;
        imgData.data[j] = imgData.data[j+1] = imgData.data[j+2] = avg;
      }
      ctx.putImageData(imgData, 0, 0);
    }

    // Embed as JPEG
    const dataUrl = canvas.toDataURL('image/jpeg', settings.quality / 100);
    const imgBytes = await fetch(dataUrl).then(res => res.arrayBuffer());
    const embedded = await newPdf.embedJpg(imgBytes);
    const dims = embedded.scale(1);

    const newPage = newPdf.addPage([viewport.width, viewport.height]);
    newPage.drawImage(embedded, { x: 0, y: 0, width: viewport.width, height: viewport.height });
  }

  // Remove metadata if opted
  if (settings.removeMetadata) {
    newPdf.setTitle('');
    newPdf.setAuthor('');
    newPdf.setSubject('');
    newPdf.setProducer('');
    newPdf.setCreator('');
  }

  setProcessingMessage('Saving compressed PDF...');
  const pdfBytes = await newPdf.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  saveAs(blob, `compressed-${file.name}`);

  // ping stats
  fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
} catch (err) {
  console.error('Compression failed:', err);
  alert('An error occurred. The PDF might be too complex.');
} finally {
  setIsProcessing(false);
  setProcessingMessage('');
}

};

const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: useCallback(accepted => { const f = accepted[0]; if (f && f.type === 'application/pdf') setFile(f); else alert('Please upload a PDF.'); }, []), accept: { 'application/pdf': ['.pdf'] }, multiple: false, });

return ( <div className="w-full max-w-6xl mx-auto py-24 px-4"> <ToolPageHeader title="PDF Compressor" description="Optimize your PDF: preview, metadata & compression." /> <div className="bg-card-bg border border-gray-700 rounded-lg p-8"> {!file ? ( <div {...getRootProps()} className={flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}}> <input {...getInputProps()} /> <p className="text-accent">{isDragActive ? 'Drop PDF here' : 'Click or drag PDF here'}</p> </div> ) : ( <div className="space-y-6"> {/* Preview & Metadata toggles /} <div className="flex space-x-4"> <button onClick={() => setView('preview')} className="px-4 py-2 bg-gray-700 rounded">Preview</button> <button onClick={() => setView('metadata')} className="px-4 py-2 bg-gray-700 rounded">Metadata</button> </div> {view === 'preview' ? ( <div className="grid gap-4"> {previewPages.map((src, idx) => ( <img key={idx} src={src} alt={Page ${idx+1}} className="border rounded" /> ))} </div> ) : ( metadata && ( <div className="bg-gray-900 p-4 rounded"> {Object.entries(metadata).map(([k,v]) => ( <div key={k} className="text-gray-300"><strong>{k}:</strong> {v ? v.toString() : 'N/A'}</div> ))} </div> ) )} {/ Compression Settings & Action */} <div className="pt-6 border-t border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-8"> <div className="md:col-span-2"> <p className="text-sm text-gray-400">Choose quality and options, then compress & download.</p> </div> <div className="md:col-span-1 space-y-4"> {qualityPresets.map(p => ( <button key={p.name} onClick={() => setSettings(s => ({ ...s, quality: p.value }))} className={w-full p-3 rounded border ${settings.quality===p.value? 'bg-accent border-accent':'border-gray-600'}}>{p.name}</button> ))} <div className="flex justify-between"> <span>Grayscale</span> <input type="checkbox" checked={settings.isGrayscale} onChange={() => setSettings(s=>({ ...s, isGrayscale: !s.isGrayscale }))} /> </div> <div className="flex justify-between"> <span>Remove Metadata</span> <input type="checkbox" checked={settings.removeMetadata} onChange={() => setSettings(s=>({ ...s, removeMetadata: !s.removeMetadata }))} /> </div> <button onClick={handleCompress} disabled={isProcessing} className="w-full py-2 bg-accent rounded text-white"> {isProcessing ? processingMessage : 'Compress & Download'} </button> </div> </div> </div> )} </div> </div> ); }

