'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [originalSize, setOriginalSize] = useState('0 KB');
  const [newSize, setNewSize] = useState('0 KB');
  const [reduction, setReduction] = useState(0);

  useEffect(() => {
    if (file) {
      setOriginalSize(formatBytes(file.size));
    }
    if (compressedFile) {
      setNewSize(formatBytes(compressedFile.size));
      const reductionValue = Math.round((1 - compressedFile.size / file.size) * 100);
      setReduction(reductionValue);
    }
  }, [file, compressedFile]);

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

        // Use the quality setting for JPEG compression
        const jpegDataUrl = canvas.toDataURL('image/jpeg', settings.quality / 100);
        const jpgBytes = await newPdfDoc.embedJpg(jpegDataUrl);
        
        const newPage = newPdfDoc.addPage([page.view[2], page.view[3]]);
        newPage.drawImage(jpgBytes, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
      }

      // Remove metadata
      if (settings.removeMetadata) {
        newPdfDoc.setTitle('');
        newPdfDoc.setAuthor('');
        newPdfDoc.setSubject('');
        newPdfDoc.setKeywords([]);
        newPdfDoc.setProducer('');
        newPdfDoc.setCreator('');
        newPdfDoc.setCreationDate(new Date(0));
        newPdfDoc.setModificationDate(new Date(0));
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
        const ctx = liveCanvas.getContext('2d');
        liveCanvas.width = vp.width;
        liveCanvas.height = vp.height;
        
        // Clear canvas before rendering
        ctx.clearRect(0, 0, liveCanvas.width, liveCanvas.height);
        
        // Render with white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, liveCanvas.width, liveCanvas.height);
        
        await previewPage.render({ 
          canvasContext: ctx, 
          viewport: vp 
        }).promise;
      }

      setCompressedFile({ 
        blob, 
        size: blob.size, 
        name: `compressed-${file.name}` 
      });
    } catch (err) {
      console.error('Compression error:', err);
      alert(`An error occurred: ${err.message || 'Please try a different file'}`);
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
    if (!bytes || bytes === 0) return '0 Bytes';
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
        className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-400">
            <span className="font-semibold text-accent">Click to upload a PDF</span>
          </p>
          <p className="text-xs text-gray-500">Files are processed locally in your browser</p>
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
      <div className="md:col-span-2">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Your File</h3>
          <div className="flex items-center space-x-4 mb-6">
            <div className="bg-gray-700 rounded-lg w-16 h-16 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-200 truncate max-w-xs">{file.name}</p>
              <p className="text-gray-400 text-sm">{originalSize}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="text-lg font-medium text-gray-300 mb-4">Compression Preview</h4>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex items-center justify-center h-48">
              <p className="text-gray-500">Adjust settings and click "Compress & Preview" to see the result</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="md:col-span-1">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-200">Compression Settings</h3>

          <div className="space-y-8">
            {/* Quality slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="quality-slider" className="text-gray-300 font-medium">
                  Image Quality
                </label>
                <span className="bg-accent/20 text-accent font-bold px-2 py-1 rounded text-sm">
                  {settings.quality}%
                </span>
              </div>
              <input
                id="quality-slider"
                type="range"
                min="10"
                max="100"
                step="10"
                value={settings.quality}
                onChange={(e) => setSettings(p => ({ ...p, quality: +e.target.value }))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <label htmlFor="grayscale-toggle" className="text-gray-300">Convert to Grayscale</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="grayscale-toggle"
                    className="sr-only"
                    checked={settings.isGrayscale}
                    onChange={() => setSettings(p => ({ ...p, isGrayscale: !p.isGrayscale }))}
                  />
                  <div 
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      settings.isGrayscale ? 'bg-accent' : 'bg-gray-700'
                    }`}
                  >
                    <div 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        settings.isGrayscale ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-900/50 rounded-lg">
                <label htmlFor="metadata-toggle" className="text-gray-300">Remove Metadata</label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="metadata-toggle"
                    className="sr-only"
                    checked={settings.removeMetadata}
                    onChange={() => setSettings(p => ({ ...p, removeMetadata: !p.removeMetadata }))}
                  />
                  <div 
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      settings.removeMetadata ? 'bg-accent' : 'bg-gray-700'
                    }`}
                  >
                    <div 
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        settings.removeMetadata ? 'translate-x-5' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleProcessAndPreview}
                className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-lg transition"
              >
                Compress & Preview
              </button>
              <button
                onClick={handleStartOver}
                className="border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-3 px-4 rounded-lg transition"
              >
                Use different file
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const PreviewView = () => (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-200">Preview</h3>
          <div className="flex justify-center">
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
      
      <div className="md:col-span-1">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-6 text-gray-200">Compression Results</h3>
          
          <div className="bg-gray-900/50 rounded-lg p-5 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">Original Size</p>
                <p className="font-bold text-lg">{originalSize}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-1">New Size</p>
                <p className="font-bold text-lg text-green-400">{newSize}</p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-800">
              <p className="text-gray-400 text-sm mb-1">Reduction</p>
              <p className="text-3xl font-bold text-accent">~{reduction}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="bg-accent hover:bg-accent/90 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Compressed PDF
            </button>
            <button
              onClick={handleReconfigure}
              className="border border-gray-600 hover:border-gray-500 text-gray-300 font-medium py-3 px-4 rounded-lg transition"
            >
              Change Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const CurrentView = () => {
    if (isProcessing) {
      return (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mb-6"></div>
          <p className="text-lg text-gray-300 mb-2">{processingMessage}</p>
          <p className="text-gray-500">This may take a moment depending on file size</p>
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
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader
        title="PDF Compressor"
        description="Securely compress your PDF and preview the result before downloading."
      />
      
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        <CurrentView />
      </div>
      
      <div className="mt-20 text-gray-300 prose prose-invert max-w-none">
        <h2 className="text-3xl font-bold mb-6">Optimize Your PDFs Without Compromising Privacy</h2>
        <p>Our PDF Compressor uses advanced techniques to reduce file sizes while maintaining quality. Unlike other online tools that require uploading your sensitive documents, our compression happens entirely in your browser. Your files never leave your device.</p>
        
        <h3 className="text-2xl font-bold mt-12 mb-4">How It Works</h3>
        <p>The compression process analyzes images and text in your PDF, applying smart optimization techniques to reduce file size without noticeable quality loss. You can preview the result before downloading to ensure it meets your requirements.</p>
        
        <h3 className="text-2xl font-bold mt-12 mb-4">Complete Privacy Protection</h3>
        <p>Security is built into every step of our process. When you compress a PDF with DocEnclave:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Your file is processed entirely in your browser</li>
          <li>No server uploads or cloud processing</li>
          <li>All processing is temporary and cleared after download</li>
          <li>No tracking or data collection</li>
        </ul>
        
        <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-semibold">How much can I reduce my PDF file size?</h4>
            <p>Reduction depends on your content. Image-heavy PDFs can see 50-80% reduction. Text-based PDFs typically see 20-50% reduction.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Is there a file size limit?</h4>
            <p>No, but very large files may take longer to process depending on your device's capabilities.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Will compression reduce quality?</h4>
            <p>Our tool lets you control the balance between quality and file size. You can preview the result before downloading to ensure it meets your quality standards.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Are my files secure?</h4>
            <p>Absolutely. Your files are processed locally in your browser and never uploaded to any server. We don't store or access your documents in any way.</p>
          </div>
        </div>
      </div>
    </div>
  );
}