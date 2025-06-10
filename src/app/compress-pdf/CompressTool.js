'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from '@/lib/firebase'; // We will create this file
import ToolPageHeader from '@/components/ToolPageHeader';

export default function CompressTool() {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleCompress = async (file) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setDownloadUrl(null);
    const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const originalName = file.name;

    const storage = getStorage(app);
    const storageRef = ref(storage, `uploads/${uid}/${originalName}`);
    
    // Listen for Firestore updates
    const db = getFirestore(app);
    const unsub = onSnapshot(doc(db, "compressions", uid), (doc) => {
        const data = doc.data();
        if (data?.status === 'complete') {
            setDownloadUrl(data.downloadUrl);
            setFileName(data.fileName);
            setIsProcessing(false);
            unsub(); // Stop listening
        } else if (data?.status === 'error') {
            alert('An error occurred on the server. Please try again.');
            setIsProcessing(false);
            unsub();
        }
    });

    const uploadTask = uploadBytesResumable(storageRef, file, { 
        customMetadata: { 
            quality: '75', // We'll add UI for this later
            isGrayscale: 'false',
            originalName,
            uid
        }
    });

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        console.error("Upload failed:", error);
        alert('Upload failed. Please check your connection and try again.');
        setIsUploading(false);
        unsub();
      }, 
      () => {
        setIsUploading(false);
        setIsProcessing(true); // Now we wait for the backend
      }
    );
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: useCallback(acceptedFiles => handleCompress(acceptedFiles[0]), []),
    accept: { 'application/pdf': ['.pdf'] }, multiple: false,
  });
  
  const handleStartOver = () => {
    setIsUploading(false);
    setIsProcessing(false);
    setDownloadUrl(null);
    setFileName('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto py-24 px-4">
      <ToolPageHeader title="PDF Compressor" description="Securely compress your PDF on our powerful servers." />
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8 text-center">
        {(!isUploading && !isProcessing && !downloadUrl) && (
            <div {...getRootProps()} className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer border-gray-500 hover:border-accent">
                <input {...getInputProps()} />
                <p>Drag & drop or click to upload</p>
            </div>
        )}
        {(isUploading || isProcessing) && (
            <div className="py-20">
                <p className="text-xl text-accent mb-4">{isUploading ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing on our secure server...'}</p>
                <div className="w-full bg-gray-600 rounded-full h-2.5"><div className="bg-accent h-2.5 rounded-full" style={{width: `${isUploading ? uploadProgress : 100}%`}}></div></div>
            </div>
        )}
        {downloadUrl && (
            <div className="py-12">
                <h3 className="text-2xl font-semibold mb-4 text-green-400">Compression Complete!</h3>
                <a href={downloadUrl} download={fileName} className="bg-accent text-white font-bold py-3 px-8 rounded-lg">Download File</a>
                <button onClick={handleStartOver} className="block mx-auto mt-6 text-gray-400 hover:underline">Compress Another File</button>
            </div>
        )}
      </div>
    </div>
  );
}