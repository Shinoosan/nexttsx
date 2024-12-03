// src/components/telegram-init.tsx
'use client';

import { useEffect } from 'react';
import { useCardStore } from '@/store/card-store';
import { toast } from '@/components/ui/use-toast';
import WebApp from '@twa-dev/sdk';

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



export function TelegramInit() {
  const { setTelegramUser } = useCardStore();

  useEffect(() => {
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
        setTelegramUser(userData);

        toast({
          title: 'Welcome!',
          description: `Hello ${userData.firstName}!`,
        });

        return userData;
      } catch (error) {
        console.error('Error saving user:', error);
        throw error;
      }
    };

    const initTelegramUser = async () => {
      try {
        // Development mode handling
        if (process.env.NODE_ENV === 'development') {
          const mockUser = {
            id: 1,
            first_name: 'Dev',
            username: 'dev_user',
            is_premium: true,
          };
          await saveUserData(mockUser);
          return;
        }

        // Production mode handling
        if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
          const tg = window.Telegram.WebApp;
          tg.ready();
          tg.expand();

          const user = tg.initDataUnsafe.user;
          if (!user) {
            throw new Error('No Telegram user data available');
          }

          await saveUserData(user);
        } else {
          throw new Error('Telegram WebApp is not available');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error('Telegram initialization error:', error);
        
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        });
      }
    };

    void initTelegramUser();
  }, [setTelegramUser]);

  return null;
}

export type { TelegramUser, TelegramWebAppUser, WebAppInitData };
