
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
        status: 'soon',
        maxFiles: {
          free: 3,
          premium: 10
        },
        maxFileSize: {
          free: 20,  // MB
          premium: 100 // MB
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
