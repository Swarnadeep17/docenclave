import { realtimeDb } from '../config/firebase'
import { ref, onValue, set, get, runTransaction } from 'firebase/database'

class StatsService {
  constructor() {
    this.statsRef = ref(realtimeDb, 'stats')
    this.activeUsersRef = ref(realtimeDb, 'activeUsers')
    this.listeners = new Set()
  }

  // Helper to get the current month's stats path
  getCurrentMonthPath() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
    return `stats/${year}/${month}`;
  }

  // Initialize stats - now just a placeholder for potential future use, not for hardcoded values
  async initializeStats() {
    // This function can be used later if needed for initial setup checks,
    // but it no longer provides hardcoded values.
    console.log('StatsService initialized.');
  }

  // Listen to real-time stats updates
  subscribeToStats(callback) {
    const monthStatsRef = ref(realtimeDb, this.getCurrentMonthPath());
    const unsubscribe = onValue(monthStatsRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val());
      } else {
        // Provide a default structure if the month's node doesn't exist yet
        callback({
          visits: 0,
          filesDownloaded: 0,
          toolsUsed: 0,
          toolUsage: {},
          lastUpdated: Date.now()
        });
      }
    })

    this.listeners.add(unsubscribe)
    return unsubscribe
  }

  // Listen to active users count
  subscribeToActiveUsers(callback) {
    const unsubscribe = onValue(this.activeUsersRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeUsers = Object.keys(snapshot.val()).length
        callback(activeUsers)
      } else {
        callback(127) // Fallback number
      }
    }, (error) => {
      console.error('Error listening to active users:', error)
      callback(127) // Fallback number
    })

    this.listeners.add(unsubscribe)
    return unsubscribe
  }

  // Increment file processed count
  async incrementFilesProcessed(count = 1) {
    try {
      await runTransaction(ref(realtimeDb, 'stats/filesProcessed'), (currentValue) => {
        return (currentValue || 0) + count
      })
      
      // Also update files downloaded (assuming 1.5x ratio)
      await runTransaction(ref(realtimeDb, 'stats/filesDownloaded'), (currentValue) => {
        return (currentValue || 0) + Math.floor(count * 1.5)
      })

      // Update last updated timestamp
      await set(ref(realtimeDb, 'stats/lastUpdated'), Date.now())
    } catch (error) {
      console.error('Error incrementing files processed:', error)
    }
  }

  // Increment tools used count
  async incrementToolsUsed(count = 1) {
    try {
      await runTransaction(ref(realtimeDb, 'stats/toolsUsed'), (currentValue) => {
        return (currentValue || 0) + count
      })

      await set(ref(realtimeDb, 'stats/lastUpdated'), Date.now())
    } catch (error) {
      console.error('Error incrementing tools used:', error)
    }
  }

  // Register active user session
  async registerActiveUser(userId = null) {
    try {
      const sessionId = userId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const userRef = ref(realtimeDb, `activeUsers/${sessionId}`)
      
      await set(userRef, {
        timestamp: Date.now(),
        lastSeen: Date.now()
      })

      // Set up heartbeat to maintain active status
      const heartbeatInterval = setInterval(async () => {
        try {
          await set(ref(realtimeDb, `activeUsers/${sessionId}/lastSeen`), Date.now())
        } catch (error) {
          console.error('Error updating heartbeat:', error)
          clearInterval(heartbeatInterval)
        }
      }, 30000) // Update every 30 seconds

      // Clean up on page unload
      const cleanup = () => {
        clearInterval(heartbeatInterval)
        set(userRef, null).catch(console.error)
      }

      window.addEventListener('beforeunload', cleanup)
      
      return { sessionId, cleanup }
    } catch (error) {
      console.error('Error registering active user:', error)
      return { sessionId: null, cleanup: () => {} }
    }
  }

  // Clean up old active users (older than 2 minutes)
  async cleanupActiveUsers() {
    try {
      const snapshot = await get(this.activeUsersRef)
      if (snapshot.exists()) {
        const activeUsers = snapshot.val()
        const cutoffTime = Date.now() - (2 * 60 * 1000) // 2 minutes ago
        
        const updates = {}
        Object.keys(activeUsers).forEach(sessionId => {
          const user = activeUsers[sessionId]
          if (user.lastSeen < cutoffTime) {
            updates[`activeUsers/${sessionId}`] = null
          }
        })

        if (Object.keys(updates).length > 0) {
          await set(ref(realtimeDb), updates)
        }
      }
    } catch (error) {
      console.error('Error cleaning up active users:', error)
    }
  }

  // Cleanup all listeners
  cleanup() {
    this.listeners.forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe()
      }
    })
    this.listeners.clear()
  }
}

export default new StatsService()
