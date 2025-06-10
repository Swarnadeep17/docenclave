'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, PDFName } from 'pdf-lib';
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
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [previewImageSrc, setPreviewImageSrc] = useState(null);

  const analysisData = useRef({
    totalImageSize: 0,
    nonImageSize: 0,
  });

  // --- Effect for Initial File Analysis (Runs ONCE per file) ---
  useEffect(() => {
    if (!file) return;

    const analyzeFile = async () => {
      setIsProcessing(true);
      setProcessingMessage('Analyzing PDF...');
      setSettings(initialSettings);

      try {
        const fileBlob = new Blob([file]);
        const pdfjsBuffer = await fileBlob.arrayBuffer();
        const pdfjsDoc = await pdfjs.getDocument({ data: pdfjsBuffer }).promise;

        // Generate Preview
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setPreviewImageSrc(canvas.toDataURL('image/png'));
        
        // --- ACCURATE ANALYSIS using pdf-lib ---
        const pdfLibDoc = await PDFDocument.load(pdfjsBuffer.slice(0));
        let totalImageSize = 0;
        const imageRefs = new Set();
        pdfLibDoc.getPages().forEach(page => {
            try {
                const resources = page.node.Resources();
                const xobjects = resources?.lookup(PDFName.of('XObject'));
                if (xobjects?.isDict()) {
                    xobjects.entries().forEach(([key, value]) => {
                        if (value.isIndirect()) {
                            const xobject = pdfLibDoc.context.lookup(ref);
                            if (xobject.lookup(PDFName.of('Subtype')) === PDFName.of('Image') && !imageRefs.has(value.toString())) {
                                imageRefs.add(value.toString());
                                const image = pdfLibDoc.getImage(ref);
                                totalImageSize += image.sizeInBytes;
                            }
                        }
                    });
                }
            } catch (e) { console.warn("Could not process resources on a page for analysis."); }
        });
        
        analysisData.current = {
            totalImageSize,
            nonImageSize: file.size - totalImageSize
        };
        
      } catch (error) {
        console.error("Fatal error during analysis:", error);
        alert("Could not analyze this PDF. It may be corrupt or have an unsupported format.");
        handleStartOver();
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
      }
    };

    analyzeFile();
  }, [file]);

  // --- UNIFIED Effect for INSTANTLY Updating Stats and Preview ---
  useEffect(() => {
    if (!file || !previewImageSrc) return;

    const { totalImageSize, nonImageSize } = analysisData.current;
    if (totalImageSize > 0) {
        let estimatedImageSize = totalImageSize * (settings.quality / 100);
        if(settings.isGrayscale) estimatedImageSize *= 0.7; // Factor for grayscale
        
        const estimatedTotalSize = nonImageSize + estimatedImageSize;
        const originalSize = file.size;
        const reduction = originalSize > 0 ? 100 - (estimatedTotalSize / originalSize) * 100 : 0;
        
        setStats({ 
            originalSize, 
            estimatedSize: estimatedTotalSize, 
            reduction: Math.max(0, Math.round(reduction))
        });
    } else {
      // If no images, estimate is same as original
      setStats({
        originalSize: file.size,
        estimatedSize: file.size,
        reduction: 0
      })
    }
  }, [settings, file, previewImageSrc]);
  
  const handleCompress = async () => {
    if (!file) return;

    setIsProcessing(true);
    setProcessingMessage('Compressing Images...');
    
    try {
        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const imageRefCache = new Map();
        
        const pages = pdfDoc.getPages();
        for (const [pageIndex, page] of pages.entries()) {
            setProcessingMessage(`Analyzing page ${pageIndex + 1}/${pages.length}...`);
            const resources = page.node.Resources();
            const xobjects = resources?.lookup(PDFName.of('XObject'));
            if (!xobjects?.isDict()) continue;

            for (const [name, ref] of xobjects.entries()) {
                if (!ref.isIndirect()) continue;
                
                const xobject = pdfDoc.context.lookup(ref);
                if (xobject.lookup(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;
                
                const imageRefString = ref.toString();
                if (imageRefCache.has(imageRefString)) continue;

                const image = pdfDoc.getImage(ref);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const tempImg = new Image();
                try {
                    tempImg.src = await image.toPng(); // Use PNG for better quality before re-compression
                } catch {
                    console.warn(`Could not process an image on page ${pageIndex+1}. Skipping it.`);
                    continue; // Skip this image if it's in a format we can't handle
                }
                await new Promise(resolve => { tempImg.onload = resolve; });
                
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                if (settings.isGrayscale) ctx.filter = 'grayscale(100%)';
                ctx.drawImage(tempImg, 0, 0);
                
                const newImageBytes = await pdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
                imageRefCache.set(imageRefString, newImageBytes);
            }
        }
        
        for (const [originalRefStr, newImage] of imageRefCache.entries()) {
            const refToReplace = PDFDocument.parse(originalRefStr, false);
            pdfDoc.context.assign(refToReplace, newImage.ref);
        }

        if (settings.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
        }

        setProcessingMessage('Saving file...');
        const pdfBytes = await pdfDoc.save();
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
    setPreviewImageSrc(null);
  };

  const PreviewArea = () => (
    previewImageSrc ? (
        <img 
            src={previewImageSrc} 
            alt="PDF Preview" 
            className={`max-w-full max-h-full object-contain transition-filter duration-300 ${settings.isGrayscale ? 'grayscale' : 'grayscale-0'}`}
        />
    ) : (
        <p className="text-accent">{processingMessage || "Preview will appear here."}</p>
    )
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
          isProcessing && !previewImageSrc ? (
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
                  <div className="flex items-center justify-between"><label htmlFor="metadata" className="text-sm text-gray-300">Basic Optimization</label><button onClick={() => setSettings(prev => ({...prev, removeMetadata: !prev.removeMetadata}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
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