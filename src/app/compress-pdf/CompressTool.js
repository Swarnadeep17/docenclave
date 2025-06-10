// src/app/compress-pdf/CompressTool.js
'use client';

import { useState, useCallback } from 'react';
import ToolPageHeader from '@/components/ToolPageHeader';
import { useDropzone } from 'react-dropzone';

// --- Placeholder State ---
// We'll replace these with real logic later.
const initialStats = {
  originalSize: 0,
  estimatedSize: 0,
  reduction: 0,
};

const initialSettings = {
  imageQuality: 75, // Default quality
  isGrayscale: false,
  removeMetadata: true,
};

export default function CompressTool() {
  const [file, setFile] = useState(null);
  const [stats, setStats] = useState(initialStats);
  const [settings, setSettings] = useState(initialSettings);
  const [previewImageUrl, setPreviewImageUrl] = useState(null); // To hold the canvas data URL
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Placeholder Logic ---
  // We will implement the real file handling logic here later.
  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
      // TODO: Add logic to generate preview and calculate initial stats.
      // For now, we'll just set some dummy data to see the UI.
      setStats({
          originalSize: uploadedFile.size,
          estimatedSize: uploadedFile.size * 0.4, // Dummy estimate
          reduction: 60
      });
      setPreviewImageUrl('/placeholder-preview.png'); // Dummy image
    } else {
      alert("Please upload a valid PDF file.");
    }
  }, []);

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    // TODO: Add logic to re-calculate estimated size and update preview
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
  });
  
  // Helper to format bytes into KB/MB
  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <ToolPageHeader
        title="Advanced PDF Compressor"
        description="Fine-tune compression settings with a real-time preview of quality and file size."
      />

      {/* Main Tool Card */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-4 sm:p-8">
        {!file ? (
          // --- UPLOAD VIEW ---
          <div {...getRootProps()} className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-accent bg-gray-800' : 'hover:bg-gray-800 hover:border-gray-400'}`}>
            <input {...getInputProps()} />
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-accent">{isDragActive ? 'Drop it here!' : 'Click to upload or drag & drop'}</span>
            </p>
            <p className="text-xs text-gray-500">Upload a single PDF file</p>
          </div>
        ) : (
          // --- CONTROL ROOM VIEW ---
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Side: Preview Window */}
            <div className="md:col-span-2 bg-gray-900/50 rounded-lg p-4 flex items-center justify-center min-h-[400px]">
              {previewImageUrl ? (
                <img src={previewImageUrl} alt="PDF Preview" className="max-w-full max-h-full object-contain" />
              ) : (
                <p>Generating Preview...</p>
              )}
            </div>

            {/* Right Side: Settings Panel */}
            <div className="md:col-span-1 flex flex-col space-y-6">
              <h3 className="text-2xl font-bold border-b border-gray-600 pb-2">Compression Settings</h3>
              
              {/* Stats Display */}
              <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                      <p className="text-xs text-gray-400">Original</p>
                      <p className="font-semibold text-lg">{formatBytes(stats.originalSize)}</p>
                  </div>
                   <div>
                      <p className="text-xs text-gray-400">Estimated</p>
                      <p className="font-semibold text-lg text-accent">{formatBytes(stats.estimatedSize)}</p>
                  </div>
                   <div>
                      <p className="text-xs text-gray-400">Reduction</p>
                      <p className="font-semibold text-lg text-green-400">~{stats.reduction}%</p>
                  </div>
              </div>

              {/* Image Quality Slider */}
              <div>
                <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-1">Image Quality</label>
                <input 
                  id="quality"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.imageQuality}
                  onChange={(e) => handleSettingChange('imageQuality', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>Lower</span>
                    <span className="font-bold text-accent">{settings.imageQuality}%</span>
                    <span>Higher</span>
                </div>
              </div>
              
              {/* Other Settings (Toggles) */}
              <div className="space-y-3">
                  <div className="flex items-center justify-between">
                      <label htmlFor="grayscale" className="text-sm text-gray-300">Convert to Grayscale</label>
                      <button onClick={() => handleSettingChange('isGrayscale', !settings.isGrayscale)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.isGrayscale ? 'bg-accent' : 'bg-gray-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.isGrayscale ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
                   <div className="flex items-center justify-between">
                      <label htmlFor="metadata" className="text-sm text-gray-300">Basic Optimization</label>
                      <button onClick={() => handleSettingChange('removeMetadata', !settings.removeMetadata)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.removeMetadata ? 'bg-accent' : 'bg-gray-600'}`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.removeMetadata ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-600 space-y-3">
                  <button 
                    // onClick={handleCompress}
                    disabled={isProcessing} 
                    className="w-full bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-600"
                  >
                    {isProcessing ? 'Compressing...' : 'Compress PDF'}
                  </button>
                  <button 
                    onClick={() => setFile(null)} 
                    className="w-full text-sm text-gray-400 hover:text-white hover:underline"
                  >
                    Use a different file
                  </button>
              </div>
            </div>
          </div>
        )}
      </div>
        
      {/* TODO: Add SEO Content Block Here */}
      
    </div>
  );
}