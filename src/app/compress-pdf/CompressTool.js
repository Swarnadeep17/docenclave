'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjs from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import ToolPageHeader from '@/components/ToolPageHeader';

// Configure pdfjs worker source
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Predefined quality presets for compression
const qualityPresets = [
  { name: 'Recommended', value: 75, description: 'Good balance of size and quality.' },
  { name: 'Strong Compression', value: 50, description: 'Smaller file, noticeable quality reduction.' },
  { name: 'Extreme Compression', value: 25, description: 'Smallest file, significant quality reduction.' },
];

// Initial settings for the compression tool
const initialSettings = {
  quality: 75,
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  // State variables to manage the tool's flow and data
  const [file, setFile] = useState(null); // Stores the original uploaded PDF file
  const [settings, setSettings] = useState(initialSettings); // Stores current compression settings
  const [isProcessing, setIsProcessing] = useState(false); // Indicates if compression is in progress
  const [processingMessage, setProcessingMessage] = useState(''); // Message displayed during processing
  const [compressedFile, setCompressedFile] = useState(null); // Stores the result of the compressed PDF
  const previewCanvasRef = useRef(null); // Ref for the canvas element used to display PDF preview

  /**
   * Handles the file input change event.
   * Validates if the selected file is a PDF and updates the state.
   */
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    // Clear the input value to allow re-uploading the same file if needed
    event.target.value = null;
    if (selectedFile && selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setCompressedFile(null); // Reset compressed file state when a new file is uploaded
        setSettings(initialSettings); // Reset settings to initial when a new file is uploaded
    } else if (selectedFile) {
        alert('Please select a valid PDF file.');
    }
  };

  /**
   * Effect hook to render the preview of the compressed PDF onto the canvas.
   * This runs whenever `compressedFile` or `file` state changes.
   */
    // --- EFFECT TO RENDER PREVIEW OF COMPRESSED FILE ---
  useEffect(() => {
    if (compressedFile && compressedFile.blob) { // Removed previewCanvasRef.current from outer if
        setHasPreviewRendered(false); // Reset before attempting to render
        const renderPreview = async () => {
            setProcessingMessage('Rendering final preview...');
            try {
                const canvas = previewCanvasRef.current; // Get the current ref value here
                if (!canvas) { // Explicitly check if canvas element is available
                    console.warn("Preview canvas element not found, deferring render.");
                    // You might want to set a flag here to retry or show a specific message
                    return; // Exit if canvas is not ready
                }

                const arrayBuffer = await compressedFile.blob.arrayBuffer();
                const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const page = await pdfDoc.getPage(1);
                const viewport = page.getViewport({ scale: 1.0 });
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                setHasPreviewRendered(true);
            } catch (e) {
                console.error("Error rendering compressed preview:", e);
                console.error("PDF.js rendering error details:", JSON.stringify(e, Object.getOwnPropertyNames(e)));
                setHasPreviewRendered(false);
            } finally {
                setProcessingMessage('');
            }
        };
        // Add a small delay to ensure the DOM has updated and the canvas element is available
        // This is a common workaround for ref-related race conditions in React
        const timeoutId = setTimeout(renderPreview, 50); // Small delay, e.g., 50ms

        return () => clearTimeout(timeoutId); // Cleanup timeout if component unmounts or deps change
    } else if (!compressedFile && file) {
        const canvas = previewCanvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        setHasPreviewRendered(false);
    }
  }, [compressedFile, file]); // No change to dependencies
 // Dependencies for the effect

  /**
   * Handles the compression and preview generation process.
   * This is the core logic of the tool.
   */
  const handleProcessAndPreview = async () => {
    if (!file) return; // Exit if no file is selected

    setIsProcessing(true); // Start processing
    setProcessingMessage('Initializing compression...');

    // Implement a timeout for the entire compression operation
    let operationCompleted = false;
    const operationTimeout = setTimeout(() => {
        if (!operationCompleted) {
            console.error("Compression operation timed out.");
            alert("The compression process took too long and was stopped. The PDF might be too large or complex.");
            setIsProcessing(false);
            setProcessingMessage('');
        }
    }, 60000); // 60 seconds timeout

    try {
        const newPdfDoc = await PDFDocument.create(); // Create a new PDF document
        const fileBuffer = await file.arrayBuffer(); // Read the original PDF into an ArrayBuffer
        const sourcePdf = await pdfjs.getDocument({ data: fileBuffer }).promise; // Parse original PDF with pdfjs

        // Iterate through each page of the original PDF
        for (let i = 1; i <= sourcePdf.numPages; i++) {
            setProcessingMessage(`Processing page ${i} of ${sourcePdf.numPages}...`);
            // Yield to the event loop to update UI for message
            await new Promise(resolve => setTimeout(resolve, 0));

            const page = await sourcePdf.getPage(i);
            // Render page onto an off-screen canvas at a high resolution
            const viewport = page.getViewport({ scale: 2.0 }); // Scale for better image quality
            const canvas = document.createElement('canvas'); // Create a temporary off-screen canvas
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport }).promise;

            // Apply grayscale filter if enabled
            if (settings.isGrayscale) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let j = 0; j < data.length; j += 4) {
                    const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
                    data[j] = avg; data[j + 1] = avg; data[j + 2] = avg;
                }
                ctx.putImageData(imageData, 0, 0);
            }

            // Convert canvas content to JPEG and embed into the new PDF
            const jpgImageBytes = await newPdfDoc.embedJpg(canvas.toDataURL('image/jpeg', settings.quality / 100));
            const newPage = newPdfDoc.addPage([page.view[2], page.view[3]]); // Add page with original dimensions
            newPage.drawImage(jpgImageBytes, { x: 0, y: 0, width: newPage.getWidth(), height: newPage.getHeight() });
        }

        // Remove metadata if enabled
        if (settings.removeMetadata) {
            newPdfDoc.setTitle('');
            newPdfDoc.setAuthor('');
            // You can also clear other fields like Subject, Keywords, Creator, Producer if desired
            // newPdfDoc.setSubject('');
            // newPdfDoc.setKeywords([]);
            // newPdfDoc.setCreator('');
            // newPdfDoc.setProducer('');
        }

        const pdfBytes = await newPdfDoc.save(); // Save the new PDF document
        const blob = new Blob([pdfBytes], { type: 'application/pdf' }); // Create a Blob from the PDF bytes

        operationCompleted = true; // Mark operation as completed successfully
        clearTimeout(operationTimeout); // Clear the timeout

        // Crucial Change: Set isProcessing to false and clear message *before* setting compressedFile.
        // This allows the CurrentView to immediately transition to PreviewView.
        setIsProcessing(false);
        setProcessingMessage('');

        setCompressedFile({ // Store the compressed file blob and info, triggering preview useEffect
            blob: blob,
            size: blob.size,
            name: `docenclave-compressed-${file.name}`
        });

    } catch (error) {
        operationCompleted = true; // Mark operation as completed even on error
        clearTimeout(operationTimeout); // Clear timeout
        console.error("Failed to compress PDF:", error);
        alert("An error occurred during compression. The PDF might be too complex for this tool.");
        setIsProcessing(false); // Reset processing state on error
        setProcessingMessage(''); // Clear message on error
    }
  };

  /**
   * Handles the download of the compressed PDF.
   */
  const handleDownload = () => {
      if(!compressedFile) return;
      saveAs(compressedFile.blob, compressedFile.name);
      // Send a statistic to your API (if applicable)
      fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
  };

  /**
   * Utility function to format bytes into human-readable sizes (KB, MB, GB).
   * @param {number} bytes - The number of bytes.
   * @param {number} decimals - Number of decimal places.
   * @returns {string} Formatted size string.
   */
  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes'; // Handle 0 bytes case
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  /**
   * Resets the tool to the initial upload state.
   */
  const handleStartOver = () => {
    setFile(null);
    setCompressedFile(null);
    setSettings(initialSettings); // Also reset settings when starting over
  };

  /**
   * Navigates back to the settings view while preserving the uploaded file.
   */
  const handleReconfigure = () => {
    setCompressedFile(null); // Clear compressed file to go back to settings view
    // The original 'file' state remains, so user doesn't have to re-upload
  };

  /**
   * Component for the file upload stage.
   */
  const UploadView = () => (
    <label htmlFor="file-upload-compress" className="mb-8 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">Click to upload PDF</span></p>
            <p className="text-xs text-gray-500">Select a single PDF file to compress</p>
        </div>
        <input id="file-upload-compress" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
    </label>
  );

  /**
   * Component for the compression settings stage.
   */
  const SettingsView = () => (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
              <h3 className="text-2xl font-semibold mb-4 text-gray-200">Your file is ready.</h3>
              <p className="text-gray-400">Original Name: <span className="font-medium">{file.name}</span></p>
              <p className="text-gray-400">Original Size: <span className="font-bold">{formatBytes(file.size)}</span></p>
              <p className="mt-4 max-w-sm text-gray-500">Select your preferred compression level and options. Click "Compress & Preview" to see the result.</p>
          </div>
          <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Level</h3>
                <div className="space-y-2">
                    {qualityPresets.map(preset => (
                        <button
                            key={preset.name}
                            onClick={() => setSettings(prev => ({...prev, quality: preset.value}))}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${settings.quality === preset.value ? 'bg-accent border-accent text-white' : 'bg-gray-700 border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white'}`}
                        >
                            <div className="font-semibold">{preset.name}</div>
                            <div className="text-xs opacity-80">{preset.description}</div>
                        </button>
                    ))}
                </div>

              <h3 className="text-xl font-bold border-b border-gray-600 pb-2 pt-4">Advanced Options</h3>
              <div className="space-y-3">
                  {/* Grayscale Toggle */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label>
                    <button
                      onClick={() => setSettings(p => ({...p, isGrayscale: !p.isGrayscale}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                  {/* Remove Metadata Toggle */}
                  <div className="flex items-center justify-between">
                    <label htmlFor="metadata" className="text-sm text-gray-300">Remove Metadata</label>
                    <button
                      onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
              </div>
              <div className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md">Note: Compression makes text non-selectable.</div>
              <div className="pt-4 border-t border-gray-600 space-y-3">
                <button
                  onClick={handleProcessAndPreview}
                  disabled={isProcessing} // Disable button during processing
                  className={`w-full bg-accent text-white font-bold py-3 px-8 rounded-lg transition-colors ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
                >
                  {isProcessing ? 'Processing...' : 'Compress & Preview'}
                </button>
                <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Use a different file</button>
              </div>
          </div>
      </div>
  );

  /**
   * Component for the preview and download stage.
   */
  const PreviewView = () => {
      const reduction = file && compressedFile ? 100 - (compressedFile.size / file.size) * 100 : 0;
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
                  {processingMessage === 'Rendering final preview...' ? ( // Show message while preview is being rendered
                    <div className="text-center text-accent">{processingMessage}</div>
                  ) : (
                    <canvas ref={previewCanvasRef} className="max-w-full max-h-full object-contain" />
                  )}
              </div>
              <div className="md:col-span-1 flex flex-col space-y-6">
                  <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Preview & Download</h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div><p className="text-xs text-gray-400">Original Size</p><p className="font-semibold text-lg line-through">{formatBytes(file.size)}</p></div>
                    <div><p className="text-xs text-gray-400">New Size</p><p className="font-semibold text-lg text-accent">{formatBytes(compressedFile.size)}</p></div>
                  </div>
                  <div className="text-center bg-green-900/40 p-3 rounded-lg"><p className="text-xs text-green-300">Reduction</p><p className="font-bold text-xl text-green-300">~{Math.round(reduction)}%</p></div>
                  <div className="pt-4 border-t border-gray-600 space-y-3">
                    <button onClick={handleDownload} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Download Compressed PDF</button>
                    <button onClick={handleReconfigure} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Change Settings</button>
                  </div>
              </div>
          </div>
      );
  };

  /**
   * Renders the appropriate view based on the current state (Upload, Settings, Processing, Preview).
   */
  const CurrentView = () => {
    // If compressedFile is available, always show PreviewView.
    // The useEffect will handle the asynchronous rendering of the preview content.
    if (compressedFile) {
        return <PreviewView />;
    }
    // If we are currently processing (compressing), show the processing message.
    if (isProcessing) {
        return <div className="text-center py-20 text-accent">{processingMessage}</div>;
    }
    // If a file has been selected but not yet compressed, show the SettingsView.
    if (file) {
        return <SettingsView />;
    }
    // Default: If no file is selected, show the UploadView.
    return <UploadView />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="PDF Compressor" description="Securely compress your PDF and preview the result before downloading." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        <CurrentView />
      </div>
      {/* SEO Content Block */}
      <div className="mt-12 text-gray-300">
        <h2 className="text-3xl font-bold mb-6 text-white">Take Control of Your PDF Size</h2>
        <p className="mb-4 text-gray-400">
          Large PDF files can be a hassle, slowing down uploads, downloads, and email attachments.
          DocEnclave's PDF Compressor offers a powerful yet simple solution to reduce your PDF file sizes
          significantly without compromising privacy. Unlike other online tools, your documents
          never leave your browser, ensuring complete confidentiality.
        </p>
        <p className="mb-6 text-gray-400">
          Whether you need to compress a large report for emailing or optimize a document for web
          upload, our tool provides the flexibility and control you need to achieve the perfect balance
          between file size and document quality.
        </p>

<h3 className="text-2xl font-bold mb-4 text-white">Configure First, Then Preview</h3>
        <p className="mb-6 text-gray-400">
          Our unique "Process First, Preview Second" architecture ensures you have full control over
          the compression process. You select your desired compression level and advanced options
          like converting to grayscale or removing metadata upfront. Once processed, you get an
          instant preview of the compressed PDF, allowing you to visually confirm the output and
          decide if it meets your needs before downloading. This iterative approach saves you time
          and ensures satisfaction.
        </p>

        <h3 className="text-2xl font-bold mb-4 text-white">Smarter Compression, Total Privacy</h3>
        <p className="mb-6 text-gray-400">
          DocEnclave PDF Compressor operates 100% client-side, meaning all compression logic is
          executed directly within your web browser. Your sensitive PDF files are never uploaded to
          our servers, ensuring absolute privacy and security. We reconstruct your PDF page by page
          as optimized JPEG images, giving you control over image quality and enabling significant
          file size reduction.
        </p>

        <h2 className="text-2xl font-bold mb-4 text-white">Frequently Asked Questions (FAQ)</h2>
        <div className="space-y-4">
          <h4 className="text-xl font-semibold text-white">How does PDF compression work?</h4>
          <p className="text-gray-400">
            Our tool works by "reconstructing" your PDF. Each page of your original PDF is rendered as a high-quality image.
            These images are then compressed using JPEG compression (with a quality setting you control), and a new PDF
            document is created from these compressed images. This method is highly effective for reducing file sizes,
            especially for PDFs with many images or complex layouts.
          </p>

          <h4 className="text-xl font-semibold text-white">Will compressing my PDF affect its quality?</h4>
          <p className="text-gray-400">
            Yes, some quality reduction is inherent in the compression process, especially with "Strong" or "Extreme" settings.
            Because we convert pages to JPEG images, text within the PDF will no longer be selectable. However, our "Recommended"
            setting provides a good balance, and you can always preview the result before downloading to ensure it meets your
            quality expectations.
          </p>

          <h4 className="text-xl font-semibold text-white">Is my PDF secure and private?</h4>
          <p className="text-gray-400">
            Absolutely. DocEnclave PDF Compressor is designed with privacy as its top priority. All processing happens
            directly in your browser. Your PDF files are never sent to our servers, ensuring your data remains completely
            private and secure.
          </p>

          <h4 className="text-xl font-semibold text-white">What is "Remove Metadata"?</h4>
          <p className="text-gray-400">
            PDFs often contain hidden metadata like author, creation date, and software used to create the document.
            The "Remove Metadata" option strips this information from your compressed PDF, providing a cleaner and
            potentially slightly smaller file.
          </p>

          <h4 className="text-xl font-semibold text-white">Why is text not selectable after compression?</h4>
          <p className="text-gray-400">
            Since our compression method involves converting each PDF page into an image (JPEG), the text is no longer
            recognized as editable or selectable text within the PDF. It becomes part of the image, similar to a scanned document.
            This is a trade-off for achieving significant file size reduction.
          </p>
        </div>
      </div>
    </div>
  );
}