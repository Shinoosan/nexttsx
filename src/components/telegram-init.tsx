// src/components/telegram-init.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import WebApp from '@twa-dev/sdk';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface TelegramWebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

interface WebAppInitData {
  query_id?: string;
  user?: TelegramWebAppUser;
  auth_date?: number;
  hash?: string;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: typeof WebApp & {
        initDataUnsafe: WebAppInitData;
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export function TelegramInit() {
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  const saveUserData = async (user: TelegramWebAppUser) => {
    try {
      const response = await fetch('/api/telegram-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        throw new Error('Failed to save user data');
      }

      const userData = await response.json();
      console.log('Telegram user saved:', userData);

      toast({
        title: 'Welcome!',
        description: `Hello ${userData.firstName}!`,
        variant: 'default',
      });

      return userData;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  };

  const handleMockUser = useCallback(async () => {
    const mockUser = {
      id: 1,
      first_name: 'Dev',
      username: 'dev_user',
      is_premium: true,
    };
    console.log('Using mock user in development:', mockUser);
    return await saveUserData(mockUser);
  }, []);

  const handleError = useCallback((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error in Telegram initialization:', error);
    
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }, []);

  useEffect(() => {
    const initTelegramUser = async () => {
      if (typeof window === 'undefined') return;

      try {
        const tg = window.Telegram?.WebApp;
        if (!tg) {
          if (process.env.NODE_ENV === 'development') {
            console.warn('Running outside Telegram WebApp environment');
            await handleMockUser();
            return;
          }
          throw new Error('Telegram WebApp is not available');
        }

        tg.ready();
        tg.expand();

        const user = tg.initDataUnsafe.user;
        if (!user) {
          throw new Error('No user data available');
        }

        await saveUserData(user);
      } catch (error) {
        handleError(error);
      } finally {
        setIsInitializing(false);
      }
    };

    void initTelegramUser();
  }, [handleMockUser, handleError]);

  if (isInitializing) {
    return null;
  }

  return null;
}

export type { TelegramUser, TelegramWebAppUser, WebAppInitData };
