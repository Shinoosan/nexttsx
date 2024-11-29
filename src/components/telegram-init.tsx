'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        expand(): void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
        };
      };
    };
  }
}

export function TelegramInit() {
  useEffect(() => {
    const initTelegramUser = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const user = tg.initDataUnsafe?.user;

        if (user) {
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
          } catch (error) {
            console.error('Error saving Telegram user:', error);
          }
        }
      }
    };

    void initTelegramUser();
  }, []);

  return null;
} 