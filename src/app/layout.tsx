'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';
import { useUserStore } from '@/store/userStore';
import { cn } from '@/lib/utils';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Hydration-safe: useSyncExternalStore avoids the "setState in effect" lint error
function useHydrated() {
  return useSyncExternalStore(
    () => () => {}, // no-op unsubscribe — this never changes
    () => true,     // client: always hydrated
    () => false,    // server: not hydrated
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hydrated = useHydrated();
  const darkMode = useUserStore(s => s.darkMode);
  const setHasHydrated = useUserStore(s => s.setHasHydrated);

  // Sync hydration flag to user store (once, after mount)
  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  // Prevent flash: render with no dark mode class until hydrated
  const darkClass = hydrated && darkMode;

  return (
    <html
      lang="en"
      className={cn(
        `${geistSans.variable} ${geistMono.variable}`,
        'h-full antialiased',
        darkClass && 'dark',
      )}
    >
      <head>
        <title>Shopwise — Voice Shopping Assistant</title>
        <meta name="description" content="A voice-first shopping intelligence platform that transforms your grocery list into an intelligent, conversational companion." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content={darkMode ? '#0A0A0A' : '#FAFAF8'} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta property="og:title" content="Shopwise — Voice Shopping Assistant" />
        <meta property="og:description" content="Speak naturally. Shop intelligently." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Shopwise — Voice Shopping Assistant" />
        <meta name="twitter:description" content="Speak naturally. Shop intelligently." />
        <meta name="robots" content="index, follow" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Hydration guard: show nothing until client state is ready to prevent mismatch */}
        {hydrated ? <>{children}</> : (
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary animate-pulse" />
          </div>
        )}
      </body>
    </html>
  );
}
