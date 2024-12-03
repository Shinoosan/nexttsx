'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/use-toast';
import { ThemeToggle } from '@/components/theme-switcher';
import { Toaster } from '@/components/ui/toaster';
import { Home, Settings, User } from 'lucide-react';
import { useProxy } from '@/hooks/use-proxy';
import '@/app/globals.css';

// Loading component
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy load views with proper loading states
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

// Type definitions
interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramWebApp {
  initDataUnsafe: {
    user?: WebAppUser;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

function PageContent() {
  const [currentView, setCurrentView] = useState<'home' | 'profile' | 'settings'>('home');
  const [userData, setUserData] = useState<WebAppUser | null>(null);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();
  const [mounted, setMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);

    const initializeTelegramWebApp = async () => {
      try {
        if (typeof window !== 'undefined') {
          // Try to get WebApp from window.Telegram first
          let WebApp = window.Telegram?.WebApp;
          
          // If not available, try importing from @twa-dev/sdk
          if (!WebApp) {
            const TWA = await import('@twa-dev/sdk');
            WebApp = TWA.default;
          }

          if (WebApp?.initDataUnsafe?.user) {
            setUserData(WebApp.initDataUnsafe.user);
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

  return (
    <div className="min-h-[100dvh] w-full">
      <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 transition-colors duration-300">
        <main className="pb-20 pt-4">
          <AnimatePresence mode="wait">
            {currentView === 'home' && (
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
            )}
            {currentView === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ProfileView
                  telegramUserId={userData?.id?.toString() || ''}
                  processedCount={processedCount}
                />
              </motion.div>
            )}
            {currentView === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SettingsView />
              </motion.div>
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
  );
}

// Export the component with proper mounting checks
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