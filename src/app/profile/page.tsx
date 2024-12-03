'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from 'next/dynamic';
import type { WebAppInitData } from '@twa-dev/types';

// Define interfaces
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

// Create a wrapper component for Telegram SDK with proper error handling
const TelegramWrapper = dynamic(
  () => Promise.resolve(({ children }: { children: (data: WebAppInitData | null) => React.ReactNode }) => {
    let initData = null;
    
    if (typeof window !== 'undefined') {
      try {
        const WebApp = require('@twa-dev/sdk').default;
        initData = WebApp.initData ? JSON.parse(atob(WebApp.initData)) : null;
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
      }
    }
    
    return <>{children(initData)}</>;
  }),
  { 
    ssr: false,
    loading: () => <ProfileSkeleton />
  }
);

function ProfileContent({ initData }: { initData: WebAppInitData | null }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async (userId: string) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-stats?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data = await response.json();
        setStats(data.global);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    if (initData?.user) {
      void fetchStats(initData.user.id.toString());
    } else {
      setLoading(false);
    }
  }, [initData]);

  if (!initData?.user) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">
              Application was launched with missing init data
            </p>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold">Error</h2>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  const user = initData.user;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.photo_url} alt={user.username || user.first_name} />
                <AvatarFallback>
                  {user.first_name[0]}
                  {user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.first_name} {user.last_name}
                </h2>
                {user.username && (
                  <p className="text-muted-foreground">
                    @{user.username}
                  </p>
                )}
                {user.is_premium && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Premium
                  </span>
                )}
              </div>
            </div>

            {stats && (
              <>
                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">Your Stats</h3>
                  <p>Language: {user.language_code || 'Not specified'}</p>
                  <p>ID: {user.id}</p>
                </div>

                <div className="p-4 rounded-lg bg-muted">
                  <h3 className="font-semibold mb-2">Global Stats</h3>
                  <p>Total Cards Processed: {stats.totalCardsProcessed}</p>
                  <p>Total Users: {stats.totalUsers}</p>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

function ProfileSkeleton() {
  return (
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
}

// Export with dynamic to disable SSR
export default dynamic(() => Promise.resolve(() => (
  <TelegramWrapper>
    {(initData) => <ProfileContent initData={initData} />}
  </TelegramWrapper>
)), {
  ssr: false
});