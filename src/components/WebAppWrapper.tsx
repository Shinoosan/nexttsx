'use client';

import { useEffect, type ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { ClientLayout } from './ClientLayout';
import type { WebAppUser } from '@twa-dev/types';

interface WebAppWrapperProps {
  children?: ReactNode;
}

export function WebAppWrapper({ children }: WebAppWrapperProps) {
  useEffect(() => {
    try {
      WebApp.ready();
      
      // Emit user data to parent component if available
      if (WebApp.initDataUnsafe?.user) {
        const user = WebApp.initDataUnsafe.user;
        const transformedUser: WebAppUser = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          language_code: user.language_code,
          is_premium: user.is_premium,
          // Add the transformed fields
          firstName: user.first_name,
          lastName: user.last_name,
          languageCode: user.language_code,
          isPremium: user.is_premium,
          photoUrl: user.photo_url
        };

        window.dispatchEvent(
          new CustomEvent<WebAppUser>('webappUserData', {
            detail: transformedUser
          })
        );
      }
    } catch (error) {
      console.error('Error initializing WebApp:', error);
    }
  }, []);

  return children ? (
    <>{children}</>
  ) : (
    <ClientLayout defaultView="home" />
  );
} 