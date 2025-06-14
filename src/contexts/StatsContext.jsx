import React, { createContext, useContext, useState, useEffect } from 'react'

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
    filesProcessed: 0,
    toolsAvailable: 15,
    happyUsers: 0
  })

  useEffect(() => {
    // Load stats from localStorage
    const savedStats = localStorage.getItem('docenclave-stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    } else {
      // Initialize with some base numbers
      setStats({
        filesProcessed: 12847,
        toolsAvailable: 15,
        happyUsers: 2156
      })
    }
  }, [])

  const incrementFilesProcessed = (count = 1) => {
    setStats(prev => {
      const newStats = {
        ...prev,
        filesProcessed: prev.filesProcessed + count
      }
      localStorage.setItem('docenclave-stats', JSON.stringify(newStats))
      return newStats
    })
  }

  const incrementHappyUsers = () => {
    setStats(prev => {
      const newStats = {
        ...prev,
        happyUsers: prev.happyUsers + 1
      }
      localStorage.setItem('docenclave-stats', JSON.stringify(newStats))
      return newStats
    })
  }

  const value = {
    stats,
    incrementFilesProcessed,
    incrementHappyUsers
  }

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  )
}
