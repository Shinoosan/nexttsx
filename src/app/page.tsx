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
import dynamic from 'next/dynamic';
import type { WebAppUser } from '@twa-dev/types';

// Create a wrapper component for the WebApp SDK
const WebAppWrapper = dynamic(
  () => import('@/components/WebAppWrapper').then((mod) => mod.WebAppWrapper),
  { ssr: false }
);

export default function Page() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'settings'>('home');
  const [userData, setUserData] = useState<WebAppUser | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();

  useEffect(() => {
    // Get userData from WebAppWrapper
    const handleUserData = (event: CustomEvent<WebAppUser>) => {
      const user = event.detail;
      // Transform WebAppUser to match the expected User interface
      setUserData({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        languageCode: user.language_code,
        isPremium: user.is_premium
      } as any); // Using 'as any' temporarily to bypass type checking
    };

    window.addEventListener('webappUserData', handleUserData as any);
    return () => {
      window.removeEventListener('webappUserData', handleUserData as any);
    };
  }, []);

  const showToast = (message: string, type?: 'error' | 'success') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  return (
    <WebAppWrapper>
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
              {currentView === 'profile' && userData && (
                <ProfileView
                  telegramUserId={userData.id.toString()}
                  processedCount={processedCount}
                  userData={userData}
                />
              )}
              {currentView === 'settings' && (
                <SettingsView
                  telegramUserId={userData?.id.toString() || ''}
                />
              )}
            </AnimatePresence>
          </main>
          <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
            <div className="flex justify-around items-center h-16 max-w-md mx-auto">
              {['home', 'profile', 'settings'].map((view) => (
                <motion.button
                  key={`${view}-button`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setCurrentView(view as 'home' | 'profile' | 'settings')}
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
        <Toaster />
      </div>
    </WebAppWrapper>
  );
}
