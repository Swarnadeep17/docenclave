// src/app/split-pdf/page.js
import SplitTool from './SplitTool'; // We will create this component next

export const metadata = {
  title: 'Split PDF Free & Securely | Extract Pages Offline | DocEnclave',
  description: 'Split a PDF into multiple files or extract specific pages. Select pages visually and download securely in your browser. No file uploads required.',
};

// This Server Component just renders our interactive client component
export default function SplitPdfPage() {
  return <SplitTool />;
}