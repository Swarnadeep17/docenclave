'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { useDropzone } from 'react-dropzone';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

// Host the pdf.js worker locally (assumes you copied pdf.worker.min.js to public/)
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const initialSettings = {
  quality: 75,
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [originalFile, setOriginalFile] = useState(null);
  const [settings, setSettings] = useState(initialSettings);
  const [stats, setStats] = useState({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [previewImageSrc, setPreviewImageSrc] = useState(null);
  
  const analysisData = useRef({
    pageCount: 0,
    samplePageJpegSizeAtLowQ: 0,
    samplePageJpegSizeAtHighQ: 0,
  });

  const cleanupCanvas = (canvas) => {
    if (canvas) {
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    event.target.value = null;
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setOriginalFile(selectedFile);
      setSettings(initialSettings);
      setPreviewImageSrc(null);
      setStats({ originalSize: 0, estimatedSize: 0, reduction: 0 });
    } else if (selectedFile) {
      alert('Please select a valid PDF file.');
    }
  };

  useEffect(() => {
    if (!originalFile) return;

    const analyzeAndPreview = async () => {
      setIsProcessing(true);
      setProcessingMessage('Analyzing PDF...');
      
      let previewCanvas, estimationCanvas;
      try {
        const fileBlob = new Blob([originalFile]);
        const pdfjsBuffer = await fileBlob.arrayBuffer();
        const pdfjsDoc = await pdfjs.getDocument({ data: pdfjsBuffer }).promise;
        
        analysisData.current.pageCount = pdfjsDoc.numPages;

        const page = await pdfjsDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.0 });

        previewCanvas = document.createElement('canvas');
        previewCanvas.height = viewport.height;
        previewCanvas.width = viewport.width;
        const previewCtx = previewCanvas.getContext('2d', { willReadFrequently: true });
        await page.render({ canvasContext: previewCtx, viewport }).promise;
        setPreviewImageSrc(previewCanvas.toDataURL('image/png'));

        estimationCanvas = document.createElement('canvas');
        estimationCanvas.height = viewport.height;
        estimationCanvas.width = viewport.width;
        const estimationCtx = estimationCanvas.getContext('2d', { willReadFrequently: true });
        await page.render({ canvasContext: estimationCtx, viewport }).promise;

        const jpgDataUrlLow = estimationCanvas.toDataURL('image/jpeg', 0.10);
        const jpgDataUrlHigh = estimationCanvas.toDataURL('image/jpeg', 0.95);
        analysisData.current.samplePageJpegSizeAtLowQ = jpgDataUrlLow.length;
        analysisData.current.samplePageJpegSizeAtHighQ = jpgDataUrlHigh.length;
      } catch (error) {
        console.error('Error during analysis/preview:', error);
        alert('Could not analyze or preview this PDF. It may be corrupt or unsupported.');
        setOriginalFile(null);
        setPreviewImageSrc(null);
      } finally {
        cleanupCanvas(previewCanvas);
        cleanupCanvas(estimationCanvas);
        setIsProcessing(false);
        setProcessingMessage('');
      }
    };
    analyzeAndPreview();
  }, [originalFile]);

  useEffect(() => {
    if (!originalFile || !previewImageSrc) {
      setStats({ originalSize: 0, estimatedSize: 0, reduction: 0 });
      return;
    }
    
    const { pageCount, samplePageJpegSizeAtLowQ, samplePageJpegSizeAtHighQ } = analysisData.current;
    
    if (pageCount > 0 && samplePageJpegSizeAtHighQ > 0) {
      const qualityInput = settings.quality;
      let qualityRatio = 0;
      if (qualityInput <= 10) qualityRatio = 0;
      else if (qualityInput >= 95) qualityRatio = 1;
      else qualityRatio = (qualityInput - 10) / (95 - 10);
      
      const compressibleRange = samplePageJpegSizeAtHighQ - samplePageJpegSizeAtLowQ;
      let estimatedPageSize = samplePageJpegSizeAtLowQ + compressibleRange * qualityRatio;
      
      if (settings.isGrayscale) estimatedPageSize *= 0.7;
      
      const estimatedTotalSize = estimatedPageSize * pageCount;
      const originalFileSize = originalFile.size;
      const reduction = originalFileSize > 0 ? 100 - (estimatedTotalSize / originalFileSize) * 100 : 0;
      
      setStats({ 
        originalSize: originalFileSize, 
        estimatedSize: Math.max(0, estimatedTotalSize), 
        reduction: Math.max(0, Math.min(100, Math.round(reduction)))
      });
    }
  }, [settings, originalFile, previewImageSrc]);

  const handleCompress = async () => {
    if (!originalFile) return;
    setIsProcessing(true);
    setProcessingMessage('Reconstructing PDF...');
    
    let canvas;
    try {
      const newPdfDoc = await PDFDocument.create();
      const fileBuffer = await originalFile.arrayBuffer();
      const sourcePdf = await pdfjs.getDocument({ data: fileBuffer }).promise;

      for (let i = 1; i <= sourcePdf.numPages; i++) {
        setProcessingMessage(`Processing page ${i} of ${sourcePdf.numPages}...`);
        await new Promise(resolve => setTimeout(resolve, 0));

        const page = await sourcePdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        
        canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        await page.render({ canvasContext: ctx, viewport }).promise;
        
        if (settings.isGrayscale) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let j = 0; j < data.length; j += 4) {
            const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
            data[j] = avg;
            data[j + 1] = avg;
            data[j + 2] = avg;
          }
          ctx.putImageData(imageData, 0, 0);
        }

        const jpgImageBytes = await newPdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
        const newPage = newPdfDoc.addPage([viewport.width / 2, viewport.height / 2]);
        newPage.drawImage(jpgImageBytes, {
          x: 0,
          y: 0,
          width: newPage.getWidth(),
          height: newPage.getHeight(),
        });
        cleanupCanvas(canvas);
        canvas = null;
      }
      
      if (settings.removeMetadata) {
        newPdfDoc.setTitle('');
        newPdfDoc.setAuthor('');
        newPdfDoc.setSubject('');
        newPdfDoc.setKeywords([]);
        newPdfDoc.setProducer('');
        newPdfDoc.setCreator('');
      }
      
      setProcessingMessage('Saving file...');
      const pdfBytes = await newPdfDoc.save({ useObjectStreams: false });
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `docenclave-compressed-${originalFile.name}`);
      
      fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statToIncrement: 'downloads' }),
      }).catch((error) => console.error('Stats API error:', error));
    } catch (error) {
      console.error('Failed to compress PDF:', error);
      alert('An error occurred during compression. The PDF might be too large or complex. Try a smaller file or lower quality settings.');
    } finally {
      cleanupCanvas(canvas);
      setIsProcessing(false);
      setProcessingMessage('');
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes || bytes < 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleStartOver = () => {
    setOriginalFile(null);
    setPreviewImageSrc(null);
    setStats({ originalSize: 0, estimatedSize: 0, reduction: 0 });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles, rejectedFiles) => {
      console.log('onDrop triggered', { acceptedFiles, rejectedFiles });
      const selectedFile = acceptedFiles[0];
      if (selectedFile && selectedFile.type === 'application/pdf') {
        console.log('Accepted PDF file:', selectedFile.name);
        setOriginalFile(selectedFile);
        setSettings(initialSettings);
      } else if (rejectedFiles.length > 0) {
        console.log('Rejected files:', rejectedFiles);
        alert('Please select a valid PDF file.');
      }
    }, []),
    accept: {
      'application/pdf': ['.pdf'],
    },
    multiple: false,
    onDropAccepted: () => console.log('File accepted'),
    onDropRejected: () => console.log('File rejected'),
    onError: (error) => console.error('Dropzone error:', error),
  });

  const UploadView = () => (
    <div
      {...getRootProps()}
      className={`mb-8 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors pointer-events-auto ${
        isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'
      }`}
      onClick={() => console.log('Upload div clicked')}
    >
      <input {...getInputProps()} />
      <svg
        className="w-8 h-8 mb-4 text-gray-400"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 20 16"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
        />
      </svg>
      <p className="mb-2 text-sm text-gray-400">
        <span className="font-semibold text-accent">
          {isDragActive ? 'Drop PDF here' : 'Click to upload or drag & drop'}
        </span>
      </p>
      <p className="text-xs text-gray-500">Select a single PDF file</p>
    </div>
  );

  const SettingsAndPreviewView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-200">Original Preview (Page 1)</h3>
        {previewImageSrc ? (
          <img
            src={previewImageSrc}
            alt="Original PDF Preview"
            className={`max-w-full max-h-[320px] object-contain border border-gray-700 rounded transition-filter duration-300 ${
              settings.isGrayscale ? 'grayscale' : 'grayscale-0'
            }`}
          />
        ) : (
          isProcessing && processingMessage ? (
            <p className="text-accent">{processingMessage}</p>
          ) : (
            <p className="text-gray-500">Preview will appear after analysis.</p>
          )
        )}
      </div>
      <div className="md:col-span-1 flex flex-col space-y-6">
        <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
        <div className="text-sm text-gray-400">File: {originalFile?.name || 'Unknown'}</div>
        <div className="grid grid-cols-3 gap-2 text-center p-2 bg-gray-800/30 rounded-md">
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
          <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1">
            Image Quality
          </label>
          <input
            id="quality"
            type="range"
            min="1"
            max="100"
            value={settings.quality}
            onChange={(e) => setSettings((p) => ({ ...p, quality: parseInt(e.target.value) }))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Lower</span>
            <span className="font-bold text-accent">{settings.quality}%</span>
            <span>Higher</span>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label htmlFor="grayscale" className="text-sm text-gray-300">
              Convert to Grayscale
            </label>
            <button
              onClick={() => setSettings((p) => ({ ...p, isGrayscale: !p.isGrayscale }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="metadata" className="text-sm text-gray-300">
              Remove Metadata
            </label>
            <button
              onClick={() => setSettings((p) => ({ ...p, removeMetadata: !p.removeMetadata }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
        <div className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md">
          Note: Compression makes text non-selectable.
        </div>
        <div className="pt-4 border-t border-gray-600 space-y-3">
          <button
            onClick={handleCompress}
            disabled={isProcessing}
            className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600"
          >
            {isProcessing ? processingMessage : 'Compress PDF & Download'}
          </button>
          <button
            onClick={handleStartOver}
            className="w-full text-sm text-gray-400 hover:text-white hover:underline"
          >
            Use a different file
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="w-full max-w-6xl mx-auto py-24 px-4">
        <ToolPageHeader
          title="PDF Compressor"
          description="Securely compress your PDF with real-time feedback and control."
        />
        <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
          {isProcessing && processingMessage.startsWith('Analyzing') ? (
            <div className="text-center py-20 text-accent">{processingMessage}</div>
          ) : originalFile ? (
            <SettingsAndPreviewView />
          ) : (
            <UploadView />
          )}
        </div>
        <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
          <h2 className="text-3xl font-bold mb-6">Take Control of Your PDF Size</h2>
          <p>
            DocEnclave's PDF Compressor empowers you to significantly reduce file sizes without
            sacrificing clarity, all while ensuring your data remains 100% private. Our tool operates
            entirely in your browser, meaning your sensitive documents are never uploaded to any server.
          </p>
          <h3 className="text-2xl font-bold mt-12 mb-4">Instant Feedback, Informed Decisions</h3>
          <p>
            As soon as you upload your PDF, you'll see an initial preview and real-time estimates of the
            compressed file size as you adjust settings. Choose your image quality, opt for grayscale
            conversion for maximum space saving, or remove unnecessary metadata. See the impact of your
            choices instantly before you commit to compression.
          </p>
          <h3 className="text-2xl font-bold mt-12 mb-4">Reliable Compression, Uncompromised Privacy</h3>
          <p>
            Our advanced "Reconstruction" method rebuilds your PDF page by page, applying your chosen
            settings to each image. This robust process ensures reliable compression even for complex
            files, while the client-side operation guarantees your documents never leave your computer.
            The result? A smaller, shareable PDF without compromising your privacy.
          </p>
          <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-8">
            <div>
              <h4 className="text-xl font-semibold">How does the compression work?</h4>
              <p>
                After you upload a PDF and choose your settings (like image quality and grayscale), our tool
                intelligently rebuilds the document. Each page is effectively converted into a high-quality
                image, which is then compressed to your specifications and reassembled into a new, smaller PDF.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Will my text still be selectable after compression?</h4>
              <p>
                Because our method converts each page into an image to achieve reliable compression, the text
                in the final PDF will not be selectable. This is a trade-off for achieving significant and
                consistent file size reduction across all PDF types.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold">Is this tool free and private?</h4>
              <p>
                Absolutely. Like all DocEnclave tools, the PDF Compressor is 100% free to use, with no
                watermarks or registration. All processing happens in your browser, so your files remain
                completely private and secure on your own device.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}