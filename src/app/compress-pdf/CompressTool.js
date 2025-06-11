'use client';

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const CompressTool = () => {
  const [file, setFile] = useState(null);
  const [originalPdf, setOriginalPdf] = useState(null);
  const [compressedPdf, setCompressedPdf] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [settings, setSettings] = useState({ isGrayscale: false, quality: 0.7 });
  const [metadata, setMetadata] = useState({});
  const [view, setView] = useState('preview'); // 'preview' or 'metadata'
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFile(file);

    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    setOriginalPdf(pdfDoc);

    generatePreviewsAndMetadata(arrayBuffer);
  };

  const generatePreviewsAndMetadata = async (arrayBuffer) => {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const previews = [];
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      previews.push(canvas.toDataURL());
    }
    setPreviews(previews);

    const meta = {
      title: pdf._pdfInfo.info?.Title || 'N/A',
      author: pdf._pdfInfo.info?.Author || 'N/A',
      pageCount: numPages,
      creationDate: pdf._pdfInfo.info?.CreationDate || 'N/A',
      modDate: pdf._pdfInfo.info?.ModDate || 'N/A',
    };
    setMetadata(meta);
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    const newPdfDoc = await PDFDocument.create();

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      let imgData = canvas.toDataURL('image/jpeg', settings.quality);

      if (settings.isGrayscale) {
        const grayCanvas = document.createElement('canvas');
        grayCanvas.width = canvas.width;
        grayCanvas.height = canvas.height;
        const ctx = grayCanvas.getContext('2d');
        const img = new Image();
        img.src = imgData;

        await new Promise((res) => (img.onload = res));
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, grayCanvas.width, grayCanvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
        imgData = grayCanvas.toDataURL('image/jpeg', settings.quality);
      }

      const imageBytes = await fetch(imgData).then((res) => res.arrayBuffer());
      const image = await newPdfDoc.embedJpg(imageBytes);
      const pageDims = image.scale(1);

      const newPage = newPdfDoc.addPage([pageDims.width, pageDims.height]);
      newPage.drawImage(image, { x: 0, y: 0, width: pageDims.width, height: pageDims.height });
    }

    const compressedPdfBytes = await newPdfDoc.save();
    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    setCompressedPdf(blob);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (compressedPdf) {
      saveAs(compressedPdf, 'compressed.pdf');
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">PDF Compressor</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} className="mb-4" />

      <div className="mb-4">
        <label className="mr-2">
          <input
            type="checkbox"
            checked={settings.isGrayscale}
            onChange={(e) => setSettings({ ...settings, isGrayscale: e.target.checked })}
          />
          <span className="ml-1">Convert to Grayscale</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block">Image Quality: {Math.round(settings.quality * 100)}%</label>
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={settings.quality}
          onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      <button
        onClick={handleCompress}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
        disabled={isProcessing || !file}
      >
        {isProcessing ? 'Compressing...' : 'Compress PDF'}
      </button>

      {compressedPdf && (
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-4 py-2 rounded mb-4 ml-2"
        >
          Download
        </button>
      )}

      {file && (
        <div className="mb-4">
          <button
            onClick={() => setView('preview')}
            className={`mr-2 px-3 py-1 rounded ${view === 'preview' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setView('metadata')}
            className={`px-3 py-1 rounded ${view === 'metadata' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
          >
            Metadata
          </button>
        </div>
      )}

      {view === 'preview' && previews.length > 0 && (
        <div className="space-y-4">
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`Page ${idx + 1}`} className="w-full border" />
          ))}
        </div>
      )}

      {view === 'metadata' && (
        <div className="bg-gray-100 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">PDF Metadata</h3>
          <ul>
            {Object.entries(metadata).map(([key, value]) => (
              <li key={key}><strong>{key}:</strong> {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompressTool;