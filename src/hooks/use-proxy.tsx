'use client';

import React from 'react';
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface ProxyContextType {
  proxy: string | null;
  setProxy: (proxy: string | null) => void;
  updateUserProxy: (telegramId: string, proxy: string) => Promise<void>;
  saveProxy: (newProxy: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ProxyContext = createContext<ProxyContextType | undefined>(undefined);

export function ProxyProvider({ children }: { children: ReactNode }) {
  const [proxy, setProxy] = useState<string | null>(
    process.env.NEXT_PUBLIC_DEFAULT_PROXY || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Safe localStorage access
  useEffect(() => {
    const savedProxy = typeof window !== 'undefined' 
      ? localStorage.getItem('proxy')
      : null;
    if (savedProxy) {
      setProxy(savedProxy);
    }
  }, []);

  const updateUserProxy = async (telegramId: string, newProxy: string) => {
    setIsLoading(true);
    setError(null);

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
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update proxy');
      }

      setProxy(newProxy);
      if (typeof window !== 'undefined') {
        localStorage.setItem('proxy', newProxy);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('Error updating proxy:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const saveProxy = (newProxy: string) => {
    try {
      setProxy(newProxy);
      if (typeof window !== 'undefined') {
        localStorage.setItem('proxy', newProxy);
      }
    } catch (error) {
      console.error('Error saving proxy to localStorage:', error);
      setError('Failed to save proxy settings');
    }
  };

  const value = {
    proxy,
    setProxy,
    updateUserProxy,
    saveProxy,
    isLoading,
    error,
  };

  return <ProxyContext.Provider value={value}>{children}</ProxyContext.Provider>;
}

export function useProxy(): ProxyContextType {
  const context = useContext(ProxyContext);
  if (context === undefined) {
    throw new Error('useProxy must be used within a ProxyProvider');
  }
  return context;
}