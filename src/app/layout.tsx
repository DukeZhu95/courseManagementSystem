import { ClerkProvider } from '@clerk/nextjs';
import { ConvexClientProvider } from '@/providers/convex-client-provider';
import './globals.css';
import React from 'react';
import '@/styles/index.css';
import { clerkAppearance, clerkLayout } from '@/config/clerk-appearance';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body>
    <ClerkProvider
      appearance={clerkAppearance}
      {...clerkLayout}
    >
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkProvider>
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          zIndex: 9999,
        },
      }}
    />
    </body>
    </html>
  );
}