import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { useDropzone } from 'react-dropzone';
import { PLAN_LIMITS, formatFileSize, validateFile } from '../../../utils/constants.js';
import { trackDownload, trackToolUsage } from '../../../utils/firebase.js';

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

  if (error) {
    return (<div className="w-20 h-28 bg-white rounded border flex items-center justify-center"><div className="text-gray-400 text-xs text-center"><div className="text-lg mb-1">⚠️</div><div>Error</div></div></div>);
  }

  return (<div className="relative w-20 h-28"><canvas ref={canvasRef} className="w-full h-full bg-white rounded border" style={{ display: loading ? 'none' : 'block' }} /><div className="absolute inset-0 bg-white rounded border flex items-center justify-center" style={{ display: loading ? 'flex' : 'none' }}><div className="text-gray-400 text-xs text-center animate-pulse"><div className="text-lg mb-1">📄</div><div>Loading...</div></div></div></div>);
};

const PDFPagePreview = ({ file, pageNumber, isSelected, isDuplicate, onToggleSelect, onDelete, globalPageIndex }) => {
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    const loadPdfData = async () => {
      try {
        const arrayBuffer = await file.file.arrayBuffer();
        setPdfData(arrayBuffer);
      } catch (err) {
        console.error('Error loading PDF data:', err);
      }
    };
    loadPdfData();
  }, [file]);

  return (
    <div className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all ${isDuplicate ? 'border-yellow-500 shadow-yellow-500/20' : isSelected ? 'border-blue-500 shadow-blue-500/20' : 'border-dark-border'}`}>
      <button onClick={onDelete} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors">×</button>
      {isDuplicate && (<div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xs font-bold z-10">!</div>)}
      <div onClick={onToggleSelect} className="cursor-pointer">
        <PDFPageRenderer pdfData={pdfData} pageNumber={pageNumber} />
        <div className="text-center mt-2">
          <div className="text-dark-text-primary text-xs font-medium mb-1">Global #{globalPageIndex + 1}</div>
          <div className="text-dark-text-muted text-xs">Page {pageNumber}</div>
          <div className="mt-2"><input type="checkbox" checked={isSelected} onChange={onToggleSelect} className="w-4 h-4 accent-blue-500" onClick={(e) => e.stopPropagation()} /></div>
        </div>
      </div>
    </div>
  );
};

const FilePreview = ({ file, onPagesUpdate, onRemoveFile }) => {
  const handlePageToggle = (pageIndex) => {
    const updatedPages = file.pages.map((page, idx) => idx === pageIndex ? { ...page, selected: !page.selected } : page);
    onPagesUpdate(file.id, updatedPages);
  };

  const handlePageDelete = (pageIndex) => {
    const updatedPages = file.pages.filter((_, idx) => idx !== pageIndex);
    onPagesUpdate(file.id, updatedPages);
  };

  return (
    <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📄</span>
          <div>
            <h4 className="text-dark-text-primary font-medium">{file.name}</h4>
            <p className="text-dark-text-muted text-sm">{formatFileSize(file.size)} • {file.pages.length} pages • {file.pages.filter(p => p.selected).length} selected</p>
          </div>
        </div>
        <button onClick={() => onRemoveFile(file.id)} className="text-red-400 hover:text-red-300 p-2">🗑️</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button onClick={() => onPagesUpdate(file.id, file.pages.map(page => ({ ...page, selected: !file.pages.every(p => p.selected) })))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">{file.pages.every(p => p.selected) ? 'Deselect All' : 'Select All'}</button>
        <button onClick={() => onPagesUpdate(file.id, file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 0 })))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Odd Pages</button>
        <button onClick={() => onPagesUpdate(file.id, file.pages.map((page, idx) => ({ ...page, selected: idx % 2 === 1 })))} className="text-xs bg-dark-tertiary text-dark-text-secondary px-3 py-1 rounded hover:bg-gray-600 transition-colors">Even Pages</button>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {file.pages.map((page, pageIndex) => (<PDFPagePreview key={`${file.id}-${pageIndex}`} file={file} pageNumber={pageIndex + 1} isSelected={page.selected} isDuplicate={page.isDuplicate} onToggleSelect={() => handlePageToggle(pageIndex)} onDelete={() => handlePageDelete(pageIndex)} globalPageIndex={page.globalIndex} />))}
      </div>
    </div>
  );
};

const USPBar = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm mb-6">
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>👁️</span> <span className="text-dark-text-secondary">Page Preview</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>🔒</span> <span className="text-dark-text-secondary">100% Private</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>⚡</span> <span className="text-dark-text-secondary">Instant Processing</span></div>
      <div className="flex items-center justify-center gap-2 p-2 bg-dark-tertiary rounded-lg"><span>🎯</span> <span className="text-dark-text-secondary">Smart Detection</span></div>
    </div>
);

const PDFMerge = () => {
  const [files, setFiles] = useState([]);
  const [currentPlan, setCurrentPlan] = useState('FREE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [error, setError] = useState('');
  const [outputFilename, setOutputFilename] = useState('merged-document.pdf');
  const [previewMode, setPreviewMode] = useState(false);

  const limits = PLAN_LIMITS[currentPlan];

  useEffect(() => { trackToolUsage('pdf_merge'); }, []);

  const detectDuplicates = (allFiles) => {
    const pageHashes = new Map();
    let globalPageIndex = 0;
    return allFiles.map(file => ({...file, pages: file.pages.map((page, pageIndex) => { const pageHash = `${file.name}-${pageIndex}`; const isDuplicate = pageHashes.has(pageHash); pageHashes.set(pageHash, true); return { ...page, isDuplicate, globalIndex: globalPageIndex++ };})}));
  };

  const onDrop = async (acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) { setError('Only PDF files are accepted'); return; }
    if (files.length + acceptedFiles.length > limits.maxFiles) { setShowUpgradeModal(true); return; }
    const newFiles = [];
    let totalSize = files.reduce((sum, file) => sum + file.size, 0);
    for (const file of acceptedFiles) {
      const validation = validateFile(file, currentPlan);
      if (!validation.valid) { setError(validation.error); return; }
      if (totalSize + file.size > limits.maxTotalSize) { setShowUpgradeModal(true); return; }
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = Array.from({ length: pdfDoc.getPageCount() }, (_, index) => ({ pageIndex: index, selected: true, isDuplicate: false, globalIndex: 0 }));
        newFiles.push({ id: Math.random().toString(36).substring(7), file, name: file.name, size: file.size, pages });
        totalSize += file.size;
      } catch (err) { setError(`Failed to load PDF: ${file.name}. Please ensure it's a valid PDF file.`); return; }
    }
    setFiles(detectDuplicates([...files, ...newFiles]));
    if (newFiles.length > 0) setPreviewMode(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, multiple: true });

  const removeFile = (id) => setFiles(detectDuplicates(files.filter(file => file.id !== id)));

  const updatePages = (fileId, newPages) => setFiles(detectDuplicates(files.map(file => file.id === fileId ? { ...file, pages: newPages } : file)));

  const getTotalSelectedPages = () => files.reduce((total, file) => total + file.pages.filter(page => page.selected).length, 0);

  const moveFile = (id, direction) => {
    const index = files.findIndex(file => file.id === id);
    if ((direction === 'up' && index > 0) || (direction === 'down' && index < files.length - 1)) {
      const newFiles = [...files];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      setFiles(detectDuplicates(newFiles));
    }
  };

  const mergePDFs = async () => {
    if (getTotalSelectedPages() < 1) { setError('Please select at least 1 page to merge'); return; }
    setIsProcessing(true);
    setProgress(0);
    setError('');
    try {
      const mergedPdf = await PDFDocument.create();
      for (const [i, file] of files.entries()) {
        const selectedPagesInFile = file.pages.filter(page => page.selected);
        if (selectedPagesInFile.length > 0) {
          setProgress(Math.round(((i + 1) / files.length) * 80));
          const fileArrayBuffer = await file.file.arrayBuffer();
          const pdf = await PDFDocument.load(fileArrayBuffer);
          const pageIndices = selectedPagesInFile.map(page => page.pageIndex);
          const copiedPages = await mergedPdf.copyPages(pdf, pageIndices);
          copiedPages.forEach(page => mergedPdf.addPage(page));
        }
      }
      setProgress(95);
      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = outputFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      setProgress(100);
      await trackDownload('pdf_merge');
      setTimeout(() => { setIsProcessing(false); setProgress(0); setFiles([]); setPreviewMode(false); }, 1500);
    } catch (err) { console.error('PDF merge error:', err); setError('Failed to merge PDFs. Please ensure all files are valid PDF documents.'); setIsProcessing(false); setProgress(0); }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const totalSelectedPages = getTotalSelectedPages();

  return (
    <>
      <SEOHead />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-5xl mx-auto rounded-xl p-px bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500">
          <div className="bg-dark-secondary rounded-[11px] p-6 md:p-8">
            <div className="text-center mb-6"><h1 className="text-3xl md:text-4xl font-bold text-dark-text-primary mb-3">PDF Merge Tool</h1><p className="text-base text-dark-text-secondary max-w-2xl mx-auto">Combine multiple PDFs with page-by-page preview and reordering, all 100% private.</p></div>
            <USPBar />
            <div className="bg-dark-primary rounded-lg p-4 border border-dark-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-dark-text-secondary"><span><span className="font-medium text-dark-text-primary">{currentPlan}</span> PLAN</span><span>Files: <span className="text-dark-text-primary">{files.length}</span>/{limits.maxFiles}</span><span>Size: <span className="text-dark-text-primary">{formatFileSize(totalSize)}</span>/{formatFileSize(limits.maxTotalSize)}</span>{previewMode && (<span>Selected Pages: <span className="text-dark-text-primary">{totalSelectedPages}</span></span>)}</div>
                {currentPlan === 'FREE' && (<button onClick={() => setShowUpgradeModal(true)} className="bg-dark-tertiary text-dark-text-primary px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-700 transition-colors w-full sm:w-auto">Upgrade</button>)}
              </div>
              {error && (<div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400"><span className="font-bold mr-2">⚠️</span>{error}</div>)}
              
              {(!previewMode || files.length === 0) && (<div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-12 text-center transition-all cursor-pointer ${isDragActive ? 'border-blue-400 bg-blue-500/5' : 'border-dark-border hover:border-gray-500'}`}><input {...getInputProps()} /><div className="text-6xl mb-4">📄</div><h3 className="text-xl font-semibold text-dark-text-primary mb-2">{isDragActive ? 'Drop your PDF files here' : 'Choose or drag PDF files here'}</h3><p className="text-dark-text-secondary mb-4">Select multiple PDF files to combine them into one document</p><p className="text-dark-text-muted text-sm">Supports up to {limits.maxFiles} files • Maximum {formatFileSize(limits.maxTotalSize)} total</p></div>)}
              {!previewMode && files.length > 0 && (<div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-dark-text-primary">Selected Files ({files.length})</h3><div className="flex space-x-3"><div {...getRootProps()}><input {...getInputProps()} /><button className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">Add More Files</button></div><button onClick={() => setPreviewMode(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Advanced Preview</button></div></div><div className="bg-dark-secondary rounded-xl p-6 border border-dark-border"><div className="space-y-3">{files.map((file, index) => (<div key={file.id} className="flex items-center justify-between bg-dark-tertiary p-4 rounded-lg"><div className="flex items-center space-x-3"><span className="text-2xl">📄</span><div><p className="text-dark-text-primary font-medium">{file.name}</p><p className="text-dark-text-muted text-sm">{formatFileSize(file.size)} • {file.pages.length} pages</p></div></div><div className="flex items-center space-x-2"><button onClick={() => moveFile(file.id, 'up')} disabled={index === 0} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬆️</button><button onClick={() => moveFile(file.id, 'down')} disabled={index === files.length - 1} className="p-2 text-dark-text-secondary hover:text-dark-text-primary disabled:opacity-50 disabled:cursor-not-allowed">⬇️</button><button onClick={() => removeFile(file.id)} className="p-2 text-red-400 hover:text-red-300">🗑️</button></div></div>))}</div></div></div>)}
              {previewMode && files.length > 0 && (<div className="space-y-6"><div className="flex items-center justify-between"><h3 className="text-xl font-semibold text-dark-text-primary">Page Preview & Selection</h3><div className="flex space-x-3"><div {...getRootProps()}><input {...getInputProps()} /><button className="bg-dark-tertiary text-dark-text-primary px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">Add More Files</button></div><button onClick={() => setPreviewMode(false)} className="border border-dark-border text-dark-text-primary px-4 py-2 rounded-lg hover:bg-dark-tertiary transition-colors">Simple View</button></div></div>{files.map((file) => (<FilePreview key={file.id} file={file} onPagesUpdate={updatePages} onRemoveFile={removeFile} />))}</div>)}
              {files.length > 0 && (<div className="bg-dark-secondary rounded-xl p-6 border border-dark-border mt-6">{currentPlan === 'PREMIUM' && (<div className="mb-4"><label className="block text-dark-text-primary text-sm font-medium mb-2">Custom Output Filename</label><input type="text" value={outputFilename} onChange={(e) => setOutputFilename(e.target.value)} className="w-full bg-dark-tertiary border border-dark-border rounded-lg px-4 py-2 text-dark-text-primary focus:outline-none focus:border-blue-500" placeholder="merged-document.pdf" /></div>)}<button onClick={mergePDFs} disabled={totalSelectedPages < 1 || isProcessing} className="w-full bg-dark-text-primary text-dark-primary py-4 rounded-lg font-semibold hover:bg-dark-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg">{isProcessing ? `Merging... ${progress}%` : previewMode ? `Merge ${totalSelectedPages} Selected Pages` : `Combine ${files.length} PDF Files`}</button></div>)}
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <section className="mt-16"><h2 className="text-2xl font-bold text-dark-text-primary text-center mb-8">How to Use</h2><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div><h3 className="font-semibold text-dark-text-primary mb-2">Upload PDFs</h3><p className="text-dark-text-secondary text-sm">Drag & drop or browse to select multiple PDF files</p></div><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div><h3 className="font-semibold text-dark-text-primary mb-2">Preview & Select</h3><p className="text-dark-text-secondary text-sm">Choose specific pages and reorder as needed</p></div><div className="text-center"><div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div><h3 className="font-semibold text-dark-text-primary mb-2">Download</h3><p className="text-dark-text-secondary text-sm">Click merge and get your combined PDF instantly</p></div></div></section>
          <section className="mt-16"><div className="max-w-4xl mx-auto"><h2 className="text-3xl font-bold text-dark-text-primary mb-8">The Complete Guide to PDF Merging</h2><div className="space-y-8"><div><h3 className="text-xl font-semibold text-dark-text-primary mb-3">Why You Need a Reliable PDF Merger</h3><p className="text-dark-text-secondary leading-relaxed">In today's digital workspace, PDF files are everywhere. Whether you're a student combining research papers, a professional merging reports, or someone organizing personal documents, you need a tool that's both powerful and secure. Traditional PDF merger tools often require uploading your sensitive documents to unknown servers, creating privacy risks that simply aren't worth taking.</p></div><div><h3 className="text-xl font-semibold text-dark-text-primary mb-3">The Privacy Problem with Online PDF Tools</h3><p className="text-dark-text-secondary leading-relaxed">Most online PDF merger tools process your files on their servers. This means your confidential business documents, personal papers, or sensitive information is temporarily stored on computers you don't control. Even if they promise to delete files after processing, there's always a risk. DocEnclave solves this by processing everything locally in your browser — your files never leave your device.</p></div></div></div></section>
        </div>
        {showUpgradeModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-dark-secondary rounded-xl p-8 max-w-md mx-4 border border-dark-border"><h3 className="text-xl font-bold text-dark-text-primary mb-4">Upgrade to Premium for More Power</h3><p className="text-dark-text-secondary mb-6">You've reached the free plan limits. Upgrade to Premium and unlock:</p><ul className="space-y-2 mb-6"><li className="text-dark-text-secondary">✅ Merge up to 50 PDF files</li><li className="text-dark-text-secondary">✅ 500MB total file capacity</li><li className="text-dark-text-secondary">✅ Custom output filenames</li></ul><div className="flex space-x-3"><button onClick={() => setShowUpgradeModal(false)} className="flex-1 border border-dark-border text-dark-text-primary py-2 rounded-lg hover:bg-dark-tertiary transition-colors">Continue Free</button><button className="flex-1 bg-dark-text-primary text-dark-primary py-2 rounded-lg font-medium hover:bg-dark-text-secondary transition-colors">Upgrade to Premium</button></div></div></div>)}
      </div>
    </>
  );
};

export default PDFMerge;