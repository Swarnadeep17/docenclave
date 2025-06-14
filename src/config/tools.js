
// Tool categories and their configurations
export const toolCategories = {
  pdf: {
    name: 'PDF Tools',
    icon: 'fa-file-pdf',
    description: 'Convert, compress, merge PDF files',
    tools: {
      'pdf-merge': {
        name: 'Merge PDF',
        description: 'Combine multiple PDF files into one',
        icon: 'fa-object-group',
        status: 'available',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,  // MB
          premium: 100 // MB
        }
      },
      'pdf-split': {
        name: 'Split PDF',
        description: 'Extract pages from PDF files',
        icon: 'fa-cut',
        status: 'soon',
        maxFiles: {
          free: 1,
          premium: 5
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'pdf-compress': {
        name: 'Compress PDF',
        description: 'Reduce PDF file size without losing quality',
        icon: 'fa-compress-arrows-alt',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'pdf-to-image': {
        name: 'PDF to Image',
        description: 'Convert PDF pages to JPG or PNG images',
        icon: 'fa-file-image',
        status: 'soon',
        maxFiles: {
          free: 1,
          premium: 5
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'pdf-to-word': {
        name: 'PDF to Word',
        description: 'Convert PDF files to editable Word documents',
        icon: 'fa-file-word',
        status: 'soon',
        maxFiles: {
          free: 1,
          premium: 5
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'word-to-pdf': {
        name: 'Word to PDF',
        description: 'Convert Word documents to PDF format',
        icon: 'fa-file-pdf',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      }
    }
  },
  image: {
    name: 'Image Tools',
    icon: 'fa-image',
    description: 'Resize, compress, convert images',
    tools: {
      'image-compress': {
        name: 'Compress Image',
        description: 'Reduce image file size while maintaining quality',
        icon: 'fa-compress',
        status: 'soon',
        maxFiles: {
          free: 5,
          premium: 20
        },
        maxFileSize: {
          free: 20,  // MB
          premium: 100 // MB
        }
      },
      'image-resize': {
        name: 'Resize Image',
        description: 'Change image dimensions and resolution',
        icon: 'fa-expand-arrows-alt',
        status: 'soon',
        maxFiles: {
          free: 5,
          premium: 20
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'image-convert': {
        name: 'Convert Image',
        description: 'Convert between JPG, PNG, WebP, and other formats',
        icon: 'fa-exchange-alt',
        status: 'soon',
        maxFiles: {
          free: 5,
          premium: 20
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'image-to-pdf': {
        name: 'Image to PDF',
        description: 'Convert images to PDF documents',
        icon: 'fa-file-pdf',
        status: 'soon',
        maxFiles: {
          free: 10,
          premium: 50
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      }
    }
  },
  document: {
    name: 'Document Tools',
    icon: 'fa-file-alt',
    description: 'Convert and process various document formats',
    tools: {
      'excel-to-pdf': {
        name: 'Excel to PDF',
        description: 'Convert Excel spreadsheets to PDF format',
        icon: 'fa-file-excel',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'powerpoint-to-pdf': {
        name: 'PowerPoint to PDF',
        description: 'Convert PowerPoint presentations to PDF',
        icon: 'fa-file-powerpoint',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'text-to-pdf': {
        name: 'Text to PDF',
        description: 'Convert plain text files to PDF documents',
        icon: 'fa-file-alt',
        status: 'soon',
        maxFiles: {
          free: 5,
          premium: 15
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      }
    }
  },
  security: {
    name: 'Security Tools',
    icon: 'fa-shield-alt',
    description: 'Protect and secure your documents',
    tools: {
      'pdf-protect': {
        name: 'Protect PDF',
        description: 'Add password protection to PDF files',
        icon: 'fa-lock',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      },
      'pdf-unlock': {
        name: 'Unlock PDF',
        description: 'Remove password protection from PDF files',
        icon: 'fa-unlock',
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,
          premium: 100
        }
      }
    }
  }
}

// Function to get all available tools
export const getAllTools = () => {
  const tools = {}
  Object.entries(toolCategories).forEach(([category, categoryData]) => {
    Object.entries(categoryData.tools).forEach(([toolId, toolData]) => {
      tools[toolId] = {
        ...toolData,
        category,
        id: toolId
      }
    })
  })
  return tools
}

// Function to get tool by ID
export const getToolById = (toolId) => {
  const tools = getAllTools()
  return tools[toolId]
}
