import React, { createContext, useContext, useState, useEffect } from 'react'
import statsService from '../services/statsService'

const StatsContext = createContext()

export const useStats = () => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    visits: 0,
    filesDownloaded: 0,
    toolsUsed: 0,
    totalUsers: 0,
    activeUsers: 0,
    toolsAvailable: 15,
    toolUsage: {},
    lastUpdated: Date.now()
  })
  const [activeUsers, setActiveUsers] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [userSession, setUserSession] = useState(null)

  useEffect(() => {
    let statsUnsubscribe = null
    let activeUsersUnsubscribe = null

    const initializeFirebaseStats = async () => {
      try {
        // Initialize stats in Firebase
        const initialStats = await statsService.initializeStats()
        setStats(prev => ({ ...prev, ...initialStats }))
        setIsConnected(true)

        // Subscribe to real-time stats updates
        statsUnsubscribe = statsService.subscribeToStats((newStats) => {
          setStats(prev => ({
            ...prev,
            ...newStats,
            toolsAvailable: 15 // Keep this static
          }))
        })

        // Subscribe to active users count
        activeUsersUnsubscribe = statsService.subscribeToActiveUsers((count) => {
          setActiveUsers(count)
          setStats(prev => ({ ...prev, activeUsers: count }))
        })

        // Register this user as active
        const session = await statsService.registerActiveUser()
        setUserSession(session)

        // Clean up old active users periodically
        const cleanupInterval = setInterval(() => {
          statsService.cleanupActiveUsers()
        }, 60000) // Every minute

        return () => {
          clearInterval(cleanupInterval)
        }

      } catch (error) {
        console.error('Error initializing Firebase stats:', error)
        setIsConnected(false)
        // Fall back to localStorage
        const savedStats = localStorage.getItem('docenclave-stats')
        if (savedStats) {
          setStats(prev => ({ ...prev, ...JSON.parse(savedStats) }))
        }
      }
    }

    const cleanup = initializeFirebaseStats()

    return () => {
      if (statsUnsubscribe) statsUnsubscribe()
      if (activeUsersUnsubscribe) activeUsersUnsubscribe()
      if (userSession?.cleanup) userSession.cleanup()
      if (cleanup) cleanup.then(fn => fn && fn())
      statsService.cleanup()
    }
  }, [])

  const incrementFilesProcessed = async (count = 1) => {
    if (isConnected) {
      // Update Firebase
      await statsService.incrementFilesProcessed(count)
    } else {
      // Fall back to localStorage
      setStats(prev => {
        const newStats = {
          ...prev,
          filesProcessed: prev.filesProcessed + count,
          filesDownloaded: prev.filesDownloaded + Math.floor(count * 1.5)
        }
        localStorage.setItem('docenclave-stats', JSON.stringify(newStats))
        return newStats
      })
    }
  }

  const incrementToolsUsed = async (count = 1, toolId = null) => {
    if (isConnected) {
      // Update Firebase
      await statsService.incrementToolsUsed(count, toolId)
    } else {
      // Fall back to localStorage
      setStats(prev => {
        const newStats = {
          ...prev,
          toolsUsed: prev.toolsUsed + count,
          toolUsage: {
            ...prev.toolUsage,
            [toolId]: (prev.toolUsage?.[toolId] || 0) + count
          }
        }
        localStorage.setItem('docenclave-stats', JSON.stringify(newStats))
        return newStats
      })
    }
  }

  const incrementHappyUsers = () => {
    // This could be implemented if needed
    setStats(prev => ({
      ...prev,
      totalUsers: prev.totalUsers + 1
    }))
  }

  const value = {
    stats,
    activeUsers,
    isConnected,
    incrementFilesProcessed,
    incrementToolsUsed,
    incrementHappyUsers
  }

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  )
}
