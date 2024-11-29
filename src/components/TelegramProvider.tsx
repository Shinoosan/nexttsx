// components/telegram-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { WebApp } from '@twa-dev/types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

interface TelegramContext {
  webApp: WebApp | null;
  user: {
    id: string;
    username?: string;
    firstName: string;
    lastName?: string;
    photoUrl?: string;
  } | null;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContext>({
  webApp: null,
  user: null,
  isReady: false,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [webApp, setWebApp] = useState<WebApp | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramContext['user']>(null);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const app = window.Telegram.WebApp;
      app.ready();
      setWebApp(app);
      
      if (app.initDataUnsafe?.user) {
        const { id, username, first_name, last_name, photo_url } = app.initDataUnsafe.user;
        setUser({
          id: id.toString(),
          username,
          firstName: first_name,
          lastName: last_name,
          photoUrl: photo_url,
        });
      }
      
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ webApp, user, isReady }}>
      {children}
    </TelegramContext.Provider>
  );
}

export const useTelegram = () => useContext(TelegramContext);