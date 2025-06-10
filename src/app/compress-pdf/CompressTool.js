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
  const previewCanvasRef = useRef(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    event.target.value = null;
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
      const liveCanvas = previewCanvasRef.current;
      if (liveCanvas) {
        liveCanvas.width = vp.width;
        liveCanvas.height = vp.height;
        await previewPage.render({ canvasContext: liveCanvas.getContext('2d'), viewport: vp }).promise;
      }

      setCompressedFile({ blob, size: blob.size, name: `compressed-${file.name}` });
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
  };

  const handleReconfigure = () => {
    setCompressedFile(null);
  };

  const UploadView = () => (
    <label htmlFor="file-upload" className="...">
      {/* upload UI */}
      <input id="file-upload" type="file" accept=".pdf" onChange={handleFileChange} hidden />
    </label>
  );

  const SettingsView = () => (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 ...">
        <h3>Your file is ready</h3>
        <p>Original: {file.name} – {formatBytes(file.size)}</p>
        <p>Adjust quality below then click “Compress & Preview”</p>
      </div>
      <div className="md:col-span-1 space-y-6">
        <h3>Compression Settings</h3>

        {/* Quality slider */}
        <div>
          <label htmlFor="quality-slider">
            Image Quality: <strong>{settings.quality}%</strong>
          </label>
          <input
            id="quality-slider"
            type="range"
            min="10"
            max="100"
            step="5"
            value={settings.quality}
            onChange={(e) =>
              setSettings((p) => ({ ...p, quality: +e.target.value }))
            }
            className="w-full"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div>
            <label>Grayscale</label>
            <button onClick={() => setSettings((p) => ({ ...p, isGrayscale: !p.isGrayscale }))}>
              {settings.isGrayscale ? 'On' : 'Off'}
            </button>
          </div>
          <div>
            <label>Remove Metadata</label>
            <button onClick={() => setSettings((p) => ({ ...p, removeMetadata: !p.removeMetadata }))}>
              {settings.removeMetadata ? 'On' : 'Off'}
            </button>
          </div>
        </div>

        <button onClick={handleProcessAndPreview}>Compress & Preview</button>
        <button onClick={handleStartOver}>Use different file</button>
      </div>
    </div>
  );

  const PreviewView = () => {
    const reduction = file && compressedFile
      ? Math.round((1 - compressedFile.size / file.size) * 100)
      : 0;

    return (
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 ...">
          <canvas ref={previewCanvasRef} />
        </div>
        <div className="md:col-span-1 space-y-6">
          <h3>Preview & Download</h3>
          <p>Original: {formatBytes(file.size)}</p>
          <p>New: {formatBytes(compressedFile.size)}</p>
          <p>Reduction: {reduction}%</p>
          <button onClick={handleDownload}>Download Compressed PDF</button>
          <button onClick={handleReconfigure}>Change Settings</button>
        </div>
      </div>
    );
  };

  const CurrentView = () =>
    isProcessing
      ? <div className="text-center">{processingMessage}</div>
      : compressedFile
      ? <PreviewView />
      : file
      ? <SettingsView />
      : <UploadView />;

  return (
    <div className="container mx-auto py-12 px-4">
      <ToolPageHeader
        title="PDF Compressor"
        description="Adjust quality, preview before downloading."
      />
      <div className="bg-gray-900 border rounded p-8">
        <CurrentView />
      </div>
    </div>
  );
}