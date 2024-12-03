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
        window.dispatchEvent(
          new CustomEvent<WebAppUser>('webappUserData', {
            detail: WebApp.initDataUnsafe.user
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