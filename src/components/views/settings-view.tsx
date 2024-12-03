'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-switcher';
import { useProxy } from '@/hooks/use-proxy';
import { useToast } from '@/components/ui/use-toast';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface ProxyCheckResponse {
  isLive: boolean;
  ip?: string;
  error?: string;
}

interface SettingsViewProps {
  telegramUserId: string;
}

// Components
const ProxyStatus = ({ ip }: { ip: string }) => (
  <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
    <AlertDescription className="text-green-600 dark:text-green-400">
      Proxy is active (IP: {ip})
    </AlertDescription>
  </Alert>
);

export default function SettingsView({ telegramUserId }: SettingsViewProps) {
  const { proxy, updateUserProxy } = useProxy();
  const [proxyInput, setProxyInput] = useState(proxy || '');
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const [proxyIp, setProxyIp] = useState<string>('');

  useEffect(() => {
    if (proxy) {
      setProxyInput(proxy);
    }
  }, [proxy]);

  const validateProxyFormat = (proxy: string): boolean => {
    const proxyRegex = /^(?:\d{1,3}\.){3}\d{1,3}:\d+:[^:]+:[^:]+$/;
    return proxyRegex.test(proxy);
  };

  const checkAndSaveProxy = async () => {
    if (!validateProxyFormat(proxyInput)) {
      toast({
        title: 'Error',
        description: 'Invalid proxy format. Expected: ip:port:username:password',
        variant: 'destructive',
      });
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch('/api/check-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proxy: proxyInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to check proxy');
      }

      const data: ProxyCheckResponse = await response.json();

      if (data.isLive) {
        await updateUserProxy(telegramUserId, proxyInput);
        setProxyIp(data.ip || '');
        toast({
          title: 'Success',
          description: `Proxy is live (IP: ${data.ip})`,
        });
      } else {
        throw new Error(data.error || 'Proxy is not working');
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

  return (
    <div className="px-4 pt-4 pb-32">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Settings</h2>
            <ThemeToggle />
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="proxy">Proxy Settings</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="proxy"
                  placeholder="ip:port:username:password"
                  value={proxyInput}
                  onChange={(e) => setProxyInput(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={checkAndSaveProxy}
                  disabled={isChecking || !proxyInput}
                >
                  {isChecking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Check & Save
                </Button>
              </div>
              {proxyIp && <ProxyStatus ip={proxyIp} />}
            </div>

            <Button
              variant="destructive"
              onClick={handleClearProxy}
              disabled={!proxyInput || isChecking}
            >
              Clear Proxy
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}