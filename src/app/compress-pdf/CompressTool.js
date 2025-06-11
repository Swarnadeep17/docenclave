"use client";

import React, { useEffect, useState, useRef } from "react";
import { PDFDocument } from "pdf-lib";
import { saveAs } from "file-saver";

export default function CompressTool() {
  const [pdfFile, setPdfFile] = useState(null);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [quality, setQuality] = useState(60);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const canvasRef = useRef(null);

  // ✅ Load pdfjs-dist ONLY in browser
  useEffect(() => {
    const loadPdfjs = async () => {
      if (typeof window !== "undefined") {
        const pdfjs = await import("pdfjs-dist/build/pdf");
        const workerSrc = await import("pdfjs-dist/build/pdf.worker.entry");
        pdfjs.GlobalWorkerOptions.workerSrc = workerSrc.default;
        setPdfjsLib(pdfjs);
      }
    };
    loadPdfjs();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setCompressedPdfUrl(null);
      setIsPreviewing(true);
    }
  };

  const compressPDF = async () => {
    if (!pdfFile || !pdfjsLib) return;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pdfDoc = await PDFDocument.create();

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });

      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      const imgData = canvas.toDataURL("image/jpeg", quality / 100);
      const embeddedImg = await pdfDoc.embedJpg(imgData);
      const newPage = pdfDoc.addPage([viewport.width, viewport.height]);

      newPage.drawImage(embeddedImg, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    const compressedBytes = await pdfDoc.save();
    const blob = new Blob([compressedBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    setCompressedPdfUrl(url);
    setIsPreviewing(false);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Compress PDF</h1>

      <input
        type="file"
        accept="application/pdf"
        onChange={handleUpload}
        className="mb-4"
      />

      {isPreviewing && (
        <div>
          <label className="block font-medium mb-2">
            Compression Quality: {quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            step="1"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full mb-4"
          />
          <button
            onClick={compressPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Compress Now
          </button>
        </div>
      )}

      {compressedPdfUrl && (
        <div className="mt-6">
          <a
            href={compressedPdfUrl}
            download={`compressed_${pdfFile.name}`}
            className="text-green-600 underline"
          >
            Download Compressed PDF
          </a>
        </div>
      )}
    </div>
  );
}