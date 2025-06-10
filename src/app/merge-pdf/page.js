// src/app/merge-pdf/page.js

export default function MergePdfPage() {
  return (
    <div className="w-full max-w-4xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Merge PDF Files</h1>
        <p className="text-lg text-gray-400">
          Combine multiple PDFs into a single file, right in your browser.
        </p>
      </div>

      {/* Tool UI - We will build this next */}
      <div className="bg-card-bg border border-gray-700 rounded-lg p-8 min-h-[300px]">
        <p className="text-center text-gray-500">
          The PDF merging tool will be here.
        </p>
      </div>

      {/* SEO Content Section */}
      <div className="mt-16 text-gray-300">
        <h2 className="text-2xl font-bold mb-4">About the Merge PDF Tool</h2>
        <p className="mb-4">
          Our Merge PDF tool allows you to quickly combine several PDF files into one document without ever uploading your files to a server. This ensures your sensitive information remains 100% private. Drag and drop your files, reorder them as you wish, and download your merged PDF instantly.
        </p>
        {/* We will add an FAQ section here later */}
      </div>
    </div>
  );
}