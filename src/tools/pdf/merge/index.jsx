// src/tools/pdf/merge/index.jsx
import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

export default function PDFMerger() {
  const [files, setFiles] = useState([]);
  
  const mergePDFs = async () => {
    const mergedPdf = await PDFDocument.create();
    
    for (const file of files) {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => mergedPdf.addPage(page));
    }
    
    const mergedPdfFile = await mergedPdf.save();
    // Create download link
  }
  
  return (
    <div>
      <input type="file" multiple accept=".pdf" 
             onChange={e => setFiles([...e.target.files])} />
      <button onClick={mergePDFs} disabled={files.length < 2}>
        Merge PDFs
      </button>
    </div>
  );
}