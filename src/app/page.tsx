'use client';

// Type definitions
interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
    };
    query_id?: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

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

  // Initialize Telegram WebApp
  useEffect(() => {
    const initTelegramWebApp = () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe?.user?.id) {
          setTelegramUserId(tg.initDataUnsafe.user.id.toString());
        }
      }
    };

    initTelegramWebApp();
  }, []);

  // Toast notification handler
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast({
      title: type === 'success' ? 'Success' : 'Error',
      description: message,
      variant: type === 'success' ? 'default' : 'destructive',
    });
  };

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
        {/* Header Section */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b">
          <div className="flex justify-between items-center px-4 h-14">
            <ThemeToggle />
            <h1 className="text-lg font-semibold">
              {currentView.charAt(0).toUpperCase() + currentView.slice(1)}
            </h1>
            <div className="w-8 h-8" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Main Content */}
        <main className="pb-20 pt-20">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <HomeView 
                telegramUserId={telegramUserId}
                proxy={proxy}
                onProcessedCountChange={setProcessedCount}
                showToast={showToast}
              />
            )}
            {currentView === 'profile' && (
              <ProfileView 
                telegramUserId={telegramUserId}
                processedCount={processedCount}
              />
            )}
            {currentView === 'settings' && (
              <SettingsView 
                showToast={showToast}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Navigation Bar */}
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
