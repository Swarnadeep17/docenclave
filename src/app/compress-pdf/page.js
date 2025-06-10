// src/app/compress-pdf/page.js
import CompressTool from './CompressTool';

export const metadata = {
  title: 'Compress PDF Files Securely & Offline | DocEnclave',
  description: 'Reduce the file size of your PDFs with our advanced compressor. Preview quality vs. size in real-time. 100% free, private, and in-browser.',
  keywords: ['compress pdf', 'pdf compressor', 'reduce pdf size', 'pdf optimizer', 'free pdf compressor', 'offline pdf compressor'],
};

export default function CompressPdfPage() {
  return <CompressTool />;
}