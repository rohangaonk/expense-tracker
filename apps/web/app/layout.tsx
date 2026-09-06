import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@repo/ui/components/ui/toaster";
import { ToastProvider } from '../components/ToastProvider';
import { ConfirmDialogProvider } from '../components/ConfirmDialogProvider';
import Script from 'next/script';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Expense Tracker",
  description: "Track your expenses effortlessly with AI voice commands",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ExpenseAI",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <ConfirmDialogProvider>
            {children}
            <Toaster />
          </ConfirmDialogProvider>
        </ToastProvider>
        
        {/* Clean up any legacy Service Worker registrations and caches */}
        <Script id="pwa-cleanup" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (var r of registrations) {
                  r.unregister();
                }
              });
            }
            if ('caches' in window) {
              caches.keys().then(function(names) {
                for (var name of names) {
                  caches.delete(name);
                }
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
