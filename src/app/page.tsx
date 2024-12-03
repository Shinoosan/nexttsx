'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/theme-switcher';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, User } from 'lucide-react';
import { useProxy } from '@/hooks/use-proxy';
import { retrieveLaunchParams, type User as TelegramUser } from '@telegram-apps/sdk';
import '@/app/globals.css';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const HomeView = dynamic(
  () => import('@/components/views/home-view'),
  {
    loading: () => <LoadingScreen />,
    ssr: false
  }
);

const ProfileView = dynamic(
  () => import('@/components/views/profile-view'),
  {
    loading: () => <LoadingScreen />,
    ssr: false
  }
);

const SettingsView = dynamic(
  () => import('@/components/views/settings-view'),
  {
    loading: () => <LoadingScreen />,
    ssr: false
  }
);

function PageContent() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'settings'>('home');
  const [userData, setUserData] = useState<TelegramUser | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initializeTelegramWebApp = async () => {
      try {
        if (typeof window !== 'undefined') {
          const { initData, initDataRaw } = retrieveLaunchParams();
          
          if (initData?.user) {
            const user: TelegramUser = {
              id: initData.user.id,
              firstName: initData.user.firstName,
              lastName: initData.user.lastName,
              username: initData.user.username,
              languageCode: initData.user.languageCode,
              isPremium: initData.user.isPremium,
              allowsWriteToPm: initData.user.allowsWriteToPm,
              addedToAttachmentMenu: initData.user.addedToAttachmentMenu,
              isBot: initData.user.isBot,
              photoUrl: initData.user.photoUrl
            };
            
            setUserData(user);

            // Optional: Validate init data on your server
            try {
              const response = await fetch('/api/validate-init-data', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `tma ${initDataRaw}`
                }
              });
              
              if (!response.ok) {
                throw new Error('Failed to validate init data');
              }
            } catch (error) {
              console.error('Validation error:', error);
              toast({
                title: "Failed to validate Telegram data",
                variant: "destructive"
              });
            }
          } else {
            throw new Error('No user data available');
          }
        }
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
        toast({
          title: "Failed to initialize Telegram Web App",
          variant: "destructive"
        });
      } finally {
        setIsInitialized(true);
      }
    };

    void initializeTelegramWebApp();
  }, []);

  const showToast = (message: string, type?: 'error' | 'success') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  if (!mounted || !isInitialized) {
    return <LoadingScreen />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <HomeView
              telegramUserId={userData?.id?.toString() || ''}
              proxy={proxy}
              onProcessedCountChange={setProcessedCount}
              showToast={showToast}
            />
          </motion.div>
        );
      case 'profile':
        return (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileView
              telegramUserId={userData?.id?.toString() || ''}
              processedCount={processedCount}
              userData={userData}
            />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SettingsView />
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
        <header className="fixed top-0 right-0 p-4 z-50">
          <ThemeToggle />
        </header>

        <main className="pb-20 pt-4">
          <AnimatePresence mode="wait">
            {renderView()}
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
          <div className="flex justify-around items-center h-16 max-w-md mx-auto">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('home')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'home' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Home className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('profile')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'profile' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <User className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentView('settings')}
              className={`p-2 rounded-lg transition-colors ${
                currentView === 'settings' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Settings className="w-6 h-6" />
            </motion.button>
          </div>
        </nav>
      </div>
      <Toaster />
    </div>
  );
}

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingScreen />;
  }

  return <PageContent />;
}