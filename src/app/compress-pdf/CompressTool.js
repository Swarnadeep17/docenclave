'use client';

import { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

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
  
  // State to hold the final compressed file data
  const [compressedFile, setCompressedFile] = useState(null); 
  const previewCanvasRef = useRef(null);

  const handleProcess = async () => {
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
            const viewport = page.getViewport({ scale: 2.0 }); // High quality for reconstruction
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
        
        setProcessingMessage('Saving file...');
        if (settings.removeMetadata) {
            newPdfDoc.setTitle('');
            newPdfDoc.setAuthor('');
        }
        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });

        // --- RENDER PREVIEW OF THE FINAL FILE ---
        const previewPdfDoc = await pdfjs.getDocument({data: pdfBytes.slice(0)}).promise;
        const previewPage = await previewPdfDoc.getPage(1);
        const previewViewport = previewPage.getViewport({scale: 1.5});
        const liveCanvas = previewCanvasRef.current;
        if(liveCanvas) {
            liveCanvas.height = previewViewport.height;
            liveCanvas.width = previewViewport.width;
            await previewPage.render({canvasContext: liveCanvas.getContext('2d'), viewport: previewViewport}).promise;
        }

        setCompressedFile({
            blob: blob,
            size: blob.size,
            name: `docenclave-compressed-${file.name}`
        });
        
    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this tool.");
    } finally {
        setIsProcessing(false);
        setProcessingMessage('');
    }
  };
  
  const handleDownload = () => {
      if(!compressedFile) return;
      saveAs(compressedFile.blob, compressedFile.name);
      // Increment download stat
      fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(acceptedFiles => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile && uploadedFile.type.includes('pdf')) setFile(uploadedFile);
        else alert("Please upload a valid PDF file.");
    }, []),
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });

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

  // --- UI COMPONENTS ---
  const UploadView = () => (
    <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-accent' : 'border-gray-500'}`}>
        <input {...getInputProps()} />
        <p>Drag & drop or click to upload PDF</p>
    </div>
  );

  const SettingsView = () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px]">
              <h3 className="text-2xl font-semibold mb-4">Your file is ready to be compressed.</h3>
              <p className="text-gray-400">Original Size: {formatBytes(file.size)}</p>
              <p className="mt-4 text-center">Choose your settings on the right, then click "Compress & Preview".</p>
          </div>
          <div className="md:col-span-1 flex flex-col space-y-6">
              <h3>Compression Settings</h3>
              <div>
                  <label>Image Quality</label>
                  <input type="range" min="1" max="100" value={settings.quality} onChange={e => setSettings(p => ({...p, quality: parseInt(e.target.value)}))} />
                  <span>{settings.quality}%</span>
              </div>
              <div><label>Convert to Grayscale</label><button onClick={() => setSettings(p => ({...p, isGrayscale: !p.isGrayscale}))}>{settings.isGrayscale ? 'ON' : 'OFF'}</button></div>
              <div><label>Basic Optimization</label><button onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))}>{settings.removeMetadata ? 'ON' : 'OFF'}</button></div>
              <div>Note: Compression makes text non-selectable.</div>
              <div className="pt-4">
                  <button onClick={handleProcess}>Compress & Preview</button>
                  <button onClick={handleStartOver}>Use a different file</button>
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
                  <h3>Preview & Download</h3>
                  <div>Original: {formatBytes(file.size)}</div>
                  <div>New Size: {formatBytes(compressedFile.size)}</div>
                  <div>Reduction: ~{Math.round(reduction)}%</div>
                  <button onClick={handleDownload}>Download</button>
                  <button onClick={handleReconfigure}>Change Settings</button>
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
    </div>
  );
}