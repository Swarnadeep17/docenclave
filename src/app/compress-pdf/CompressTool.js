'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone'; // Re-added this import
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
  const previewCanvasRef = useRef(null);

  // --- onDrop for react-dropzone ---
  const onDrop = useCallback((acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setCompressedFile(null); 
        setSettings(initialSettings); 
    } else if (selectedFile) {
        alert('Please select a valid PDF file.');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

  useEffect(() => {
    if (compressedFile && compressedFile.blob && previewCanvasRef.current) {
        const renderPreview = async () => {
            setIsProcessing(true); 
            setProcessingMessage('Rendering final preview...');
            try {
                const arrayBuffer = await compressedFile.blob.arrayBuffer();
                const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const page = await pdfDoc.getPage(1);
                const viewport = page.getViewport({ scale: 1.0 });
                const canvas = previewCanvasRef.current;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
            } catch (e) {
                console.error("Error rendering compressed preview:", e);
            } finally {
                setIsProcessing(false);
                setProcessingMessage('');
            }
        };
        renderPreview();
    } else if (!compressedFile && file && previewCanvasRef.current) { 
        // Clear canvas if we go back to settings or upload new file
        const canvas = previewCanvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, [compressedFile, file]);

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
            await new Promise(resolve => setTimeout(resolve, 0));

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
        
        setCompressedFile({
            blob: blob,
            size: blob.size,
            name: `docenclave-compressed-${file.name}`
        });
        
    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this tool.");
        setIsProcessing(false);
        setProcessingMessage('');
    }
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
    <div {...getRootProps()} className={`mb-8 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}`}>
        <input {...getInputProps()} />
        <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">{isDragActive ? 'Drop PDF here' : 'Click to upload or drag & drop'}</span></p>
        <p className="text-xs text-gray-500">Select a single PDF file</p>
    </div>
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
      {/* SEO Content Block will be added once this is perfect */}
    </div>
  );
}