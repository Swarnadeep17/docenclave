'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const initialSettings = { quality: 75, isGrayscale: false, removeMetadata: true };

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  const analysisData = useRef({ pageCount: 0, samplePageSizeAt100: 0 });

  useEffect(() => {
    if (!file) return;
    const analyzeFile = async () => {
      setIsProcessing(true);
      setProcessingMessage('Analyzing PDF...');
      setSettings(initialSettings);
      try {
        const pdfjsDoc = await pdfjs.getDocument(await file.arrayBuffer()).promise;
        analysisData.current.pageCount = pdfjsDoc.numPages;
        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        setPreviewImageSrc(canvas.toDataURL('image/png'));
        const jpgDataUrl100 = canvas.toDataURL('image/jpeg', 1.0);
        analysisData.current.samplePageSizeAt100 = jpgDataUrl100.length;
      } catch (e) {
        alert("Could not analyze this PDF.");
        handleStartOver();
      } finally {
        setIsProcessing(false);
      }
    };
    analyzeFile();
  }, [file]);

  useEffect(() => {
    if (!file || !previewImageSrc) return;
    const { pageCount, samplePageSizeAt100 } = analysisData.current;
    if (pageCount > 0) {
      const qualityModifier = Math.pow(settings.quality / 100, 2);
      let estimatedTotalSize = (samplePageSizeAt100 * qualityModifier) * pageCount;
      if (settings.isGrayscale) estimatedTotalSize *= 0.7;
      const reduction = file.size > 0 ? 100 - (estimatedTotalSize / file.size) * 100 : 0;
      setStats({ originalSize: file.size, estimatedSize: estimatedTotalSize, reduction: Math.max(0, Math.round(reduction)) });
    }
  }, [settings, file, previewImageSrc]);

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProcessingMessage('Reconstructing PDF...');
    try {
        const newPdfDoc = await PDFDocument.create();
        const sourcePdf = await pdfjs.getDocument(await file.arrayBuffer()).promise;
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
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                for (let i = 0; i < imgData.data.length; i += 4) {
                    const avg = (imgData.data[i] + imgData.data[i+1] + imgData.data[i+2]) / 3;
                    imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = avg;
                }
                ctx.putImageData(imgData, 0, 0);
            }
            const jpgBytes = await newPdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
            const newPage = newPdfDoc.addPage([page.view[2], page.view[3]]);
            newPage.drawImage(jpgBytes, { x: 0, y: 0, width: newPage.getWidth(), height: newPage.getHeight() });
        }
        if (settings.removeMetadata) { newPdfDoc.setTitle(''); newPdfDoc.setAuthor(''); }
        const pdfBytes = await newPdfDoc.save();
        saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), `docenclave-compressed-${file.name}`);
        fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
    } catch (e) {
        alert("An error occurred during compression.");
    } finally {
        setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(files => setFile(files[0]), []),
    accept: { 'application/pdf': ['.pdf'] }, multiple: false,
  });

  const formatBytes = (b) => {
    if (!+b) return '0 Bytes';
    const i = Math.floor(Math.log(b) / Math.log(1024));
    return `${parseFloat((b / Math.pow(1024, i)).toFixed(2))} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
  };
  
  const handleStartOver = () => {
    setFile(null);
    setPreviewImageSrc(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="Advanced PDF Compressor" description="Fine-tune compression settings with a real-time preview." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        {!file ? (
          <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'border-accent' : 'border-gray-500'}`}><input {...getInputProps()} /><p>Drag & drop or click to upload</p></div>
        ) : (isProcessing) ? (
          <div className="text-center py-20 text-accent">{processingMessage}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              {previewImageSrc ? <img src={previewImageSrc} alt="Preview" className={`max-w-full max-h-full object-contain transition-filter duration-300 ${settings.isGrayscale ? 'grayscale' : ''}`} /> : <p>Generating Preview...</p>}
            </div>
            <div className="flex flex-col space-y-6">
              <h3>Compression Settings</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div><p>Original</p><p>{formatBytes(stats.originalSize)}</p></div>
                <div><p>Estimated</p><p className="text-accent">{formatBytes(stats.estimatedSize)}</p></div>
                <div><p>Reduction</p><p className="text-green-400">~{stats.reduction}%</p></div>
              </div>
              <div>
                <label>Image Quality</label>
                <input type="range" min="1" max="100" value={settings.quality} onChange={e => setSettings(p => ({...p, quality: parseInt(e.target.value)}))} />
                <div><span>Lower</span><span>{settings.quality}%</span><span>Higher</span></div>
              </div>
              <div className="space-y-3">
                <div><label>Convert to Grayscale</label><button onClick={() => setSettings(p => ({...p, isGrayscale: !p.isGrayscale}))}></button></div>
                <div><label>Basic Optimization</label><button onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))}></button></div>
              </div>
              <div>Note: Compression makes text non-selectable.</div>
              <div>
                <button onClick={handleCompress}>Compress PDF</button>
                <button onClick={handleStartOver}>Use a different file</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}