"use client";

import React, { useState, useEffect } from "react";
import { PDFDocument, rgb } from "pdf-lib";
import { saveAs } from "file-saver";

export default function CompressTool() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfjsLib, setPdfjsLib] = useState(null);
  const [quality, setQuality] = useState(60);
  const [compressedPdfUrl, setCompressedPdfUrl] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

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

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setCompressedPdfUrl(null);
      setIsPreviewing(true);
    }
  };

  const compressPDF = async () => {
    console.log("PDF File:", pdfFile);
    console.log("pdfjsLib:", pdfjsLib);

    if (!pdfFile || !pdfjsLib) return;

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedarray = new Uint8Array(this.result);

      const loadingTask = pdfjsLib.getDocument({ data: typedarray });
      const pdf = await loadingTask.promise;

      const compressedPdfDoc = await PDFDocument.create();

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({ canvasContext: context, viewport });
        await renderTask.promise;

        const imgData = canvas.toDataURL("image/jpeg", quality / 100);
        const imgBytes = await fetch(imgData).then((res) => res.arrayBuffer());

        const img = await compressedPdfDoc.embedJpg(imgBytes);
        const pageRef = compressedPdfDoc.addPage([img.width, img.height]);
        pageRef.drawImage(img, {
          x: 0,
          y: 0,
          width: img.width,
          height: img.height,
        });
      }

      const pdfBytes = await compressedPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setCompressedPdfUrl(url);
    };

    fileReader.readAsArrayBuffer(pdfFile);
  };

  return (
    <div className="bg-neutral-900 text-white min-h-screen flex flex-col items-center justify-start px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6 text-center">Compress PDF</h1>

      <div className="bg-neutral-800 p-6 rounded-xl w-full max-w-md shadow-lg">
        <label className="block mb-3 text-sm font-medium">Upload a PDF file:</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleUpload}
          className="w-full bg-neutral-700 text-sm p-2 rounded mb-5"
        />

        {isPreviewing && (
          <>
            <label className="block mb-2 text-sm font-medium">
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
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-semibold"
            >
              Compress Now
            </button>
          </>
        )}

        {compressedPdfUrl && (
          <a
            href={compressedPdfUrl}
            download={`compressed_${pdfFile.name}`}
            className="mt-5 block text-center text-green-400 underline"
          >
            Download Compressed PDF
          </a>
        )}
      </div>

      <footer className="text-xs mt-auto pt-20 text-neutral-400">
        <div className="flex justify-center space-x-4">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/about" className="hover:underline">About</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
        <p className="mt-4">&copy; 2025 DocEnclave. All rights reserved.</p>
      </footer>
    </div>
  );
}