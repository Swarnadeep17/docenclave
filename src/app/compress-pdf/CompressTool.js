'use client';

import { useDropzone } from 'react-dropzone';
import { useState, useCallback, useRef, useEffect } from 'react';
// We will add Firebase imports later when we wire up the backend
// import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';
// import { getFirestore, doc, onSnapshot, setDoc } from 'firebase/firestore';
// import { app } from '@/lib/firebase'; 
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver'; // For the final download
import ToolPageHeader from '@/components/ToolPageHeader';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const qualityPresets = [
  { name: 'Recommended', value: 75, description: 'Good balance of size and quality.' },
  { name: 'Strong Compression', value: 50, description: 'Smaller file, noticeable quality reduction.' },
  { name: 'Extreme Compression', value: 25, description: 'Smallest file, significant quality reduction.' },
];

const initialSettings = {
  quality: 75,
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [originalFile, setOriginalFile] = useState(null); // The actual File object
  const [settings, setSettings] = useState(initialSettings);
  
  // UI State: 'upload', 'settings', 'processing', 'previewAndDownload'
  const [uiState, setUiState] = useState('upload'); 
  const [processingMessage, setProcessingMessage] = useState('');
  
  const [initialPreviewUrl, setInitialPreviewUrl] = useState(null); // Data URL for original preview
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState(null); // Data URL for compressed preview
  
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [compressedFileSize, setCompressedFileSize] = useState(0);
  
  const [finalDownloadBlob, setFinalDownloadBlob] = useState(null); // The final Blob to download
  const [finalFileName, setFinalFileName] = useState('');

  const currentJobId = useRef(null);
  const firestoreUnsubscribe = useRef(null);
  const finalPreviewCanvasRef = useRef(null); // For drawing the server-compressed preview

  // --- Generate Initial Client-Side Preview ---
  useEffect(() => {
    if (originalFile && uiState === 'settings') { // Only when entering settings view
      setProcessingMessage('Generating initial preview...');
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const pdfjsDoc = await pdfjsLib.getDocument({ data: e.target.result }).promise;
          const page = await pdfjsDoc.getPage(1);
          const viewport = page.getViewport({ scale: 1.0 });
          const canvas = document.createElement('canvas');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const context = canvas.getContext('2d');
          await page.render({ canvasContext: context, viewport }).promise;
          setInitialPreviewUrl(canvas.toDataURL('image/png'));
        } catch (err) {
          console.error("Error generating initial preview:", err);
          alert("Could not generate preview for this file. It might be corrupt. Please try another file.");
          handleStartOver(); // Reset if preview fails
        } finally {
            setProcessingMessage('');
        }
      };
      reader.onerror = () => {
          console.error("FileReader error for initial preview.");
          alert("Could not read the file for preview.");
          handleStartOver();
          setProcessingMessage('');
      }
      reader.readAsArrayBuffer(originalFile);
      setOriginalFileSize(originalFile.size);
    }
  }, [originalFile, uiState]);

  // --- Firestore Listener (Placeholder for now) ---
  useEffect(() => {
    if (uiState === 'processing' && currentJobId.current) {
      console.log(`Pretending to listen to Firestore for job: ${currentJobId.current}`);
      // Simulating server processing and response
      const mockServerProcessing = setTimeout(async () => {
        console.log("Mock server processing complete for", currentJobId.current);
        // Simulate fetching a mock compressed blob for preview
        // In reality, this data would come from the Firestore listener
        try {
            const dummyBlob = new Blob(["This is a dummy compressed PDF content."], {type: 'application/pdf'});
            const arrayBuffer = await dummyBlob.arrayBuffer();
            const pdfjsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            // Since it's dummy content, pdfjsDoc.getPage(1) will fail.
            // So, for now, we'll just set a placeholder for compressed preview.
            // setCompressedPreviewUrl("placeholder_compressed_preview.png"); // Or handle appropriately
            
            // We will directly use the original preview for now to test UI flow
            if (finalPreviewCanvasRef.current && initialPreviewUrl) {
                 const canvas = finalPreviewCanvasRef.current;
                 const ctx = canvas.getContext('2d');
                 const img = new Image();
                 img.onload = () => {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    // Here, you might apply a visual filter to distinguish it or show "Compressed" text
                    ctx.filter = 'sepia(50%)'; // Example: make it look different
                    ctx.drawImage(img, 0, 0);
                 }
                 img.src = initialPreviewUrl;
            }


            setCompressedFileSize(originalFileSize * ((settings.quality / 100) * (settings.isGrayscale ? 0.7 : 1)));
            setFinalDownloadBlob(dummyBlob); 
            setFinalFileName(`compressed-${originalFile.name}`);
            setUiState('previewAndDownload');
        } catch(e){
            console.error("Error in mock server processing:", e);
            alert("Mock server processing failed.");
            setUiState('settings');
        }
      }, 5000); // 5 second delay

      // Cleanup function for the mock listener
      return () => clearTimeout(mockServerProcessing);
    }
  }, [uiState, originalFileSize, settings.quality, settings.isGrayscale, initialPreviewUrl, originalFile?.name]);


  const handleFileSelect = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setOriginalFile(file);
      setInitialPreviewUrl(null); // Clear old preview
      setUiState('settings');
    } else if (file) {
      alert('Please upload a valid PDF file.');
    }
  }, []);

  const handleCompressTrigger = () => {
    if (!originalFile) return;

    currentJobId.current = `${Date.now()}-${originalFile.name}`; // Generate a mock job ID
    setUiState('processing');
    setProcessingMessage('Simulating upload & server processing...');
    // In a real scenario, this is where you'd start the Firebase Storage upload
    // The Firestore listener (useEffect above) would then take over.
  };
  
  const handleDownload = () => {
      if(!finalDownloadBlob || !finalFileName) return;
      saveAs(finalDownloadBlob, finalFileName);
      // fetch('/api/stats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statToIncrement: 'downloads' }) });
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };
  
  const handleStartOver = () => {
    setOriginalFile(null);
    setSettings(initialSettings);
    setUiState('upload');
    setInitialPreviewUrl(null);
    setCompressedPreviewUrl(null);
    setFinalDownloadBlob(null);
    currentJobId.current = null;
  };
  
  const handleReconfigure = () => {
    setUiState('settings'); // Go back to settings, originalFile and initialPreviewUrl are preserved
    setCompressedPreviewUrl(null);
    setFinalDownloadBlob(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleFileSelect,
    accept: { 'application/pdf': ['.pdf'] }, multiple: false,
    noClick: uiState !== 'upload', // Disable click if not in upload state
    noKeyboard: uiState !== 'upload',
  });

  // --- UI RENDER FUNCTIONS ---
  const UploadView = () => (
    <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}`}>
      <input {...getInputProps()} />
      <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
      <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-accent">{isDragActive ? 'Drop PDF here' : 'Click to upload or drag & drop'}</span></p>
      <p className="text-xs text-gray-500">Select a single PDF file</p>
    </div>
  );

  const SettingsView = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px] text-center">
        <h3 className="text-xl font-semibold mb-2 text-gray-200">Original File Preview (Page 1)</h3>
        {initialPreviewUrl ? (
          <img src={initialPreviewUrl} alt="Original PDF Preview" className="max-w-full max-h-[320px] object-contain border border-gray-700 rounded" />
        ) : (
          <p className="text-accent">{processingMessage || "Generating preview..."}</p>
        )}
        <p className="text-sm text-gray-400 mt-2">{originalFile?.name} ({formatBytes(originalFileSize)})</p>
      </div>
      <div className="md:col-span-1 flex flex-col space-y-6">
        <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Compression Level</label>
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
        </div>
        <div className="space-y-3 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between"><label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label><button onClick={() => setSettings(p => ({...p, isGrayscale: !p.isGrayscale}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
          <div className="flex items-center justify-between"><label htmlFor="metadata" className="text-sm text-gray-300">Remove Metadata</label><button onClick={() => setSettings(p => ({...p, removeMetadata: !p.removeMetadata}))} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}><span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>
        </div>
        <div className="pt-4 border-t border-gray-600 space-y-3">
          <button onClick={handleCompressTrigger} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Compress PDF</button>
          <button onClick={handleStartOver} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Use a different file</button>
        </div>
      </div>
    </div>
  );

  const ProcessingView = () => (
    <div className="text-center py-20 min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-xl text-accent mb-4">{processingMessage}</p>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
    </div>
  );

  const PreviewAndDownloadView = () => {
      const reduction = originalFileSize && compressedFileSize ? 100 - (compressedFileSize / originalFileSize) * 100 : 0;
      return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex flex-col items-center justify-center min-h-[400px]">
                  <p className="text-sm text-gray-400 mb-2">Preview of Compressed File (Page 1)</p>
                  <canvas ref={finalPreviewCanvasRef} className="max-w-full max-h-[360px] object-contain border border-gray-700 rounded" />
              </div>
              <div className="md:col-span-1 flex flex-col space-y-6">
                  <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Complete!</h3>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div><p className="text-xs text-gray-400">Original Size</p><p className="font-semibold text-lg line-through">{formatBytes(originalFileSize)}</p></div>
                    <div><p className="text-xs text-gray-400">New Size</p><p className="font-semibold text-lg text-accent">{formatBytes(compressedFileSize)}</p></div>
                  </div>
                  <div className="text-center bg-green-900/40 p-3 rounded-lg"><p className="text-xs text-green-300">Reduction</p><p className="font-bold text-xl text-green-300">~{Math.round(reduction)}%</p></div>
                   <div className="text-xs text-yellow-400/80 bg-yellow-900/30 p-2 rounded-md">Note: Compressed file text is non-selectable.</div>
                  <div className="pt-4 border-t border-gray-600 space-y-3">
                    <button onClick={handleDownload} className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">Download Compressed PDF</button>
                    <button onClick={handleReconfigure} className="w-full text-sm text-gray-400 hover:text-white hover:underline">Change Settings & Re-compress</button>
                    <button onClick={handleStartOver} className="w-full text-sm text-gray-500 hover:text-white hover:underline">Start Over with New File</button>
                  </div>
              </div>
          </div>
      );
  };
  
  const CurrentView = () => {
    if (uiState === 'upload') return <UploadView />;
    if (uiState === 'settings') return <SettingsView />;
    if (uiState === 'processing') return <ProcessingView />;
    if (uiState === 'previewAndDownload') return <PreviewAndDownloadView />;
    return <UploadView />; 
  }

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="PDF Compressor" description="Securely compress your PDF on our powerful servers, then preview and download." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        <CurrentView />
      </div>
      {/* SEO Content Block will be added here */}
    </div>
  );
}