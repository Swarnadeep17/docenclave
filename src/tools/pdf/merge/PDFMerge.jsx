import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const SEOHead = () => {
  useEffect(() => {
    document.title = "Free PDF Merge Tool - Combine PDF Files Online | DocEnclave";
    document.querySelector('meta[name="description"]')?.setAttribute('content',
      "Merge PDF files for free with page preview. Combine, reorder, and select specific pages. 100% secure, no uploads required. Start merging PDFs instantly."
    );
  }, []);
  return null;
};

const PDFPageRenderer = ({ pdfData, pageNumber }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdfData || !canvasRef.current) return;
      try {
        setLoading(true);
        setError(false);
        const pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
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
  }, [pdfData, pageNumber]);

  if (error) return <div style={{ color: 'red' }}>Error loading page</div>;
  if (loading) return <div>Loading...</div>;

  return <canvas ref={canvasRef} style={{ border: '1px solid #ccc', margin: '2px' }} />;
};

const PDFMerge = () => {
  const [files, setFiles] = useState([]);
  const [pdfPages, setPdfPages] = useState([]); // [{ fileIndex, pageNumber, selected }]
  const [merging, setMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);

  const onDrop = async (acceptedFiles) => {
    // Filter PDFs only
    const pdfFiles = acceptedFiles.filter(f => f.type === 'application/pdf');
    if (pdfFiles.length === 0) return;

    // Read each PDF, get number of pages, add to state
    const newFiles = [];
    const newPdfPages = [];

    for (let i = 0; i < pdfFiles.length; i++) {
      const file = pdfFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdfDoc.numPages;
      newFiles.push({ file, arrayBuffer, numPages });
      for (let p = 1; p <= numPages; p++) {
        newPdfPages.push({ fileIndex: i, pageNumber: p, selected: true });
      }
    }
    setFiles(newFiles);
    setPdfPages(newPdfPages);
    setMergedPdfUrl(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': [] } });

  const togglePageSelection = (index) => {
    setPdfPages(prev =>
      prev.map((page, i) => i === index ? { ...page, selected: !page.selected } : page)
    );
  };

  const reorderPages = (dragIndex, hoverIndex) => {
    // Simple reorder logic
    const pages = [...pdfPages];
    const [removed] = pages.splice(dragIndex, 1);
    pages.splice(hoverIndex, 0, removed);
    setPdfPages(pages);
  };

  const mergeSelectedPages = async () => {
    setMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();

      // Map fileIndex to PDFDocument loaded by pdf-lib
      const loadedDocs = {};
      for (let i = 0; i < files.length; i++) {
        loadedDocs[i] = await PDFDocument.load(files[i].arrayBuffer);
      }

      // For each selected page in order, copy page to mergedPdf
      for (const page of pdfPages.filter(p => p.selected)) {
        const srcDoc = loadedDocs[page.fileIndex];
        const [copiedPage] = await mergedPdf.copyPages(srcDoc, [page.pageNumber - 1]);
        mergedPdf.addPage(copiedPage);
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (err) {
      console.error('Error merging PDFs:', err);
      alert('Failed to merge PDFs. Please try again.');
    }
    setMerging(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <SEOHead />
      <h1>PDF Merge Tool</h1>
      <div {...getRootProps()} style={{
        border: '2px dashed #888',
        padding: 20,
        textAlign: 'center',
        cursor: 'pointer',
        marginBottom: 20,
        backgroundColor: isDragActive ? '#eee' : 'transparent'
      }}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop your PDF files here...</p> : <p>Drag & drop PDF files here, or click to browse</p>}
      </div>

      {files.length === 0 && <p>No files selected.</p>}

      {files.length > 0 && (
        <>
          <h2>Pages Preview & Selection</h2>
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
            {pdfPages.map((page, idx) => {
              const file = files[page.fileIndex];
              return (
                <div key={idx} style={{
                  border: page.selected ? '3px solid #007bff' : '1px solid #ccc',
                  borderRadius: 4,
                  cursor: 'pointer',
                  width: 90,
                  textAlign: 'center',
                  userSelect: 'none'
                }}
                  onClick={() => togglePageSelection(idx)}
                  title={`File: ${file.file.name}, Page: ${page.pageNumber}`}
                >
                  <PDFPageRenderer pdfData={file.arrayBuffer} pageNumber={page.pageNumber} />
                  <div style={{ fontSize: 12, padding: '2px 0' }}>Page {page.pageNumber}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={mergeSelectedPages}
            disabled={merging || pdfPages.filter(p => p.selected).length === 0}
            style={{ marginTop: 20, padding: '10px 20px', fontSize: 16 }}
          >
            {merging ? 'Merging...' : 'Merge Selected Pages'}
          </button>

          {mergedPdfUrl && (
            <div style={{ marginTop: 20 }}>
              <h3>Merged PDF</h3>
              <a href={mergedPdfUrl} download="merged.pdf" style={{ fontSize: 16, color: '#007bff' }}>
                Download Merged PDF
              </a>
              <iframe
                src={mergedPdfUrl}
                title="Merged PDF Preview"
                style={{ width: '100%', height: 500, marginTop: 10, border: '1px solid #ccc' }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PDFMerge;
