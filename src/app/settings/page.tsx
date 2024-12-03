'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-switcher';
import { useProxy } from '@/hooks/use-proxy';
import { useToast } from '@/components/ui/use-toast';
import { Home, Settings, User } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Types
interface ProxyCheckResponse {
  isLive: boolean;
  ip?: string;
  error?: string;
}

// Utility functions
const checkProxy = async (proxy: string): Promise<ProxyCheckResponse> => {
  try {
    const response = await fetch('/api/check-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proxy }),
    });

    if (!response.ok) {
      throw new Error('Failed to check proxy');
    }

    const data: ProxyCheckResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking proxy:', error);
    return {
      isLive: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
};

// Main component
function SettingsContent() {
  const { proxy, updateUserProxy } = useProxy();
  const [proxyInput, setProxyInput] = useState(proxy || '');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const [proxyIp, setProxyIp] = useState<string>('');
  const [telegramUserId, setTelegramUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initTelegram = async () => {
      try {
        if (typeof window !== 'undefined') {
          const WebApp = (await import('@twa-dev/sdk')).default;
          if (WebApp.initDataUnsafe?.user) {
            setTelegramUserId(WebApp.initDataUnsafe.user.id.toString());
          } else if (process.env.NODE_ENV === 'development') {
            setTelegramUserId('1'); // Development fallback
          }
        }
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
        toast({
          title: 'Error',
          description: 'Failed to initialize Telegram Web App',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    void initTelegram();
  }, [toast]);

  useEffect(() => {
    if (proxy) {
      setProxyInput(proxy);
    }
  }, [proxy]);

  const checkAndSaveProxy = async () => {
    if (!telegramUserId) {
      toast({
        title: 'Error',
        description: 'Telegram user ID not found',
        variant: 'destructive',
      });
      return;
    }

    if (!validateProxyFormat(proxyInput)) {
      toast({
        title: 'Error',
        description: 'Invalid proxy format',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      const proxyResult = await checkProxy(proxyInput);

      if (proxyResult.isLive) {
        await updateUserProxy(telegramUserId, proxyInput);
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
    if (!telegramUserId) {
      toast({
        title: 'Error',
        description: 'Telegram user ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateUserProxy(telegramUserId, '');
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

  const validateProxyFormat = (proxy: string): boolean => {
    const parts = proxy.split(':');
    return parts.length === 4;
  };

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          {/* Rest of your component JSX */}
        </Card>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        {/* Navigation JSX */}
      </nav>
    </div>
  );
}

// Export with dynamic to disable SSR and handle client-side only features
export default dynamic(() => Promise.resolve(SettingsContent), {
  ssr: false,
  loading: () => (
    <div className="min-h-[100dvh] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  ),
});