'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, PDFName, StandardFonts } from 'pdf-lib';
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
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const [initialFileSize, setInitialFileSize] = useState(0);

  // --- Effect for Initial Preview Generation (runs when 'file' changes) ---
  useEffect(() => {
    if (!file) {
        setPreviewImageSrc(null); // Clear preview if no file
        return;
    }

    const generateInitialPreview = async () => {
      setIsProcessing(true); // Show a general processing state for preview
      setProcessingMessage('Generating initial preview...');
      try {
        const fileBlob = new Blob([file]);
        const pdfjsBuffer = await fileBlob.arrayBuffer();
        const pdfjsDoc = await pdfjs.getDocument({ data: pdfjsBuffer }).promise;
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 }); // Standard scale for initial preview
        
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        await page.render({ canvasContext: context, viewport }).promise;
        
        setPreviewImageSrc(canvas.toDataURL('image/png'));
        setInitialFileSize(file.size); // Store initial file size
      } catch (error) {
        console.error("Error generating initial preview:", error);
        alert("Could not generate preview for this PDF. It may be corrupt or unsupported. You can still try to compress.");
        setPreviewImageSrc(null); // Clear preview on error
      } finally {
        setIsProcessing(false);
        setProcessingMessage('');
      }
    };
    generateInitialPreview();
  }, [file]);

  // --- DIRECT IMAGE REPLACEMENT COMPRESSION ---
  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingMessage('Compressing PDF...');
    
    try {
        const existingPdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const imageRefs = new Map(); // To track unique images and their new, compressed versions

        const pages = pdfDoc.getPages();
        for (const [pageIndex, page] of pages.entries()) {
            setProcessingMessage(`Analyzing images on page ${pageIndex + 1}/${pages.length}...`);
            const resources = page.node.Resources();
            const xobjects = resources?.lookup(PDFName.of('XObject'));
            if (!xobjects?.isDict()) continue;

            for (const [imageName, imageRefObj] of xobjects.entries()) {
                if (!imageRefObj.isIndirect()) continue; // Must be an indirect reference

                const xobject = pdfDoc.context.lookup(imageRefObj);
                if (xobject.lookup(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;

                const imageRefString = imageRefObj.toString();
                if (imageRefCache.has(imageRefString)) { // Already processed this unique image
                    xobjects.set(imageName, imageRefCache.get(imageRefString).ref);
                    continue;
                }

                const image = pdfDoc.getImage(imageRefObj);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const tempImg = new Image();
                try {
                    tempImg.src = await image.toPng(); // Use PNG for initial draw to preserve quality
                } catch (imgError) {
                    console.warn(`Skipping problematic image on page ${pageIndex + 1}:`, imgError);
                    continue; 
                }
                await new Promise(resolve => { tempImg.onload = resolve; });
                
                canvas.width = tempImg.width;
                canvas.height = tempImg.height;
                
                if (settings.isGrayscale) {
                    ctx.filter = 'grayscale(100%)';
                }
                ctx.drawImage(tempImg, 0, 0);

                const newImageBytes = await pdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
                imageRefCache.set(imageRefString, newImageBytes); // Cache the new embedded image object
                xobjects.set(imageName, newImageBytes.ref); // Replace the reference in the page's resources
            }
        }
        
        if (settings.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setProducer('');
            pdfDoc.setCreator('');
        }

        setProcessingMessage('Saving compressed file...');
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `docenclave-compressed-${file.name}`);
        
        fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
    } catch (error) {
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this specific compression method.");
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
    accept: { 'application/pdf': ['.pdf'] }, multiple: false,
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
    setInitialFileSize(0);
  };
  
  const PreviewArea = () => (
    previewImageSrc ? (
        <img 
            src={previewImageSrc} 
            alt="PDF Preview" 
            className={`max-w-full max-h-full object-contain transition-filter duration-300 ${settings.isGrayscale ? 'grayscale' : 'grayscale-0'}`}
        />
    ) : (
        <p className="text-accent">{processingMessage || "Upload a PDF to see a preview."}</p>
    )
  );

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="PDF Compressor" description="Optimize your PDF files by reducing image quality and removing unnecessary data." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        {!file ? (
          <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">{isDragActive ? 'Drop PDF here' : 'Click to upload or drag & drop'}</span></p>
            <p className="text-xs text-gray-500">Select a single PDF file</p>
          </div>
        ) : (
          isProcessing && !previewImageSrc ? ( // Show processing only if there's no preview yet
            <div className="text-center py-20 text-accent">{processingMessage}</div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              <PreviewArea />
            </div>
            <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
              <div className="text-center p-2 bg-gray-800/50 rounded-md">
                  <p className="text-xs text-gray-400">Original Size</p>
                  <p className="font-semibold text-lg">{formatBytes(initialFileSize)}</p>
              </div>
              
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1">Image Quality</label>
                <div className="space-y-2">
                    {qualityPresets.map(preset => (
                        <button 
                            key={preset.name}
                            onClick={() => setSettings(prev => ({...prev, quality: preset.value}))}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${settings.quality === preset.value ? 'bg-accent border-accent text-white' : 'bg-gray-700 border-gray-600 hover:border-gray-500'}`}
                        >
                            <div className="font-semibold">{preset.name}</div>
                            <div className="text-xs opacity-80">{preset.description}</div>
                        </button>
                    ))}
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between"><label htmlFor="grayscale" className="text-sm text-gray-300">Convert Images to Grayscale</label><button onClick={() => setSettings(prev => ({...prev, isGrayscale: !prev.isGrayscale}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
                  <div className="flex items-center justify-between"><label htmlFor="metadata" className="text-sm text-gray-300">Remove Metadata</label><button onClick={() => setSettings(prev => ({...prev, removeMetadata: !p.removeMetadata}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
              </div>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                  <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">{isProcessing ? processingMessage : 'Compress PDF & Download'}</button>
                  <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Use a different file</button>
              </div>
            </div>
          </div>
          )
        )}
      </div>
      {/* SEO Content Block will be added back here */}
    </div>
  );
}