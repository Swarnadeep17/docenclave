// src/app/split-pdf/page.js
'use client'; // The 'use client' directive is now here.

import SplitTool from './SplitTool';

// The metadata export is removed from this file.
// We will rely on the main layout's title for now.

export default function SplitPdfPage() {
  // This page component now simply renders the interactive SplitTool.
  return <SplitTool />;
}