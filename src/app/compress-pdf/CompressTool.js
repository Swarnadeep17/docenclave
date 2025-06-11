import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/build/pdf.worker.entry';
import { saveAs } from 'file-saver';

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [originalName, setOriginalName] = useState('');
  const [previewPages, setPreviewPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quality, setQuality] = useState(60);
  const [grayscale, setGrayscale] = useState(false);
  const [removeMetadata, setRemoveMetadata] = useState(false);
  const [loading, setLoading] = useState(false);

  const canvasRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith('.pdf')) return;
    setOriginalName(file.name);
    setLoading(true);
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const total = Math.min(pdf.numPages, 50);

    const previews = [];
    for (let i = 1; i <= total; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: context, viewport }).promise;
      previews.push(canvas.toDataURL());
    }
    setPreviewPages(previews);
    setCurrentPage(1);
    setFile(arrayBuffer);
    setLoading(false);
  };

  const compressPDF = async () => {
    if (!file) return;
    setLoading(true);
    const srcPdf = await pdfjsLib.getDocument({ data: file }).promise;
    const totalPages = Math.min(srcPdf.numPages, 50);
    const newPdf = await PDFDocument.create();

    for (let i = 1; i <= totalPages; i++) {
      const page = await srcPdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      if (grayscale) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = data[i + 1] = data[i + 2] = avg;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const imgData = canvas.toDataURL('image/jpeg', quality / 100);
      const img = await newPdf.embedJpg(imgData);
      const pageDims = img.scale(1);
      const newPage = newPdf.addPage([pageDims.width, pageDims.height]);
      newPage.drawImage(img, { x: 0, y: 0, width: pageDims.width, height: pageDims.height });
    }

    if (removeMetadata) {
      newPdf.setTitle('');
      newPdf.setAuthor('');
      newPdf.setSubject('');
      newPdf.setProducer('');
    }

    const pdfBytes = await newPdf.save();
    const renamed = `compressed_${originalName}`;
    saveAs(new Blob([pdfBytes], { type: 'application/pdf' }), renamed);
    setLoading(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-4">Compress PDF</h2>

      <div className="border-dashed border-2 p-6 rounded-xl mb-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="mb-2"
        />
        <p className="text-sm text-gray-500">Max 50 pages. PDF only.</p>
      </div>

      {file && (
        <>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Compression Quality: {quality}%</label>
            <input
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(e) => setQuality(Number(e.target.value))}
              className="w-full"
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

          {previewPages.length > 0 && (
            <div className="mb-4">
              <img
                src={previewPages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="border mx-auto max-h-96"
              />
              <div className="flex justify-center items-center gap-4 mt-2">
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Prev
                </button>
                <span className="text-sm">Page {currentPage} of {previewPages.length}</span>
                <button
                  className="px-3 py-1 rounded bg-gray-200"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, previewPages.length))}
                  disabled={currentPage === previewPages.length}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          <button
            onClick={compressPDF}
            className="bg-black text-white px-6 py-2 rounded-xl hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? 'Compressing…' : 'Download Compressed PDF'}
          </button>
        </>
      )}
    </div>
  );
}
