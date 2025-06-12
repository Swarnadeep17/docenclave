// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    maxFiles: 10,
    maxTotalSize: 50 * 1024 * 1024, // 50MB in bytes
    maxFileSize: 50 * 1024 * 1024,  // 50MB per file
    maxExtractPages: 20, // ← NEW: for PDF split
    maxPDFPages: 50,     // ← NEW: max pages in uploaded PDF
    features: {
      reorder: true,
      pageSelection: true,
      compression: true,
      preview: true,
      bookmarks: false,
      passwordProtection: false,
      customFilename: false,
      queue: false,
      batchExtract: false  // ← NEW: for PDF split
    }
  },
  PREMIUM: {
    maxFiles: 50,
    maxTotalSize: 500 * 1024 * 1024, // 500MB in bytes
    maxFileSize: 500 * 1024 * 1024,  // 500MB per file
    maxExtractPages: Infinity, // ← NEW: unlimited for premium
    maxPDFPages: Infinity,     // ← NEW: unlimited pages
    features: {
      reorder: true,
      pageSelection: true,
      compression: true,
      preview: true,
      bookmarks: true,
      passwordProtection: true,
      customFilename: true,
      queue: true,
      batchExtract: true  // ← NEW: for PDF split
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

// ← NEW: PDF Split specific validation
export const validatePDFForSplit = (pageCount, currentPlan = 'FREE') => {
  const limits = PLAN_LIMITS[currentPlan]
  
  if (pageCount > limits.maxPDFPages) {
    return { 
      valid: false, 
      error: `PDF has too many pages. Maximum ${limits.maxPDFPages} pages allowed for ${currentPlan} plan` 
    }
  }
  
  return { valid: true }
}

// ← NEW: Page selection validation for PDF Split
export const validatePageSelection = (selectedCount, currentPlan = 'FREE') => {
  const limits = PLAN_LIMITS[currentPlan]
  
  if (selectedCount > limits.maxExtractPages) {
    return { 
      valid: false, 
      error: `Too many pages selected. Maximum ${limits.maxExtractPages} pages allowed for ${currentPlan} plan` 
    }
  }
  
  return { valid: true }
}