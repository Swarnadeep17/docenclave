// src/app/pdf-tools/page.js
import Link from 'next/link';

// Define all our available PDF tools here
const pdfTools = [
  {
    name: 'Merge PDF',
    description: 'Combine multiple PDFs and orchestrate every single page with our advanced visual tool.',
    href: '/merge-pdf'
  },
  {
    name: 'Split PDF',
    description: 'Visually select and extract pages from any PDF, or split it into multiple separate files.',
    href: '/split-pdf'
  },
  {
    name: 'Compress PDF',
    description: 'Reduce file size with an interactive preview of quality and compression settings.',
    href: '/compress-pdf'
  },
// Add new PDF tools here in the future
];

export const metadata = {
    title: 'All PDF Tools | DocEnclave',
    description: 'Discover a full suite of free, secure, and offline PDF tools. Merge, split, and more, right in your browser.',
};

export default function PdfToolsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-200 to-gray-400 text-transparent bg-clip-text">
          PDF Toolkit
        </h1>
        <p className="mt-4 text-lg text-gray-300">
          All the tools you need to be more productive with your PDF files, with 100% privacy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pdfTools.map((tool) => (
          <Link
            key={tool.name}
            href={tool.href}
            className="bg-card-bg p-6 rounded-lg border border-gray-700 hover:border-accent transition-all duration-200 group"
          >
            <h3 className="text-xl font-bold mb-2 group-hover:text-accent">{tool.name}</h3>
            <p className="text-gray-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}