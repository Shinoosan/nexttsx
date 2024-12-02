'use client'

import React from 'react'
import { createContext, useContext, useState, type ReactNode } from 'react'

interface ProxyContextType {
  proxy: string | null
  setProxy: (proxy: string | null) => void
  updateUserProxy: (telegramId: string, proxy: string) => Promise<void>
  saveProxy?: (newProxy: string) => void // Added for compatibility
}

const ProxyContext = createContext<ProxyContextType>({
  proxy: process.env.NEXT_PUBLIC_DEFAULT_PROXY || null,
  setProxy: () => {},
  updateUserProxy: async () => {},
})

export function ProxyProvider({ children }: { children: ReactNode }) {
  const [proxy, setProxy] = useState<string | null>(
    process.env.NEXT_PUBLIC_DEFAULT_PROXY || null
  )

  const updateUserProxy = async (telegramId: string, newProxy: string) => {
    try {
      const response = await fetch('/api/user/proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          proxy: newProxy,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update proxy')
      }

      setProxy(newProxy)
    } catch (error) {
      console.error('Error updating proxy:', error)
      throw error
    }
  }

  // Added for compatibility with your settings page
  const saveProxy = (newProxy: string) => {
    setProxy(newProxy)
    localStorage.setItem('proxy', newProxy)
  }

  return (
    <ProxyContext.Provider value={{ proxy, setProxy, updateUserProxy, saveProxy }}>
      {children}
    </ProxyContext.Provider>
  )
}

export function useProxy(): ProxyContextType {
  const context = useContext(ProxyContext)
  if (!context) {
    throw new Error('useProxy must be used within a ProxyProvider')
  }
  return context
}
