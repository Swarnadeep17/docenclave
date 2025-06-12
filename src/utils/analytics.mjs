import { initializeApp } from 'firebase/app' import { getFirestore, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore' import { firebaseConfig } from './firebaseConfig.js'

const app = initializeApp(firebaseConfig) const db = getFirestore(app)

// Get current month key (YYYY-MM format) const getCurrentMonthKey = () => { const now = new Date() return ${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')} }

// Get current month name for display export const getCurrentMonthName = () => { const now = new Date() return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }

// Track visitor (called once per session) export const trackVisitor = async () => { try { const monthKey = getCurrentMonthKey() const docRef = doc(db, 'analytics', monthKey)

// Check if document exists, if not create it
const docSnap = await getDoc(docRef)
if (!docSnap.exists()) {
  await setDoc(docRef, {
    visitors: 1,
    downloads: 0,
    tools_used: {},
    lastDownloadLocation: null,
    created_at: new Date(),
    month_name: getCurrentMonthName()
  })
} else {
  await updateDoc(docRef, {
    visitors: increment(1)
  })
}

console.log('Visitor tracked successfully')

} catch (error) { console.log('Analytics tracking failed:', error) // Fail silently to not disrupt user experience } }

// Track download/tool usage export const trackDownload = async (toolName = 'unknown') => { try { const monthKey = getCurrentMonthKey() const docRef = doc(db, 'analytics', monthKey)

// Check if document exists, if not create it first
const docSnap = await getDoc(docRef)
if (!docSnap.exists()) {
  await setDoc(docRef, {
    visitors: 0,
    downloads: 1,
    tools_used: {
      [toolName]: 1
    },
    lastDownloadLocation: null,
    created_at: new Date(),
    month_name: getCurrentMonthName()
  })
} else {
  await updateDoc(docRef, {
    downloads: increment(1),
    [`tools_used.${toolName}`]: increment(1)
  })
}

console.log(`Download tracked: ${toolName}`)

} catch (error) { console.log('Download tracking failed:', error) // Fail silently to not disrupt user experience } }

// Track specific tool usage without download export const trackToolUsage = async (toolName) => { try { const monthKey = getCurrentMonthKey() const docRef = doc(db, 'analytics', monthKey)

// Check if document exists, if not create it first
const docSnap = await getDoc(docRef)
if (!docSnap.exists()) {
  await setDoc(docRef, {
    visitors: 0,
    downloads: 0,
    tools_used: {
      [toolName]: 1
    },
    lastDownloadLocation: null,
    created_at: new Date(),
    month_name: getCurrentMonthName()
  })
} else {
  await updateDoc(docRef, {
    [`tools_used.${toolName}`]: increment(1)
  })
}

console.log(`Tool usage tracked: ${toolName}`)

} catch (error) { console.log('Tool usage tracking failed:', error) // Fail silently to not disrupt user experience } }

// Get current month stats export const getMonthlyStats = async () => { try { const monthKey = getCurrentMonthKey() const docRef = doc(db, 'analytics', monthKey) const docSnap = await getDoc(docRef)

if (docSnap.exists()) {
  const data = docSnap.data()
  return {
    visitors: data.visitors || 0,
    downloads: data.downloads || 0,
    tools_used: data.tools_used || {},
    month_name: data.month_name || getCurrentMonthName(),
    lastDownloadLocation: data.lastDownloadLocation || null,
    created_at: data.created_at
  }
} else {
  return {
    visitors: 0,
    downloads: 0,
    tools_used: {},
    lastDownloadLocation: null,
    month_name: getCurrentMonthName(),
    created_at: null
  }
}

} catch (error) { console.log('Failed to get stats:', error) return { visitors: 0, downloads: 0, tools_used: {}, lastDownloadLocation: null, month_name: getCurrentMonthName(), created_at: null } } }

// Get most popular tools from current month export const getPopularTools = async (limit = 5) => { try { const stats = await getMonthlyStats() const toolsUsed = stats.tools_used || {}

// Convert to array and sort by usage count
const sortedTools = Object.entries(toolsUsed)
  .sort(([,a], [,b]) => b - a)
  .slice(0, limit)
  .map(([name, count]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }))

return sortedTools

} catch (error) { console.log('Failed to get popular tools:', error) return [] } }

// Check if it's a new visitor (based on localStorage) export const isNewVisitor = () => { const hasVisited = localStorage.getItem('docenclave_visited') if (!hasVisited) { localStorage.setItem('docenclave_visited', Date.now().toString()) return true } return false }

// Check if visitor has already been tracked this session export const hasTrackedThisSession = () => { return sessionStorage.getItem('visitor_tracked') === 'true' }

// Mark visitor as tracked for this session export const markVisitorTracked = () => { sessionStorage.setItem('visitor_tracked', 'true') }

// Get conversion rate export const getConversionRate = async () => { try { const stats = await getMonthlyStats() if (stats.visitors === 0) return 0 return Math.round((stats.downloads / stats.visitors) * 100) } catch (error) { console.log('Failed to calculate conversion rate:', error) return 0 } }

// Reset analytics for testing (only use in development) export const resetCurrentMonthStats = async () => { if (process.env.NODE_ENV !== 'development') { console.warn('Reset function only available in development') return }

try { const monthKey = getCurrentMonthKey() const docRef = doc(db, 'analytics', monthKey)

await setDoc(docRef, {
  visitors: 0,
  downloads: 0,
  tools_used: {},
  lastDownloadLocation: null,
  created_at: new Date(),
  month_name: getCurrentMonthName()
})

console.log('Analytics reset for current month')

} catch (error) { console.log('Failed to reset analytics:', error) } }

// Track download with city+country location and fallback export const trackDownloadWithLocation = async (toolName = 'unknown') => { try { let location = 'Unknown Location'

// Attempt to fetch location
try {
  const res = await fetch('https://ipapi.co/json/')
  const data = await res.json()

  const city = data?.city?.trim()
  const country = data?.country_name?.trim()

  if (city && country) {
    location = `${city}, ${country}`
  } else if (country) {
    location = country
  }
} catch (geoErr) {
  console.warn('Geolocation fetch failed:', geoErr)
}

const monthKey = getCurrentMonthKey()
const docRef = doc(db, 'analytics', monthKey)
const docSnap = await getDoc(docRef)

if (!docSnap.exists()) {
  // Create document if missing
  await setDoc(docRef, {
    visitors: 0,
    downloads: 1,
    tools_used: {
      [toolName]: 1
    },
    lastDownloadLocation: location,
    created_at: new Date(),
    month_name: getCurrentMonthName()
  })
} else {
  // Update existing analytics document
  await updateDoc(docRef, {
    downloads: increment(1),
    [`tools_used.${toolName}`]: increment(1),
    lastDownloadLocation: location
  })
}

console.log(`Tracked download: ${toolName} from ${location}`)

} catch (error) { console.error('Failed to track download with location:', error) // Fail silently } }

