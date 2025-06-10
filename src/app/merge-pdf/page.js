// src/app/merge-pdf/page.js

import MergeTool from './MergeTool'; // Import our new interactive component

// This is the non-interactive Server Component that handles SEO
export const metadata = {
  title: 'Merge PDF Files Free & Securely Offline | DocEnclave',
  description: 'Combine multiple PDF files with the ultimate free merger. Drag & drop to reorder individual pages, delete pages, and merge securely in your browser. No uploads required.',
};

// This function just returns our interactive tool
export default function MergePdfPage() {
  return <MergeTool />;
}