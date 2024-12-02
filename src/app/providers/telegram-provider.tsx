'use client';

import { useEffect } from 'react';

// Define the types we need right here
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
  allows_write_to_pm?: boolean;
  added_to_attachment_menu?: boolean;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initDataUnsafe: {
    user?: TelegramUser;
    start_param?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const initTelegramUser = async () => {
      // Check if Telegram WebApp is available
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const webApp = window.Telegram.WebApp;
        
        // Tell Telegram that our app is ready
        webApp.ready();

        const user = webApp.initDataUnsafe.user;

        if (user) {
          try {
            const response = await fetch('/api/telegram-user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                username: user.username,
                languageCode: user.language_code,
                isPremium: user.is_premium,
                photoUrl: user.photo_url,
                allowsWriteToPm: user.allows_write_to_pm,
                addedToAttachmentMenu: user.added_to_attachment_menu
              }),
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

  return children;
}
