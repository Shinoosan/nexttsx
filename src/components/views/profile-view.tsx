'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types
interface Stats {
  global: {
    totalCardsProcessed: number;
    totalUsers: number;
  }
}

interface ProfileViewProps {
  telegramUserId: string;
  processedCount: number;
  userData: TelegramUser;  // Using the correct TelegramUser interface
}

export default function ProfileView({ telegramUserId, processedCount, userData }: ProfileViewProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/get-stats?userId=${telegramUserId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: Stats = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (telegramUserId) {
      void fetchStats();
    }
  }, [telegramUserId]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !userData) {
    return <ErrorAlert message={error || 'No user data available'} />;
  }

  return (
    <div className="px-4 pt-4 pb-32">
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {userData.photo_url ? (
                <div className="relative w-full h-full">
                  <Image
                    src={userData.photo_url}
                    alt={userData.username || userData.first_name}
                    fill
                    className="object-cover rounded-full"
                    sizes="(max-width: 64px) 100vw, 64px"
                  />
                </div>
              ) : (
                <AvatarFallback>
                  {userData.first_name[0]}
                  {userData.last_name?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div>
              <h2 className="text-xl font-semibold">
                {userData.first_name} {userData.last_name}
              </h2>
              {userData.username && (
                <p className="text-muted-foreground">
                  @{userData.username}
                </p>
              )}
              {userData.is_premium && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  Premium
                </span>
              )}
            </div>
          </div>

          <StatsCard title="Your Stats">
            <p>Language: {userData.language_code || 'Not specified'}</p>
            <p>ID: {userData.id}</p>
            <p>Cards Processed: {processedCount}</p>
          </StatsCard>

          {stats?.global && (
            <StatsCard title="Global Stats">
              <p>Total Cards Processed: {stats.global.totalCardsProcessed}</p>
              <p>Total Users: {stats.global.totalUsers}</p>
            </StatsCard>
          )}
        </div>
      </Card>
    </div>
  );
}

// Helper Components
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