'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import { type User as TelegramUser } from '@telegram-apps/sdk';

interface ProfileViewProps {
  telegramUserId: string;
  processedCount: number;
  userData: TelegramUser | null;
}

export default function ProfileView({ telegramUserId, processedCount, userData }: ProfileViewProps) {
  return (
    <motion.div
      key="profile-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-4"
    >
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6 text-foreground">Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            {userData?.photoUrl ? (
              <img 
                src={userData.photoUrl} 
                alt="Profile" 
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
            )}
            <div>
              <p className="font-medium">
                {userData ? (
                  `${userData.firstName} ${userData.lastName || ''}`
                ) : (
                  'Telegram User'
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {userData?.username ? `@${userData.username}` : `ID: ${telegramUserId || 'Not connected'}`}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t space-y-2">
            <p className="text-sm text-muted-foreground">
              Cards Processed: {processedCount}
            </p>
            {userData && (
              <>
                <p className="text-sm text-muted-foreground">
                  Language: {userData.languageCode || 'Not set'}
                </p>
                {userData.isPremium && (
                  <p className="text-sm text-primary">
                    Premium User ✨
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}