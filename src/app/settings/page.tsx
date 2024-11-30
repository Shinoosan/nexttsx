'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-switcher';
import { useProxy } from '@/hooks/use-proxy';
import { useToast } from '@/components/ui/use-toast';
import { Home, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';

const checkProxy = async (proxy: string) => {
  try {
    const response = await fetch('/api/check-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proxy }),
    });

    const data = await response.json();
    return data.isLive;
  } catch (error) {
    console.error('Error checking proxy:', error);
    return false;
  }
};

interface SettingsPageProps {
  telegramUserId: string | null;
}

export default function SettingsPage({ telegramUserId }: SettingsPageProps) {
  const { proxy, saveProxy } = useProxy(telegramUserId || '');
  const [proxyInput, setProxyInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (proxy) {
      setProxyInput(proxy);
    }
  }, [proxy]);

  const checkAndSaveProxy = async () => {
    setIsChecking(true);
    try {
      const isLive = await checkProxy(proxyInput);

      if (isLive) {
        await saveProxy(proxyInput);
        toast({
          title: 'Success',
          description: 'Proxy is live and has been saved',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Proxy is not working',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check proxy',
        variant: 'destructive',
      });
    } finally {
      setIsChecking(false);
    }
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
            {/* User Proxy Configuration */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Your Proxy Configuration</h2>
              <textarea
                className="w-full p-4 rounded-lg border bg-background text-foreground resize-none font-mono text-sm"
                placeholder="Enter proxy (IP:PORT:USERNAME:PASSWORD)"
                value={proxyInput}
                onChange={(e) => setProxyInput(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={checkAndSaveProxy}
                disabled={isChecking || !proxyInput}
                className="flex-1"
              >
                {isChecking ? 'Checking...' : 'Check & Save Proxy'}
              </Button>

              {proxy && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    saveProxy(null);
                    setProxyInput('');
                  }}
                >
                  Clear Proxy
                </Button>
              )}
            </div>

            {proxy && (
              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Current Proxy:</h3>
                <code className="text-sm">{proxy}</code>
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

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const telegramUserId = process.env.TELEGRAM_USER_ID || null;

  return {
    props: {
      telegramUserId,
    },
  };
};
