import CompressTool from './CompressTool';
import ToolPageHeader from '@/components/ToolPageHeader';

export const metadata = {
  title: 'PDF Compressor - DocEnclave | Reduce PDF File Size Online',
  description: 'Compress PDF files online with advanced options. Batch processing, quality control, metadata removal, and more. Free, secure, and client-side processing.',
  keywords: 'PDF compressor, reduce PDF size, compress PDF online, PDF optimization, batch PDF compression',
  openGraph: {
    title: 'Advanced PDF Compressor - DocEnclave',
    description: 'Compress PDF files with advanced features like batch processing, quality control, and metadata removal.',
    type: 'website',
  },
};

export default function CompressPdfPage() {
  return (
    <>
      <ToolPageHeader 
        title="PDF Compressor"
        description="Reduce PDF file sizes with advanced compression options"
        features={[
          'Batch processing multiple files',
          'Adjustable compression levels',
          'Image quality control',
          'Metadata removal',
          'Real-time compression preview',
          'Download as ZIP archive'
        ]}
      />
      <CompressTool />
    </>
  );
}