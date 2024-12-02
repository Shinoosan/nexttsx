'use client';

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Telegram WebApp interfaces
interface WebAppUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

interface WebAppInitData {
  query_id?: string;
  user?: WebAppUser;
  receiver?: WebAppUser;
  chat?: any; // WebAppChat interface can be added if needed
  chat_type?: 'sender' | 'private' | 'group' | 'supergroup' | 'channel';
  chat_instance?: string;
  start_param?: string;
}

// Declare global Telegram WebApp type
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: WebAppInitData;
        ready: () => void;
      };
    };
  }
}

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
        const webAppData = tg.initDataUnsafe;
        const webAppUser = webAppData.user;

        if (webAppUser) {
          // Get user photo URL from WebAppUser
          const defaultPhotoUrl = 'https://via.placeholder.com/150';
          const photoUrl = webAppUser.photo_url || defaultPhotoUrl;

          // Update user profile in database
          await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              telegramId: webAppUser.id.toString(),
              username: webAppUser.username || '',
              firstName: webAppUser.first_name,
              lastName: webAppUser.last_name || '',
              photoUrl,
              isPremium: webAppUser.is_premium || false,
              languageCode: webAppUser.language_code || 'en'
            })
          });

          // Fetch updated stats
          await fetchStats(webAppUser.id.toString());
        }
      }
      setLoading(false);
    };

    // Initialize Telegram WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }

    void initProfile();
  }, []);

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
