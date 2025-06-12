// This file centralizes the configuration for all available tools in the application.
// It makes the Home.jsx component cleaner and the tool data easier to manage.

export const toolCategories = [
  {
    id: 'pdf',
    title: 'PDF Tools',
    icon: '📄',
    description: 'Process and manipulate PDF files with professional-grade tools',
    tools: [
      {
        name: 'PDF Merge',
        description: 'Combine multiple PDFs into one',
        path: '/tools/pdf/merge',
        available: true
      },
      {
        name: 'PDF Split',
        description: 'Extract pages or split into multiple files',
        path: '/tools/pdf/split',
        available: true
      },
      {
        name: 'PDF Compress',
        description: 'Reduce file size while maintaining quality',
        path: '/tools/pdf/compress',
        available: false
      },
      {
        name: 'PDF to Image',
        description: 'Convert PDF pages to image formats',
        path: '/tools/pdf/to-image',
        available: false
      }
    ]
  },
  {
    id: 'image',
    title: 'Image Tools',
    icon: '🖼️',
    description: 'Resize, compress, and convert images while maintaining quality',
    tools: [
      {
        name: 'Image Resize',
        description: 'Change image dimensions',
        path: '/tools/image/resize',
        available: false
      },
      {
        name: 'Image Compress',
        description: 'Reduce file size',
        path: '/tools/image/compress',
        available: false
      },
      {
        name: 'Format Convert',
        description: 'Convert between image formats',
        path: '/tools/image/convert',
        available: false
      },
      {
        name: 'Image to PDF',
        description: 'Convert images to PDF',
        path: '/tools/image/to-pdf',
        available: false
      }
    ]
  },
  {
    id: 'document',
    title: 'Document Tools',
    icon: '📝',
    description: 'Advanced document processing and conversion tools',
    tools: [
      {
        name: 'Word to PDF',
        description: 'Convert DOC/DOCX to PDF',
        path: '/tools/document/word-to-pdf',
        available: false
      },
      {
        name: 'Excel to PDF',
        description: 'Convert spreadsheets to PDF',
        path: '/tools/document/excel-to-pdf',
        available: false
      },
      {
        name: 'PowerPoint to PDF',
        description: 'Convert presentations to PDF',
        path: '/tools/document/ppt-to-pdf',
        available: false
      },
      {
        name: 'Text to PDF',
        description: 'Create PDF from plain text',
        path: '/tools/document/text-to-pdf',
        available: false
      }
    ]
  }
];