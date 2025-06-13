// CREATE NEW FILE: docenclave-main/src/components/shared/pdf/PDFFilePreview.jsx

import React from 'react';
import PDFSinglePagePreview from './PDFSinglePagePreview.jsx';
import { formatFileSize } from '../../../utils/constants.js';

const PDFFilePreview = ({
  file,
  pdfJSDoc, // Pass pre-loaded pdfjs doc for Split tool
  pages,
  onPageToggle,
  onPageDelete, // Optional
  onRemoveFile, // Optional
  renderPageActions, // Optional render prop for file-level buttons
  renderReorderControls, // Optional render prop for up/down arrows
}) => {
  const selectedCount = pages.filter(p => p.selected).length;

  return (
    <div className="bg-dark-secondary rounded-xl p-6 border border-dark-border">
      {/* File Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3 overflow-hidden">
          <span className="text-2xl flex-shrink-0">📄</span>
          <div className="overflow-hidden">
            <h4 className="text-dark-text-primary font-medium truncate" title={file.name}>{file.name}</h4>
            <p className="text-dark-text-muted text-sm">
              {formatFileSize(file.size)} • {pages.length} pages • {selectedCount} selected
            </p>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          {/* Conditionally render reorder controls */}
          {renderReorderControls && renderReorderControls()}
          {/* Conditionally render file remove button */}
          {onRemoveFile && (
            <button
              onClick={() => onRemoveFile(file.id)}
              className="text-red-400 hover:text-red-300 p-2 ml-2"
              aria-label={`Remove file ${file.name}`}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Conditionally render file-level action buttons */}
      {renderPageActions && (
        <div className="flex flex-wrap gap-2 mb-4">
          {renderPageActions()}
        </div>
      )}

      {/* Page Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {pages.map((page, pageIndex) => (
          <PDFSinglePagePreview
            key={`${file.id}-${pageIndex}`}
            file={file.file} // Pass raw file for renderer
            pdfDoc={pdfJSDoc} // Pass pre-loaded doc if available
            pageNumber={pageIndex + 1}
            isSelected={page.selected}
            isDuplicate={page.isDuplicate} // Prop is ignored if undefined
            onToggleSelect={() => onPageToggle(file.id, pageIndex)}
            onDelete={onPageDelete ? () => onPageDelete(file.id, pageIndex) : undefined}
            displayText={page.globalIndex !== undefined ? `Global #${page.globalIndex + 1}` : `Page ${pageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PDFFilePreview;