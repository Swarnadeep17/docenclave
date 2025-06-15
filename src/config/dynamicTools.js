import { toolCategories } from './tools'

// Function to dynamically discover available tools from file system
export const discoverAvailableTools = () => {
  try {
    // This would work in a Node.js environment, but for browser we'll use a different approach
    // We'll create a manifest-based system instead
    return getToolsFromManifest()
  } catch (error) {
    console.warn('Could not discover tools dynamically, falling back to static config')
    return toolCategories
  }
}

// Browser-compatible tool discovery using import.meta.glob (Vite feature)
export const getToolsFromManifest = async () => {
  const updatedCategories = { ...toolCategories }
  
  try {
    // Use dynamic imports to check which tools actually exist
    const toolModules = import.meta.glob('/src/components/tools/**/*.jsx')
    
    // Update tool status based on actual file existence
    Object.keys(updatedCategories).forEach(categoryKey => {
      const category = updatedCategories[categoryKey]
      Object.keys(category.tools).forEach(toolKey => {
        const toolPath = `/src/components/tools/${categoryKey}/${toolKey.replace('-', '')}.jsx`
        const toolPathAlt = `/src/components/tools/${categoryKey}/${toolKey}.jsx`
        const toolPathCamel = `/src/components/tools/${categoryKey}/${toolKey.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('')}.jsx`
        
        // Check if tool file exists
        if (toolModules[toolPath] || toolModules[toolPathAlt] || toolModules[toolPathCamel]) {
          category.tools[toolKey].status = 'available'
        } else {
          category.tools[toolKey].status = 'soon'
        }
      })
    })
    
    return updatedCategories
  } catch (error) {
    console.warn('Dynamic tool discovery failed, using static config')
    return toolCategories
  }
}

// Function to get all available tools with dynamic status
export const getAllToolsDynamic = async () => {
  const categories = await getToolsFromManifest()
  const tools = {}
  
  Object.entries(categories).forEach(([category, categoryData]) => {
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

// Export the original functions for backward compatibility
export { toolCategories, getAllTools, getToolById } from './tools'
