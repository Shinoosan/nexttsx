'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  cardsProcessed: number;
}

interface Stats {
  user: UserProfile;
  global: {
    totalCardsProcessed: number;
    totalUsers: number;
  };
}

export default function ProfilePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initProfile = async () => {
      if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        const initData = tg.initData;
        const user = initData ? JSON.parse(initData) : null;

        if (user) {
          // Get user photo URL
          const photoUrl = await getUserPhotoUrl(user.id);

          // Update user profile in database
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: user.id.toString(),
              username: user.username,
              firstName: user.first_name,
              lastName: user.last_name,
              photoUrl
            })
          });

          // Fetch updated stats
          await fetchStats(user.id.toString());
        }
      }
      setLoading(false);
    };

    void initProfile();
  }, []);

  const getUserPhotoUrl = async (userId: number): Promise<string> => {
    // You'll need to implement this based on Telegram's bot API
    // Usually requires a bot token and server-side implementation
    return `https://api.telegram.org/file/bot${process.env.NEXT_PUBLIC_BOT_TOKEN}/${userId}/photo`;
  };

  const fetchStats = async (userId: string) => {
    try {
      const [userResponse, statsResponse] = await Promise.all([
        fetch(`/api/user?telegramId=${userId}`),
        fetch(`/api/get-stats?userId=${userId}`)
      ]);

      const userData = await userResponse.json();
      const statsData = await statsResponse.json();

      setStats({
        user: userData,
        global: statsData.global
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950">
      <main className="px-4 pt-4 pb-32">
        <Card className="p-6 max-w-2xl mx-auto">
          {stats && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={stats.user.photoUrl} alt={stats.user.username} />
                  <AvatarFallback>
                    {stats.user.firstName?.[0]}
                    {stats.user.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold">
                    {stats.user.firstName} {stats.user.lastName}
                  </h2>
                  <p className="text-muted-foreground">@{stats.user.username}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Your Stats</h3>
                <p>Cards Processed: {stats.user.cardsProcessed}</p>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h3 className="font-semibold mb-2">Global Stats</h3>
                <p>Total Cards Processed: {stats.global.totalCardsProcessed}</p>
                <p>Total Users: {stats.global.totalUsers}</p>
              </div>
            </div>
          )}
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
