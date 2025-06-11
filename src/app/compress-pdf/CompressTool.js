'use client';

import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [metadata, setMetadata] = useState({});
  const [view, setView] = useState('preview');
  const [settings, setSettings] = useState({ isGrayscale: false, quality: 0.7 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreviews([]);
      setMetadata({});
      return;
    }

    const loadPdf = async () => {
      try {
        setIsProcessing(true);
        const buffer = await file.arrayBuffer();

        // Extract metadata
        const pdfDoc = await PDFDocument.load(buffer);
        setMetadata({
          title: pdfDoc.getTitle() || 'N/A',
          author: pdfDoc.getAuthor() || 'N/A',
          pageCount: pdfDoc.getPageCount(),
          creationDate: pdfDoc.getCreationDate()?.toString() || 'N/A',
          modificationDate: pdfDoc.getModificationDate()?.toString() || 'N/A',
        });

        // Generate previews
        const loadingTask = pdfjsLib.getDocument({ data: buffer });
        const pdf = await loadingTask.promise;
        const pages = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1 });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          pages.push(canvas.toDataURL());
        }

        setPreviews(pages);
      } catch (err) {
        console.error(err);
        setMetadata({});
      } finally {
        setIsProcessing(false);
      }
    };

    loadPdf();
  }, [file]);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === 'application/pdf') {
      setFile(selected);
      setCompressedBlob(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setIsProcessing(true);
    const buffer = await file.arrayBuffer();

    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      let dataUrl = canvas.toDataURL('image/jpeg', settings.quality);

      if (settings.isGrayscale) {
        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => (img.onload = resolve));
        const gCanvas = document.createElement('canvas');
        gCanvas.width = canvas.width;
        gCanvas.height = canvas.height;
        const gCtx = gCanvas.getContext('2d');
        gCtx.drawImage(img, 0, 0);
        const imgData = gCtx.getImageData(0, 0, gCanvas.width, gCanvas.height);
        for (let j = 0; j < imgData.data.length; j += 4) {
          const avg = (imgData.data[j] + imgData.data[j + 1] + imgData.data[j + 2]) / 3;
          imgData.data[j] = imgData.data[j + 1] = imgData.data[j + 2] = avg;
        }
        gCtx.putImageData(imgData, 0, 0);
        dataUrl = gCanvas.toDataURL('image/jpeg', settings.quality);
      }

      const imgBytes = await fetch(dataUrl).then((res) => res.arrayBuffer());
      const embedded = await newPdf.embedJpg(imgBytes);
      const dims = embedded.scale(1);
      const newPage = newPdf.addPage([dims.width, dims.height]);
      newPage.drawImage(embedded, {
        x: 0,
        y: 0,
        width: dims.width,
        height: dims.height,
      });
    }

    const outBytes = await newPdf.save();
    setCompressedBlob(new Blob([outBytes], { type: 'application/pdf' }));
    setIsProcessing(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-2">PDF Compressor</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {isProcessing && <p>Processing...</p>}
      {previews.length > 0 && (
        <div className="grid grid-cols-1 gap-2 mt-4">
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`Page ${idx + 1}`} className="w-full border" />
          ))}
        </div>
      )}
      <button onClick={handleCompress} className="mt-4 bg-black text-white px-4 py-2 rounded">
        Compress & Download
      </button>
      {compressedBlob && (
        <button
          onClick={() => saveAs(compressedBlob, 'compressed.pdf')}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Download
        </button>
      )}
    </div>
  );
}