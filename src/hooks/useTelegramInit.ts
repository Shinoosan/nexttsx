// hooks/useTelegramInit.ts
import { useState, useEffect } from 'react';
import { retrieveLaunchParams, type User as TelegramUser } from '@telegram-apps/sdk';
import { toast } from '@/components/ui/use-toast';

export function useTelegramInit() {
  const [userData, setUserData] = useState<TelegramUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeTelegramWebApp = async () => {
      try {
        const { initData, initDataRaw } = retrieveLaunchParams();
        
        if (initData?.user) {
          const user: TelegramUser = {
            id: initData.user.id,
            firstName: initData.user.firstName,
            lastName: initData.user.lastName,
            username: initData.user.username,
            languageCode: initData.user.languageCode,
            isPremium: initData.user.isPremium,
            allowsWriteToPm: initData.user.allowsWriteToPm,
            addedToAttachmentMenu: initData.user.addedToAttachmentMenu,
            isBot: initData.user.isBot,
            photoUrl: initData.user.photoUrl
          };
          
          setUserData(user);

          try {
            const response = await fetch('/api/validate-init-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `tma ${initDataRaw}`
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to validate init data');
            }
          } catch (error) {
            console.error('Validation error:', error);
            toast({
              title: "Failed to validate Telegram data",
              variant: "destructive"
            });
          }
        } else {
          throw new Error('No user data available');
        }
      } catch (error) {
        console.error('Error initializing Telegram Web App:', error);
        toast({
          title: "Failed to initialize Telegram Web App",
          variant: "destructive"
        });
      } finally {
        setIsInitialized(true);
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      void initializeTelegramWebApp();
    }
  }, []);

  return { userData, isInitialized, isLoading };
}