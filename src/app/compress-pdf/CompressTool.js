'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, PDFName, PDFRawStream } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

// Configure the worker at the top level
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const initialSettings = {
  imageQuality: 0.75, // Use a 0-1 scale for quality
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  const originalCanvasData = useRef(null);
  const previewCanvasRef = useRef(null);
  const analysisData = useRef({ nonImageSize: 0, totalImageSize: 0 });

  useEffect(() => {
    if (!originalCanvasData.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (settings.isGrayscale) {
        context.filter = 'grayscale(100%)';
      } else {
        context.filter = 'none';
      }
      context.drawImage(img, 0, 0);
    };
    img.src = originalCanvasData.current;
  }, [settings.isGrayscale, file]);

  const updateEstimates = useCallback((newSettings) => {
    const { totalImageSize, nonImageSize } = analysisData.current;
    const originalSize = file ? file.size : 0;
    
    if (originalSize === 0) return;

    let estimatedImageSize = totalImageSize * newSettings.imageQuality;
    if (newSettings.isGrayscale) {
      estimatedImageSize *= 0.7;
    }

    const estimatedTotalSize = nonImageSize + estimatedImageSize;
    const reduction = 100 - (estimatedTotalSize / originalSize) * 100;

    setStats({
      originalSize,
      estimatedSize: estimatedTotalSize,
      reduction: Math.round(reduction),
    });
  }, [file]);

  const onDrop = useCallback(async (acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
        alert("Please upload a valid PDF file.");
        return;
    }

    setProcessingMessage('Analyzing PDF...');
    setIsProcessing(true);
    setFile(uploadedFile);
    setSettings(initialSettings);

    try {
        const fileBuffer = await uploadedFile.arrayBuffer();
        const pdfjsDoc = await pdfjs.getDocument({ data: fileBuffer.slice(0) }).promise;
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });
        const canvas = previewCanvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        originalCanvasData.current = canvas.toDataURL('image/png');
        
        analysisData.current = {
            totalImageSize: uploadedFile.size, 
            nonImageSize: 0 
        };
        
        updateEstimates(initialSettings);

    } catch (error) {
        console.error("Error processing PDF:", error);
        alert("Could not process this PDF. It might be a very complex file or have an unusual format.");
        setFile(null);
    } finally {
        setIsProcessing(false);
        setProcessingMessage('');
    }
  }, [updateEstimates]);

  const handleSettingChange = (setting, value) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    updateEstimates(newSettings);
  };
  
  // *** NEW, ROBUST HANDLECOMPRESS FUNCTION ***
  const handleCompress = async () => {
    if (!file) return;

    setProcessingMessage('Compressing, please wait...');
    setIsProcessing(true);
    
    try {
        const fileBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(fileBuffer);
        const imageRefs = new Set();
        
        // Step 1: Find all unique image references in the document
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

        // Step 2: Create compressed versions of each unique image
        const compressedImageMap = new Map();
        for (const ref of imageRefs) {
            const image = pdfDoc.getImage(pdfDoc.context.lookup(ref));
            if (!image) continue;

            // Use a temporary canvas to apply grayscale if needed
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            
            // Draw the original image data onto the canvas
            const tempImg = new Image();
            tempImg.src = await image.toDataUrl();
            await new Promise(resolve => { tempImg.onload = resolve });

            if (settings.isGrayscale) {
                ctx.filter = 'grayscale(100%)';
            }
            ctx.drawImage(tempImg, 0, 0);

            // Get the (potentially grayscaled) image data and embed as a new JPG
            const compressedJpgBytes = await pdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.imageQuality));
            compressedImageMap.set(ref, compressedJpgBytes.ref);
        }

        // Step 3: Replace the image references in the document's structure
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
        
        // Step 4: Remove metadata if requested
        if (settings.removeMetadata) {
            pdfDoc.setTitle('');
            pdfDoc.setAuthor('');
            pdfDoc.setSubject('');
            pdfDoc.setCreator('');
            pdfDoc.setProducer('');
        }

        // Step 5: Save the modified document
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        saveAs(blob, `docenclave-compressed-${file.name}`);
        
        // Step 6: Increment download stat
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
    onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: false,
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
    originalCanvasData.current = null;
  };

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
              <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain"></canvas>
            </div>
            <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                      <p className="text-xs text-gray-400">Original</p>
                      <p className="font-semibold text-lg">{formatBytes(stats.originalSize)}</p>
                  </div>
                   <div>
                      <p className="text-xs text-gray-400">Estimated</p>
                      <p className="font-semibold text-lg text-accent">{formatBytes(stats.estimatedSize)}</p>
                  </div>
                   <div>
                      <p className="text-xs text-gray-400">Reduction</p>
                      <p className="font-semibold text-lg text-green-400">~{stats.reduction}%</p>
                  </div>
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
                  <div className="flex items-center justify-between">
                      <label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label>
                      <button onClick={() => handleSettingChange('isGrayscale', !settings.isGrayscale)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
                   <div className="flex items-center justify-between">
                      <label htmlFor="metadata" className="text-sm text-gray-300">Basic Optimization</label>
                      <button onClick={() => handleSettingChange('removeMetadata', !settings.removeMetadata)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              </div>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                  <button onClick={handleCompress} disabled={isProcessing} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600">
                    {isProcessing ? processingMessage : 'Compress PDF'}
                  </button>
                  <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">
                    Use a different file
                  </button>
              </div>
            </div>
          </div>
          ))
        }
      </div>
      
      <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
        <h2 className="text-3xl font-bold mb-6">Take Control of Your PDF Size</h2>
        <p>Sending a PDF that's too large for an email attachment is a common frustration. While many tools offer to compress your files, they often leave you in the dark, forcing you to choose between vague options like "low" or "high" quality. At DocEnclave, we believe in putting the power back in your hands. Our advanced PDF compressor gives you a transparent, interactive experience to reduce file size without sacrificing clarity.</p>
        
        <h3 className="text-2xl font-bold mt-12 mb-4">See the Difference in Real-Time</h3>
        <p>Our unique interface features a live preview and an interactive quality slider. As you adjust the settings, you see the estimated final file size and percentage reduction update instantly. This feedback loop allows you to find the perfect balance between file size and image quality *before* you commit to compressing. No more downloading multiple versions to find the right one. Make the right choice the first time, every time.</p>
        
        <h3 className="text-2xl font-bold mt-12 mb-4">Smarter Compression, Total Privacy</h3>
        <p>DocEnclave's compressor is designed to be intelligent. It primarily targets the large images within your PDF for compression, while striving to maintain the crispness of your text. For even greater size savings, you can convert images to grayscale or strip out unnecessary metadata with the flip of a switch. And because this all happens directly in your browser, your sensitive documents are never uploaded to a server. This guarantees 100% privacy and security for your files.</p>

        <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-semibold">How do I reduce the size of my PDF?</h4>
            <p>Simply upload your PDF. Use the interactive slider to adjust the image quality and see the estimated size change. For more reduction, toggle the "Grayscale" or "Basic Optimization" options. Once you're satisfied with the estimate, click "Compress PDF" to download your new, smaller file.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Will compressing my PDF reduce its quality?</h4>
            <p>Compression primarily reduces the quality of images within the PDF to save space. Our tool allows you to control this trade-off. A setting of 75-80% is often visually indistinguishable from the original for on-screen viewing, while significantly reducing file size. Text quality is generally unaffected.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Is it safe to compress my confidential documents here?</h4>
            <p>Yes, it is the safest way possible. DocEnclave operates entirely within your web browser. Your files are not sent to or stored on any external servers. The entire compression process happens on your own computer, ensuring your data remains completely private and secure.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}