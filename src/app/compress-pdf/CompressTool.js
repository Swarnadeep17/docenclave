'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const initialSettings = {
  quality: 75, // Now a 1-100 scale
  isGrayscale: false,
};

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [previewStatus, setPreviewStatus] = useState('idle');

  const previewCanvasRef = useRef(null);
  const originalPreviewDataUrl = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // --- SINGLE, UNIFIED useEffect FOR ALL POST-UPLOAD PROCESSING ---
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

          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const context = canvas.getContext('2d');
          await page.render({ canvasContext: context, viewport }).promise;
          
          originalPreviewDataUrl.current = canvas.toDataURL();
          setPreviewStatus('success');
        } catch (previewError) {
          console.warn("Could not generate PDF preview. Proceeding without it.", previewError);
          setPreviewStatus('failed');
        }

        const estimatedSize = file.size * (initialSettings.quality / 100);
        const reduction = 100 - (estimatedSize / file.size) * 100;
        setStats({ originalSize: file.size, estimatedSize, reduction: Math.round(reduction) });

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

  // --- SINGLE, UNIFIED useEffect FOR UPDATING PREVIEW AND STATS ---
  useEffect(() => {
    if (!file) return;

    // Redraw the preview canvas immediately when settings change
    if (previewStatus === 'success' && previewCanvasRef.current && originalPreviewDataUrl.current) {
        const canvas = previewCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.filter = settings.isGrayscale ? 'grayscale(100%)' : 'none';
            ctx.drawImage(img, 0, 0);
        };
        img.src = originalPreviewDataUrl.current;
    }

    // Debounce the statistics calculation for performance
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = setTimeout(() => {
      setStats(prevStats => {
        const originalSize = prevStats.originalSize;
        let estimatedSize = originalSize * (settings.quality / 100);
        if (settings.isGrayscale) estimatedSize *= 0.7;
        const reduction = originalSize > 0 ? 100 - (estimatedSize / originalSize) * 100 : 0;
        return { originalSize, estimatedSize, reduction: Math.round(reduction) };
      });
    }, 150);

    return () => clearTimeout(debounceTimeoutRef.current);
  }, [settings, file, previewStatus]);
  
  const handleCompress = async () => {
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
            newPage.drawImage(jpgImageBytes, {
                x: 0, y: 0, width: newPage.getWidth(), height: newPage.getHeight(),
            });
        }
        
        setProcessingMessage('Saving file...');
        newPdfDoc.setTitle('');
        newPdfDoc.setAuthor('');
        const pdfBytes = await newPdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `docenclave-compressed-${file.name}`);
        
        fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this tool.");
    } finally {
        setIsProcessing(false);
        setProcessingMessage('');
    }
  };

  const handleQualityInputChange = (e) => {
    const value = e.target.value;
    if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 100)) {
        setSettings(prev => ({...prev, quality: value === '' ? '' : parseInt(value)}));
    }
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
    setPreviewStatus('idle');
    originalPreviewDataUrl.current = null;
  };

  const PreviewArea = () => (
    <>
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
                  id="quality" type="range" min="1" max="100"
                  value={settings.quality}
                  onChange={(e) => setSettings(prev => ({...prev, quality: parseInt(e.target.value)}))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Lower</span>
                    <span className="font-bold text-accent">{settings.quality}%</span>
                    <span>Higher</span>
                </div>
              </div>
              
              <div className="space-y-3">
                  <div className="flex items-center justify-between"><label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label><button onClick={() => setSettings(prev => ({...prev, isGrayscale: !prev.isGrayscale}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
              </div>
               <div className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md">Note: Compression makes text non-selectable.</div>
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