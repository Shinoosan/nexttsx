'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/theme-switcher';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, User } from 'lucide-react';
import { useProxy } from '@/hooks/use-proxy';
import '@/app/globals.css';
import HomeView from '@/components/views/home-view';
import ProfileView from '@/components/views/profile-view';
import SettingsView from '@/components/views/settings-view';
import WebApp from '@twa-dev/sdk';
import type { WebAppUser } from '@twa-dev/types';

export default function Page() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'settings'>('home');
  const [userData, setUserData] = useState<WebAppUser | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();

  useEffect(() => {
    const initData = WebApp.initDataUnsafe;
    const user = initData.user || null;

    if (user) {
      setUserData(user);
    }
  }, []);

  const showToast = (message: string, type?: 'error' | 'success') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  return WebApp.wrap(
    <div className="min-h-[100dvh] w-full">
      <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
        <main className="pb-20 pt-4">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
              <HomeView
                telegramUserId={userData?.id.toString() || ''}
                proxy={proxy}
                onProcessedCountChange={setProcessedCount}
                showToast={showToast}
              />
            )}
            {currentView === 'profile' && (
              <ProfileView
                telegramUserId={userData?.id.toString() || ''}
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
                onClick={() => setCurrentView(view)}
                className={`p-2 rounded-lg transition-colors ${
                  currentView === view ? 'text-primary' : 'text-muted-foreground'
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
    </div>,
    <Toaster />
  );
}
