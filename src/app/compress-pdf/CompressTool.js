'use client';
import React, { useState, useRef, useEffect } from 'react';
import { pdfjs } from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function CompressTool() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [originalName, setOriginalName] = useState('');
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [quality, setQuality] = useState(60);
  const [grayscale, setGrayscale] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (fileData) generatePreview(fileData);
  }, [fileData]);

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsProcessing(true);
    setOriginalName(file.name);
    const arrayBuffer = await file.arrayBuffer();
    setFileData(arrayBuffer);
    setCompressedUrl(null);
    setIsProcessing(false);
  };

  const generatePreview = async (buffer) => {
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;
    const previews = [];

    for (let i = 1; i <= Math.min(5, numPages); i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.8 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport }).promise;
      previews.push(canvas.toDataURL());
    }

    setPages(previews);
  };

  const compressPDF = async () => {
    if (!fileData) return;
    setIsProcessing(true);
    const existingPdf = await PDFDocument.load(fileData);
    const newPdf = await PDFDocument.create();

    const numPages = existingPdf.getPageCount();
    for (let i = 0; i < numPages; i++) {
      const [copiedPage] = await newPdf.copyPages(existingPdf, [i]);
      const page = copiedPage;
      const { width, height } = page.getSize();

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      const pageImage = await existingPdf.saveAsBase64({ dataUri: true });
      const img = new Image();
      img.src = pageImage;
      await new Promise((res) => (img.onload = res));

      ctx.drawImage(img, 0, 0, width, height);

      if (grayscale) {
        const imageData = ctx.getImageData(0, 0, width, height);
        for (let j = 0; j < imageData.data.length; j += 4) {
          const avg = (imageData.data[j] + imageData.data[j + 1] + imageData.data[j + 2]) / 3;
          imageData.data[j] = imageData.data[j + 1] = imageData.data[j + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const imgData = canvas.toDataURL('image/jpeg', quality / 100);
      const embeddedImg = await newPdf.embedJpg(imgData);
      const newPage = newPdf.addPage([width, height]);
      newPage.drawImage(embeddedImg, { x: 0, y: 0, width, height });
    }

    if (removeMetadata) {
      newPdf.setTitle('');
      newPdf.setAuthor('');
      newPdf.setSubject('');
      newPdf.setKeywords([]);
    }

    const compressedBytes = await newPdf.save();
    const blob = new Blob([compressedBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    setCompressedUrl(url);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (compressedUrl) {
      const name = `compressed_${originalName}`;
      saveAs(compressedUrl, name);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-8 max-w-3xl mx-auto text-center">
      <h1 className="text-3xl font-bold">Compress PDF</h1>
      <p className="text-gray-500">Reduce your PDF size in-browser. Preview before download. Free & private.</p>

      <div
        onClick={() => fileInputRef.current.click()}
        className="cursor-pointer border-2 border-dashed border-gray-400 rounded-xl p-6 w-full hover:border-black"
      >
        <p className="text-gray-600">{originalName || 'Click to upload a PDF file (max 50 pages)'}</p>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>

      {fileData && (
        <div className="w-full">
          <div className="flex items-center justify-between mb-4">
            <label className="font-medium">Image Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="w-1/2"
            />
          </div>
          <div className="flex items-center justify-center gap-6 mb-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={grayscale} onChange={() => setGrayscale(!grayscale)} />
              Grayscale
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={removeMetadata} onChange={() => setRemoveMetadata(!removeMetadata)} />
              Remove Metadata
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            {pages.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index + 1}`} className="border rounded-lg shadow" />
            ))}
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            <button
              className="bg-black text-white px-4 py-2 rounded-lg disabled:opacity-50"
              onClick={compressPDF}
              disabled={isProcessing}
            >
              {isProcessing ? 'Compressing...' : 'Compress PDF'}
            </button>
            {compressedUrl && (
              <button
                className="border border-black text-black px-4 py-2 rounded-lg"
                onClick={handleDownload}
              >
                Download
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}