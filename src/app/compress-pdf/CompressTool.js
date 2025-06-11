'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const qualityPresets = [
  { name: 'Recommended', value: 75, description: 'Good balance of size and quality.' },
  { name: 'Strong Compression', value: 50, description: 'Smaller file, noticeable quality reduction.' },
  { name: 'Extreme Compression', value: 25, description: 'Smallest file, significant quality reduction.' },
];

const initialSettings = {
  quality: 75,
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [compressedFile, setCompressedFile] = useState(null); 
  const previewCanvasRef = useRef(null); // This ref is for the canvas in PreviewView

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    event.target.value = null; 
    if (selectedFile && selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setCompressedFile(null);
        setSettings(initialSettings);
    } else if (selectedFile) {
        alert('Please select a valid PDF file.');
    }
  };

  // --- EFFECT TO RENDER PREVIEW OF COMPRESSED FILE ---
  // This runs ONLY when 'compressedFile' (which contains the blob) updates.
  useEffect(() => {
    if (compressedFile && compressedFile.blob && previewCanvasRef.current) {
        const renderPreview = async () => {
            setProcessingMessage('Rendering final preview...'); // Let user know
            setIsProcessing(true);
            try {
                const arrayBuffer = await compressedFile.blob.arrayBuffer();
                const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const page = await pdfDoc.getPage(1);
                const viewport = page.getViewport({ scale: 1.0 }); // Standard scale
                const canvas = previewCanvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
            } catch (e) {
                console.error("Error rendering compressed preview:", e);
                // If preview fails, we still have the compressedFile object for download
            } finally {
                setIsProcessing(false);
                setProcessingMessage('');
            }
        };
        renderPreview();
    }
  }, [compressedFile]); 

  const handleProcessAndPreview = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingMessage('Reconstructing PDF...');
    
    try {
        const newPdfDoc = await PDFDocument.create();
        const fileBuffer = await file.arrayBuffer();
        const sourcePdf = await pdfjs.getDocument({ data: fileBuffer }).promise;

        for (let i = 1; i <= sourcePdf.numPages; i++) {
            setProcessingMessage(`Processing page ${i} of ${sourcePdf.numPages}...`);
            const page = await sourcePdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;
            
            if (settings.isGrayscale) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let j = 0; j < data.length; j += 4) {
                    const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                    data[j] = avg; data[j + 1] = avg; data[j + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
            }

            const jpgImageBytes = await newPdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
            const newPage = newPdfDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(jpgImageBytes, { x: 0, y: 0, width: newPage.getWidth(), height: newPage.getHeight() });
        }
        
        if (settings.removeMetadata) {
            newPdfDoc.setTitle('');
            newPdfDoc.setAuthor('');
        }
        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        // This will trigger the useEffect above to render the preview
        setCompressedFile({
            blob: blob,
            size: blob.size,
            name: `docenclave-compressed-${file.name}`
        });
        
    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this tool.");
        setIsProcessing(false); // Ensure processing is false on error
        setProcessingMessage('');
    }
    // No longer need setIsProcessing(false) here as the useEffect for preview will handle it
  };
  
  const handleDownload = () => {
      if(!compressedFile) return;
      saveAs(compressedFile.blob, compressedFile.name);
      fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };
  
  const handleStartOver = () => {
    setFile(null);
    setCompressedFile(null);
  };
  
  const handleReconfigure = () => {
    setCompressedFile(null);
  };

  const UploadView = () => (
    <label htmlFor="file-upload-compress" className="mb-8 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload PDF</span></p>
            <p className="text-xs text-gray-500">Select a single PDF file to compress</p>
        </div>
        <input id="file-upload-compress" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
    </label>
  );

  const SettingsView = () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-200">Your file is ready.</h3>
              <p className="text-gray-400">Original Name: <span className="font-medium">{file.name}</span></p>
              <p className="text-gray-400">Original Size: <span className="font-bold">{formatBytes(file.size)}</span></p>
              <p className="mt-4 max-w-sm text-gray-500">Select your preferred compression level and options. Click "Compress & Preview" to see the result.</p>
          </div>
          <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Level</h3>
                <div className="space-y-2">
                    {qualityPresets.map(preset => (
                        <button 
                            key={preset.name}
                            onClick={() => setSettings(prev => ({...prev, quality: preset.value}))}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${settings.quality === preset.value ? 'bg-accent border-accent text-white' : 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'}`}
                        >
                            <div className="font-semibold">{preset.name}</div>
                            <div className="text-xs opacity-80">{preset.description}</div>
                        </button>
                    ))}
                </div>
              
              <h3 className="text-xl font-bold border-b border-gray-600 pb-2 pt-4">Advanced Options</h3>
              <div className="space-y-3">
                  <div className="flex items-center justify-between"><label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label><button onClick={() => setSettings(p => ({...p, isGrayscale: !p.isGrayscale}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                  <div className="flex items-center justify-between"><label htmlFor="metadata" className="text-sm text-gray-300">Remove Metadata</label><button onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
              </div>
              <div className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md">Note: Compression makes text non-selectable.</div>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                <button onClick={handleProcessAndPreview} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Compress & Preview</button>
                <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Use a different file</button>
              </div>
          </div>
      </div>
  );

  const PreviewView = () => {
      const reduction = file && compressedFile ? 100 - (compressedFile.size / file.size) * 100 : 0;
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  {/* This canvas will now be drawn by the new useEffect hook */}
                  <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain" />
              </div>
              <div className="md:col-span-1 flex flex-col space-y-6">
                  <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Preview & Download</h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div><p className="text-xs text-gray-400">Original Size</p><p className="font-semibold text-lg line-through">{formatBytes(file.size)}</p></div>
                    <div><p className="text-xs text-gray-400">New Size</p><p className="font-semibold text-lg text-accent">{formatBytes(compressedFile.size)}</p></div>
                  </div>
                  <div className="text-center bg-green-900/40 p-3 rounded-lg"><p className="text-xs text-green-300">Reduction</p><p className="font-bold text-xl text-green-300">~{Math.round(reduction)}%</p></div>
                  <div className="pt-4 border-t border-gray-600 space-y-3">
                    <button onClick={handleDownload} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Download Compressed PDF</button>
                    <button onClick={handleReconfigure} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Change Settings</button>
                  </div>
              </div>
          </div>
      );
  };
  
  const CurrentView = () => {
    if (isProcessing) {
        return <div className="text-center py-20 text-accent">{processingMessage}</div>;
    }
    if (compressedFile) {
        return <PreviewView />;
    }
    if (file) {
        return <SettingsView />;
    }
    return <UploadView />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="PDF Compressor" description="Securely compress your PDF and preview the result before downloading." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        <CurrentView />
      </div>
      {/* SEO Content Block Starts Here */}
      <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
        <h2 className="text-3xl font-bold mb-6">Take Control of Your PDF Size</h2>
        <p>Sending a PDF that's too large for an email attachment is a common frustration. DocEnclave puts the power back in your hands. Our advanced PDF compressor gives you a transparent, two-step process to reduce file size without sacrificing clarity, all with 100% privacy.</p>
        <h3 className="text-2xl font-bold mt-12 mb-4">Configure First, Then Preview</h3>
        <p>Our unique workflow lets you choose your settings first (like image quality and grayscale), then generate a high-quality preview of the compressed result. You'll see the final, accurate file size and quality *before* you download, ensuring you get exactly what you need on the first try. No more guesswork or repeated downloads.</p>
        <h3 className="text-2xl font-bold mt-12 mb-4">Smarter Compression, Total Privacy</h3>
        <p>DocEnclave's compressor is designed to be intelligent. It primarily targets the large images within your PDF for compression. For even greater size savings, you can convert images to grayscale or strip out unnecessary metadata with the flip of a switch. And because this all happens directly in your browser, your sensitive documents are never uploaded to a server. This guarantees 100% privacy and security for your files.</p>
        <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-semibold">How do I reduce the size of my PDF?</h4>
            <p>It's a simple process: 1) Click the upload box and select your PDF. 2) Choose your desired quality and other options like grayscale. 3) Click "Compress & Preview" to see the result and the exact new file size. If you're happy, click "Download".</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Will compressing my PDF reduce its quality?</h4>
            <p>Our method focuses on reducing the quality of images inside the PDF to save space, as this provides the biggest size savings. Text will become part of the page image but will remain sharp. You can use the quality presets to find the perfect balance for your needs.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Is it safe to compress my confidential documents here?</h4>
            <p>Yes, it is the safest way possible. DocEnclave operates entirely within your web browser. Your files are not sent to or stored on any external servers. The entire compression process happens on your own computer, ensuring your data remains completely private and secure.</p>
          </div>
        </div>
      </div>
      {/* SEO Content Block Ends Here */}
    </div>
  );
}