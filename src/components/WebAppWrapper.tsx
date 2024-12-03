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
    if (WebApp.isReady) {
      WebApp.ready();
      
      // Emit user data to parent component
      if (WebApp.initDataUnsafe.user) {
        window.dispatchEvent(
          new CustomEvent<WebAppUser>('webappUserData', {
            detail: WebApp.initDataUnsafe.user
          })
        );
      }
    }
  }, []);

  return children ? (
    <>{children}</>
  ) : (
    <ClientLayout defaultView="home" />
  );
} 