import { initializeApp } from 'firebase/app'
import { getFirestore, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  projectId: "docenclave-d5a43",
  // Add other config if needed for client access
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

// Get current month key (YYYY-MM format)
const getCurrentMonthKey = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

// Track visitor (called once per session)
export const trackVisitor = async () => {
  try {
    const monthKey = getCurrentMonthKey()
    const docRef = doc(db, 'analytics', monthKey)
    
    // Check if document exists, if not create it
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        visitors: 1,
        downloads: 0,
        tools_used: {},
        created_at: new Date()
      })
    } else {
      await updateDoc(docRef, {
        visitors: increment(1)
      })
    }
  } catch (error) {
    console.log('Analytics tracking failed:', error)
  }
}

// Track download/tool usage
export const trackDownload = async (toolName = 'unknown') => {
  try {
    const monthKey = getCurrentMonthKey()
    const docRef = doc(db, 'analytics', monthKey)
    
    await updateDoc(docRef, {
      downloads: increment(1),
      [`tools_used.${toolName}`]: increment(1)
    })
  } catch (error) {
    console.log('Download tracking failed:', error)
  }
}

// Get current month stats
export const getMonthlyStats = async () => {
  try {
    const monthKey = getCurrentMonthKey()
    const docRef = doc(db, 'analytics', monthKey)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return docSnap.data()
    } else {
      return { visitors: 0, downloads: 0, tools_used: {} }
    }
  } catch (error) {
    console.log('Failed to get stats:', error)
    return { visitors: 0, downloads: 0, tools_used: {} }
  }
}