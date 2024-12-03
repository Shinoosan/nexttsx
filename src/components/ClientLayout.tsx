'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/theme-switcher';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, User } from 'lucide-react';
import { useProxy } from '@/hooks/use-proxy';
import { useTelegramInit } from '@/hooks/useTelegramInit';
import { dynamicViews } from '@/lib/dynamic-views';

type ViewType = 'home' | 'profile' | 'settings';

interface ClientLayoutProps {
  defaultView: ViewType;
}

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const { HomeView, ProfileView, SettingsView } = dynamicViews;

const ClientLayout = ({ defaultView }: ClientLayoutProps) => {
  const [currentView, setCurrentView] = useState<ViewType>(defaultView);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();
  const { userData, isInitialized, isLoading } = useTelegramInit();

  const showToast = (message: string, type?: 'error' | 'success') => {
    toast({
      title: message,
      variant: type === 'error' ? 'destructive' : 'default'
    });
  };

  if (isLoading || !isInitialized) {
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
            <SettingsView telegramUserId={userData?.id?.toString() || ''} />
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
};

export { ClientLayout };
export type { ClientLayoutProps };