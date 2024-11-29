// components/providers/theme-provider.tsx
"use client"

import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-preference" // Add this to ensure clean storage
      value={{
        light: "light",
        dark: "dark",
        dim: "dim",
        forest: "forest",
        sunset: "sunset",
        midnight: "midnight",
        ocean: "ocean",
        coffee: "coffee",
        rose: "rose",
        cyberpunk: "cyberpunk",
        system: "system"
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}