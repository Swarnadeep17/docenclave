// CREATE NEW FILE: docenclave-main/src/components/shared/pdf/PDFSinglePagePreview.jsx

import React from 'react';
import PDFPageRenderer from '../PDFPageRenderer.jsx';

const PDFSinglePagePreview = ({
  file, // Pass the raw File object for rendering
  pdfDoc, // Or pass a pre-loaded pdfjs doc
  pageNumber,
  isSelected,
  onToggleSelect,
  isDuplicate = false, // Optional: for merge tool
  onDelete, // Optional: for merge tool
  displayText, // Optional: custom text below thumbnail
}) => {
  return (
    <div
      className={`relative bg-dark-tertiary rounded-lg p-3 border-2 transition-all ${
        isDuplicate
          ? 'border-yellow-500 shadow-yellow-500/20'
          : isSelected
          ? 'border-blue-500 shadow-blue-500/20'
          : 'border-dark-border'
      } ${onToggleSelect ? 'cursor-pointer' : ''}`}
      onClick={onToggleSelect}
    >
      {/* Conditionally render the delete button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent the main div's onClick
            onDelete();
          }}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold z-10 transition-colors"
          aria-label={`Delete page ${pageNumber}`}
        >
          ×
        </button>
      )}

      {/* Conditionally render the duplicate indicator */}
      {isDuplicate && (
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-yellow-500 text-black rounded-full flex items-center justify-center text-xs font-bold z-10" title="Duplicate Page">
          !
        </div>
      )}

      {/* Conditionally render the selected checkmark for the Split tool's aesthetic */}
      {!onDelete && isSelected && (
         <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
           ✓
         </div>
      )}

      <PDFPageRenderer file={file} pdfDoc={pdfDoc} pageNumber={pageNumber} />

      <div className="text-center mt-2">
        <div className="text-dark-text-primary text-xs font-medium mb-1">
          {displayText || `Page ${pageNumber}`}
        </div>

        {/* The checkbox is always useful for clear visual selection */}
        <div className="mt-2">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="w-4 h-4 accent-blue-500 pointer-events-none"
          />
        </div>
      </div>
    </div>
  );
};

export default PDFSinglePagePreview;