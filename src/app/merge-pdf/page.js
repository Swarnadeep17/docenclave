// src/app/merge-pdf/page.js

'use client'; // Mark this as a client-side component

import { useState } from 'react'; // Import the useState hook from React

export default function MergePdfPage() {
  // Create a state variable to hold the list of selected PDF files.
  // 'files' is the current list of files.
  // 'setFiles' is the function we use to update the list.
  const [files, setFiles] = useState([]);

  // This function will be called when the user selects files.
  const handleFileChange = (event) => {
    // 'event.target.files' is a list of files the user selected.
    // We convert it from a FileList to a regular array.
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles); // Update our state with the new files
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Merge PDF Files</h1>
        <p className="text-lg text-gray-400">
          Combine multiple PDFs into a single file, right in your browser.
        </p>
      </div>

      {/* Tool UI Section */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8">
        
        {/* The File Input Dropzone */}
        {/* We use a 'label' to make the whole area clickable, which triggers the hidden 'input' */}
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-500 rounded-lg cursor-pointer hover:bg-gray-800 hover:border-accent transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-400">
              <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF files only</p>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden" // The actual file input is hidden, we style the 'label' instead.
            accept=".pdf" // Only allow PDF files to be selected
            multiple // Allow selecting multiple files
            onChange={handleFileChange} // Call our function when files are selected
          />
        </label>
        
        {/* Staging Area - This section will only appear if files have been selected */}
        {files.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Selected Files:</h3>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="bg-gray-800 p-3 rounded-md flex justify-between items-center"
                >
                  <span className="text-gray-300">{file.name}</span>
                  <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                </li>
              ))}
            </ul>

            {/* Merge Button - will be functional later */}
            <div className="mt-6 text-center">
              <button className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-600 transition-colors">
                Merge {files.length} Files
              </button>
            </div>
          </div>
        )}

      </div>

      {/* SEO Content Section */}
      <div className="mt-16 text-gray-300">
        <h2 className="text-2xl font-bold mb-4">About the Merge PDF Tool</h2>
        <p className="mb-4">
          Our Merge PDF tool allows you to quickly combine several PDF files into one document without ever uploading your files to a server. This ensures your sensitive information remains 100% private. Drag and drop your files, reorder them as you wish, and download your merged PDF instantly.
        </p>
      </div>
    </div>
  );
}