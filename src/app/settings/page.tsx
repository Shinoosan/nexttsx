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
    // Check if the window object is available (browser environment)
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe.user) {
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

  const checkAndSaveProxy = async () => {
    // If no telegram ID and in development, use a default
    if (!telegramId) {
      if (process.env.NODE_ENV === 'development') {
        setTelegramId('1');
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
        await updateUserProxy(telegramId || '1', proxyInput);
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
    if (!telegramId) {
      toast({
        title: 'Error',
        description: 'Telegram user ID not found',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateUserProxy(telegramId, '');
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

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <ThemeToggle />
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Proxy Configuration</h2>
              <textarea
                className="w-full p-4 rounded-lg border bg-background text-foreground resize-none font-mono text-sm"
                placeholder="Enter proxy (IP:PORT:USERNAME:PASSWORD)"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                rows={3}
              />
              {proxyInput && !validateProxyFormat(proxyInput) && (
                <p className="text-destructive text-sm mt-1">
                  Invalid format. Use: IP:PORT:USERNAME:PASSWORD
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                onClick={checkAndSaveProxy}
                disabled={isChecking || !proxyInput || !validateProxyFormat(proxyInput)}
                className="flex-1"
              >
                {isChecking ? 'Checking...' : 'Check & Save Proxy'}
              </Button>

              {proxy && (
                <Button
                  variant="destructive"
                  onClick={handleClearProxy}
                >
                  Clear Proxy
                </Button>
              )}
            </div>

            {proxy && (
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <h3 className="font-semibold">Current Proxy:</h3>
                <code className="text-sm block">{proxy}</code>
                {proxyIp && (
                  <p className="text-sm text-muted-foreground">
                    IP: {proxyIp}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </main>

     <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t">
        <div className="flex justify-between items-center h-16 px-4 max-w-2xl mx-auto">
          <Link
            href="/"
            className="flex flex-col items-center justify-center flex-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Home size={24} />
            <span className="text-xs">Home</span>
          </Link>

          <Link
            href="/profile"
            className="flex flex-col items-center justify-center flex-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <User size={24} />
            <span className="text-xs">Profile</span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center justify-center flex-1 text-foreground transition-colors"
          >
            <Settings size={24} />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}