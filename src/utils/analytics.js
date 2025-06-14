
import { getAnalytics, logEvent } from 'firebase/analytics'

export const trackToolVisit = (toolId) => {
  const analytics = getAnalytics()
  logEvent(analytics, 'tool_visit', {
    tool_id: toolId
  })
}

export const trackToolUsage = (toolId, fileCount, totalSize) => {
  const analytics = getAnalytics()
  logEvent(analytics, 'tool_usage', {
    tool_id: toolId,
    file_count: fileCount,
    total_size: totalSize
  })
}

export const trackDownload = (toolId, outputSize) => {
  const analytics = getAnalytics()
  logEvent(analytics, 'file_download', {
    tool_id: toolId,
    output_size: outputSize
  })
}
