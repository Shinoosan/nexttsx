import { dynamic, runtime } from '../config';

export { dynamic, runtime };

'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import WebApp from '@/lib/telegram-webapp';

interface Stats {
  totalCardsProcessed: number;
  totalUsers: number;
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

export { ProfileSkeleton };

export default function ProfilePage() {
  const [initData, setInitData] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && WebApp) {
      setInitData(WebApp.initDataUnsafe);
    }
  }, []);

  useEffect(() => {
    const fetchStats = async (userId: string) => {
      try {
        const response = await fetch(`/api/get-stats?userId=${userId}`);
        const data = await response.json();
        setStats(data.global);
      } catch (error) {
        console.error('Error fetching stats:', error);
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

  const user = initData.user;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.photoUrl} alt={user.username} />
                <AvatarFallback>
                  {user.firstName[0]}
                  {user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground">
                  @{user.username}
                </p>
                {user.isPremium && (
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
                  <p>Language: {user.languageCode}</p>
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
