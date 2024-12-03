'use client';

import { useEffect, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { ClientLayout } from './ClientLayout';

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
          new CustomEvent('webappUserData', {
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