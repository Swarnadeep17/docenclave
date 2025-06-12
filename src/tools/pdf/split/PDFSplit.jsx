import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SEOHead = () => {
  useEffect(() => {
    document.title = "Free PDF Split Tool - Extract Pages from PDF Online | DocEnclave";
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      "Split PDF files for free with page preview. Extract specific pages, split by ranges, or create separate files. 100% secure, no uploads required. Start splitting PDFs instantly."
    );
  }, []);
  return null;
};

const PDFPageRenderer = ({ pdfDoc, pageNumber }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        setLoading(true);
        setError(false);
        const page = await pdfDoc.getPage(pageNumber);
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min(80 / viewport.width, 112 / viewport.height);
        const scaledViewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = scaledViewport.height;
        canvas.width = scaledViewport.width;
        const renderContext = { canvasContext: context, viewport: scaledViewport };
        await page.render(renderContext).promise;
        setLoading(false);
      } catch (err) {
        console.error('Error rendering PDF page:', err);
        setError(true);
        setLoading(false);
      }
    };
    renderPage();
  }, [pdfDoc, pageNumber]);

  if (error) return <div style={{ color: 'red' }}>Error loading page</div>;
  if (loading) return <div>Loading...</div>;

  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc', margin: '2px' }} />;
};

const PDFSplit = () => {
  const [file, setFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState([]); // array of page numbers (1-based)
  const [splitting, setSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    const pdfFile = acceptedFiles[0];
    if (pdfFile.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadedPdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setFile({ file: pdfFile, arrayBuffer });
    setPdfDoc(loadedPdfDoc);
    setNumPages(loadedPdfDoc.numPages);
    // Select all pages by default
    setSelectedPages(Array.from({ length: loadedPdfDoc.numPages }, (_, i) => i + 1));
    setSplitPdfUrl(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [] }, multiple: false });

  const togglePageSelection = (pageNumber) => {
    setSelectedPages(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const splitSelectedPages = async () => {
    if (!pdfDoc || selectedPages.length === 0) {
      alert('Please select pages to extract.');
      return;
    }
    setSplitting(true);
    try {
      const srcPdfBytes = file.arrayBuffer;
      const srcPdfLibDoc = await PDFDocument.load(srcPdfBytes);
      const newPdf = await PDFDocument.create();

      // Copy selected pages
      const copiedPages = await newPdf.copyPages(srcPdfLibDoc, selectedPages.map(p => p - 1));
      copiedPages.forEach(page => newPdf.addPage(page));

      const newPdfBytes = await newPdf.save();
      const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (err) {
      console.error('Error splitting PDF:', err);
      alert('Failed to split PDF. Please try again.');
    }
    setSplitting(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <SEOHead />
      <h1>PDF Split Tool</h1>
      <div {...getRootProps()} style={{
        border: '2px dashed #888',
        padding: 20,
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: 20,
        backgroundColor: isDragActive ? '#eee' : 'transparent'
      }}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop your PDF file here...</p> : <p>Drag & drop a PDF file here, or click to browse</p>}
      </div>

      {!file && <p>No file selected.</p>}

      {pdfDoc && (
        <>
          <h2>Select Pages to Extract</h2>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            maxHeight: 300,
            overflowY: 'auto',
            border: '1px solid #ccc',
            padding: 8,
            backgroundColor: '#fafafa'
          }}>
            {Array.from({ length: numPages }, (_, i) => i + 1).map(pageNumber => (
              <div
                key={pageNumber}
                onClick={() => togglePageSelection(pageNumber)}
                style={{
                  border: selectedPages.includes(pageNumber) ? '3px solid #007bff' : '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  width: 90,
                  textAlign: 'center',
                  userSelect: 'none'
                }}
                title={`Page ${pageNumber}`}
              >
                <PDFPageRenderer pdfDoc={pdfDoc} pageNumber={pageNumber} />
                <div style={{ fontSize: 12, padding: '2px 0' }}>Page {pageNumber}</div>
              </div>
            ))}
          </div>

          <button
            onClick={splitSelectedPages}
            disabled={splitting || selectedPages.length === 0}
            style={{ marginTop: 20, padding: '10px 20px', fontSize: 16 }}
          >
            {splitting ? 'Splitting...' : 'Extract Selected Pages'}
          </button>

          {splitPdfUrl && (
            <div style={{ marginTop: 20 }}>
              <h3>Extracted PDF</h3>
              <a href={splitPdfUrl} download="extracted.pdf" style={{ fontSize: 16, color: '#007bff' }}>
                Download Extracted PDF
              </a>
              <iframe
                src={splitPdfUrl}
                title="Extracted PDF Preview"
                style={{ width: '100%', height: 500, marginTop: 10, border: '1px solid #ccc' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PDFSplit;
