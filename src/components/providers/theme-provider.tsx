"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ReactNode } from "react"

interface ThemeProviderProps {
  children: ReactNode;
  attribute?: string;
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  storageKey?: string;
  themes?: string[];
  value?: {
    light: string;
    dark: string;
    dim?: string;
    forest?: string;
    sunset?: string;
    midnight?: string;
    ocean?: string;
    coffee?: string;
    rose?: string;
    cyberpunk?: string;
    system: string;
  };
}

export function ThemeProvider({ 
  children,
  ...props 
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-preference"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
