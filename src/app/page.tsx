// app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-switcher';
import { useProxy } from '@/hooks/use-proxy';
import { useToast } from '@/components/ui/use-toast';
import { Home, Settings, User } from 'lucide-react';
import Link from 'next/link';
import WebApp from '@twa-dev/sdk';
import type { WebAppUser } from '@twa-dev/types';

interface ProxyCheckResponse {
  isLive: boolean;
  ip?: string;
  error?: string;
}

const checkProxy = async (proxy: string): Promise<ProxyCheckResponse> => {
  try {
    const response = await fetch('/api/check-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proxy }),
    });

    const data: ProxyCheckResponse = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to check proxy');
    }

    return data;
  } catch (error) {
    console.error('Error checking proxy:', error);
    return { 
      isLive: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export default function SettingsPage() {
  const { proxy, updateUserProxy } = useProxy();
  const [proxyInput, setProxyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const [userData, setUserData] = useState<WebAppUser | null>(null);
  const [proxyIp, setProxyIp] = useState<string>('');

  useEffect(() => {
    if (WebApp.initDataUnsafe.user) {
      setUserData(WebApp.initDataUnsafe.user);
    }
    
    // Set initial proxy value
    if (proxy) {
      setProxyInput(proxy);
    }
  }, [proxy]);

  const checkAndSaveProxy = async () => {
    if (!userData?.id) {
      if (process.env.NODE_ENV === 'development') {
        setUserData({ id: 1 } as WebAppUser);
      } else {
        toast({
          title: 'Error',
          description: 'Telegram user ID not found',
          variant: 'destructive',
        });
        return;
      }
    }

    setIsChecking(true);
    try {
      const proxyResult = await checkProxy(proxyInput);

      if (proxyResult.isLive) {
        // Save proxy to database
        await updateUserProxy(userData?.id.toString() || '1', proxyInput);
        setProxyIp(proxyResult.ip || '');
        
        toast({
          title: 'Success',
          description: `Proxy is live (IP: ${proxyResult.ip})`,
        });
      } else {
        toast({
          title: 'Error',
          description: proxyResult.error || 'Proxy is not working',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save proxy',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleClearProxy = async () => {
    if (!userData?.id && process.env.NODE_ENV !== 'development') {
      toast({
        title: 'Error',
        description: 'Telegram user ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateUserProxy(userData?.id.toString() || '1', '');
      setProxyInput('');
      setProxyIp('');
      toast({
        title: 'Success',
        description: 'Proxy has been cleared',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear proxy',
        variant: 'destructive',
      });
    }
  };


  return (
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
