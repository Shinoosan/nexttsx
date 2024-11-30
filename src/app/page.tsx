'use client';

import { WebApp } from '../types/telegram-webapp-types';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-switcher';
import { GateSelector } from '@/components/gate-selector';
import { AnimatedButton } from '@/components/ui/animated-button';
import { ProcessingStatus } from '@/components/processing-status';
import { useInterval } from '@/hooks/use-interval';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, User } from 'lucide-react';
import { useProxy } from '@/hooks/use-proxy';
import '@/app/globals.css';
import HomeView from '@/components/views/home-view';
import ProfileView from '@/components/views/profile-view';
import SettingsView from '@/components/views/settings-view';

export type ViewType = 'home' | 'profile' | 'settings';

export default function Page() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [telegramUserId, setTelegramUserId] = useState<string>('');
  const [processedCount, setProcessedCount] = useState(0);
  const { proxy } = useProxy();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();

      // Check if initDataUnsafe and user exist
      if (tg.initDataUnsafe?.user) {
        // Access user.id correctly
        setTelegramUserId(tg.initDataUnsafe.user.id.toString());
      }
    }
  }, []);

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
        <main className="pb-20 pt-4">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <HomeView 
                telegramUserId={telegramUserId}
                proxy={proxy}
                onProcessedCountChange={setProcessedCount}
              />
            )}
            {currentView === 'profile' && (
              <ProfileView 
                telegramUserId={telegramUserId}
                processedCount={processedCount}
              />
            )}
            {currentView === 'settings' && <SettingsView />}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            {['home', 'profile', 'settings'].map((view) => (
              <motion.button
                key={`${view}-button`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setCurrentView(view as ViewType)}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === view 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                }`}
              >
                {view === 'home' && <Home className="w-6 h-6" />}
                {view === 'profile' && <User className="w-6 h-6" />}
                {view === 'settings' && <Settings className="w-6 h-6" />}
              </motion.button>
            ))}
          </div>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}
