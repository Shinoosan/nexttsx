// app/layout.tsx
import { ProxyProvider } from "@/hooks/use-proxy"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { Providers } from '@/components/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

// Remove 'use client' from layout - it should be a server component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script 
          src="https://telegram.org/js/telegram-web-app.js" 
          strategy="afterInteractive"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}