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

  // Rest of your component remains the same...
}
