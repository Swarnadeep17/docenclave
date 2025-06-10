'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, PDFName } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

// Configure the worker at the top level
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const initialSettings = {
  imageQuality: 0.75,
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [previewStatus, setPreviewStatus] = useState('idle');

  const previewCanvasRef = useRef(null);
  
  // --- STATE-DRIVEN FILE PROCESSING ---
  useEffect(() => {
    if (!file) return;

    const processFile = async () => {
      setIsProcessing(true);
      setProcessingMessage('Analyzing PDF...');
      setPreviewStatus('generating');
      setSettings(initialSettings);

      try {
        const fileBlob = new Blob([file]);
        
        try {
          const canvas = previewCanvasRef.current;
          if (!canvas) throw new Error("Canvas ref is not ready.");

          const pdfjsBuffer = await fileBlob.arrayBuffer();
          const pdfjsDoc = await pdfjs.getDocument({ data: pdfjsBuffer }).promise;
          const page = await pdfjsDoc.getPage(1);
          const viewport = page.getViewport({ scale: 1.0 });

          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          setPreviewStatus('success');

        } catch (previewError) {
          console.warn("Could not generate PDF preview. Proceeding without it.", previewError);
          setPreviewStatus('failed');
        }

        const estimatedSize = file.size * initialSettings.imageQuality;
        const reduction = 100 - (estimatedSize / file.size) * 100;
        setStats({
          originalSize: file.size,
          estimatedSize: estimatedSize,
          reduction: Math.round(reduction),
        });

      } catch (error) {
        console.error("Fatal error processing file:", error);
        alert("Could not read the uploaded file.");
        setFile(null);
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
      }
    };

    processFile();
  }, [file]);

  // --- DEBOUNCED SETTINGS UPDATE LOGIC ---
  const debounceTimeoutRef = useRef(null);
  const handleSettingChange = useCallback((setting, value) => {
    // Immediately update the visual state
    setSettings(prev => ({ ...prev, [setting]: value }));
    
    // Clear any pending timeout
    if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set a new timeout to run the expensive calculation
    debounceTimeoutRef.current = setTimeout(() => {
        const currentSize = file ? file.size : 0;
        if (!currentSize) return;

        // Use the latest settings from state
        setSettings(latestSettings => {
            let estimatedSize = currentSize * latestSettings.imageQuality;
            if (latestSettings.isGrayscale) {
              estimatedSize *= 0.7;
            }
            const reduction = 100 - (estimatedSize / currentSize) * 100;
            setStats({
              originalSize: currentSize,
              estimatedSize: estimatedSize,
              reduction: Math.round(reduction),
            });
            return latestSettings;
        });
    }, 150); // 150ms debounce delay
  }, [file]);
  
  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('Compressing, please wait...');
    
    try {
        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const imageRefs = new Set();
        
        pdfDoc.getPages().forEach(page => {
            try {
                const resources = page.node.Resources();
                const xobjects = resources?.lookup(PDFName.of('XObject'));
                if (xobjects?.isDict()) {
                    xobjects.entries().forEach(([key, value]) => {
                        if (value.isIndirect() && pdfDoc.context.lookup(value).lookup(PDFName.of('Subtype')) === PDFName.of('Image')) {
                            imageRefs.add(value.toString());
                        }
                    });
                }
            } catch (e) { console.warn("Could not process resources on a page."); }
        });

        const compressedImageMap = new Map();
        for (const ref of imageRefs) {
            const image = pdfDoc.getImage(pdfDoc.context.lookup(ref));
            if (!image) continue;

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const tempImg = new Image();
            tempImg.src = await image.toPng();
            await new Promise(resolve => { tempImg.onload = resolve });

            canvas.width = tempImg.width;
            canvas.height = tempImg.height;
            
            if (settings.isGrayscale) {
                ctx.filter = 'grayscale(100%)';
            }
            ctx.drawImage(tempImg, 0, 0);

            const compressedJpgBytes = await pdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.imageQuality));
            compressedImageMap.set(ref, compressedJpgBytes.ref);
        }

        pdfDoc.getPages().forEach(page => {
            try {
                const resources = page.node.Resources();
                const xobjects = resources?.lookup(PDFName.of('XObject'));
                 if (xobjects?.isDict()) {
                    xobjects.entries().forEach(([key, value]) => {
                        if (value.isIndirect() && compressedImageMap.has(value.toString())) {
                            xobjects.set(key, compressedImageMap.get(value.toString()));
                        }
                    });
                }
            } catch (e) { console.warn("Could not replace image reference on a page."); }
        });
        
        if (settings.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `docenclave-compressed-${file.name}`);
        
        fetch('/api/stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ statToIncrement: 'downloads' }),
        }).catch(err => console.error("Failed to increment download count:", err));

    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex or use a format that is not yet supported by this tool.");
    } finally {
        setIsProcessing(false);
        setProcessingMessage('');
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(acceptedFiles => {
        const uploadedFile = acceptedFiles[0];
        if (uploadedFile && uploadedFile.type.includes('pdf')) {
          setFile(uploadedFile);
        } else {
          alert("Please upload a valid PDF file.");
        }
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
    setPreviewStatus('idle');
  };
  
  const PreviewArea = () => (
    <>
        {/* The canvas is now always in the DOM but hidden until success. This fixes the ref bug. */}
        <canvas 
            ref={previewCanvasRef} 
            className="max-w-full max-h-full object-contain"
            style={{ display: previewStatus === 'success' ? 'block' : 'none' }}
        ></canvas>
        {previewStatus === 'generating' && <p className="text-accent">Generating Preview...</p>}
        {previewStatus === 'failed' && <p className="text-yellow-400">Preview not available for this document.</p>}
    </>
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader
        title="Advanced PDF Compressor"
        description="Fine-tune compression settings with a real-time preview of quality and file size."
      />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        {!file ? (
          <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">{isDragActive ? 'Drop it here!' : 'Click to upload or drag & drop'}</span></p>
          </div>
        ) : (
          isProcessing ? (
            <div className="text-center py-20 text-accent">{processingMessage}</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              <PreviewArea />
            </div>
            <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                  <div><p className="text-xs text-gray-400">Original</p><p className="font-semibold text-lg">{formatBytes(stats.originalSize)}</p></div>
                  <div><p className="text-xs text-gray-400">Estimated</p><p className="font-semibold text-lg text-accent">{formatBytes(stats.estimatedSize)}</p></div>
                  <div><p className="text-xs text-gray-400">Reduction</p><p className="font-semibold text-lg text-green-400">~{stats.reduction}%</p></div>
              </div>
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1">Image Quality</label>
                <input 
                  id="quality" type="range" min="0.1" max="1" step="0.01"
                  value={settings.imageQuality}
                  onChange={(e) => handleSettingChange('imageQuality', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Lower</span>
                    <span className="font-bold text-accent">{Math.round(settings.imageQuality * 100)}%</span>
                    <span>Higher</span>
                </div>
              </div>
              <div className="space-y-3">
                  <div className="flex items-center justify-between"><label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label><button onClick={() => handleSettingChange('isGrayscale', !settings.isGrayscale)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                  <div className="flex items-center justify-between"><label htmlFor="metadata" className="text-sm text-gray-300">Basic Optimization</label><button onClick={() => handleSettingChange('removeMetadata', !settings.removeMetadata)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
              </div>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                  <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">{isProcessing ? processingMessage : 'Compress PDF'}</button>
                  <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Use a different file</button>
              </div>
            </div>
          </div>
          )
        )}
      </div>
    </div>
  );
}