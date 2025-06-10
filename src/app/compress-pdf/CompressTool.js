'use client';

import { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
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
  const [compressedFile, setCompressedFile] = useState(null);
  const [previewDimensions, setPreviewDimensions] = useState({ width: 0, height: 0 });
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setCompressedFile(null);
      setSettings(initialSettings);
    } else if (selectedFile) {
      alert('Please select a valid PDF file.');
    }
  };

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
          const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
          for (let j = 0; j < img.data.length; j += 4) {
            const avg = (img.data[j] + img.data[j + 1] + img.data[j + 2]) / 3;
            img.data[j] = img.data[j + 1] = img.data[j + 2] = avg;
          }
          ctx.putImageData(img, 0, 0);
        }

        const jpgBytes = await newPdfDoc.embedJpg(
          canvas.toDataURL('image/jpeg', settings.quality / 100)
        );
        const newPage = newPdfDoc.addPage([page.view[2], page.view[3]]);
        newPage.drawImage(jpgBytes, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }

      if (settings.removeMetadata) {
        newPdfDoc.setTitle('').setAuthor('');
      }

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });

      setProcessingMessage('Rendering final preview...');
      const previewPdf = await pdfjs.getDocument({ data: pdfBytes }).promise;
      const previewPage = await previewPdf.getPage(1);
      const vp = previewPage.getViewport({ scale: 1.0 });
      
      // Save dimensions for responsive rendering
      setPreviewDimensions({
        width: vp.width,
        height: vp.height
      });

      const liveCanvas = previewCanvasRef.current;
      if (liveCanvas) {
        liveCanvas.width = vp.width;
        liveCanvas.height = vp.height;
        await previewPage.render({ 
          canvasContext: liveCanvas.getContext('2d'), 
          viewport: vp 
        }).promise;
      }

      setCompressedFile({ 
        blob, 
        size: blob.size, 
        name: `compressed-${file.name}` 
      });
    } catch (err) {
      console.error(err);
      alert('An error occurred during compression.');
    } finally {
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    saveAs(compressedFile.blob, compressedFile.name);
    fetch('/api/stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statToIncrement: 'downloads' }),
    });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${['Bytes','KB','MB','GB'][i]}`;
  };

  const handleStartOver = () => {
    setFile(null);
    setCompressedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReconfigure = () => {
    setCompressedFile(null);
  };

  const UploadView = () => (
    <div className="flex flex-col items-center justify-center w-full">
      <label 
        htmlFor="file-upload" 
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-gray-600 transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">PDF only</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          accept=".pdf" 
          onChange={handleFileChange} 
          className="hidden" 
          ref={fileInputRef}
        />
      </label>
    </div>
  );

  const SettingsView = () => (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 ...">
        <h3 className="text-xl font-semibold mb-2">Your file is ready</h3>
        <p className="text-gray-300 mb-1">
          <span className="font-medium">Original:</span> {file.name}
        </p>
        <p className="text-gray-300 mb-4">
          <span className="font-medium">Size:</span> {formatBytes(file.size)}
        </p>
        <p className="text-gray-400">Adjust quality below then click "Compress & Preview"</p>
      </div>
      <div className="md:col-span-1 space-y-6">
        <h3 className="text-xl font-semibold">Compression Settings</h3>

        {/* Quality slider */}
        <div className="space-y-2">
          <label htmlFor="quality-slider" className="block text-sm font-medium">
            Image Quality: <strong>{settings.quality}%</strong>
          </label>
          <input
            id="quality-slider"
            type="range"
            min="10"
            max="100"
            step="10"
            value={settings.quality}
            onChange={(e) => setSettings(p => ({ ...p, quality: +e.target.value }))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 px-1">
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="grayscale-toggle" className="text-sm font-medium">Grayscale</label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="grayscale-toggle"
                className="sr-only"
                checked={settings.isGrayscale}
                onChange={() => setSettings(p => ({ ...p, isGrayscale: !p.isGrayscale }))}
              />
              <div 
                className={`block w-10 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.isGrayscale ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onClick={() => setSettings(p => ({ ...p, isGrayscale: !p.isGrayscale }))}
              >
                <div 
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.isGrayscale ? 'translate-x-4' : ''
                  }`}
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label htmlFor="metadata-toggle" className="text-sm font-medium">Remove Metadata</label>
            <div className="relative inline-block w-10 align-middle select-none">
              <input 
                type="checkbox" 
                id="metadata-toggle"
                className="sr-only"
                checked={settings.removeMetadata}
                onChange={() => setSettings(p => ({ ...p, removeMetadata: !p.removeMetadata }))}
              />
              <div 
                className={`block w-10 h-6 rounded-full cursor-pointer transition-colors ${
                  settings.removeMetadata ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                onClick={() => setSettings(p => ({ ...p, removeMetadata: !p.removeMetadata }))}
              >
                <div 
                  className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    settings.removeMetadata ? 'translate-x-4' : ''
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <button
            onClick={handleProcessAndPreview}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition"
          >
            Compress & Preview
          </button>
          <button
            onClick={handleStartOver}
            className="border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-2.5 px-4 rounded transition"
          >
            Use different file
          </button>
        </div>
      </div>
    </div>
  );

  const PreviewView = () => {
    const reduction = file && compressedFile
      ? Math.round((1 - compressedFile.size / file.size) * 100)
      : 0;

    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900">
            <h3 className="text-sm font-medium px-4 py-2 bg-gray-800 border-b border-gray-700">Preview</h3>
            <div className="p-4 flex justify-center">
              <div 
                className="border border-gray-700 rounded bg-white overflow-auto max-h-[500px]"
                style={{
                  width: '100%',
                  aspectRatio: previewDimensions.width && previewDimensions.height 
                    ? `${previewDimensions.width} / ${previewDimensions.height}`
                    : '16/9'
                }}
              >
                <canvas 
                  ref={previewCanvasRef} 
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="md:col-span-1 space-y-6">
          <h3 className="text-xl font-semibold">Preview & Download</h3>
          
          <div className="bg-gray-800 rounded-lg p-4">
            <table className="w-full mb-2">
              <thead>
                <tr className="text-left text-sm text-gray-400">
                  <th>Original Size</th>
                  <th>New Size</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="font-bold text-lg py-1">{formatBytes(file.size)}</td>
                  <td className="font-bold text-lg py-1">{formatBytes(compressedFile.size)}</td>
                </tr>
              </tbody>
            </table>
            
            <div className="pt-3 text-center">
              <p className="text-gray-400 text-sm">Reduction</p>
              <p className="text-2xl font-bold">~{reduction}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded transition"
            >
              Download Compressed PDF
            </button>
            <button
              onClick={handleReconfigure}
              className="border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-2.5 px-4 rounded transition"
            >
              Change Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CurrentView = () => {
    if (isProcessing) {
      return (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-lg">{processingMessage}</p>
          <p className="text-sm text-gray-400 mt-2">This may take a moment depending on file size</p>
        </div>
      );
    }
    
    if (compressedFile) {
      return <PreviewView />;
    }
    
    if (file) {
      return <SettingsView />;
    }
    
    return <UploadView />;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <ToolPageHeader
        title="PDF Compressor"
        description="Securely compress your PDF and preview the result before downloading."
      />
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
        <CurrentView />
      </div>
    </div>
  );
}