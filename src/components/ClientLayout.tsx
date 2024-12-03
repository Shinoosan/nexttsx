'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as TelegramUser } from '@telegram-apps/sdk';
import { useProxy } from '@/hooks/use-proxy';
import { useTelegramInit } from '@/hooks/useTelegramInit';
import { useToast } from '@/components/ui/use-toast';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Navigation } from '@/components/Navigation';
import HomeView from '@/components/views/home-view';
import ProfileView from '@/components/views/profile-view';
import SettingsView from '@/components/views/settings-view';

export type ViewType = 'home' | 'profile' | 'settings';

interface ClientLayoutProps {
  defaultView: ViewType;
  children?: React.ReactNode;
}

export function ClientLayout({ defaultView, children }: ClientLayoutProps) {
  const [currentView, setCurrentView] = useState<ViewType>(defaultView);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const { proxy } = useProxy();
  const { userData, isInitialized, isLoading } = useTelegramInit();
  const { toast } = useToast();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (children) {
    return <>{children}</>;
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-red-500">
          Failed to initialize. Please try again.
        </p>
      </div>
    );
  }

  const showToast = (title: string, description?: string, variant: 'default' | 'destructive' = 'default') => {
    toast({
      title,
      description,
      variant,
    });
  };

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
        return userData ? (
          <motion.div
            key="profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ProfileView
              telegramUserId={userData.id.toString()}
              processedCount={processedCount}
              userData={userData}
            />
          </motion.div>
        ) : null;
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
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {renderView()}
        </AnimatePresence>
      </main>
      <Navigation
        currentView={currentView}
        onViewChange={setCurrentView}
        processedCount={processedCount}
      />
    </div>
  );
}