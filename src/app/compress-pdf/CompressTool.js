'use client';

import React, { useState, useEffect } from 'react'; import { PDFDocument } from 'pdf-lib'; import * as pdfjsLib from 'pdfjs-dist'; import { saveAs } from 'file-saver'; import ToolPageHeader from '@/components/ToolPageHeader';

pdfjsLib.GlobalWorkerOptions.workerSrc = //cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js;

export default function CompressTool() { const [file, setFile] = useState(null); const [previews, setPreviews] = useState([]); const [metadata, setMetadata] = useState({}); const [view, setView] = useState('preview'); // 'preview' or 'metadata' const [settings, setSettings] = useState({ isGrayscale: false, quality: 0.7 }); const [isProcessing, setIsProcessing] = useState(false); const [compressedBlob, setCompressedBlob] = useState(null);

// Load PDF, generate previews & metadata useEffect(() => { if (!file) { setPreviews([]); setMetadata({}); return; } const load = async () => { setIsProcessing(true); const buffer = await file.arrayBuffer();

// Metadata
  try {
    const pdfDoc = await PDFDocument.load(buffer);
    setMetadata({
      title: pdfDoc.getTitle() || 'N/A',
      author: pdfDoc.getAuthor() || 'N/A',
      pageCount: pdfDoc.getPageCount(),
      creationDate: pdfDoc.getCreationDate()?.toString() || 'N/A',
      modificationDate: pdfDoc.getModificationDate()?.toString() || 'N/A',
    });
  } catch {
    setMetadata({});
  }

  // Previews
  const loading = pdfjsLib.getDocument({ data: buffer });
  const pdf = await loading.promise;
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push(canvas.toDataURL());
  }
  setPreviews(pages);
  setIsProcessing(false);
};
load();

}, [file]);

const handleFileChange = (e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); };

const compress = async () => { if (!file) return; setIsProcessing(true); const buffer = await file.arrayBuffer(); const loading = pdfjsLib.getDocument({ data: buffer }); const pdf = await loading.promise; const newPdf = await PDFDocument.create(); for (let i = 1; i <= pdf.numPages; i++) { const page = await pdf.getPage(i); const viewport = page.getViewport({ scale: 1.5 }); const canvas = document.createElement('canvas'); canvas.width = viewport.width; canvas.height = viewport.height; const ctx = canvas.getContext('2d'); await page.render({ canvasContext: ctx, viewport }).promise;

let dataUrl = canvas.toDataURL('image/jpeg', settings.quality);
  if (settings.isGrayscale) {
    const img = new Image();
    img.src = dataUrl;
    await new Promise(res => img.onload = res);
    const gCanvas = document.createElement('canvas');
    gCanvas.width = canvas.width;
    gCanvas.height = canvas.height;
    const gCtx = gCanvas.getContext('2d');
    gCtx.drawImage(img, 0, 0);
    const imgData = gCtx.getImageData(0, 0, gCanvas.width, gCanvas.height);
    for (let j = 0; j < imgData.data.length; j += 4) {
      const avg = (imgData.data[j] + imgData.data[j+1] + imgData.data[j+2]) / 3;
      imgData.data[j] = imgData.data[j+1] = imgData.data[j+2] = avg;
    }
    gCtx.putImageData(imgData, 0, 0);
    dataUrl = gCanvas.toDataURL('image/jpeg', settings.quality);
  }

  const bytes = await fetch(dataUrl).then(r => r.arrayBuffer());
  const imgEmbed = await newPdf.embedJpg(bytes);
  const dims = imgEmbed.scale(1);
  newPdf.addPage([dims.width, dims.height]).drawImage(imgEmbed, { x: 0, y: 0, width: dims.width, height: dims.height });
}

const outBytes = await newPdf.save();
const blob = new Blob([outBytes], { type: 'application/pdf' });
setCompressedBlob(blob);
setIsProcessing(false);

};

return ( <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8"> <ToolPageHeader title="PDF Compressor" description="Preview, metadata & advanced compression exactly like the merger tool." /> <div className="bg-card-bg border border-gray-700 rounded-lg p-8"> <label htmlFor="pdf-upload" className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors"> <div className="pt-5 pb-6 flex flex-col items-center"> <svg className="w-8 h-8 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Select PDF file</span></p> <p className="text-xs text-gray-500">Only .pdf files supported</p> </div> <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} /> </label>

{file && (
      <>
        <div className="mb-6 flex space-x-4">
          <button onClick={() => setView('preview')} className={`px-4 py-2 rounded ${view === 'preview' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'}`}>Preview</button>
          <button onClick={() => setView('metadata')} className={`px-4 py-2 rounded ${view === 'metadata' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-300'}`}>Metadata</button>
        </div>

        {view === 'preview' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {previews.map((src, idx) => (
              <img key={idx} src={src} alt={`Page ${idx+1}`} className={`border rounded ${settings.isGrayscale ? 'filter grayscale' : ''}`} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-900 p-4 rounded grid gap-2">
            {Object.entries(metadata).map(([k,v]) => (
              <div key={k} className="text-gray-300"><strong>{k}:</strong> {v}</div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <p className="text-sm text-gray-400 mb-2">Compression Settings</p>
            <div className="flex items-center mb-4">
              <label className="mr-2 text-gray-300">Grayscale</label>
              <input type="checkbox" checked={settings.isGrayscale} onChange={() => setSettings(s => ({ ...s, isGrayscale: !s.isGrayscale }))} />
            </div>
            <label className="block text-gray-300 mb-1">Image Quality: {Math.round(settings.quality * 100)}%</label>
            <input type="range" min="0.1" max="1" step="0.1" value={settings.quality} onChange={e => setSettings(s => ({ ...s, quality: parseFloat(e.target.value) }))} className="w-full" />
          </div>
          <div className="md:col-span-1 flex flex-col space-y-4">
            <button onClick={compress} disabled={isProcessing} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">
              {isProcessing ? 'Processing...' : 'Compress & Download'}
            </button>
            {compressedBlob && (
              <a href={URL.createObjectURL(compressedBlob)} download={`compressed-${file.name}`} onClick={() => fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) })} className="w-full text-center text-gray-400 hover:underline">
                Download Compressed PDF
              </a>
            )}
          </div>
        </div>
      </>
    )}
  </div>
</div>

); }

