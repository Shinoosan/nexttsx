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
    }
  }, []);

  return children ? (
    <>{children}</>
  ) : (
    <ClientLayout defaultView="home" />
  );
} 