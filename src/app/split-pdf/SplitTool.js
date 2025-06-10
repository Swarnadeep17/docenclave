'use client';

import { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import ToolPageHeader from '@/components/ToolPageHeader';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

// Required configuration for pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function SplitTool() {
  const [pages, setPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [outputType, setOutputType] = useState(null);

  // --- NEW STATE FOR ADVANCED OPTIONS ---
  const [splitMode, setSplitMode] = useState('visual'); // 'visual' or 'automated'
  const [fixedRange, setFixedRange] = useState(2); // Default for fixed range split

  const handleFileChange = async (event) => {
    // Reset all states on new file upload
    setPages([]);
    setSelectedPages(new Set());
    setOriginalFile(null);
    setOutputType(null);
    setIsProcessing(true);
    setSplitMode('visual'); // Default to visual mode on new upload

    const file = event.target.files[0];
    event.target.value = null;

    if (file && file.type === "application/pdf") {
      setOriginalFile(file);
      try {
        const fileBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: fileBuffer.slice(0) }).promise;
        const tempPages = [];

        for (let j = 1; j <= pdf.numPages; j++) {
          const page = await pdf.getPage(j);
          const viewport = page.getViewport({ scale: 0.25 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport: viewport }).promise;

          tempPages.push({
            id: `page-${j}`,
            originalPageNumber: j,
            imgSrc: canvas.toDataURL(),
          });
        }
        setPages(tempPages);
      } catch (error) {
        console.error("Could not process file:", file.name, error);
        alert(`Could not process ${file.name}. It might be corrupted or password-protected.`);
      }
    }
    setIsProcessing(false);
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(pageId)) {
        newSelected.delete(pageId);
      } else {
        newSelected.add(pageId);
      }
      return newSelected;
    });
  };
  
  const handleSelectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      const allPageIds = new Set(pages.map(p => p.id));
      setSelectedPages(allPageIds);
    }
  };

  const handleProcess = async (type) => {
    if (selectedPages.size === 0) {
      alert("Please select at least one page to proceed.");
      return;
    }
    setIsProcessing(true);
    setOutputType(type);

    try {
        const sourcePdfBytes = await originalFile.arrayBuffer();
        const sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });
        
        const selectedPageNumbers = pages
            .filter(p => selectedPages.has(p.id))
            .map(p => p.originalPageNumber - 1);
            
        if (type === 'extract') {
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, selectedPageNumbers);
            copiedPages.forEach(page => newPdf.addPage(page));

            const newPdfBytes = await newPdf.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            saveAs(blob, 'docenclave-extracted-pages.pdf');

        } else if (type === 'split') {
            const zip = new JSZip();
            for (let i = 0; i < selectedPageNumbers.length; i++) {
                const pageNumber = selectedPageNumbers[i];
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(sourcePdf, [pageNumber]);
                newPdf.addPage(copiedPage);
                const newPdfBytes = await newPdf.save();
                zip.file(`page_${pageNumber + 1}.pdf`, newPdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, "docenclave-split-pages.zip");
        }
        
        // Increment download stat
        fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
    } catch (error) {
      console.error(`Error during ${type} process:`, error);
      alert(`A critical error occurred during the ${type} process.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // --- NEW: LOGIC FOR AUTOMATED TASKS ---
  const handleAutomatedProcess = async (type) => {
    setIsProcessing(true);
    
    try {
        const sourcePdfBytes = await originalFile.arrayBuffer();
        let pageIndicesToExtract = [];

        // Determine which pages to extract based on the task type
        if (type === 'odd') {
            pageIndicesToExtract = pages.map(p => p.originalPageNumber - 1).filter(n => (n + 1) % 2 !== 0);
        } else if (type === 'even') {
            pageIndicesToExtract = pages.map(p => p.originalPageNumber - 1).filter(n => (n + 1) % 2 === 0);
        }

        // Logic for Fixed Range split
        if (type === 'fixedRange') {
            const zip = new JSZip();
            const totalPages = pages.length;
            const range = parseInt(fixedRange, 10);
            if (!range || range <= 0) {
                alert("Page range must be a number greater than 0.");
                setIsProcessing(false);
                return;
            }

            for (let i = 0; i < totalPages; i += range) {
                // We need to load the PDF here because pdf-lib docs cannot be reused across async operations easily
                const sourcePdf = await PDFDocument.load(sourcePdfBytes.slice(0), { ignoreEncryption: true });
                const newPdf = await PDFDocument.create();
                const chunkPageIndices = Array.from({ length: Math.min(range, totalPages - i) }, (_, k) => i + k);
                
                const copiedPages = await newPdf.copyPages(sourcePdf, chunkPageIndices);
                copiedPages.forEach(page => newPdf.addPage(page));
                
                const newPdfBytes = await newPdf.save();
                zip.file(`docenclave_pages_${i + 1}-${i + range}.pdf`, newPdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, "docenclave-split-by-range.zip");

        // Logic for Odd/Even Pages extraction
        } else {
            const sourcePdf = await PDFDocument.load(sourcePdfBytes, { ignoreEncryption: true });
            const newPdf = await PDFDocument.create();
            const copiedPages = await newPdf.copyPages(sourcePdf, pageIndicesToExtract);
            copiedPages.forEach(page => newPdf.addPage(page));

            const newPdfBytes = await newPdf.save();
            const blob = new Blob([newPdfBytes], { type: 'application/pdf' });
            saveAs(blob, `docenclave-extracted-${type}-pages.pdf`);
        }
        
        // Increment download stat
        fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
    } catch (error) {
        console.error(`Error during automated split (${type}):`, error);
        alert(`A critical error occurred during the automated split process.`);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleStartOver = () => {
    setPages([]);
    setSelectedPages(new Set());
    setOriginalFile(null);
    setOutputType(null);
    setSplitMode('visual');
    const fileInput = document.getElementById('file-upload');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader 
        title="Visual PDF Splitter"
        description="Click to select the exact pages you want to extract or split. Complete privacy, no uploads."
      />
      {/* --- NEW: Mode Toggle UI --- */}
      {originalFile && (
        <div className="flex justify-center mb-8 border-b-2 border-gray-700">
            <button
                onClick={() => setSplitMode('visual')}
                className={`px-6 py-3 font-semibold transition-colors ${splitMode === 'visual' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
            >
                Visual Selection
            </button>
            <button
                onClick={() => setSplitMode('automated')}
                className={`px-6 py-3 font-semibold transition-colors ${splitMode === 'automated' ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
            >
                Automated Splitting
            </button>
        </div>
      )}

      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        {!originalFile && (
          <label htmlFor="file-upload" className="mb-8 flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
              <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload a PDF</span></p>
              <p className="text-xs text-gray-500">Select a single PDF file to start</p>
            </div>
            <input id="file-upload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
          </label>
        )}
        
        {isProcessing && <p className="text-center text-accent my-8">Processing, please wait...</p>}
        
        {!isProcessing && originalFile && (
            <>
                {splitMode === 'visual' && (
                    <>
                        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                            <div className="text-gray-300">
                                <span className="font-bold text-accent">{selectedPages.size}</span> of {pages.length} pages selected
                            </div>
                            <button onClick={handleSelectAll} className="text-sm font-semibold text-accent hover:underline mt-2 sm:mt-0">
                                {selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}
                            </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 p-4 bg-gray-900/50 rounded-lg overflow-x-auto min-h-[150px]">
                            {pages.map((page, index) => (
                                <div key={page.id} onClick={() => togglePageSelection(page.id)} className="relative group aspect-[7/10] cursor-pointer">
                                <img src={page.imgSrc} alt={`Page ${index + 1}`} className={`w-full h-full object-contain border-4 rounded-md transition-colors ${selectedPages.has(page.id) ? 'border-accent' : 'border-gray-600 group-hover:border-gray-500'}`} />
                                <div className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1 rounded-tr-md rounded-bl-md">{index + 1}</div>
                                {selectedPages.has(page.id) && (
                                    <div className="absolute top-1 right-1 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                            <button onClick={() => handleProcess('extract')} disabled={isProcessing || selectedPages.size === 0} className="w-full sm:w-auto bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">Extract {selectedPages.size} Pages</button>
                            <button onClick={() => handleProcess('split')} disabled={isProcessing || selectedPages.size === 0} className="w-full sm:w-auto bg-gray-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed">Split into {selectedPages.size} Files</button>
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={handleStartOver} className="text-sm text-gray-400 hover:text-white hover:underline">Start Over with a new file</button>
                        </div>
                    </>
                )}

                {splitMode === 'automated' && (
                    <div className="py-8">
                        <h3 className="text-xl font-semibold text-center mb-6 text-gray-200">Choose an Automated Task</h3>
                        <div className="max-w-xl mx-auto space-y-6">
                            <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                <div className="flex items-center">
                                    <label htmlFor="fixed-range" className="mr-4 text-gray-300">Split every</label>
                                    <input
                                    type="number"
                                    id="fixed-range"
                                    value={fixedRange}
                                    onChange={(e) => setFixedRange(Math.max(1, parseInt(e.target.value) || 1))}
                                    className="w-20 bg-gray-700 text-white p-2 rounded-md text-center"
                                    min="1"
                                    />
                                    <span className="ml-4 text-gray-300">pages</span>
                                </div>
                                <button onClick={() => handleAutomatedProcess('fixedRange')} className="bg-accent text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">Run</button>
                            </div>
                            <div className="bg-gray-900/50 p-4 rounded-lg flex items-center justify-between gap-4">
                                <p className="text-gray-300">Extract specific pages</p>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAutomatedProcess('odd')} className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600">Odd Pages</button>
                                    <button onClick={() => handleAutomatedProcess('even')} className="bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg hover:bg-gray-600">Even Pages</button>
                                </div>
                            </div>
                        </div>
                        <div className="text-center mt-12">
                            <button onClick={handleStartOver} className="text-sm text-gray-400 hover:text-white hover:underline">Start Over with a new file</button>
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      <div className="mt-20 text-gray-300 prose prose-invert max-w-none prose-p:text-gray-300 prose-h2:text-gray-100 prose-h3:text-gray-200 prose-h4:text-gray-200">
        <h2 className="text-3xl font-bold mb-6">The Visual Way to Split PDF Files</h2>
        <p>Stop guessing with page numbers. The DocEnclave PDF Splitter gives you a bird's-eye view of your entire document, allowing you to hand-pick the exact pages you need. Whether you're extracting a single chapter for a colleague, separating a batch of invoices, or just saving a specific section for your records, our tool provides the precision you need, with the privacy you deserve.</p>
        <p>Like all DocEnclave tools, the splitting process happens entirely on your device. Your large reports, confidential agreements, and personal documents are never uploaded, analyzed, or stored on any server. It's the most secure way to deconstruct a PDF.</p>

        <h3 className="text-2xl font-bold mt-12 mb-4">Two Powerful Splitting Modes</h3>
        <p>We understand that not all tasks are the same. That's why our tool offers two distinct modes for maximum flexibility:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Extract Selected Pages:</strong> This is your precision tool. Click to select any number of pages, in any order, and our tool will create a single new PDF containing only your selection. Perfect for creating custom excerpts or reports.</li>
          <li><strong>Split into Separate Files:</strong> Have a document with 100 individual invoices? With one click, this mode will take every page you've selected and save each one as its own separate PDF file, neatly packaged in a downloadable ZIP archive. It's a massive time-saver for batch processing.</li>
        </ul>

        <h3 className="text-2xl font-bold mt-12 mb-4">Your Workflow, Your Privacy</h3>
        <p>The freedom to manage your documents should not come at the cost of your privacy. Our in-browser approach ensures that you are always in control. There are no file size limits imposed by servers and no waiting for uploads. Just instant, secure, and intuitive PDF splitting.</p>

        <h2 className="text-3xl font-bold mt-16 mb-8">Frequently Asked Questions</h2>
        <div className="space-y-8">
          <div>
            <h4 className="text-xl font-semibold">How do I extract specific pages from a PDF?</h4>
            <p>It's easy. 1) Upload your PDF file. 2) In the visual grid, click on all the pages you wish to keep. They will be highlighted. 3) Click the "Extract Pages" button to download a new PDF containing only your selection.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Is this PDF splitter free to use?</h4>
            <p>Yes, 100%. The DocEnclave PDF Splitter is completely free, with no page limits, no watermarks, and no registration needed. It's part of our commitment to providing powerful, private document tools for everyone.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">How do I separate every page of a PDF into its own file?</h4>
            <p>After uploading your PDF, click the "Select All Pages" button (or manually select the ones you want). Then, click the "Split into Separate Files" button. Your browser will download a ZIP file containing each selected page as an individual PDF.</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold">Is splitting my PDF here secure?</h4>
            <p>It is the most secure method available. Because the tool runs entirely in your browser, your PDF file is never sent over the internet. It never leaves your computer, guaranteeing the confidentiality of your information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}