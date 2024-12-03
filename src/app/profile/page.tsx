'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { WebAppInitData } from '@twa-dev/types';

// Types
interface Stats {
  totalCardsProcessed: number;
  totalUsers: number;
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

// Components
const ErrorAlert = ({ message }: { message: string }) => (
  <Alert variant="destructive" className="mx-4 mt-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </Alert>
);

const StatsCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-lg bg-muted">
    <h3 className="font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const ProfileSkeleton = () => (
  <div className="p-4">
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    </Card>
  </div>
);

function ProfileContent() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const initializeTelegramAndFetchStats = async () => {
      try {
        setLoading(true);
        
        // Initialize Telegram Web App
        let user: TelegramUser | null = null;
        
        if (typeof window !== 'undefined') {
          const WebApp = (window as any).Telegram?.WebApp || (await import('@twa-dev/sdk')).default;
          
          if (WebApp?.initDataUnsafe?.user) {
            user = WebApp.initDataUnsafe.user;
            setTelegramUser(user);
            
            // Fetch stats only if we have a user
            const response = await fetch(`/api/get-stats?userId=${user.id}`);
            if (!response.ok) {
              throw new Error('Failed to fetch stats');
            }
            const data = await response.json();
            setStats(data.global);
          } else {
            throw new Error('No user data available');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    void initializeTelegramAndFetchStats();
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !telegramUser) {
    return <ErrorAlert message={error || 'No user data available'} />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage 
                  src={telegramUser.photo_url} 
                  alt={telegramUser.username || telegramUser.first_name} 
                />
                <AvatarFallback>
                  {telegramUser.first_name[0]}
                  {telegramUser.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-semibold">
                  {telegramUser.first_name} {telegramUser.last_name}
                </h2>
                {telegramUser.username && (
                  <p className="text-muted-foreground">
                    @{telegramUser.username}
                  </p>
                )}
                {telegramUser.is_premium && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                    Premium
                  </span>
                )}
              </div>
            </div>

            <StatsCard title="Your Stats">
              <p>Language: {telegramUser.language_code || 'Not specified'}</p>
              <p>ID: {telegramUser.id}</p>
            </StatsCard>

            {stats && (
              <StatsCard title="Global Stats">
                <p>Total Cards Processed: {stats.totalCardsProcessed}</p>
                <p>Total Users: {stats.totalUsers}</p>
              </StatsCard>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

// Export the component with proper mounting checks
export default function Profile() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <ProfileSkeleton />;
  }

  return <ProfileContent />;
}