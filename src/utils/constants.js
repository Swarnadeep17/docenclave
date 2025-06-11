// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    maxFiles: 5,
    maxTotalSize: 50 * 1024 * 1024, // 50MB in bytes
    maxFileSize: 50 * 1024 * 1024,  // 50MB per file
    features: {
      reorder: true,
      pageSelection: true,
      compression: true,
      preview: true,
      bookmarks: false,
      passwordProtection: false,
      customFilename: false,
      queue: false
    }
  },
  PREMIUM: {
    maxFiles: 50,
    maxTotalSize: 500 * 1024 * 1024, // 500MB in bytes
    maxFileSize: 500 * 1024 * 1024,  // 500MB per file
    features: {
      reorder: true,
      pageSelection: true,
      compression: true,
      preview: true,
      bookmarks: true,
      passwordProtection: true,
      customFilename: true,
      queue: true
    }
  }
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFile = (file, currentPlan = 'FREE') => {
  const limits = PLAN_LIMITS[currentPlan]
  
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are allowed' }
  }
  
  if (file.size > limits.maxFileSize) {
    return { 
      valid: false, 
      error: `File too large. Maximum ${formatFileSize(limits.maxFileSize)} allowed` 
    }
  }
  
  return { valid: true }
}