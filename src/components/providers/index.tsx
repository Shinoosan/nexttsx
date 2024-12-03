// src/components/providers/index.tsx
'use client';

import { ThemeProvider } from "@/components/providers/theme-provider"
import { ProxyProvider } from "@/hooks/use-proxy"
import { TelegramInit } from '@/components/telegram-init'
import { useEffect, useState } from 'react'

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ProxyProvider>
        <TelegramInit />
        {children}
      </ProxyProvider>
    </ThemeProvider>
  );
}