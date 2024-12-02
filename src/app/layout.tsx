// src/app/layout.tsx
import { ProxyProvider } from "@/hooks/use-proxy"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { TelegramInit } from '@/components/telegram-init'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

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
          strategy="beforeInteractive"
        />
      </head>
      <body className={`${inter.variable} font-sans`}>
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
      </body>
    </html>
  )
}
