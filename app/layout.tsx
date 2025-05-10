import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "./contexts/SettingsContext";
import ConnectionStatusWrapper from "./components/ConnectionStatusWrapper";
import { NotificationProvider } from "./components/Notification";
import SupabaseInitializer from "./components/SupabaseInitializer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FlipNews - తెలుగు న్యూస్ అప్లికేషన్",
  description: "FlipNews is your source for the latest Telugu news with an interactive flip experience",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-100`}
      >
        <SettingsProvider>
          <NotificationProvider>
            <SupabaseInitializer />
            <main className="flex-grow">
              {children}
            </main>
            <ConnectionStatusWrapper />
          </NotificationProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
