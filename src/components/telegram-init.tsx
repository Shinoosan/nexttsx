// src/components/telegram-init.tsx
'use client';

import { useEffect } from 'react';

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
