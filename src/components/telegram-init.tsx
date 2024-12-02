// src/components/telegram-init.tsx
'use client';

import { useEffect } from 'react';
import WebApp from '@twa-dev/sdk';

// Define the TelegramUser interface
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

// Define the WebApp interface
declare global {
  interface Window {
    Telegram?: {
      WebApp: typeof WebApp & {
        initDataUnsafe: {
          user?: TelegramUser;
          auth_date?: number;
          hash?: string;
          query_id?: string;
        };
      };
    };
  }
}

export function TelegramInit() {
  useEffect(() => {
    const initTelegramUser = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        try {
          // Initialize WebApp
          window.Telegram.WebApp.ready();
          
          const user = window.Telegram.WebApp.initDataUnsafe.user;

          if (user) {
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
          } else {
            console.warn('No Telegram user data available');
            if (process.env.NODE_ENV === 'development') {
              // Use mock data in development
              const mockUser = {
                id: 1,
                first_name: 'Dev',
                username: 'dev_user'
              };
              console.log('Using mock user in development:', mockUser);
            }
          }
        } catch (error) {
          console.error('Error in Telegram initialization:', error);
        }
      }
    };

    void initTelegramUser();
  }, []);

  return null;
}
